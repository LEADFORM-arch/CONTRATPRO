# Stripe Billing test pour ContratPro

Dashboard fourni :

```text
https://dashboard.stripe.com/acct_1TVFyGBJsOV2aVH0/test/dashboard
```

Objectif : valider les abonnements ContratPro Starter, Pro et Business en mode
test avant de passer le paywall en production forte.

## 1. Recuperer la cle test

Dans Stripe, rester en **Test mode**.

Aller dans :

```text
Developers > API keys
```

Copier la cle secrete test `sk_test_...`.

Ne jamais l'ecrire dans le repo. Dans PowerShell :

```powershell
$env:STRIPE_SECRET_KEY="sk_test_..."
```

## 2. Creer les produits et prix test

```powershell
npm run stripe:create-test-billing
```

Le script cree ou recupere :

- `ContratPro Starter` a `49 EUR / mois` ;
- `ContratPro Pro` a `99 EUR / mois` ;
- `ContratPro Business` a `199 EUR / mois`.

Variables a reporter dans Vercel :

```text
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...
```

Lookup keys :

```text
contratpro_starter_monthly_49_eur
contratpro_pro_monthly_99_eur
contratpro_business_monthly_199_eur
```

## 3. Creer le webhook Stripe test

Dans Stripe :

```text
Developers > Webhooks > Add endpoint
```

Endpoint URL :

```text
https://contratpro-dun.vercel.app/api/webhooks/stripe
```

Evenements a cocher :

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
invoice.payment_succeeded
```

Copier le signing secret `whsec_...`.

## 4. Ajouter les variables dans Vercel

Dans Vercel, projet `contratpro/contratpro`, environnement Production :

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...
CONTRATPRO_REQUIRE_BILLING=false
```

Garder `CONTRATPRO_REQUIRE_BILLING=false` pendant le test pour ne pas bloquer
l'app si un webhook ou une session checkout doit etre corrige.

## 5. Verifier

Localement, apres avoir defini les variables dans le terminal :

```powershell
$env:STRIPE_WEBHOOK_SECRET="whsec_..."
$env:STRIPE_PRICE_ID_STARTER="price_..."
$env:STRIPE_PRICE_ID_PRO="price_..."
$env:STRIPE_PRICE_ID_BUSINESS="price_..."
$env:CONTRATPRO_REQUIRE_BILLING="false"
npm run stripe:readiness
```

Le check `Billing lock` restera en echec tant que
`CONTRATPRO_REQUIRE_BILLING=false`. C'est attendu pendant le test.

## 6. Test fonctionnel

Controle automatise du webhook billing :

```powershell
npm run smoke:stripe
npm run deploy:smoke:stripe -- https://votre-deploiement.vercel.app
```

Ce script signe deux evenements Stripe fictifs (`checkout.session.completed` et
`customer.subscription.updated`) avec `STRIPE_WEBHOOK_SECRET`, puis verifie que
`billing_subscriptions` passe en `active` et que `billing_events` journalise les
evenements.

1. Se connecter a ContratPro.
2. Aller sur `/settings/billing`.
3. Lire le bloc "Architecte IA billing" pour choisir le palier selon le signal
   pilote : Starter si l'enjeu est l'import Excel, Pro si le sujet est le ROI
   SEPA, Business si le client veut un go-live accompagne.
4. Cliquer sur l'activation d'un palier.
5. Utiliser une carte test Stripe, par exemple `4242 4242 4242 4242`.
6. Verifier que Stripe redirige vers ContratPro.
7. Verifier `/admin/launch` et `/settings/billing`.

Le webhook Stripe doit rester idempotent : si Stripe renvoie le meme event id,
ContratPro repond `duplicate: true` sans rejouer les effets metier ni renvoyer
une alerte fondateur.

## 7. Activation paywall

Quand checkout et webhook sont valides :

```text
CONTRATPRO_REQUIRE_BILLING=true
```

Redeployer, puis lancer :

```powershell
npm run deploy:smoke -- https://contratpro-dun.vercel.app
```

Avant live mode, remplacer les cles test par `sk_live_...`, recreer le webhook
live et utiliser le `whsec_...` live.
