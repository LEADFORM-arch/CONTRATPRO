-- Optional premium module: renewal follow-up audit trail.
-- Run this after supabase/schema.sql when you want persistent relance tracking.

create table if not exists public.renewal_actions (
  id text primary key default gen_random_uuid()::text,
  contract_id text not null references public.contracts(id) on delete cascade,
  status text not null default 'TODO'
    check (status in ('TODO', 'SENT', 'REPLIED', 'WON', 'LOST')),
  channel text not null,
  message text not null,
  due_at timestamptz not null default now(),
  completed_at timestamptz,
  outcome text,
  created_at timestamptz not null default now()
);

create index if not exists renewal_actions_contract_id_idx
  on public.renewal_actions(contract_id);

create index if not exists renewal_actions_status_due_at_idx
  on public.renewal_actions(status, due_at);

insert into public.renewal_actions (
  id,
  contract_id,
  status,
  channel,
  message,
  due_at,
  outcome
)
values
  (
    'act_lefevre_j45',
    'ctr_lefevre',
    'TODO',
    'Email',
    'Relance J-45 pour renouvellement du contrat PAC Atlantic.',
    '2026-05-15',
    'A envoyer cette semaine'
  ),
  (
    'act_bellecour_prep',
    'ctr_bellecour',
    'SENT',
    'Email + lien SEPA',
    'Preparation du renouvellement chaudiere gaz avec maintien du mandat SEPA.',
    '2026-05-22',
    'Email envoye, attente confirmation'
  )
on conflict (id) do nothing;
