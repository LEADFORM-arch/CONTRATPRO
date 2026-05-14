-- ContratPro client import audit trail.
-- Run before supabase/rls.sql or run again after to create the policy below.

create table if not exists public.import_logs (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  source text not null default 'client_csv_xlsx',
  file_name text,
  mode text not null check (mode in ('dry-run', 'execute')),
  status text not null default 'READY',
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  error_count integer not null default 0,
  warning_count integer not null default 0,
  customer_created_count integer not null default 0,
  customer_reused_count integer not null default 0,
  installation_count integer not null default 0,
  contract_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_import_logs_org_created
  on public.import_logs(organization_id, created_at desc);

alter table public.import_logs enable row level security;

drop policy if exists import_logs_by_org on public.import_logs;
create policy import_logs_by_org on public.import_logs
for all using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));
