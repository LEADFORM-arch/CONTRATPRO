import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

const proofMetrics = [
  { label: "CA récurrent", value: "100%" },
  { label: "Relances", value: "Auto" },
  { label: "RLS", value: "Actif" },
];

export default function LoginPage() {
  return (
    <main className="login-shell min-h-screen px-5 py-6 text-white sm:px-8">
      <section className="login-stage mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="login-hero">
          <div className="login-brand-row">
            <span className="login-brand-mark">CP</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                ContratPro
              </p>
              <p className="text-sm text-zinc-500">Maintenance CVC</p>
            </div>
          </div>

          <nav className="login-public-links">
            <a href="/demo">Démo</a>
            <a href="/pricing">Tarif</a>
            <a href="/privacy">Confidentialité</a>
          </nav>

          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-normal text-zinc-50 sm:text-5xl">
            Pilotez vos contrats CVC comme un centre de profit.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
            Une interface exécutive pour suivre renouvellements, attestations,
            factures et paiements récurrents sans perdre le fil opérationnel.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {proofMetrics.map((metric) => (
              <article className="login-proof-metric" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>

          <div className="login-product-preview">
            <div className="login-preview-header">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Vue dirigeant
                </p>
                <strong>Contrats à renouveler</strong>
              </div>
              <span>Live</span>
            </div>
            <div className="login-preview-grid">
              <div className="login-preview-kpi" data-tone="emerald">
                <span>Revenu annuel</span>
                <strong>48 900 EUR</strong>
              </div>
              <div className="login-preview-kpi" data-tone="cyan">
                <span>Attestations</span>
                <strong>18</strong>
              </div>
            </div>
            <div className="login-preview-list">
              <div>
                <span>Pompe à chaleur - Dijon</span>
                <strong>J+12</strong>
              </div>
              <div>
                <span>Chaudière gaz - Lyon</span>
                <strong>J+21</strong>
              </div>
              <div>
                <span>Clim réversible - Annecy</span>
                <strong>J+34</strong>
              </div>
            </div>
          </div>
        </div>

        <section className="login-card">
          <div className="login-card-topline" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-400">
                Accès sécurisé
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Connexion
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Connectez-vous à votre espace entreprise.
              </p>
            </div>
            <span className="login-security-pill">Supabase</span>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="login-card-footer">
            <span />
            Données isolées par organisation avec RLS active.
          </div>
        </section>
      </section>
    </main>
  );
}
