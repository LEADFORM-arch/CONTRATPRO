import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { getBillingSubscription } from "@/server/billing";
import { getResolvedOrganizationId } from "@/server/supabase-write";
import { getAppBaseUrl, stripePost, StripeConfigError } from "@/server/stripe";

type PortalSession = {
  id: string;
  url: string;
};

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser({ allowInactiveBilling: true });
    if (authError) {
      return authError;
    }

    const organizationId = await getResolvedOrganizationId();
    const subscription = await getBillingSubscription(organizationId).catch(() => null);

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun client Stripe rattache a cette organisation." },
        { status: 409 },
      );
    }

    const baseUrl = getAppBaseUrl(request);
    const params = new URLSearchParams({
      customer: subscription.stripe_customer_id,
      return_url: `${baseUrl}/settings/billing`,
    });

    const session = await stripePost<PortalSession>("billing_portal/sessions", params);
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible d'ouvrir le portail client Stripe." },
      { status: 500 },
    );
  }
}
