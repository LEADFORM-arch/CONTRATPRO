-- Anonymous ROI simulator events.
-- Public users never read or write this table directly. The API route inserts
-- with the Supabase service role, so RLS can stay closed by default.

create table if not exists public.simulation_leads (
  id text primary key default gen_random_uuid()::text,
  source text not null default 'public_simulator',
  contract_count integer,
  renewal_rate integer,
  yearly_contract_price integer,
  forgotten_rate integer,
  forgotten_contracts integer,
  lost_revenue integer,
  recovered_revenue integer,
  annual_cost integer,
  roi_net integer,
  roi_percent integer,
  break_even_months integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_simulation_leads_created
  on public.simulation_leads(created_at desc);

alter table public.simulation_leads enable row level security;
