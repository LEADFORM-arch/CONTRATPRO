-- ContratPro SaaS billing tables.
-- Run before supabase/rls.sql.

create table if not exists public.billing_subscriptions (
  organization_id text primary key references public.organizations(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'missing',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_subscriptions_customer
  on public.billing_subscriptions(stripe_customer_id);

create index if not exists idx_billing_subscriptions_status
  on public.billing_subscriptions(status);

create table if not exists public.billing_events (
  id text primary key default gen_random_uuid()::text,
  organization_id text references public.organizations(id) on delete set null,
  provider text not null default 'stripe',
  provider_event_id text unique,
  event_type text not null,
  status text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_billing_events_org_created
  on public.billing_events(organization_id, created_at desc);
