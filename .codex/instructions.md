# 🎯 Instructions Codex — CONTRATPRO

> Dernière mise à jour : 2026-06-28
> Projet : CONTRATPRO
> Cible : Chauffagistes CVC (France) — B2B SaaS
> Founder : Solo founder basé en France
> Repo : https://github.com/LEADFORM-arch/CONTRATPRO
> Déploiement : Vercel + Supabase

---

## 🏗️ STACK TECHNIQUE EXACTE

| Couche | Technologie | Version | Usage |
|--------|-------------|---------|-------|
| Framework | Next.js | 15 (App Router) | App Router, Server Components |
| Langage | TypeScript | 5.5+ | Strict mode |
| Runtime | Node.js | 24.x | Forcé via package.json |
| Styling | TailwindCSS | 4 | Utility-first |
| UI Components | shadcn/ui | Dernière | Composants accessibles |
| Backend | Supabase | Dernière | Auth + DB + Realtime |
| Auth | Supabase Auth | — | Email/password + OAuth |
| Base de données | PostgreSQL | 15+ | Via Supabase |
| ORM/Client DB | Supabase Client | — | Client + Server |
| Validation | Zod | 3.23+ | Tous les inputs |
| Data Fetching | React Query (TanStack Query) | 5+ | Cache côté client |
| Emails | Resend | — | PDF + emails clients |
| Paiements SEPA | GoCardless | API 2015-07-06 | Prélèvements récurrents |
| Billing SaaS | Stripe | — | 3 paliers : Starter/Pro/Business |
| PDF | Route serveur | — | Factures + attestations |
| PWA | Service Worker | — | Page terrain mobile |
| Tests | Vitest + RTL | — | Tests qualité + smoke |
| CI/CD | GitHub Actions | — | `.github/workflows/ci.yml` |
| Déploiement | Vercel | — | Hosting + Cron |

---

## 📐 ARCHITECTURE DES DOSSIERS (CONTRATPRO)

```
📁 contratpro/
├── app/                          → Next.js App Router
│   ├── (auth)/                   → Routes auth (login, register)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              → Routes dashboard (protégées)
│   │   ├── page.tsx              → Dashboard principal
│   │   ├── clients/              → Gestion clients
│   │   ├── contrats/             → Contrats annuels CVC
│   │   ├── interventions/        → Interventions planifiées
│   │   ├── attestations/         → Attestations réglementaires
│   │   ├── relances/             → Relances renouvellement
│   │   ├── paiements/            → Paiements SEPA
│   │   ├── import/               → Import CSV/XLSX clients
│   │   ├── onboarding/           → Activation client
│   │   ├── settings/             → Paramètres entreprise
│   │   │   └── billing/          → Abonnement Stripe
│   │   ├── terrain/              → PWA mobile terrain
│   │   └── layout.tsx            → Layout dashboard (sidebar + header)
│   ├── admin/                    → Espace admin fondateur
│   │   ├── page.tsx              → Dashboard prospection
│   │   ├── launch/               → Cockpit go-live
│   │   ├── pilots/               → Scorecard pilotes
│   │   ├── ops/                  → Supervision production
│   │   ├── notifications/        → Alertes internes
│   │   └── prospection/          → Prospection Facebook
│   ├── api/                      → API Routes
│   │   ├── auth/                 → Auth callbacks
│   │   ├── billing/              → Stripe checkout + portal
│   │   ├── cron/renewals         → Cron relances quotidiennes
│   │   ├── import/clients        → Import CSV/XLSX
│   │   ├── payments/[id]/submit  → Soumission GoCardless
│   │   ├── relances/send         → Envoi relance email
│   │   ├── webhooks/             → Stripe + GoCardless
│   │   │   ├── stripe
│   │   │   └── gocardless
│   │   ├── health                → Health check uptime
│   │   └── admin/ops             → Détail opérationnel admin
│   ├── demo/                     → Page démo publique
│   ├── pricing/                  → Tarifs publiques
│   ├── legal/                    → Mentions légales
│   ├── terms/                    → CGV
│   ├── privacy/                  → Confidentialité
│   ├── cookies/                  → Politique cookies
│   ├── dpa/                      → DPA
│   ├── layout.tsx                → Root layout
│   └── globals.css               → Styles globaux + tokens
├── components/
│   ├── ui/                       → shadcn/ui (NE PAS MODIFIER)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── features/                 → Composants métier CONTRATPRO
│   │   ├── clients/
│   │   │   ├── client-list.tsx
│   │   │   ├── client-form.tsx
│   │   │   └── client-card.tsx
│   │   ├── contrats/
│   │   │   ├── contrat-list.tsx
│   │   │   ├── contrat-form.tsx
│   │   │   └── contrat-card.tsx
│   │   ├── interventions/
│   │   ├── attestations/
│   │   ├── relances/
│   │   ├── paiements/
│   │   ├── billing/
│   │   │   ├── billing-plans.tsx
│   │   │   └── billing-status.tsx
│   │   ├── onboarding/
│   │   │   └── onboarding-score.tsx
│   │   └── admin/
│   │       ├── architecte-ia.tsx     → Blocs "Architecte IA"
│   │       ├── scorecard-pilote.tsx
│   │       └── prospection-panel.tsx
│   └── layout/                   → Layouts réutilisables
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── dashboard-layout.tsx
├── lib/
│   ├── utils.ts                  → cn() + helpers
│   ├── supabase/
│   │   ├── client.ts             → Browser client
│   │   └── server.ts             → Server client (RLS)
│   ├── validations/              → Schémas Zod
│   │   ├── client.schema.ts
│   │   ├── contrat.schema.ts
│   │   ├── intervention.schema.ts
│   │   ├── paiement.schema.ts
│   │   └── billing.schema.ts
│   ├── gocardless.ts             → Client GoCardless
│   ├── stripe.ts                 → Client Stripe
│   └── resend.ts                 → Client Resend
├── hooks/                        → Custom hooks
│   ├── use-auth.ts
│   ├── use-clients.ts
│   ├── use-contrats.ts
│   ├── use-paiements.ts
│   └── use-billing.ts
├── types/                        → Types globaux
│   └── index.ts
├── services/                     → Logique métier (Server Actions)
│   ├── client.service.ts
│   ├── contrat.service.ts
│   ├── intervention.service.ts
│   ├── attestation.service.ts
│   ├── paiement.service.ts
│   ├── relance.service.ts
│   └── billing.service.ts
├── tests/                        → Tests
│   ├── unit/
│   └── integration/
├── supabase/                     → Scripts SQL
│   ├── schema.sql
│   ├── seed.sql
│   ├── rls.sql                   → DOIT être exécuté EN DERNIER
│   ├── verify_rls.sql
│   ├── renewal_actions.sql
│   ├── document_sends.sql
│   ├── payment_events.sql
│   ├── billing.sql
│   ├── notifications.sql
│   ├── prospection.sql
│   └── migration-order.json      → Ordre officiel des migrations
├── docs/                         → Documentation
│   ├── production-runbook.md
│   ├── pilot-runbook.md
│   ├── cron-renewals-runbook.md
│   ├── stripe-test-billing.md
│   ├── gocardless-sandbox-runbook.md
│   ├── onboarding-activation-runbook.md
│   ├── internal-notifications-runbook.md
│   ├── customer-journey-runbook.md
│   ├── resend-readiness.md
│   ├── local-development-env.md
│   ├── vercel-launch-checklist.md
│   ├── architecture-audit-corrections.md
│   └── skill-prospection-facebook/
├── public/                       → Assets statiques
│   ├── manifest.webmanifest      → PWA
│   └── offline.html              → Page offline PWA
├── .github/
│   ├── workflows/ci.yml          → CI GitHub Actions
│   └── pull_request_template.md  → Template PR
├── .env.local                    → Variables locales (NE PAS COMMIT)
├── .env.local.example            → Template variables
├── .env.production.example       → Template production
├── vercel.json                   → Config Vercel + Cron
├── package.json                  → Node 24.x forcé
└── .codex/                       ← CE DOSSIER (règles Codex)
```

---

## ⚡ RÈGLES STRICTES DE CODAGE — CONTRATPRO

### 1. TypeScript — STRICT
- **PAS DE `any`. JAMAIS.**
- Utilise `unknown` + type guard si le type est incertain au runtime
- Interfaces pour les objets, `type` pour les unions
- Tous les params de fonction doivent être typés
- Types métier CONTRATPRO dans `types/index.ts`

```typescript
// ❌ INTERDIT
function getClient(id: any) { ... }

// ✅ OBLIGATOIRE
function getClient(id: string): Promise<Client | null> { ... }

// ✅ Type guard
function isClient(obj: unknown): obj is Client {
  return obj !== null && typeof obj === 'object' && 'id' in obj && 'raisonSociale' in obj;
}
```

### 2. React — Server Components par défaut
- **Server Component par défaut** (pas de `'use client'`)
- `'use client'` UNIQUEMENT si :
  - `useState`, `useEffect`, `useReducer`
  - Événements DOM (`onClick`, `onSubmit`, etc.)
  - APIs navigateur (`window`, `document`, `localStorage`)
- Les formulaires utilisent `useActionState` ou Server Actions
- **PAS de `useEffect` pour le data fetching** → React Query

```typescript
// ❌ INTERDIT
'use client';
export function ClientList() {
  const [clients, setClients] = useState([]);
  useEffect(() => { fetch('/api/clients').then(...) }, []); // ❌
}

// ✅ OBLIGATOIRE — React Query
function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      return data;
    },
  });
}
```

### 3. Supabase — Multi-tenant + RLS
- **RLS activé sur TOUTES les tables** (vérifié par `verify_rls.sql`)
- Jamais de clé `service_role` côté client
- Client Supabase server pour les Server Actions
- Client Supabase browser pour les composants client
- **Tenant isolation** : toutes les requêtes filtrent par `organization_id`

```typescript
// ✅ Pattern multi-tenant
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('organization_id', organizationId);  // ← OBLIGATOIRE
```

### 4. Validation — Zod systématique
- **TOUS les inputs** (API + formulaires + imports CSV)
- Schémas dans `lib/validations/`
- Validation côté client ET côté serveur
- **Imports CSV** : validation ligne par ligne avant écriture

```typescript
// lib/validations/client.schema.ts
export const clientSchema = z.object({
  raisonSociale: z.string().min(2, 'Minimum 2 caractères').max(200),
  email: z.string().email('Email invalide'),
  telephone: z.string().regex(/^0[1-9](\d{8})$/, 'Téléphone français invalide'),
  adresse: z.string().min(5).optional(),
  codePostal: z.string().regex(/^\d{5}$/, 'Code postal invalide').optional(),
  ville: z.string().min(2).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
```

### 5. Gestion des erreurs — Typée + Journalisée
- try/catch sur TOUTES les opérations async
- Erreurs typées avec classes custom
- **Journalisation dans les tables métier** (`payment_events`, `document_sends`, `renewal_actions`)
- Jamais de `throw` brut avec string

```typescript
// types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} non trouvé`, 'NOT_FOUND', 404);
  }
}

export class BillingError extends AppError {
  constructor(message: string) {
    super(message, 'BILLING_LOCKED', 403);
  }
}
```

### 6. Fonctions — Courtes et modulaires
- **Maximum 40 lignes** par fonction
- Une fonction = une responsabilité (SRP)
- Nom explicite : `getActiveContractsByClientId` > `getContracts`
- Pas de commentaires inutiles (le code doit s'auto-documenter)

### 7. Pas de code mort
- **Pas de `// TODO: implement later`**
- **Pas de `console.log` en production** → utiliser un logger structuré ou les tables de journalisation
- Si une logique manque : `throw new Error('Not implemented: [raison]')`

### 8. Sécurité — Garde-fous CONTRATPRO
- Validation Zod sur TOUS les inputs
- RLS sur toutes les tables (vérifié par `npm run security:audit`)
- Webhooks signés (Stripe + GoCardless) — vérifier `Webhook-Signature`
- Cron protégé par `CONTRATPRO_CRON_SECRET`
- Routes admin protégées par `CONTRATPRO_ADMIN_EMAILS`
- Billing lock : `CONTRATPRO_REQUIRE_BILLING=true` bloque les pages métier si abonnement inactif
- Pas de secrets dans le code (`.env.local` uniquement)
- Headers de sécurité configurés sur Vercel

### 9. Performance
- Pas de fuites de mémoire (cleanup useEffect)
- Pas de re-rendus inutiles (memo quand pertinent)
- Pas de requêtes N+1 (utiliser `select` + `include` intelligemment)
- Images optimisées avec `next/image`
- PWA : service worker prudent (pas de cache données clients)

### 10. Tests — Qualité produit
- `npm run test:quality` : tests de régression (DOIVENT passer)
- `npm run security:audit` : audit sécurité
- `npm run db:audit` : vérification migrations Supabase
- `npm run production:audit` : vérification déploiement
- `npm run ci:verify` : chaîne complète CI locale
- Tests unitaires pour la logique métier
- Smoke tests pour les parcours critiques

---

## 🚫 INTERDICTIONS ABSOLUES — CONTRATPRO

| # | Interdiction | Sanction |
|---|-------------|----------|
| 1 | Utiliser `any` | Refus immédiat |
| 2 | `useEffect` pour data fetching | Refus immédiat, utiliser React Query |
| 3 | Oublier `organization_id` dans une requête Supabase | Refus immédiat (risque multi-tenant) |
| 4 | Désactiver RLS ou modifier `rls.sql` sans audit | Refus immédiat (risque sécurité) |
| 5 | Supprimer un fichier sans autorisation | Refus immédiat |
| 6 | Modifier `package.json` sans GO | Refus immédiat |
| 7 | Installer une dépendance sans justification | Refus immédiat |
| 8 | Exposer un secret dans le code | Refus immédiat, alerte critique |
| 9 | Code > 40 lignes sans découpage | Demande de refactor |
| 10 | `console.log` en production | Demande de remplacer par journalisation |
| 11 | Pas de validation Zod sur input | Refus immédiat |
| 12 | Pas de gestion d'erreur sur async | Refus immédiat |
| 13 | Modifier `supabase/migration-order.json` sans GO | Refus immédiat |
| 14 | Ignorer les tests `test:quality` | Refus immédiat |
| 15 | Hardcoder des valeurs métier (prix, durées) | Refus immédiat → utiliser config |

---

## 🔄 PROCESSUS D'INTERACTION (OBLIGATOIRE)

À CHAQUE demande d'implémentation, tu DOIS suivre cet ordre STRICT :

### Étape 1 : Analyse (2 phrases max)
> "Je comprends que tu veux [RÉSUMÉ DU BESOIN]. Cela implique [IMPACT TECHNIQUE]."

### Étape 2 : Questions (si besoin)
> S'il manque du contexte critique, pose la question AVANT de coder.
> Exemples de questions pertinentes pour CONTRATPRO :
> - "Quel est le `organization_id` cible ?"
> - "Le feature doit-elle être protégée par le billing lock ?"
> - "Quel est le statut RLS requis pour cette table ?"
> - "Le webhook doit-il être idempotent ?"

### Étape 3 : Plan d'action
> Liste les fichiers créés/modifiés et pourquoi.
> Indiquer les impacts sur :
> - RLS (nouvelle table ? nouvelle policy ?)
> - Billing (nouvelle route protégée ?)
> - Webhooks (nouveau endpoint ?)
> - Tests (nouveau test quality ?)

```
📁 Fichiers impactés :
├── 🆕 app/(dashboard)/[feature]/page.tsx         → Page principale
├── 🆕 components/features/[feature]-list.tsx      → Liste métier
├── 🆕 lib/validations/[feature].schema.ts         → Validation Zod
├── 🆕 services/[feature].service.ts               → Logique métier
├── 🆕 hooks/use-[feature].ts                       → Hook React Query
├── 📝 supabase/schema.sql                         → Nouvelle table
├── 📝 supabase/rls.sql                            → Policy RLS (EN DERNIER)
├── 📝 supabase/migration-order.json               → Mise à jour ordre
└── 📝 tests/...                                    → Tests qualité
```

### Étape 4 : Code
> Fournis le code. Si modification d'un fichier existant, montre UNIQUEMENT la partie modifiée avec le contexte nécessaire.
> **RAPPEL :** Respecter strictement `design-system.md` pour l'UI.

### Étape 5 : Tests + Audit
> Propose immédiatement :
> 1. Le test unitaire principal
> 2. Le test de qualité (si impact sur les garde-fous)
> 3. La commande d'audit à lancer : `npm run test:quality && npm run security:audit`

---

## 📤 FORMAT DE SORTIE

- **Blocs de code Markdown** avec le langage spécifié
- Si tu corriges un bug : explique d'abord la **CAUSE RACINE** avant le code
- Si tu modifies un fichier existant : format "diff" ou section modifiée uniquement
- Pour les features complexes : inclure un **diagramme ASCII** du flux de données

---

## 🔐 PERMISSIONS ET LIMITES

| Action | Permission |
|--------|-----------|
| Lire n'importe quel fichier du repo | ✅ OUI |
| Créer des fichiers | ✅ OUI |
| Modifier des fichiers existants | ✅ OUI |
| Supprimer des fichiers | ❌ NON (sans autorisation explicite) |
| Modifier `package.json` | ❌ NON (sans justification + GO) |
| Modifier `supabase/migration-order.json` | ❌ NON (sans GO) |
| Modifier `vercel.json` | ❌ NON (sans GO) |
| Modifier `.github/workflows/ci.yml` | ❌ NON (sans GO) |
| Installer des dépendances | ❌ NON (sans GO) |
| Exposer des secrets | ❌ NON (JAMAIS) |
| Modifier `.env*` | ❌ NON (JAMAIS) |
| Désactiver RLS ou modifier `rls.sql` sans audit | ❌ NON (JAMAIS) |

---

## 🎯 CONTEXTE MÉTIER CONTRATPRO

### Projet : CONTRATPRO
- **Marché cible** : Chauffagistes CVC en France (artisans, PME)
- **Modèle économique** : SaaS B2B — Abonnement mensuel
  - Starter : 49 EUR/mois
  - Pro : 99 EUR/mois
  - Business : 199 EUR/mois
- **Utilisateurs** : Chauffagistes, techniciens, admins CVC
- **Problème résolu** : Gestion chaotique des contrats de maintenance CVC (Excel, papier, relances manuelles)
- **Différenciateur** : Tout-en-un (contrats + interventions + attestations + SEPA + relances auto) avec PWA terrain

### Entités métier principales
| Entité | Description | Table Supabase |
|--------|-------------|----------------|
| Organization | Entreprise chauffagiste | `organizations` |
| User | Utilisateur (chauffagiste, admin) | `auth.users` + `profiles` |
| Client | Client final du chauffagiste | `clients` |
| Equipment | Équipement CVC chez le client | `equipments` |
| Contrat | Contrat de maintenance annuel | `contracts` |
| Intervention | Visite de maintenance planifiée | `interventions` |
| Attestation | Attestation réglementaire | `attestations` |
| SEPA Payment | Paiement par prélèvement | `sepa_payments` |
| Document Send | Envoi document (email + PDF) | `document_sends` |
| Renewal Action | Relance renouvellement | `renewal_actions` |
| Payment Event | Journal événements paiement | `payment_events` |
| Billing | Abonnement Stripe | `billing_subscriptions` |
| Notification | Alertes internes | `internal_notifications` |

### Garde-fous critiques
- **Multi-tenant** : Toutes les données sont isolées par `organization_id`
- **Billing lock** : `CONTRATPRO_REQUIRE_BILLING=true` bloque l'accès si abonnement inactif
- **RLS** : Toutes les tables ont des policies RLS (vérifiées par `verify_rls.sql`)
- **Webhooks signés** : Stripe et GoCardless vérifient la signature
- **Cron protégé** : `CONTRATPRO_CRON_SECRET` requis pour `/api/cron/renewals`
- **Admin isolation** : Espace `/admin` réservé aux `CONTRATPRO_ADMIN_EMAILS`

### Ordre des migrations Supabase (CRITIQUE)
```
1. schema.sql          → Tables et types
2. seed.sql            → Données initiales
3. renewal_actions.sql → Relances
4. prospection.sql     → Prospection
5. document_sends.sql  → Envoi documents
6. payment_events.sql  → Journal paiements
7. billing.sql         → Abonnements
8. notifications.sql   → Alertes internes
9. rls.sql             → ← DOIT ÊTRE EN DERNIER
10. verify_rls.sql     → ← Vérification finale
```

---

## 🎯 RÉFÉRENCES PROJET

- **Repo** : https://github.com/LEADFORM-arch/CONTRATPRO
- **Vercel** : https://vercel.com/contratpro
- **Stack** : Next.js 15 + Supabase + Tailwind + shadcn/ui + Stripe + GoCardless + Resend
- **Commandes** : `npm run dev:clean`, `npm run ci:verify`, `npm run test:quality`

---

Acknowledge ces règles en disant exactement :
**"Règles comprises. Prêt à architecturer CONTRATPRO. Quelle priorité on attaque ?"**

Puis attends ma première demande.
