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
4. Dans `Mandat SEPA`, enregistrer un mandat `A preparer`.
5. Quand GoCardless fournit les identifiants sandbox, renseigner :
   - `ID client GoCardless` ;
   - `ID mandat GoCardless` ;
   - `Statut mandat` = `Actif GoCardless`.
6. Ouvrir `/payments/new`.
7. Programmer un paiement.
8. Dans `/payments`, cliquer `Soumettre SEPA`.
9. Verifier que `gc_payment_id` apparait et qu'un evenement est visible dans
   `payment_events`.

## Webhook sandbox

Configurer dans GoCardless sandbox :

```text
https://contratpro-dun.vercel.app/api/webhooks/gocardless
```

Si le test est local, utiliser un tunnel HTTPS temporaire et pointer le webhook
vers `/api/webhooks/gocardless`.

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
