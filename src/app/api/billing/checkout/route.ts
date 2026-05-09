import { NextResponse } from "next/server";

import { requireApiUser } from "@/server/api-auth";
import { getBillingSubscription } from "@/server/billing";
import { serviceSelect } from "@/server/supabase-service";
import { getResolvedOrganizationId } from "@/server/supabase-write";
import { getAppBaseUrl, stripePost, StripeConfigError } from "@/server/stripe";

type CheckoutSession = {
  id: string;
  url: string | null;
};

type OrganizationRow = {
  email: string | null;
  name: string;
};

function addProductPrice(params: URLSearchParams) {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (priceId) {
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    return;
  }

  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][unit_amount]", "20000");
  params.set("line_items[0][price_data][recurring][interval]", "month");
  params.set("line_items[0][price_data][product_data][name]", "ContratPro Pro");
  params.set(
    "line_items[0][price_data][product_data][description]",
    "Gestion des contrats de maintenance CVC",
  );
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser({ allowInactiveBilling: true });
    if (authError) {
      return authError;
    }

    const organizationId = await getResolvedOrganizationId();
    const [organization] = await serviceSelect<OrganizationRow>(
      "organizations",
      `id=eq.${encodeURIComponent(organizationId)}&select=name,email&limit=1`,
    );
    const subscription = await getBillingSubscription(organizationId).catch(() => null);
    const baseUrl = getAppBaseUrl(request);
    const params = new URLSearchParams({
      "automatic_tax[enabled]": "true",
      billing_address_collection: "required",
      client_reference_id: organizationId,
      mode: "subscription",
      "metadata[organization_id]": organizationId,
      "subscription_data[metadata][organization_id]": organizationId,
      success_url: `${baseUrl}/settings/billing?checkout=success`,
      cancel_url: `${baseUrl}/settings/billing?checkout=cancelled`,
    });

    if (subscription?.stripe_customer_id) {
      params.set("customer", subscription.stripe_customer_id);
      params.set("customer_update[address]", "auto");
      params.set("customer_update[name]", "auto");
    } else if (organization?.email) {
      params.set("customer_email", organization.email);
    }

    if (organization?.name) {
      params.set("custom_text[submit][message]", `${organization.name} active ContratPro Pro.`);
    }

    addProductPrice(params);

    const session = await stripePost<CheckoutSession>("checkout/sessions", params);
    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe n'a pas retourne d'URL Checkout." },
        { status: 502 },
      );
    }

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Impossible de creer la session Stripe Checkout." },
      { status: 500 },
    );
  }
}
