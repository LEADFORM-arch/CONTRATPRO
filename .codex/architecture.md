# 🏛️ Architecture — CONTRATPRO

## Vue d'ensemble

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client        │────▶│   Next.js       │────▶│   Supabase      │
│   (Browser/     │     │   (App Router)  │     │   (PostgreSQL)  │
│    PWA)         │     └─────────────────┘     └─────────────────┘
└─────────────────┘              │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Query   │     │   Server        │     │   RLS Policies  │
│   (Cache)       │     │   Actions       │     │   (Multi-tenant)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Stripe        │     │   GoCardless    │
│   (Billing)     │     │   (SEPA)        │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Webhooks      │     │   Webhooks      │
│   /api/webhooks │     │   /api/webhooks │
│   /stripe       │     │   /gocardless   │
└─────────────────┘     └─────────────────┘
```

## Flux de données principaux

### 1. Auth
```
Client → Supabase Auth → JWT → Middleware Next.js → Accès dashboard
```

### 2. Lecture données (Dashboard)
```
Client → React Query → Supabase (RLS + organization_id) → Données filtrées
```

### 3. Écriture données (Formulaire)
```
Client → Server Action → Zod validation → Supabase (RLS) → Revalidation cache
```

### 4. Paiement SEPA
```
Client → /api/payments/[id]/submit → GoCardless API → Webhook → payment_events
```

### 5. Billing Stripe
```
Client → /api/billing/checkout → Stripe → Webhook → billing_subscriptions
```

### 6. Relances auto
```
Cron Vercel → /api/cron/renewals → Resend (email) → renewal_actions
```

### 7. Documents PDF
```
Client → Route serveur PDF → Supabase (données) → PDF généré → Resend (email + PJ)
```

## Entités principales CONTRATPRO

| Entité | Description | Table Supabase | Clé étrangère |
|--------|-------------|----------------|---------------|
| Organization | Entreprise chauffagiste | `organizations` | — |
| Profile | Profil utilisateur | `profiles` | `auth.users` |
| Client | Client final | `clients` | `organization_id` |
| Equipment | Équipement CVC | `equipments` | `client_id` |
| Contract | Contrat maintenance | `contracts` | `client_id`, `organization_id` |
| Intervention | Visite maintenance | `interventions` | `contract_id` |
| Attestation | Attestation réglementaire | `attestations` | `intervention_id` |
| SEPA Payment | Paiement prélèvement | `sepa_payments` | `contract_id` |
| Document Send | Envoi document | `document_sends` | `contract_id` |
| Renewal Action | Relance renouvellement | `renewal_actions` | `contract_id` |
| Payment Event | Journal paiement | `payment_events` | `sepa_payment_id` |
| Billing | Abonnement Stripe | `billing_subscriptions` | `organization_id` |
| Notification | Alertes internes | `internal_notifications` | — |

## Points d'attention architecturaux CRITIQUES

- [ ] **RLS sur TOUTES les tables** — Vérifié par `verify_rls.sql`
- [ ] **Tenant isolation** — `organization_id` sur TOUTES les requêtes
- [ ] **Billing lock** — `CONTRATPRO_REQUIRE_BILLING=true` bloque l'accès
- [ ] **Webhooks signés** — Stripe (`Stripe-Signature`) + GoCardless (`Webhook-Signature`)
- [ ] **Cron protégé** — `CONTRATPRO_CRON_SECRET` requis
- [ ] **Idempotence** — `provider_event_id` pour éviter les doublons (Stripe)
- [ ] **PWA prudente** — Service worker ne cache PAS les données clients
- [ ] **Admin isolation** — Espace `/admin` réservé aux `CONTRATPRO_ADMIN_EMAILS`
