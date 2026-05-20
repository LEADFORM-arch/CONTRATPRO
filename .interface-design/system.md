# ContratPro Interface System

ContratPro is not presented to prospects as a generic SaaS. It is a cockpit for
securing recurring CVC maintenance revenue: contracts, renewals, attestations,
invoices, SEPA payments, and founder sales decisions.

This file is the local source of truth for premium product screens. Apply it
before changing dashboards, admin panels, settings, onboarding, internal ops, or
data-heavy tools.

## Intent

- Human: founder, admin, or CVC business owner making a concrete operational
  decision after seeing real contract, payment, or pilot data.
- Task: decide, prioritize, recover, validate, send, relaunch, import, or secure.
- Feel: executive, field-aware, calm under pressure, commercially sharp. The
  interface should feel like a control room for recurring revenue, not a generic
  software dashboard.

## Domain

Use vocabulary and structures from the product world:

- Maintenance contract portfolio
- Annual renewal window
- Forgotten revenue
- Attestation proof
- SEPA cash-flow
- Import dry-run
- Pilot decision
- Blocking objection
- Go-live readiness
- Organization isolation

## Color World

The palette should feel like CVC operations at night: dark control surface,
validated signals, diagnostic light, cash-flow movement, and risk markers.

- Control black: deep zinc/near-black surfaces for cockpit focus.
- Navy steel: executive structure and page confidence.
- Energy green: validated action, renewal secured, sale ready.
- Diagnostic cyan: AI/analysis, detection, signal reading.
- Caution amber: iteration, incomplete setup, pricing friction.
- Stop red: blocker, failed guardrail, bad segment.
- White zinc: crisp primary text, never soft grey for key decisions.

Avoid purple-led, beige-led, decorative gradients, paper textures, or ornamental
background effects on product screens.

## Page Color Memory

Customer-facing product screens use a stable color-memory system so a busy CVC
owner can recognize the work zone before reading.

- 1 Start / onboarding: energy green for first action.
- 2 Import Excel: teal for data intake and dry-run.
- 3 Clients: light blue for customer portfolio.
- 4 Contracts: amber for recurring maintenance revenue.
- 5 SEPA: cyan for cash-flow and mandates.
- 6 Invoices: lime for documents ready to send.
- 7 Certificates: blue for proof and compliance.
- Relances: orange for urgency and recovery.
- Terrain mobile: sky blue for field work.
- Interventions: teal for performed visits.
- Entreprise: steel grey for company identity.
- Abonnement: gold for commercial access.
- Securite: soft red for risk and protection.

Rules:

- The active page background, header eyebrow, primary actions, nav marker, and
  generic status pills inherit the page signal.
- The color is a memory cue, not decoration. Keep it subtle on backgrounds and
  stronger only on the current action.
- The numbered journey is reserved for the core customer workflow; secondary
  tools use dot markers, not numbers.

## Direction

Signature: every premium cockpit should convert ambiguity into a visible next
decision. The strongest pattern is the "decision note": status, evidence,
checklist, next action, and one copyable summary.

Rejecting:

- Generic metric cards -> domain evidence cards tied to contracts, cash-flow,
  pilots, billing, or operations.
- Feature dashboards -> decision cockpits with a clear action verb.
- Empty panels -> actionable first-run states with one obvious next move.
- Decorative AI sections -> Architecte IA panels that classify, prioritize, or
  recommend a concrete decision.

## Surface System

Use a five-level dark surface system.

- Canvas: near-black page background, same family as sidebar.
- Base: dark zinc panels with subtle top light.
- Raised: slightly lighter cards for repeated evidence or decision items.
- Overlay: modal/dropdown level, one step above raised, not a floating glass
  effect.
- Focus: green/cyan tinted controls or border emphasis for the active action.

Depth comes from quiet borders and small surface shifts, not heavy shadows. On
dark screens, shadows should be subtle and secondary to border progression.

## Border Progression

- Soft: low-opacity zinc border for layout separation.
- Standard: stronger zinc border for cards and panels.
- Emphasis: colored top border or left rail for status cards.
- Focus: green/cyan border plus visible outline for keyboard and hover states.

Use colored borders only when they carry meaning. Status colors must map to the
decision state, not decoration.

## Typography

Use Inter only.

- Primary text: zinc-50/white, high contrast, short decision labels.
- Secondary text: zinc-300/400, operational explanations.
- Tertiary text: slate/zinc muted labels, uppercase only for small metadata.
- Data text: heavy weight, tabular where numbers compare.

Labels should be direct and business-oriented:

- Good: "Creer le premier contrat", "Envoyer", "Valider", "Relancer",
  "Copier la note", "Activer".
- Avoid: explanatory marketing copy, generic "Learn more", or prospect-facing
  use of the word "SaaS".

## Spacing And Shape

- Base spacing: 4px system.
- Dense dashboard rhythm: 12px to 20px gaps, depending on information density.
- Standard card radius: 10px to 12px.
- Buttons and compact controls: 6px to 8px radius.
- Avoid nested cards. If hierarchy is needed, use panel -> repeated item,
  or band -> constrained content.

## Pattern: Cockpit Decision Note

Use this pattern when a screen must produce a written decision after ambiguous
inputs. Current reference: `/admin/pilots`, "Fiche de sortie pilote".

Anatomy:

- Trigger label: short reason the decision exists.
- Decision title: one word or tight phrase.
- Decision note: ready-to-copy summary in operational language.
- Evidence checklist: three observable facts, not vague impressions.
- Next action: one owner-friendly action.
- Copy button: copies the note for CRM, runbook, or internal recap.

Allowed states:

- `sell`: green, when the signal is commercially ready.
- `iterate`: amber, when value is understood but one blocker remains.
- `stop`: red, when the segment or use case is wrong.

Rules:

- The copy text must be useful outside the app.
- The pattern must not ask the user to interpret a dashboard from scratch.
- The first visible action must be an imperative.
- Three decisions are enough unless the domain truly needs more.

## Pattern: Architecte IA Panel

Use when the product classifies an operational situation for the user.

Anatomy:

- Eyebrow naming the architect role.
- One business thesis.
- Primary metric and threshold.
- Evidence sequence or signal cards.
- Recommended next move.

The Architecte IA is not decorative. It must answer: "What should I do next?"

## Pattern: Actionable Empty State

Use when a business table is empty.

Anatomy:

- Domain-specific diagnosis.
- One primary action.
- One secondary recovery/import option if relevant.
- No generic illustration-only empty state.

The empty state should move the user toward activation, not apologize for missing
data.

## Pattern: Ops Checklist

Use in founder/admin spaces when deployment, demo, billing, auth, or smoke checks
must be trusted.

Anatomy:

- Status card with ready/warning/critical state.
- Exact command or route when action is technical.
- Copy action for commands.
- Short risk explanation.

Admin screens can be denser than customer screens, but the next action must stay
obvious.

## Responsive Rules

Mobile is critical because the target user can be in a van or between visits.

- Keep decision cards single-column on mobile.
- Preserve action buttons within thumb reach.
- Avoid wide tables without a mobile alternative.
- Do not scale fonts with viewport width.
- Do not let labels or buttons overflow their containers.

## Quality Bar

Before shipping a product screen, run four checks:

- Squint test: the main decision area must be obvious without reading details.
- Swap test: if the screen could belong to any generic B2B tool, make it more
  ContratPro-specific.
- Token test: colors and borders must come from the control-room palette.
- Action test: the user should know the next move within five seconds.
