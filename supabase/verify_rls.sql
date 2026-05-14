-- ContratPro RLS verification.
-- Run in Supabase SQL Editor after supabase/rls.sql.
-- Expected result: every listed table has rls_enabled = true and policy_count >= 1.

with expected_tables(table_name) as (
  values
    ('organizations'),
    ('organization_memberships'),
    ('customers'),
    ('installations'),
    ('contracts'),
    ('interventions'),
    ('certificates'),
    ('invoices'),
    ('document_sends'),
    ('payment_events'),
    ('sepa_mandates'),
    ('sepa_payments'),
    ('renewal_actions'),
    ('prospection_leads'),
    ('facebook_channel_settings'),
    ('billing_subscriptions'),
    ('billing_events'),
    ('internal_notifications'),
    ('import_logs')
),
rls_state as (
  select
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    count(p.polname)::int as policy_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  where n.nspname = 'public'
  group by c.relname, c.relrowsecurity
)
select
  e.table_name,
  coalesce(r.rls_enabled, false) as rls_enabled,
  coalesce(r.policy_count, 0) as policy_count,
  case
    when r.table_name is null then 'MISSING_TABLE'
    when r.rls_enabled is not true then 'RLS_DISABLED'
    when coalesce(r.policy_count, 0) < 1 then 'NO_POLICY'
    else 'OK'
  end as status
from expected_tables e
left join rls_state r on r.table_name = e.table_name
order by e.table_name;
