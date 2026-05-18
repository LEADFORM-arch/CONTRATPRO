# GoCardless sandbox

Objectif : tester le parcours SEPA sans vrai prelevement et sans coordonnees
bancaires reelles.

## Variables locales

Ajouter dans `.env.local` uniquement :

```env
GOCARDLESS_ACCESS_TOKEN=coller_le_token_sandbox
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_VERSION=2015-07-06
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET=secret_webhook_sandbox
```

Ne jamais coller ces valeurs dans le code, dans un commit ou dans une capture
publique. En sandbox, utiliser uniquement des clients, mandats et comptes de
test fournis ou acceptes par GoCardless.

## Parcours de test ContratPro

1. Ouvrir `/contracts/quick`.
2. Creer un contrat rapide avec un client fictif.
3. Ouvrir la fiche contrat.
4. Dans `Mandat SEPA`, cliquer `Creer lien GoCardless`.
5. Ouvrir le lien sandbox et finaliser le parcours mandate GoCardless heberge.
6. Le mandat passe en suivi `Envoye GoCardless`.
7. Le webhook `/api/webhooks/gocardless` doit ensuite rattacher
   automatiquement le `mandate_request_mandate` au contrat et suivre les
   evenements `mandates` (`submitted`, `active`, `failed`, `cancelled`).
8. Quand GoCardless fournit les identifiants sandbox ou via webhook, verifier :
   - `ID client GoCardless` ;
   - `ID mandat GoCardless` ;
   - `Statut mandat` = `Actif GoCardless`.
9. Ouvrir `/payments/new`.
10. Programmer un paiement.
11. Dans `/payments`, cliquer `Soumettre SEPA`.
12. Verifier que `gc_payment_id` apparait et qu'un evenement est visible dans
   `payment_events`.

Le collage manuel des identifiants reste disponible en secours sandbox, mais le
parcours principal doit passer par le lien d'autorisation heberge GoCardless.

## Webhook sandbox

Configurer dans GoCardless sandbox :

```text
https://contratpro-dun.vercel.app/api/webhooks/gocardless
```

Si le test est local, utiliser un tunnel HTTPS temporaire et pointer le webhook
vers `/api/webhooks/gocardless`.

## Variables Vercel

Pour tester le lien d'autorisation sur `https://contratpro-dun.vercel.app`,
ajouter aussi en environnement `Production` dans Vercel :

```env
GOCARDLESS_ACCESS_TOKEN=coller_le_token_sandbox
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET=secret_webhook_sandbox
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_VERSION=2015-07-06
```

Ne pas coller ces secrets dans le code ni dans un terminal partage. Le dashboard
Vercel est la voie la plus simple : Project Settings -> Environment Variables.

## Passage live

Le sandbox prouve le parcours technique. Avant de vendre le SEPA en production,
il faudra remplacer les variables par :

```env
GOCARDLESS_ENVIRONMENT=live
GOCARDLESS_ACCESS_TOKEN=token_live
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET=secret_live
```

Ne pas ouvrir le SEPA live tant que le webhook live n'a pas ete observe sur un
paiement pilote autorise.
