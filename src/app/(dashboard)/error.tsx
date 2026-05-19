"use client";

import { useEffect } from "react";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function getReadableError(error: Error) {
  if (error.name === "DemoOrganizationForbiddenError") {
    return {
      eyebrow: "Configuration tenant",
      title: "Accès bloqué par sécurité.",
      description:
        "ContratPro a détecté un tenant de démonstration dans un contexte protégé. Corrigez l’organisation active, puis relancez la page.",
      code: "TENANT_DEMO_FORBIDDEN",
    };
  }

  if (error.name === "ProductionTenantConfigError") {
    return {
      eyebrow: "Configuration production",
      title: "Configuration incomplète.",
      description:
        "Le cockpit ne peut pas garantir l’isolation des données tant que l’organisation ou l’authentification n’est pas correctement activée.",
      code: "TENANT_CONFIG_REQUIRED",
    };
  }

  return {
    eyebrow: "Incident cockpit",
    title: "Une vérification a bloqué le chargement.",
    description:
      "Les données n’ont pas été affichées pour éviter un état incohérent. Réessayez, puis consultez la page sécurité si l’incident persiste.",
    code: "DASHBOARD_RUNTIME_ERROR",
  };
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const details = getReadableError(error);

  useEffect(() => {
    console.error("Dashboard error boundary", error);
  }, [error]);

  return (
    <main className="dashboard-error-shell min-h-screen px-5 py-8 text-white">
      <section className="dashboard-error-card mx-auto grid w-full max-w-5xl gap-8 rounded-lg p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-300">
            {details.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal text-zinc-50 md:text-4xl">
            {details.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
            {details.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              className="premium-action rounded-md text-sm font-semibold"
              onClick={reset}
              type="button"
            >
              Réessayer
            </button>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/settings/security"
            >
              Vérifier la sécurité
            </a>
            <a
              className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
              href="/login"
            >
              Se reconnecter
            </a>
          </div>
        </div>

        <aside className="dashboard-error-diagnostic rounded-lg p-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-zinc-500">
            Diagnostic
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-zinc-500">Code</dt>
              <dd className="font-mono text-zinc-100">{details.code}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Boundary</dt>
              <dd className="font-mono text-zinc-100">dashboard</dd>
            </div>
            {error.digest ? (
              <div>
                <dt className="text-zinc-500">Digest</dt>
                <dd className="break-all font-mono text-zinc-100">{error.digest}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-500">
            Les données métier restent masquées tant que la configuration n’est pas
            revenue dans un état cohérent.
          </p>
        </aside>
      </section>
    </main>
  );
}
