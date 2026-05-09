-- Prospection + Facebook channel tables for ContratPro.
-- Run after supabase/schema.sql and supabase/seed.sql.

create table if not exists public.prospection_leads (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  city text,
  specialty text,
  source text not null default 'FACEBOOK',
  source_url text,
  status text not null default 'TO_QUALIFY',
  score integer not null default 50 check (score >= 0 and score <= 100),
  next_action text,
  last_touch_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facebook_channel_settings (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null unique references public.organizations(id) on delete cascade,
  buffer_access_token text,
  buffer_profile_id text,
  apify_token text,
  manychat_token text,
  demo_url text,
  n8n_webhook_url text,
  posting_frequency text not null default '3 posts / semaine',
  persona text not null default 'Marc, chauffagiste senior franc, utile et non vendeur',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prospection_leads_org on public.prospection_leads(organization_id);
create index if not exists idx_prospection_leads_status on public.prospection_leads(status);
create index if not exists idx_prospection_leads_score on public.prospection_leads(score desc);

insert into public.prospection_leads (
  id,
  organization_id,
  company_name,
  contact_name,
  email,
  phone,
  city,
  specialty,
  source,
  status,
  score,
  next_action,
  notes
)
values
  (
    'lead_thermi_ouest',
    'org_demo',
    'Thermi Ouest',
    'Julien Morin',
    'contact@thermi-ouest.fr',
    '02 41 00 00 00',
    'Angers',
    'Pompes a chaleur',
    'FACEBOOK',
    'TO_QUALIFY',
    72,
    'Verifier volume contrats entretien',
    'A reagi a un post sur les renouvellements oublies.'
  ),
  (
    'lead_clim_habitat_44',
    'org_demo',
    'Clim Habitat 44',
    'Sarah Petit',
    'hello@climhabitat44.fr',
    '02 40 00 00 00',
    'Nantes',
    'Clim reversible',
    'FACEBOOK',
    'CONTACTED',
    81,
    'Envoyer lien demo et sequence J+2',
    'Profil tres proche ICP : petite equipe, PAC et clim reversible.'
  ),
  (
    'lead_riviere_chauffage',
    'org_demo',
    'Riviere Chauffage',
    'Marc Riviere',
    'contact@riviere-chauffage.fr',
    '02 99 00 00 00',
    'Rennes',
    'Chaudiere gaz',
    'REFERRAL',
    'DEMO_SCHEDULED',
    88,
    'Confirmer creneau demo',
    'Demande une vue simple des contrats actifs et relances.'
  )
on conflict (id) do nothing;

insert into public.facebook_channel_settings (
  organization_id,
  demo_url,
  n8n_webhook_url,
  posting_frequency,
  persona
)
values (
  'org_demo',
  'https://contratpro.fr/demo',
  'https://votre-n8n.com/webhook/fb-comment',
  '3 posts / semaine',
  'Marc, chauffagiste senior franc, utile et non vendeur'
)
on conflict (organization_id) do nothing;
