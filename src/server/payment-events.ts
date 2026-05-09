import { getRequestOrganizationId } from "@/server/auth";
import {
  insertSupabaseRow,
  selectSupabaseRows,
} from "@/server/supabase-write";

type PaymentEventRow = {
  id: string;
  event_type: string;
  provider: string;
  provider_event_id: string | null;
  status: string;
  message: string | null;
  created_at: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function recordPaymentEvent(payload: {
  eventType: string;
  message?: string;
  paymentId: string;
  providerEventId?: string;
  status: string;
  rawPayload?: unknown;
}) {
  const organizationId = await getRequestOrganizationId();
  return insertSupabaseRow<{ id: string }>("payment_events", {
    event_type: payload.eventType,
    message: payload.message ?? null,
    organization_id: organizationId,
    payment_id: payload.paymentId,
    provider: "gocardless",
    provider_event_id: payload.providerEventId ?? null,
    payload: payload.rawPayload ?? null,
    status: payload.status,
  });
}

export async function getRecentPaymentEvents(limit = 10) {
  const organizationId = await getRequestOrganizationId();
  const rows = await selectSupabaseRows<PaymentEventRow>(
    "payment_events",
    `organization_id=eq.${encodeURIComponent(
      organizationId,
    )}&select=id,event_type,provider,provider_event_id,status,message,created_at&order=created_at.desc&limit=${limit}`,
  ).catch(() => []);

  return rows.map((row) => ({
    id: row.id,
    createdAt: formatDateTime(row.created_at),
    eventType: row.event_type,
    message: row.message ?? "",
    provider: row.provider,
    providerEventId: row.provider_event_id ?? "",
    status: row.status,
  }));
}
