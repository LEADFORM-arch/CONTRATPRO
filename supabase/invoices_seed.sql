-- Optional demo invoices for ContratPro.
-- Run after supabase/schema.sql and supabase/seed.sql.

insert into public.invoices (
  id,
  organization_id,
  contract_id,
  number,
  status,
  issue_date,
  due_date,
  amount_ht,
  vat_rate,
  vat_amount,
  amount_ttc,
  paid_at
)
values
  (
    'inv_lefevre_2026',
    'org_demo',
    'ctr_lefevre',
    'FAC-2026-0001',
    'SENT',
    '2026-05-08',
    '2026-06-07',
    262.73,
    10,
    26.27,
    289,
    null
  ),
  (
    'inv_bellecour_2026',
    'org_demo',
    'ctr_bellecour',
    'FAC-2026-0002',
    'PAID',
    '2026-05-08',
    '2026-06-07',
    327.27,
    10,
    32.73,
    360,
    '2026-05-08'
  )
on conflict (id) do nothing;
