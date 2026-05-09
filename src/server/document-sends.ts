import { getRequestOrganizationId } from "@/server/auth";
import { selectSupabaseRows } from "@/server/supabase-write";
import { insertSupabaseRow } from "@/server/supabase-write";

export type DocumentType = "INVOICE" | "CERTIFICATE";
export type DocumentSendStatus = "QUEUED" | "SENT" | "FAILED";

type DocumentSendRow = {
  id: string;
  document_type: DocumentType;
  document_id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  provider: string;
  provider_message_id: string | null;
  status: DocumentSendStatus;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

export async function recordDocumentSend(payload: {
  documentId: string;
  documentType: DocumentType;
  errorMessage?: string;
  providerMessageId?: string;
  recipientEmail: string;
  recipientName?: string;
  status: DocumentSendStatus;
  subject: string;
}) {
  const organizationId = await getRequestOrganizationId();
  return insertSupabaseRow<{ id: string }>("document_sends", {
    document_id: payload.documentId,
    document_type: payload.documentType,
    error_message: payload.errorMessage ?? null,
    organization_id: organizationId,
    provider: "resend",
    provider_message_id: payload.providerMessageId ?? null,
    recipient_email: payload.recipientEmail,
    recipient_name: payload.recipientName ?? null,
    sent_at: payload.status === "SENT" ? new Date().toISOString() : null,
    status: payload.status,
    subject: payload.subject,
  });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function getDocumentSends(documentType: DocumentType, documentId: string) {
  const organizationId = await getRequestOrganizationId();
  const rows = await selectSupabaseRows<DocumentSendRow>(
    "document_sends",
    `organization_id=eq.${encodeURIComponent(
      organizationId,
    )}&document_type=eq.${documentType}&document_id=eq.${encodeURIComponent(
      documentId,
    )}&select=id,document_type,document_id,recipient_email,recipient_name,subject,provider,provider_message_id,status,error_message,sent_at,created_at&order=created_at.desc`,
  ).catch(() => []);

  return rows.map((row) => ({
    id: row.id,
    createdAt: formatDateTime(row.created_at),
    errorMessage: row.error_message ?? "",
    provider: row.provider,
    providerMessageId: row.provider_message_id ?? "",
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name ?? "",
    sentAt: formatDateTime(row.sent_at),
    status: row.status,
    subject: row.subject,
  }));
}
