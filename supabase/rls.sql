-- ContratPro production security baseline.
-- Run after schema.sql, renewal_actions.sql, prospection.sql and optional seeds.
-- This enables Row Level Security and scopes every tenant table by organization.

create table if not exists public.organization_memberships (
  organization_id text not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'OWNER' check (role in ('OWNER', 'ADMIN', 'TECHNICIAN')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists idx_org_memberships_user on public.organization_memberships(user_id);

create or replace function public.current_organization_ids()
returns table (organization_id text)
language sql
stable
security definer
set search_path = public
as $$
  select om.organization_id
  from public.organization_memberships om
  where om.user_id = auth.uid()
  union
  select nullif(auth.jwt() ->> 'org_id', '')
  union
  select nullif(auth.jwt() ->> 'organization_id', '')
  union
  select o.id
  from public.organizations o
  where o.clerk_org_id = nullif(auth.jwt() ->> 'clerk_org_id', '')
$$;

create or replace function public.can_access_organization(target_organization_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.current_organization_ids() allowed
    where allowed.organization_id = target_organization_id
  )
$$;

create or replace function public.can_access_customer(target_customer_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.customers c
    where c.id = target_customer_id
      and public.can_access_organization(c.organization_id)
  )
$$;

create or replace function public.can_access_installation(target_installation_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.installations i
    where i.id = target_installation_id
      and public.can_access_customer(i.customer_id)
  )
$$;

create or replace function public.can_access_contract(target_contract_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.contracts c
    where c.id = target_contract_id
      and public.can_access_installation(c.installation_id)
  )
$$;

create or replace function public.can_access_intervention(target_intervention_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.interventions i
    where i.id = target_intervention_id
      and public.can_access_contract(i.contract_id)
  )
$$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.customers enable row level security;
alter table public.installations enable row level security;
alter table public.contracts enable row level security;
alter table public.interventions enable row level security;
alter table public.certificates enable row level security;
alter table public.invoices enable row level security;
alter table public.sepa_mandates enable row level security;
alter table public.sepa_payments enable row level security;

drop policy if exists org_member_read_own on public.organization_memberships;
create policy org_member_read_own on public.organization_memberships
for select using (user_id = auth.uid());

drop policy if exists org_member_manage_org on public.organization_memberships;
create policy org_member_manage_org on public.organization_memberships
for all using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

drop policy if exists organizations_by_membership on public.organizations;
create policy organizations_by_membership on public.organizations
for all using (public.can_access_organization(id))
with check (public.can_access_organization(id));

drop policy if exists customers_by_org on public.customers;
create policy customers_by_org on public.customers
for all using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

drop policy if exists installations_by_customer_org on public.installations;
create policy installations_by_customer_org on public.installations
for all using (public.can_access_customer(customer_id))
with check (public.can_access_customer(customer_id));

drop policy if exists contracts_by_installation_org on public.contracts;
create policy contracts_by_installation_org on public.contracts
for all using (public.can_access_installation(installation_id))
with check (public.can_access_installation(installation_id));

drop policy if exists interventions_by_contract_org on public.interventions;
create policy interventions_by_contract_org on public.interventions
for all using (public.can_access_contract(contract_id))
with check (public.can_access_contract(contract_id));

drop policy if exists certificates_by_contract_org on public.certificates;
create policy certificates_by_contract_org on public.certificates
for all using (
  (contract_id is not null and public.can_access_contract(contract_id))
  or public.can_access_intervention(intervention_id)
)
with check (
  (contract_id is not null and public.can_access_contract(contract_id))
  or public.can_access_intervention(intervention_id)
);

drop policy if exists invoices_by_org on public.invoices;
create policy invoices_by_org on public.invoices
for all using (
  public.can_access_organization(organization_id)
  and (contract_id is null or public.can_access_contract(contract_id))
)
with check (
  public.can_access_organization(organization_id)
  and (contract_id is null or public.can_access_contract(contract_id))
);

drop policy if exists sepa_mandates_by_contract_org on public.sepa_mandates;
create policy sepa_mandates_by_contract_org on public.sepa_mandates
for all using (public.can_access_contract(contract_id))
with check (public.can_access_contract(contract_id));

drop policy if exists sepa_payments_by_org on public.sepa_payments;
create policy sepa_payments_by_org on public.sepa_payments
for all using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

do $$
begin
  if to_regclass('public.document_sends') is not null then
    execute 'alter table public.document_sends enable row level security';
    execute 'drop policy if exists document_sends_by_org on public.document_sends';
    execute 'create policy document_sends_by_org on public.document_sends
      for all using (public.can_access_organization(organization_id))
      with check (public.can_access_organization(organization_id))';
  end if;

  if to_regclass('public.payment_events') is not null then
    execute 'alter table public.payment_events enable row level security';
    execute 'drop policy if exists payment_events_by_org on public.payment_events';
    execute 'create policy payment_events_by_org on public.payment_events
      for all using (
        public.can_access_organization(organization_id)
        and exists (
          select 1 from public.sepa_payments p
          where p.id = payment_id
            and p.organization_id = organization_id
        )
      )
      with check (
        public.can_access_organization(organization_id)
        and exists (
          select 1 from public.sepa_payments p
          where p.id = payment_id
            and p.organization_id = organization_id
        )
      )';
  end if;

  if to_regclass('public.renewal_actions') is not null then
    execute 'alter table public.renewal_actions enable row level security';
    execute 'drop policy if exists renewal_actions_by_contract_org on public.renewal_actions';
    execute 'create policy renewal_actions_by_contract_org on public.renewal_actions
      for all using (public.can_access_contract(contract_id))
      with check (public.can_access_contract(contract_id))';
  end if;

  if to_regclass('public.prospection_leads') is not null then
    execute 'alter table public.prospection_leads enable row level security';
    execute 'drop policy if exists prospection_leads_by_org on public.prospection_leads';
    execute 'create policy prospection_leads_by_org on public.prospection_leads
      for all using (public.can_access_organization(organization_id))
      with check (public.can_access_organization(organization_id))';
  end if;

  if to_regclass('public.facebook_channel_settings') is not null then
    execute 'alter table public.facebook_channel_settings enable row level security';
    execute 'drop policy if exists facebook_settings_by_org on public.facebook_channel_settings';
    execute 'create policy facebook_settings_by_org on public.facebook_channel_settings
      for all using (public.can_access_organization(organization_id))
      with check (public.can_access_organization(organization_id))';
  end if;

  if to_regclass('public.billing_subscriptions') is not null then
    execute 'alter table public.billing_subscriptions enable row level security';
    execute 'drop policy if exists billing_subscriptions_by_org on public.billing_subscriptions';
    execute 'create policy billing_subscriptions_by_org on public.billing_subscriptions
      for all using (public.can_access_organization(organization_id))
      with check (public.can_access_organization(organization_id))';
  end if;

  if to_regclass('public.billing_events') is not null then
    execute 'alter table public.billing_events enable row level security';
    execute 'drop policy if exists billing_events_by_org on public.billing_events';
    execute 'create policy billing_events_by_org on public.billing_events
      for select using (
        organization_id is null or public.can_access_organization(organization_id)
      )';
  end if;

  if to_regclass('public.internal_notifications') is not null then
    execute 'alter table public.internal_notifications enable row level security';
    execute 'drop policy if exists internal_notifications_by_org on public.internal_notifications';
    execute 'create policy internal_notifications_by_org on public.internal_notifications
      for select using (
        organization_id is null or public.can_access_organization(organization_id)
      )';
  end if;

  if to_regclass('public.import_logs') is not null then
    execute 'alter table public.import_logs enable row level security';
    execute 'drop policy if exists import_logs_by_org on public.import_logs';
    execute 'create policy import_logs_by_org on public.import_logs
      for all using (public.can_access_organization(organization_id))
      with check (public.can_access_organization(organization_id))';
  end if;
end $$;
