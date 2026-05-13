# Runbook production ContratPro

Ce runbook sert a deployer ContratPro avec un niveau de rigueur adapte a un SaaS
B2B payant : controles automatiques, variables sensibles separees, webhooks
verifies et procedure de retour arriere.

Depot GitHub officiel :

```text
https://github.com/admincairn/CONTRATPRO
```

Espace Vercel de reference :

```text
https://vercel.com/contratpro
```

Projet Supabase de reference :

```text
https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp
https://yotafzxcpyyrkkpeyfpp.supabase.co
```

Compte Stripe test de reference :

```text
https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard
```

## 1. Gate avant merge

Chaque pull request doit passer le workflow GitHub Actions `ContratPro CI`.
Il execute :

```powershell
npm run type-check
npm run test:quality
npm run security:audit
npm run production:audit
npm run build
```

Un changement ne doit pas etre merge si l'un de ces controles echoue.

Le remote local attendu est :

```powershell
git remote -v
```

avec `origin` pointe vers `https://github.com/admincairn/CONTRATPRO.git`.

## 2. Variables Vercel obligatoires

Renseigner les variables de `.env.production.example` dans Vercel, au minimum :

```text
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr
CONTRATPRO_APP_URL=https://votre-domaine.fr
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_RLS_ENABLED=true
CONTRATPRO_REQUIRE_BILLING=true
CONTRATPRO_ADMIN_EMAILS=esport.hub.pro@proton.me
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
GOCARDLESS_ACCESS_TOKEN=...
GOCARDLESS_ENVIRONMENT=live
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_STARTER=...
STRIPE_PRICE_ID_PRO=...
STRIPE_PRICE_ID_BUSINESS=...
CRON_SECRET=...
```

Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
`GOCARDLESS_ACCESS_TOKEN` ou les secrets webhook cote client.

## 3. Supabase

Executer les scripts SQL metier dans Supabase SQL Editor, puis terminer par :

```text
supabase/rls.sql
supabase/verify_rls.sql
```

Toutes les lignes de `verify_rls.sql` doivent retourner `status = OK`.

## 4. Webhooks production

Configurer les endpoints :

```text
Stripe      https://votre-domaine.fr/api/webhooks/stripe
GoCardless  https://votre-domaine.fr/api/webhooks/gocardless
Health      https://votre-domaine.fr/api/health
```

Evenements Stripe recommandes :

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
invoice.payment_succeeded
```

## 5. Verification apres deploiement

Controler dans cet ordre :

```text
/api/health
/login
/pricing
/demo
/admin/ops
/admin/notifications
/onboarding
```

Puis effectuer un test metier court :

- connexion admin ;
- creation ou consultation d'un client ;
- generation PDF facture ou attestation ;
- verification supervision ;
- verification notifications internes.

## 6. Backup et restauration Supabase

Avant chaque mise en production commerciale, verifier que les backups Supabase
du projet `yotafzxcpyyrkkpeyfpp` sont actifs depuis le dashboard officiel :
https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp

Cadence minimale pour les pilotes :

- backup quotidien Supabase actif avant les premiers clients payants ;
- export SQL manuel avant toute modification de `supabase/*.sql` ;
- verification de restauration sur un projet Supabase de test avant de toucher
  la base de production ;
- conservation du dernier export pre-release avec le numero de commit GitHub.

Une restauration doit etre traitee comme un incident production : couper les
crons, bloquer les webhooks si besoin, restaurer, puis relancer `npm run
deploy:smoke` et `npm run deploy:smoke:auth`.

## 7. Retour arriere

Si le deploiement casse une route critique :

1. repasser le domaine sur le deploiement Vercel precedent ;
2. verifier `/api/health` ;
3. consulter `/admin/ops` ;
4. corriger sur une branche dediee ;
5. attendre le passage complet de `ContratPro CI` avant redeploiement.
