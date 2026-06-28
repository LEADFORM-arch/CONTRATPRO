# Checklist de mise en ligne Vercel

Objectif : deployer ContratPro depuis le repo GitHub officiel avec des secrets
propres, un build reproductible et un controle post-deploiement.

## 1. Depot GitHub

Repo source :

```text
https://github.com/LEADFORM-arch/CONTRATPRO
```

Espace Vercel de reference :

```text
https://vercel.com/contratpro
```

Projet Supabase de reference :

```text
https://supabase.com/dashboard/project/<project-ref>
https://<project-ref>.supabase.co
```

Compte Stripe test de reference :

```text
https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard
```

Cette URL correspond au dashboard Vercel. L'URL publique a tester apres
deploiement sera une URL du type `https://contratpro.vercel.app` ou votre
domaine final.

Le remote local attendu :

```powershell
git remote -v
```

doit afficher :

```text
origin  https://github.com/LEADFORM-arch/CONTRATPRO.git
```

Verifier aussi l'auteur Git local avant de pousser sur `main` :

```powershell
git config user.name
git config user.email
```

Pour le projet Vercel `contratpro`, l'email local doit etre associe au compte
Vercel/GitHub autorise. Un email non reconnu peut creer un deploiement GitHub
en etat `BLOCKED` avant meme le build, surtout sur un depot prive. La valeur
actuelle attendue est :

```text
admin@votre-domaine.fr
```

## 2. Import Vercel

Dans Vercel :

1. creer un nouveau projet ;
2. importer `LEADFORM-arch/CONTRATPRO` ;
3. laisser Framework Preset sur Next.js ;
4. garder Root Directory a la racine du repo ;
5. regler Node.js 24.x ou laisser Vercel lire `engines.node`.

Le projet declare aussi :

```json
{
  "engines": {
    "node": "24.x"
  }
}
```

## 3. Variables d'environnement

Copier les variables de `.env.production.example` dans Vercel Project Settings.

Projet Supabase cible :

```text
https://<project-ref>.supabase.co
```

Variables a remplir avec de vraies valeurs :

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
GOCARDLESS_ACCESS_TOKEN
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_STARTER
STRIPE_PRICE_ID_PRO
STRIPE_PRICE_ID_BUSINESS
CRON_SECRET
CONTRATPRO_CRON_SECRET
```

Garder en production :

```text
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_RLS_ENABLED=true
CONTRATPRO_REQUIRE_BILLING=true
GOCARDLESS_ENVIRONMENT=live
```

## 4. Controle avant deploy

En local :

```powershell
npm run ci:verify
npm run deploy:preflight
npm run db:audit
npx vercel env ls | npm run vercel:live-audit --silent
```

Dans GitHub, attendre que `ContratPro CI` passe au vert.

`vercel:live-audit` controle les variables vraiment presentes dans Vercel
Production. Tant que `CONTRATPRO_REQUIRE_BILLING=false`, l'audit sort un mode
`PILOT CONTROLE` : auth, RLS, organisation non-demo, Supabase et cron restent
bloquants, tandis que Resend, Stripe multi-paliers et GoCardless live sont des
points differes a annoncer avant vente large. Quand le billing obligatoire passe
a `true`, ces integrations redeviennent des blocages live.

Analytics produit : PostHog ou un outil equivalent reste volontairement differe.
Ne pas l'ajouter comme blocage du premier deploiement. Le brancher seulement
apres les premiers pilotes chauffagistes, et uniquement derriere le consentement
cookies `statistics=true`.

## 5. Premier deploiement

Apres import Vercel, declencher un premier deploy depuis le dashboard ou via un
push sur la branche de production.

Verifier dans Vercel :

- build Next.js termine ;
- etat du deploiement `READY`, pas seulement deploiement cree ;
- alias production pointe vers le dernier commit attendu ;
- cron `/api/cron/renewals` visible ;
- variables production presentes ;
- domaine final configure ou URL Vercel temporaire disponible.

## 6. Controle post-deploiement

Lancer :

```powershell
npm run deploy:smoke -- https://votre-deploiement.vercel.app
npm run deploy:smoke:stripe -- https://votre-deploiement.vercel.app
npm run deploy:smoke:gocardless -- https://votre-deploiement.vercel.app
```

Si Vercel Deployment Protection est active, definir aussi le secret
d'automation dans le terminal de controle :

```powershell
$env:VERCEL_AUTOMATION_BYPASS_SECRET="..."
```

Les scripts de smoke ajoutent alors le header `x-vercel-protection-bypass`
sur chaque requete. Sans ce secret, un deploiement protege retourne `401` meme
si l'application Next.js fonctionne.

Routes controlees :

```text
/api/health
/login
/pricing
/demo
/legal
/cookies
/privacy
/dpa
/terms
```

Puis tester manuellement :

- connexion admin `admin@votre-domaine.fr` ;
- `/admin/ops` ;
- `/admin/notifications` ;
- `/onboarding` ;
- generation PDF facture ou attestation ;
- envoi email document si Resend est configure ;
- portail billing si Stripe est configure.

Si un webhook retourne `Invalid API key` depuis Vercel alors que le test local
fonctionne, ne pas conclure a un probleme Stripe ou GoCardless. Verifier et
remplacer d'abord `SUPABASE_SERVICE_ROLE_KEY` dans Vercel, puis redeployer :
une variable presente peut etre ancienne ou invalide.

## 7. Go live

Basculer le domaine final seulement si :

- CI GitHub verte ;
- Vercel build vert ;
- `npm run deploy:smoke` vert ;
- `supabase/verify_rls.sql` retourne `OK` partout ;
- Stripe et GoCardless pointent vers les URLs webhook production ;
- `/admin/ops` ne signale pas d'incident critique.
