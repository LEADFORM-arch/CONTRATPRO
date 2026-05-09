export default function NotFound() {
  return (
    <main className="login-shell flex min-h-screen items-center justify-center px-5 py-8 text-white">
      <section className="w-full max-w-xl rounded-lg border border-white/10 bg-zinc-950/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          ContratPro
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-zinc-50">
          Cette page n'existe pas encore.
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Revenez au cockpit pour retrouver les contrats, relances,
          attestations et paiements suivis par votre organisation.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="premium-action rounded-md text-sm font-semibold" href="/">
            Tableau de bord
          </a>
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href="/login"
          >
            Connexion
          </a>
        </div>
      </section>
    </main>
  );
}
