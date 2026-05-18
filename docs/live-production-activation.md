# Activation production live ContratPro

Objectif : passer d'un MVP pret pour pilotes a un SaaS encaissable avec vrais
clients, sans improviser sur les secrets, les webhooks ou la base.

Cette procedure complete le runbook production. Elle doit etre executee dans
l'ordre et avec preuves capturees.

## 1. Freeze release

Avant de toucher aux dashboards externes :

```bash
git status --short
git log -1 --oneline
npm run ci:verify
```

Preuve attendue :

- aucun fichier local non commit ;
- commit GitHub note ;
- controles locaux verts.

## 2. Supabase backup + RLS

Dashboard officiel :

```text
https://supabase.com/dashboard/project/<project-ref>
```

Actions :

1. Verifier que les backups Supabase sont actifs.
2. Faire un export SQL manuel pre-release si modification de schema.
3. Executer `supabase/verify_rls.sql` dans Supabase SQL Editor.
4. Conserver une capture des checks `OK`.

Bloquant si une politique RLS echoue.

## 3. Variables Vercel production

Dashboard Vercel :

```text
https://vercel.com/contratpro?repo=https%3A%2F%2Fgithub.com%2Fadmincairn%2FCONTRATPRO
```

Executer :

```bash
npm run deploy:preflight
npx vercel env ls | npm run vercel:live-audit --silent
```

Variables obligatoires cote production :

```text
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_RLS_ENABLED=true
CONTRATPRO_REQUIRE_BILLING=true
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_STARTER
STRIPE_PRICE_ID_PRO
STRIPE_PRICE_ID_BUSINESS
GOCARDLESS_ACCESS_TOKEN
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET
CRON_SECRET
```

Ne jamais coller de valeur de secret dans GitHub, README ou ticket.

## 4. Stripe live

Dashboard test fourni :

```text
https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard
```

Pour la production live, verifier :

- produits Starter / Pro / Business ;
- price_id live des trois paliers ;
- webhook `/api/webhooks/stripe` ;
- evenements `checkout.session.completed`, `invoice.payment_succeeded`,
  `invoice.payment_failed`, `customer.subscription.updated`.

Controle :

```bash
npm run stripe:readiness
```

## 5. GoCardless live

Actions :

1. Passer `GOCARDLESS_ENVIRONMENT=live`.
2. Configurer le webhook `/api/webhooks/gocardless`.
3. Tester un mandat avec un pilote autorise.
4. Verifier la ligne `payment_events`.

Ne pas ouvrir le SEPA large tant que le webhook live n'a pas ete observe.

## 6. Smoke post-deploiement

Apres deploiement :

```bash
npm run deploy:smoke -- https://votre-domaine.fr
npm run deploy:smoke:auth -- https://votre-domaine.fr
```

Si le domaine ou le deployment Vercel est protege, ajouter
`VERCEL_AUTOMATION_BYPASS_SECRET` au terminal de smoke. Les scripts envoient le
header `x-vercel-protection-bypass`, conformement a la protection automation de
Vercel. Un `401` sur toutes les routes publiques, y compris `/api/health`,
signale une protection Vercel, pas forcement une panne applicative.

Parcours minimum :

- `/api/health`
- `/login`
- `/pricing`
- `/demo`
- `/admin/launch`
- `/admin/pilots`
- `/import`
- `/relances`
- `/terrain`

## 7. Rollback arme

Avant d'inviter un pilote :

- conserver l'URL du precedent deploiement Vercel stable ;
- noter le commit GitHub courant ;
- noter le dernier backup Supabase ;
- savoir couper cron/webhooks si incident.

Decision finale :

```text
LIVE OK / LIVE PAUSE / ROLLBACK
```

Ne choisir `LIVE OK` que si smoke public, smoke authentifie, RLS et webhooks
critiques sont verifies.

Le panneau `/admin/launch` "Architecte IA production" centralise les liens de
controle Supabase, Vercel et GitHub, puis produit une note copiable pour figer
la decision avant d'inviter un pilote payant.
