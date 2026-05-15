import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/server/admin";
import type { OpsStatus } from "@/server/ops-health";
import { getOpsHealth } from "@/server/ops-health";

import { OpsCommandCopyButton } from "./OpsCommandCopyButton";

const statusLabels: Record<OpsStatus, string> = {
  critical: "Critique",
  ready: "Pret",
  warning: "A surveiller",
};

const statusCopy: Record<OpsStatus, string> = {
  critical: "La production n'est pas prete. Corrige les points critiques avant d'ouvrir a plus de clients.",
  ready: "Le socle est sain pour piloter une production limitee et surveillee.",
  warning: "Le produit tourne, mais quelques integrations doivent encore etre verrouillees.",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Pas encore de signal";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function OpsPage() {
  const admin = await requireAdminUser("/admin/ops");
  const health = await getOpsHealth();
  const readyChecks = health.checks.filter((check) => check.status === "ready").length;
  const criticalChecks = health.checks.filter((check) => check.status === "critical").length;

  return (
    <AppShell activePath="/admin/ops" showInternalTools>
      <PageHeader
        action={
          <a className="premium-action rounded-md text-sm font-semibold" href="/settings/security">
            Securite
          </a>
        }
        description={`Cockpit reserve a ${admin.email}. Surveille la sante technique, les integrations et les signaux critiques avant de vendre plus fort.`}
        eyebrow="Interne fondateur"
        title="Supervision production"
      />

      <section className="ops-hero mt-6 rounded-lg border p-5 shadow-sm" data-status={health.status}>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Readiness score</p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <strong className="text-6xl font-black tracking-normal text-zinc-50">
                {health.score}
                <span className="text-2xl text-zinc-500">/100</span>
              </strong>
              <span className="ops-status-pill" data-status={health.status}>
                {statusLabels[health.status]}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              {statusCopy[health.status]}
            </p>
          </div>

          <div className="ops-snapshot-grid">
            <div>
              <span>Checks OK</span>
              <strong>{readyChecks}/{health.checks.length}</strong>
            </div>
            <div>
              <span>Critiques</span>
              <strong>{criticalChecks}</strong>
            </div>
            <div>
              <span>Mis a jour</span>
              <strong>{formatDate(health.generatedAt)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {health.metrics.map((metric) => (
          <article className="ops-metric-card rounded-lg border p-4" data-status={metric.status} key={metric.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {metric.label}
            </p>
            <strong className="mt-2 block text-3xl font-black text-zinc-50">
              {metric.value}
            </strong>
            <p className="mt-2 text-sm leading-5 text-zinc-400">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="ops-cron-panel mt-6 rounded-lg border shadow-sm" data-od-id="ops-cron-runbook">
        <div className="ops-panel-header">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Priorite 6</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">Cron relances sous controle</h3>
          </div>
          <span className="ops-muted-pill">Dry-run avant envoi reel</span>
        </div>
        <div className="ops-cron-grid">
          {health.cronRunbook.map((item) => (
            <article className="ops-cron-card" data-status={item.status} key={item.label}>
              <div className="ops-cron-top">
                <strong>{item.label}</strong>
                <span>{statusLabels[item.status]}</span>
              </div>
              <p>{item.detail}</p>
              <div className="ops-command-copy">
                <code>{item.command}</code>
                <OpsCommandCopyButton command={item.command} />
              </div>
              <small>{item.proof}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-demo-panel mt-6 rounded-lg border shadow-sm" data-od-id="ops-demo-checklist">
        <div className="ops-panel-header">
          <div>
            <p className="text-sm font-semibold text-amber-300">Avant rendez-vous</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">Checklist pre-demo</h3>
          </div>
          <span className="ops-muted-pill">15 minutes avant l'appel</span>
        </div>
        <div className="ops-demo-grid">
          {health.demoChecklist.map((item) => (
            <article className="ops-demo-card" data-status={item.status} key={item.label}>
              <div className="ops-demo-card-top">
                <strong>{item.label}</strong>
                <span>{statusLabels[item.status]}</span>
              </div>
              <p>{item.detail}</p>
              <small>{item.proof}</small>
              <div className="ops-demo-card-actions">
                {item.command ? (
                  <div className="ops-command-copy">
                    <code>{item.command}</code>
                    <OpsCommandCopyButton command={item.command} />
                  </div>
                ) : null}
                {item.href ? (
                  <a className="ops-action-link" href={item.href}>
                    Ouvrir
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-smoke-panel mt-6 rounded-lg border shadow-sm" data-od-id="ops-smoke-runbook">
        <div className="ops-panel-header">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Qualite avant demo</p>
            <h3 className="mt-1 text-lg font-bold text-zinc-50">Smoke tests client</h3>
          </div>
          <span className="ops-muted-pill">Local puis Vercel</span>
        </div>
        <div className="ops-smoke-grid">
          {health.smokeRunbook.map((item) => (
            <article className="ops-smoke-card" data-scope={item.scope} data-status={item.status} key={item.label}>
              <div className="ops-cron-top">
                <strong>{item.label}</strong>
                <span>{statusLabels[item.status]}</span>
              </div>
              <p>{item.detail}</p>
              <div className="ops-command-copy">
                <code>{item.command}</code>
                <OpsCommandCopyButton command={item.command} />
              </div>
              <small>{item.proof}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="ops-panel rounded-lg border shadow-sm">
          <div className="ops-panel-header">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Garde-fous</p>
              <h3 className="mt-1 text-lg font-bold text-zinc-50">Configuration production</h3>
            </div>
            <span className="ops-muted-pill">Secrets masques</span>
          </div>

          <div className="divide-y divide-zinc-800">
            {health.checks.map((check) => (
              <div className="ops-check-row" data-status={check.status} key={check.label}>
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.detail}</p>
                </div>
                <span>{statusLabels[check.status]}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="ops-panel rounded-lg border shadow-sm">
            <div className="ops-panel-header">
              <div>
                <p className="text-sm font-semibold text-cyan-300">Activite recente</p>
                <h3 className="mt-1 text-lg font-bold text-zinc-50">Signaux metier</h3>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              {health.recent.map((item) => (
                <article className="ops-recent-card" data-status={item.status} key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{formatDate(item.timestamp)}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="ops-panel rounded-lg border shadow-sm">
            <div className="ops-panel-header">
              <div>
                <p className="text-sm font-semibold text-amber-300">Runbook</p>
                <h3 className="mt-1 text-lg font-bold text-zinc-50">Points de controle</h3>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              <a className="ops-action-link" href="/relances">
                Relances et cron
              </a>
              <a className="ops-action-link" href="/payments">
                Paiements SEPA
              </a>
              <a className="ops-action-link" href="/invoices">
                Factures PDF
              </a>
              <a className="ops-action-link" href="/admin/prospection">
                Acquisition fondateur
              </a>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
