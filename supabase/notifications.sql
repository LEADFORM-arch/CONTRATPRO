-- ContratPro internal founder notifications.
-- Run before supabase/rls.sql.

create table if not exists public.internal_notifications (
  id text primary key default gen_random_uuid()::text,
  organization_id text references public.organizations(id) on delete set null,
  type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title text not null,
  message text not null,
  action_url text,
  channel text not null default 'email',
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
  recipient text,
  provider_message_id text,
  error_message text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_notifications_created
  on public.internal_notifications(created_at desc);

create index if not exists idx_internal_notifications_org_created
  on public.internal_notifications(organization_id, created_at desc);

create index if not exists idx_internal_notifications_status
  on public.internal_notifications(status, severity);
