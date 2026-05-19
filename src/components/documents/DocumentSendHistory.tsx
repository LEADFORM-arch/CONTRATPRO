type SendHistoryItem = {
  createdAt: string;
  errorMessage: string;
  provider: string;
  providerMessageId: string;
  recipientEmail: string;
  recipientName: string;
  sentAt: string;
  status: string;
  subject: string;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    FAILED: "Echec",
    QUEUED: "En attente",
    SENT: "Envoye",
  };
  return labels[status] ?? status;
}

export function DocumentSendHistory({ sends }: { sends: SendHistoryItem[] }) {
  return (
    <section className="document-history rounded-lg border p-4 shadow-sm print:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-50">
            Historique d'envoi
          </h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500">
            Trace email conservée pour savoir qui a reçu quoi, quand, et avec
            quel statut.
          </p>
        </div>
        <span className="document-history-count">{sends.length}</span>
      </div>

      <div className="mt-4 grid gap-3">
        {sends.length ? (
          sends.map((send) => (
            <article
              className="document-history-row"
              data-status={send.status}
              key={`${send.createdAt}-${send.recipientEmail}-${send.subject}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-50">
                    {send.recipientName || send.recipientEmail}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {send.recipientEmail}
                  </p>
                </div>
                <span className="document-history-status">
                  {statusLabel(send.status)}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">{send.subject}</p>
              <dl className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                <div>
                  <dt>Envoi</dt>
                  <dd className="font-semibold text-zinc-300">{send.sentAt}</dd>
                </div>
                <div>
                  <dt>Provider</dt>
                  <dd className="font-semibold text-zinc-300">
                    {send.provider}
                    {send.providerMessageId ? ` · ${send.providerMessageId}` : ""}
                  </dd>
                </div>
              </dl>
              {send.errorMessage ? (
                <p className="mt-3 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                  {send.errorMessage}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="document-history-empty">
            Aucun envoi journalise pour ce document.
          </div>
        )}
      </div>
    </section>
  );
}
