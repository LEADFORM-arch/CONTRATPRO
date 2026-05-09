-- Priority 2: document delivery audit trail.
-- Run after schema.sql and before rls.sql / verify_rls.sql.

create table if not exists public.document_sends (
  id text primary key default gen_random_uuid()::text,
  organization_id text not null references public.organizations(id) on delete cascade,
  document_type text not null check (document_type in ('INVOICE', 'CERTIFICATE')),
  document_id text not null,
  recipient_email text not null,
  recipient_name text,
  subject text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null default 'SENT' check (status in ('QUEUED', 'SENT', 'FAILED')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_document_sends_org on public.document_sends(organization_id);
create index if not exists idx_document_sends_document on public.document_sends(document_type, document_id);
create index if not exists idx_document_sends_created on public.document_sends(created_at desc);
