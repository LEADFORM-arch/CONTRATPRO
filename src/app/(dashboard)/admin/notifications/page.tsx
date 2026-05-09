import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import { getRecentInternalNotifications } from "@/server/internal-notifications";

const severityLabels = {
  critical: "Critique",
  info: "Info",
  warning: "A surveiller",
};

export default async function AdminNotificationsPage() {
  const admin = await requireAdminUser("/admin/notifications");
  const notifications = await getRecentInternalNotifications(50);
  const critical = notifications.filter((item) => item.severity === "critical");
  const failedEmails = notifications.filter((item) => item.status === "FAILED");

  return (
    <AppShell activePath="/admin/notifications" showInternalTools>
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/admin/ops">
            Supervision
          </a>
        }
        description={`Centre d'alertes reserve a ${admin.email}. Les emails admin et les traces de notification restent visibles meme si Resend echoue.`}
        eyebrow="Interne fondateur"
        title="Notifications production"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="notification-stat-card" data-tone="cyan">
          <p>Total</p>
          <strong>{notifications.length}</strong>
          <span>Derniers signaux internes</span>
        </article>
        <article className="notification-stat-card" data-tone="rose">
          <p>Critiques</p>
          <strong>{critical.length}</strong>
          <span>Paiements, webhooks, cron</span>
        </article>
        <article className="notification-stat-card" data-tone="amber">
          <p>Emails echoues</p>
          <strong>{failedEmails.length}</strong>
          <span>Resend ou config absente</span>
        </article>
      </div>

      <section className="notification-panel mt-6 rounded-lg border shadow-sm">
        <div className="notification-panel-header">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Journal interne</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">Alertes recentes</h3>
          </div>
        </div>

        <div className="divide-y divide-zinc-800">
          {notifications.length ? (
            notifications.map((notification) => (
              <article
                className="notification-row"
                data-severity={notification.severity}
                key={notification.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="notification-severity">
                      {severityLabels[notification.severity]}
                    </span>
                    <span className="notification-status">{notification.status}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {notification.type}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-zinc-50">
                    {notification.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {notification.message}
                  </p>
                  {notification.errorMessage ? (
                    <p className="mt-2 text-sm leading-6 text-rose-200">
                      {notification.errorMessage}
                    </p>
                  ) : null}
                </div>

                <div className="notification-row-side">
                  <span>{notification.createdAt}</span>
                  <span>{notification.recipient ?? "Sans destinataire"}</span>
                  {notification.actionUrl ? (
                    <a className="premium-secondary-action rounded-md px-3 py-2 text-sm font-semibold" href={notification.actionUrl}>
                      Ouvrir
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="p-5 text-sm text-zinc-500">
              Aucune notification interne pour le moment.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
