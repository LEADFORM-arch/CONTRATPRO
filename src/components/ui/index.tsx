import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type Tone =
  | "emerald"
  | "cyan"
  | "amber"
  | "rose"
  | "sky"
  | "lime"
  | "blue"
  | "steel";

export type DecisionState = "sell" | "iterate" | "stop";

/* ----------------------------------------------------------------
   Button
----------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonSizeClass: Record<ButtonSize, string> = {
  sm: "cp-btn-sm",
  md: "",
  lg: "cp-btn-lg",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`cp-btn cp-btn-${variant} ${buttonSizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`cp-btn cp-btn-${variant} ${buttonSizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
}

/* ----------------------------------------------------------------
   Card
----------------------------------------------------------------- */

type CardProps = HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  accent?: boolean;
  tone?: Tone;
};

export function Card({
  raised,
  accent,
  tone,
  className = "",
  children,
  ...props
}: CardProps) {
  const classes = [
    "cp-card",
    raised ? "cp-card-raised" : "",
    accent ? "cp-card-accent" : "",
    tone ? "" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} data-tone={tone} {...props}>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------
   StatCard
----------------------------------------------------------------- */

type StatCardProps = {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: Tone;
  className?: string;
};

export function StatCard({ label, value, detail, tone, className = "" }: StatCardProps) {
  return (
    <article className={`cp-stat ${className}`.trim()} data-tone={tone}>
      <p className="cp-stat-label">{label}</p>
      <strong className="cp-stat-value">{value}</strong>
      {detail ? <p className="cp-stat-detail">{detail}</p> : null}
    </article>
  );
}

/* ----------------------------------------------------------------
   Pill (remplace les 18 status-pill)
----------------------------------------------------------------- */

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  dot?: boolean;
};

export function Pill({ tone, dot, className = "", children, ...props }: PillProps) {
  return (
    <span
      className={`cp-pill ${dot ? "cp-pill-dot" : ""} ${className}`.trim()}
      data-tone={tone}
      {...props}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------
   Metric
----------------------------------------------------------------- */

type MetricProps = {
  value: ReactNode;
  label: string;
  className?: string;
};

export function Metric({ value, label, className = "" }: MetricProps) {
  return (
    <div className={`cp-metric ${className}`.trim()}>
      <strong className="cp-metric-value">{value}</strong>
      <span className="cp-metric-label">{label}</span>
    </div>
  );
}

/* ----------------------------------------------------------------
   Gauge — score circulaire animé
----------------------------------------------------------------- */

type GaugeProps = {
  value: number;
  max?: number;
  size?: number;
  label?: ReactNode;
  caption?: ReactNode;
  tone?: Tone;
};

export function Gauge({ value, max = 100, size = 132, label, caption, tone }: GaugeProps) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);
  const strokeColor =
    tone === "emerald"
      ? "var(--accent-emerald)"
      : tone === "amber"
        ? "var(--accent-amber)"
        : tone === "rose"
          ? "var(--accent-rose)"
          : tone === "cyan"
            ? "var(--accent-cyan)"
            : "var(--page-signal-strong)";

  return (
    <div
      className="cp-gauge"
      style={
        {
          "--gauge-circumference": circumference,
          "--gauge-offset": offset,
          width: size,
          height: size,
        } as React.CSSProperties
      }
    >
      <svg width={size} height={size}>
        <circle
          className="cp-gauge-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="cp-gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="cp-gauge-center">
        {label ? <strong className="cp-metric-value">{label}</strong> : null}
        {caption ? <span className="cp-metric-label">{caption}</span> : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   ProgressBar
----------------------------------------------------------------- */

type ProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
};

export function ProgressBar({ value, max = 100, className = "" }: ProgressBarProps) {
  const ratio = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`cp-bar ${className}`.trim()} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className="cp-bar-fill" style={{ width: `${ratio}%` }} />
    </div>
  );
}

/* ----------------------------------------------------------------
   SectionPanel
----------------------------------------------------------------- */

type SectionPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionPanel({
  title,
  description,
  action,
  children,
  className = "",
}: SectionPanelProps) {
  return (
    <section className={`cp-section ${className}`.trim()}>
      <header className="cp-section-header">
        <div>
          <h3 className="cp-section-title">{title}</h3>
          {description ? <p className="cp-section-desc">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="cp-section-body">{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------------
   AgentPanel — pattern "Architecte IA"
----------------------------------------------------------------- */

type AgentPanelProps = {
  eyebrow?: string;
  thesis: string;
  proof?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function AgentPanel({
  eyebrow = "Architecte IA",
  thesis,
  proof,
  action,
  children,
  className = "",
}: AgentPanelProps) {
  return (
    <article className={`cp-agent ${className}`.trim()}>
      <div>
        <p className="cp-agent-eyebrow">
          <span className="cp-live-dot" aria-hidden />
          {eyebrow}
        </p>
        <h3 className="cp-agent-thesis">{thesis}</h3>
        {proof ? <p className="cp-agent-proof">{proof}</p> : null}
        {children}
      </div>
      {action ? <div className="cp-agent-action">{action}</div> : null}
    </article>
  );
}

/* ----------------------------------------------------------------
   DecisionNote — pattern sell / iterate / stop
----------------------------------------------------------------- */

type DecisionNoteProps = {
  state: DecisionState;
  trigger: string;
  title: string;
  note: string;
  evidence?: string[];
  nextAction?: ReactNode;
  className?: string;
};

export function DecisionNote({
  state,
  trigger,
  title,
  note,
  evidence,
  nextAction,
  className = "",
}: DecisionNoteProps) {
  return (
    <article className={`cp-decision ${className}`.trim()} data-state={state}>
      <p className="cp-decision-trigger">{trigger}</p>
      <h4 className="cp-decision-title">{title}</h4>
      <p className="cp-decision-note">{note}</p>
      {evidence?.length ? (
        <ul className="cp-checklist">
          {evidence.map((item) => (
            <li className="cp-check-item" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {nextAction ? <div className="mt-4">{nextAction}</div> : null}
    </article>
  );
}

/* ----------------------------------------------------------------
   EmptyState — actionnable
----------------------------------------------------------------- */

type EmptyStateProps = {
  diagnosis: string;
  detail?: string;
  action?: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

export function EmptyState({
  diagnosis,
  detail,
  action,
  secondary,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`cp-empty ${className}`.trim()}>
      <p className="cp-empty-diagnosis">{diagnosis}</p>
      {detail ? <p className="cp-empty-detail">{detail}</p> : null}
      {action || secondary ? (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {action}
          {secondary}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------
   LiveDot & Eyebrow
----------------------------------------------------------------- */

export function LiveDot({ className = "" }: { className?: string }) {
  return <span className={`cp-live-dot ${className}`.trim()} aria-hidden />;
}

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return <p className={`cp-eyebrow ${className}`.trim()}>{children}</p>;
}

/* ----------------------------------------------------------------
   CheckItem
----------------------------------------------------------------- */

export function CheckItem({ children }: { children: ReactNode }) {
  return <li className="cp-check-item">{children}</li>;
}
