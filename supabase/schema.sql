-- ContratPro MVP schema for Supabase project yotafzxcpyyrkkpeyfpp
-- Run this in Supabase Dashboard > SQL Editor.

do $$ begin
  create type plan as enum ('STARTER', 'PRO', 'TEAM');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type equipment_type as enum (
    'BOILER_GAS',
    'BOILER_OIL',
    'HEAT_PUMP_AIR_AIR',
    'HEAT_PUMP_AIR_WATER',
    'HEAT_PUMP_GEO',
    'AC_REVERSIBLE',
    'VMC',
    'OTHER'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type contract_status as enum ('DRAFT', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type billing_cycle as enum ('MONTHLY', 'ANNUAL');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('SEPA', 'BANK_TRANSFER', 'CHECK', 'CASH');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type intervention_status as enum ('SCHEDULED', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type invoice_status as enum ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type mandate_status as enum (
    'PENDING_SUBMISSION',
    'SUBMITTED',
    'ACTIVE',
    'FAILED',
    'CANCELLED',
    'EXPIRED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum (
    'PENDING_SUBMISSION',
    'SUBMITTED',
    'CONFIRMED',
    'PAID_OUT',
    'FAILED',
    'CANCELLED',
    'CHARGED_BACK'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  clerk_org_id text unique,
  siret text,
  rge_number text,
  vat_number text,
  address text,
  city text,
  zip_code text,
  phone text,
  email text,
  plan plan not null default 'STARTER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  organization_id text not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'OWNER' check (role in ('OWNER', 'ADMIN', 'TECHNICIAN')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.customers (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  first_name text,
  last_name text,
  company_name text,
  email text,
  phone text,
  address text,
  city text,
  zip_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.installations (
  id text primary key default gen_random_uuid()::text,
  customer_id text not null references public.customers(id) on delete cascade,
  type equipment_type not null default 'OTHER',
  brand text,
  model text,
  serial_number text,
  power_kw numeric(6, 2),
  install_date timestamptz,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id text primary key default gen_random_uuid()::text,
  installation_id text not null references public.installations(id) on delete cascade,
  status contract_status not null default 'ACTIVE',
  start_date timestamptz not null,
  end_date timestamptz not null,
  price_ht numeric(10, 2) not null,
  vat_rate numeric(5, 2) not null,
  price_ttc numeric(10, 2) not null,
  billing_cycle billing_cycle not null default 'ANNUAL',
  payment_method payment_method not null default 'SEPA',
  auto_renew boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interventions (
  id text primary key default gen_random_uuid()::text,
  contract_id text not null references public.contracts(id) on delete cascade,
  performed_at timestamptz not null,
  technician text,
  status intervention_status not null default 'COMPLETED',
  report text,
  next_visit_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id text primary key default gen_random_uuid()::text,
  intervention_id text not null unique references public.interventions(id) on delete cascade,
  contract_id text references public.contracts(id),
  file_url text,
  file_name text,
  legal_reference text not null default 'Arrete 15/09/2009 et 02/03/2017',
  issued_at timestamptz not null default now(),
  sent_to_customer boolean not null default false,
  sent_at timestamptz
);

create table if not exists public.invoices (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id),
  contract_id text references public.contracts(id),
  number text not null unique,
  status invoice_status not null default 'DRAFT',
  issue_date timestamptz not null default now(),
  due_date timestamptz not null,
  amount_ht numeric(10, 2) not null,
  vat_rate numeric(5, 2) not null,
  vat_amount numeric(10, 2) not null,
  amount_ttc numeric(10, 2) not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sepa_mandates (
  id text primary key default gen_random_uuid()::text,
  contract_id text not null unique references public.contracts(id),
  gc_mandate_id text unique,
  gc_customer_id text,
  status mandate_status not null default 'PENDING_SUBMISSION',
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sepa_payments (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id),
  mandate_id text not null references public.sepa_mandates(id),
  gc_payment_id text unique,
  amount numeric(10, 2) not null,
  currency text not null default 'EUR',
  status payment_status not null default 'PENDING_SUBMISSION',
  charge_date timestamptz not null,
  description text,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_org on public.customers(organization_id);
create index if not exists idx_org_memberships_user on public.organization_memberships(user_id);
create index if not exists idx_installations_customer on public.installations(customer_id);
create index if not exists idx_contracts_installation on public.contracts(installation_id);
create index if not exists idx_contracts_status on public.contracts(status);
create index if not exists idx_contracts_end_date on public.contracts(end_date);
create index if not exists idx_interventions_contract on public.interventions(contract_id);
create index if not exists idx_invoices_org on public.invoices(organization_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_sepa_payments_org on public.sepa_payments(organization_id);
create index if not exists idx_sepa_payments_status on public.sepa_payments(status);
