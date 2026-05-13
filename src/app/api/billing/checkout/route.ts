import { NextResponse } from "next/server";

import { defaultBillingPlanId, getBillingPlan } from "@/lib/billing-plans";
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

function planPriceId(plan: ReturnType<typeof getBillingPlan>) {
  return process.env[plan.envKey] || (plan.id === defaultBillingPlanId ? process.env.STRIPE_PRICE_ID : "");
}

function addProductPrice(params: URLSearchParams, plan: ReturnType<typeof getBillingPlan>) {
  const priceId = planPriceId(plan);
  if (priceId) {
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    return;
  }

  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][unit_amount]", String(plan.unitAmount));
  params.set("line_items[0][price_data][recurring][interval]", "month");
  params.set("line_items[0][price_data][product_data][name]", `ContratPro ${plan.name}`);
  params.set(
    "line_items[0][price_data][product_data][description]",
    plan.description,
  );
}

export async function POST(request: Request) {
  try {
    const authError = await requireApiUser({ allowInactiveBilling: true });
    if (authError) {
      return authError;
    }

    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = getBillingPlan(body.plan);
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
      "metadata[plan]": plan.id,
      "subscription_data[metadata][organization_id]": organizationId,
      "subscription_data[metadata][plan]": plan.id,
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
      params.set("custom_text[submit][message]", `${organization.name} active ContratPro ${plan.name}.`);
    }

    addProductPrice(params, plan);

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
