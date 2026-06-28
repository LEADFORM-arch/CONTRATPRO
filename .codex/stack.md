# 🔧 Stack Technique — CONTRATPRO

## Core
| Technologie | Version | Pourquoi |
|-------------|---------|----------|
| Next.js | 15 | App Router, Server Components |
| React | 19 | Dernières features |
| TypeScript | 5.5+ | Strict mode |
| Node.js | 24.x | Forcé via package.json |
| TailwindCSS | 4 | Utility-first |

## Backend & Data
| Technologie | Version | Pourquoi |
|-------------|---------|----------|
| Supabase | Dernière | Auth + DB + Realtime |
| PostgreSQL | 15+ | DB relationnelle |
| Zod | 3.23+ | Validation inputs |

## UI & UX
| Technologie | Version | Pourquoi |
|-------------|---------|----------|
| shadcn/ui | Dernière | Composants accessibles |
| Lucide React | Dernière | Icônes |
| Tailwind Animate | Dernière | Animations |

## Intégrations métier
| Technologie | Version | Pourquoi |
|-------------|---------|----------|
| Resend | API | Emails clients + PDF |
| GoCardless | API 2015-07-06 | Prélèvements SEPA |
| Stripe | API | Abonnements SaaS (3 paliers) |

## Dev & Qualité
| Technologie | Version | Pourquoi |
|-------------|---------|----------|
| Vitest + RTL | Dernière | Tests unitaires + qualité |
| ESLint | 9+ | Linting |
| Prettier | 3+ | Formatting |

## CI/CD & Déploiement
| Technologie | Version | Pourquoi |
|-------------|---------|----------|
| GitHub Actions | — | CI sur PR/push |
| Vercel | — | Hosting + Cron |

## Variables d'environnement requises

```env
# === APP ===
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr
CONTRATPRO_APP_URL=https://votre-domaine.fr
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_RLS_ENABLED=true
CONTRATPRO_REQUIRE_BILLING=false
CONTRATPRO_ADMIN_EMAILS=admin@votre-domaine.fr
CONTRATPRO_NOTIFICATION_EMAILS=admin@votre-domaine.fr
CONTRATPRO_ORG_ID=org_demo
CONTRATPRO_CRON_SECRET=une-valeur-longue-et-aleatoire

# === SUPABASE ===
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# === EMAIL (Resend) ===
RESEND_API_KEY=...
RESEND_FROM_EMAIL=ContratPro <documents@votre-domaine.fr>

# === SEPA (GoCardless) ===
GOCARDLESS_ACCESS_TOKEN=...
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_VERSION=2015-07-06
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET=...

# === BILLING (Stripe) ===
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...

# === CRON ===
CRON_SECRET=...

# === SMOKE TESTS ===
CONTRATPRO_SMOKE_EMAIL=...
CONTRATPRO_SMOKE_PASSWORD=...
CONTRATPRO_RESEND_TEST_TO=...

# === Vercel (optionnel) ===
VERCEL_AUTOMATION_BYPASS_SECRET=...
```

## Commandes essentielles CONTRATPRO

```bash
# Développement
npm run dev              # Serveur standard
npm run dev:clean        # Serveur propre (évite empilement)

# Vérification
npm run type-check       # Vérification types TypeScript
npm run test:quality     # Tests de régression
npm run db:audit         # Audit migrations Supabase
npm run security:audit   # Audit sécurité
npm run production:audit # Audit déploiement
npm run ci:verify        # Chaîne complète CI locale

# Build
npm run build            # Build production

# Smoke tests
npm run smoke:demo                    # Scénario démo M. Martin
npm run smoke:stripe                  # Test Stripe billing
npm run smoke:gocardless              # Test GoCardless sandbox
npm run deploy:smoke -- <URL>         # Smoke routes publiques
npm run deploy:smoke:journey -- <URL> # Parcours client complet
npm run deploy:smoke:auth -- <URL>   # Smoke authentifié

# Stripe
npm run stripe:create-test-billing   # Créer produits/prix test
npm run stripe:readiness             # Vérifier Stripe ready

# Resend
npm run resend:readiness             # Vérifier Resend ready

# Déploiement
npm run deploy:preflight             # Vérification avant Vercel
npm run vercel:live-audit --silent  # Audit variables Vercel
```
