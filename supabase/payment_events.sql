-- Priority 3: SEPA provider event trail.
-- Run after schema.sql and before rls.sql / verify_rls.sql.

create table if not exists public.payment_events (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  payment_id text not null references public.sepa_payments(id) on delete cascade,
  event_type text not null,
  provider text not null default 'gocardless',
  provider_event_id text,
  status text not null,
  message text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_events_org on public.payment_events(organization_id);
create index if not exists idx_payment_events_payment on public.payment_events(payment_id, created_at desc);
create index if not exists idx_payment_events_created on public.payment_events(created_at desc);
