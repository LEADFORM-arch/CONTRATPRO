import { getAdminEmails } from "@/server/admin";
import { EmailProviderError, sendPlainEmail } from "@/server/resend";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/server/supabase-service";

export type NotificationSeverity = "critical" | "info" | "warning";

type NotificationPayload = {
  actionUrl?: string;
  message: string;
  metadata?: Record<string, unknown>;
  organizationId?: string | null;
  severity?: NotificationSeverity;
  title: string;
  type: string;
};

type NotificationRow = {
  action_url: string | null;
  created_at: string;
  error_message: string | null;
  id: string;
  message: string;
  organization_id: string | null;
  recipient: string | null;
  severity: NotificationSeverity;
  status: "FAILED" | "PENDING" | "SENT" | "SKIPPED";
  title: string;
  type: string;
};

function notificationRecipients() {
  const configured = process.env.CONTRATPRO_NOTIFICATION_EMAILS;
  const emails = configured
    ? configured.split(",").map((email) => email.trim().toLowerCase())
    : [...getAdminEmails()];

  return [...new Set(emails.filter(Boolean))];
}

function appUrl(path?: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.CONTRATPRO_APP_URL ||
    "http://localhost:3000";

  if (!path) {
    return base.replace(/\/$/, "");
  }

  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function html(payload: NotificationPayload) {
  const action = payload.actionUrl
    ? `<p><a href="${appUrl(payload.actionUrl)}">Ouvrir dans ContratPro</a></p>`
    : "";
  return `
    <p><strong>${payload.title}</strong></p>
    <p>${payload.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    ${action}
    <p style="color:#64748b;font-size:12px">Notification interne ContratPro.</p>
  `;
}

async function recordNotification(
  payload: NotificationPayload,
  status: NotificationRow["status"],
  recipient: string | null,
  providerMessageId?: string,
  errorMessage?: string,
) {
  return serviceInsert<NotificationRow>("internal_notifications", {
    action_url: payload.actionUrl ?? null,
    channel: "email",
    error_message: errorMessage ?? null,
    message: payload.message,
    metadata: payload.metadata ?? null,
    organization_id: payload.organizationId ?? null,
    provider_message_id: providerMessageId ?? null,
    recipient,
    severity: payload.severity ?? "info",
    status,
    title: payload.title,
    type: payload.type,
  }).catch((error) => {
    console.warn("[Notifications] record failed", error);
    return null;
  });
}

export async function notifyAdmin(payload: NotificationPayload) {
  const recipients = notificationRecipients();

  if (!recipients.length) {
    await recordNotification(payload, "SKIPPED", null, undefined, "Aucun destinataire admin configure.");
    return;
  }

  await Promise.all(
    recipients.map(async (recipient) => {
      try {
        const email = await sendPlainEmail({
          html: html(payload),
          subject: `[ContratPro] ${payload.title}`,
          text: `${payload.title}\n\n${payload.message}\n\n${payload.actionUrl ? appUrl(payload.actionUrl) : ""}`,
          to: recipient,
        });
        await recordNotification(payload, "SENT", recipient, email.id);
      } catch (error) {
        const message =
          error instanceof EmailProviderError || error instanceof Error
            ? error.message
            : "Erreur inconnue";
        await recordNotification(payload, "FAILED", recipient, undefined, message);
      }
    }),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function getRecentInternalNotifications(limit = 30) {
  const rows = await serviceSelect<NotificationRow>(
    "internal_notifications",
    `select=id,organization_id,type,severity,title,message,action_url,status,recipient,error_message,created_at&order=created_at.desc&limit=${limit}`,
  ).catch(() => []);

  return rows.map((row) => ({
    actionUrl: row.action_url,
    createdAt: formatDateTime(row.created_at),
    errorMessage: row.error_message,
    id: row.id,
    message: row.message,
    organizationId: row.organization_id,
    recipient: row.recipient,
    severity: row.severity,
    status: row.status,
    title: row.title,
    type: row.type,
  }));
}

export async function markInternalNotificationRead(id: string) {
  return serviceUpdate<NotificationRow>(
    "internal_notifications",
    `id=eq.${encodeURIComponent(id)}`,
    { read_at: new Date().toISOString() },
  );
}
