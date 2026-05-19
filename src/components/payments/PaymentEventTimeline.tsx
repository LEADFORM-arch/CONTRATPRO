type PaymentEvent = {
  createdAt: string;
  eventType: string;
  id: string;
  message: string;
  provider: string;
  providerEventId: string;
  status: string;
};

function eventLabel(value: string) {
  const labels: Record<string, string> = {
    payment_created: "Paiement créé",
    payment_status_updated: "Statut modifie",
    provider_submission: "Soumission provider",
    provider_submission_failed: "Echec provider",
    webhook: "Webhook provider",
  };
  return labels[value] ?? value;
}

export function PaymentEventTimeline({ events }: { events: PaymentEvent[] }) {
  return (
    <section className="payment-events rounded-lg border">
      <div className="payment-section-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Journal provider
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-50">
            Evenements d'encaissement
          </h3>
        </div>
        <span className="payment-risk-pill">{events.length} event</span>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {events.length ? (
          events.map((event) => (
            <article className="payment-event-card" data-status={event.status} key={event.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-50">
                    {eventLabel(event.eventType)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{event.createdAt}</p>
                </div>
                <span className="payment-event-status">{event.status}</span>
              </div>
              <p className="mt-3 text-sm leading-5 text-zinc-400">
                {event.message || "Aucun detail provider."}
              </p>
              <p className="mt-3 break-all text-xs text-zinc-500">
                {event.provider}
                {event.providerEventId ? ` · ${event.providerEventId}` : ""}
              </p>
            </article>
          ))
        ) : (
          <div className="payment-events-empty">
            Aucun evenement d'encaissement journalise pour l'instant.
          </div>
        )}
      </div>
    </section>
  );
}
