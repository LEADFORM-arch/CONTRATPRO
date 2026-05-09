-- Demo data for local validation. Run after supabase/schema.sql.

insert into public.organizations (id, name, city, email)
values ('org_demo', 'JD Chauffage & Clim', 'Nantes', 'contact@jd-chauffage.fr')
on conflict (id) do nothing;

insert into public.customers (id, organization_id, first_name, last_name, company_name, email, phone, address, city, zip_code)
values
  ('cus_lefevre', 'org_demo', 'Claire', 'Lefevre', 'Maison Lefevre', 'claire.lefevre@example.fr', '06 12 45 78 90', '12 rue des Lilas', 'Nantes', '44000'),
  ('cus_martin', 'org_demo', null, null, 'Cabinet Martin', 'contact@cabinet-martin.fr', '02 99 00 00 00', '4 place Bretagne', 'Rennes', '35000'),
  ('cus_bellecour', 'org_demo', 'Amandine', 'Roux', 'SCI Bellecour', 'gestion@sci-bellecour.fr', '04 72 00 00 00', '10 place Bellecour', 'Lyon', '69002')
on conflict (id) do nothing;

insert into public.installations (id, customer_id, type, brand, model)
values
  ('ins_lefevre', 'cus_lefevre', 'HEAT_PUMP_AIR_WATER', 'Atlantic', 'PAC 8 kW'),
  ('ins_martin', 'cus_martin', 'AC_REVERSIBLE', 'Daikin', 'Clim reversible'),
  ('ins_bellecour', 'cus_bellecour', 'BOILER_GAS', 'Frisquet', 'Chaudiere gaz')
on conflict (id) do nothing;

insert into public.contracts (id, installation_id, status, start_date, end_date, price_ht, vat_rate, price_ttc, billing_cycle, payment_method)
values
  ('ctr_lefevre', 'ins_lefevre', 'ACTIVE', '2025-06-12', '2026-06-12', 262.73, 10, 289, 'ANNUAL', 'SEPA'),
  ('ctr_martin', 'ins_martin', 'ACTIVE', '2025-06-28', '2026-06-28', 381.82, 10, 420, 'ANNUAL', 'BANK_TRANSFER'),
  ('ctr_bellecour', 'ins_bellecour', 'ACTIVE', '2025-07-04', '2026-07-04', 327.27, 10, 360, 'ANNUAL', 'SEPA')
on conflict (id) do nothing;

insert into public.interventions (id, contract_id, performed_at, technician, status, report)
values
  ('int_lefevre', 'ctr_lefevre', '2025-06-14', 'Nadia', 'COMPLETED', 'Entretien annuel PAC realise.'),
  ('int_martin', 'ctr_martin', '2025-07-02', 'Hugo', 'COMPLETED', 'Controle clim reversible realise.'),
  ('int_bellecour', 'ctr_bellecour', '2025-07-08', 'Nadia', 'COMPLETED', 'Mesures combustion effectuees.')
on conflict (id) do nothing;

insert into public.certificates (id, intervention_id, contract_id, file_name, legal_reference, issued_at, sent_to_customer, sent_at)
values
  ('att_lefevre', 'int_lefevre', 'ctr_lefevre', 'attestation-lefevre.pdf', 'Arrete 02/03/2017', '2025-06-14', false, null),
  ('att_martin', 'int_martin', 'ctr_martin', 'attestation-martin.pdf', 'Arrete 02/03/2017', '2025-07-02', true, '2025-07-02'),
  ('att_bellecour', 'int_bellecour', 'ctr_bellecour', 'attestation-bellecour.pdf', 'Arrete 15/09/2009', '2025-07-08', true, '2025-07-08')
on conflict (id) do nothing;

insert into public.sepa_mandates (id, contract_id, gc_mandate_id, gc_customer_id, status, signed_at)
values
  ('mand_lefevre', 'ctr_lefevre', 'MD000LEFEVRE', 'CU000LEFEVRE', 'ACTIVE', '2025-06-01'),
  ('mand_bellecour', 'ctr_bellecour', 'MD000BELLECOUR', 'CU000BELLECOUR', 'ACTIVE', '2025-07-01')
on conflict (id) do nothing;

insert into public.sepa_payments (id, organization_id, mandate_id, gc_payment_id, amount, status, charge_date, description)
values
  ('pay_lefevre', 'org_demo', 'mand_lefevre', 'PM000LEFEVRE', 289, 'PENDING_SUBMISSION', '2026-06-12', 'Contrat entretien PAC'),
  ('pay_bellecour', 'org_demo', 'mand_bellecour', 'PM000BELLECOUR', 360, 'CONFIRMED', '2026-07-04', 'Contrat entretien chaudiere')
on conflict (id) do nothing;
