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
npm run security:audit
```

Si l'audit affiche une valeur `[]`, le secret local n'est pas restaurable depuis
Vercel et doit etre repris dans son dashboard d'origine.

## Smoke test authentifie production

Ne jamais ecrire le mot de passe dans le repo. Le definir seulement dans le
terminal courant :

```powershell
$env:CONTRATPRO_SMOKE_EMAIL="esport.hub.pro@proton.me"
$env:CONTRATPRO_SMOKE_PASSWORD="votre-mot-de-passe"
npm run deploy:smoke:auth -- https://contratpro-dun.vercel.app
```

Le script controle :

- `/api/auth/login` ;
- `/api/auth/me` ;
- `/onboarding`.
