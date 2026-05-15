# Environnement local ContratPro

`vercel env pull` peut remplacer les secrets sensibles par `[]`. C'est normal :
les variables marquees sensibles dans Vercel ne sont pas relisibles en clair.

## Restaurer `.env.local`

1. Copier le template :

```powershell
Copy-Item .env.local.example .env.local
```

2. Remettre les vraies valeurs depuis les dashboards :

- Supabase : anon key, service role key, project URL depuis `https://supabase.com/dashboard/project/yotafzxcpyyrkkpeyfpp` ;
- Resend : API key et adresse d'envoi ;
- Stripe : secret key, webhook secret, price ids Starter/Pro/Business depuis `https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard` ;
- GoCardless : token live/sandbox et webhook secret ;
- Cron : `CRON_SECRET` et `CONTRATPRO_CRON_SECRET`.

3. Verifier :

```powershell
npm run env:guard
npm run security:audit
```

Si l'audit affiche une valeur `[]`, le secret local n'est pas restaurable depuis
Vercel et doit etre repris dans son dashboard d'origine.

## Regle locale anti-`org_demo`

`.env.local` ne doit jamais contenir `VERCEL_ENV=production` ni
`NODE_ENV=production`. Ces variables sont injectees par Vercel ou Next.js, pas
par le fichier local.

Pour une session authentifiee locale, utiliser une organisation non-demo :

```env
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_ORG_ID=org_contratpro_admin
CONTRATPRO_PUBLIC_LEAD_ORG_ID=org_contratpro_admin
```

Le tenant `org_demo` reste utile seulement en mode demo explicite, sans auth et
hors production. `npm run dev` lance automatiquement `npm run env:guard` avant
Next.js pour bloquer les configurations dangereuses.

## Smoke test authentifie local

Ne jamais ecrire le mot de passe dans le repo. Le definir seulement dans le
terminal courant ou dans `.env.local`, qui est ignore par Git :

```powershell
$env:CONTRATPRO_SMOKE_EMAIL="esport.hub.pro@proton.me"
$env:CONTRATPRO_SMOKE_PASSWORD="votre-mot-de-passe"
npm run smoke:auth
npm run smoke:journey
```

Les commandes locales `npm run smoke:auth` et `npm run smoke:journey` ciblent
toujours `http://localhost:3000` par defaut, meme si `NEXT_PUBLIC_APP_URL`
pointe vers Vercel. Pour forcer une autre URL locale :

```powershell
$env:CONTRATPRO_SMOKE_BASE_URL="http://localhost:3001"
npm run smoke:auth
```

`smoke:auth` controle :

- `/api/auth/login` ;
- `/api/auth/me` ;
- `/onboarding`.

`smoke:journey` controle les ecrans metier critiques et echoue si la page de
reprise dashboard apparait a la place du cockpit.

## Smoke test authentifie production

Pour tester Vercel ou le domaine final :

```powershell
$env:CONTRATPRO_SMOKE_EMAIL="esport.hub.pro@proton.me"
$env:CONTRATPRO_SMOKE_PASSWORD="votre-mot-de-passe"
npm run deploy:smoke:auth -- https://contratpro-dun.vercel.app
npm run deploy:smoke:journey -- https://contratpro-dun.vercel.app
```
