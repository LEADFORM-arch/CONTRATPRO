type ActivationEmptyStateProps = {
  actionHref: string;
  actionLabel: string;
  eyebrow: string;
  proofPoints: string[];
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function ActivationEmptyState({
  actionHref,
  actionLabel,
  eyebrow,
  proofPoints,
  secondaryHref,
  secondaryLabel,
  title,
}: ActivationEmptyStateProps) {
  return (
    <div className="activation-empty-state" data-od-id="activation-empty-state">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-300">
          {eyebrow}
        </p>
        <h3 className="mt-2 max-w-2xl text-xl font-semibold text-zinc-50">
          {title}
        </h3>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-zinc-400 md:grid-cols-3">
          {proofPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="activation-empty-actions">
        <a className="premium-action rounded-md text-sm font-semibold" href={actionHref}>
          {actionLabel}
        </a>
        {secondaryHref && secondaryLabel ? (
          <a
            className="premium-secondary-action rounded-md px-4 py-2 text-sm font-semibold"
            href={secondaryHref}
          >
            {secondaryLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
