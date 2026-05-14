# Runbook notifications internes ContratPro

Objectif : ne jamais decouvrir un incident Stripe, GoCardless, Resend ou cron
par un client. Toute rupture operationnelle doit produire une trace Supabase et,
si possible, un email fondateur.

## 1. Canaux

ContratPro utilise deux preuves :

- email admin via `CONTRATPRO_NOTIFICATION_EMAILS` ou `CONTRATPRO_ADMIN_EMAILS` ;
- ligne Supabase dans `internal_notifications`.

La ligne Supabase est obligatoire meme si l'email echoue.

## 2. Lecture du cockpit

Ouvrir `/admin/notifications`.

Le bloc "Architecte IA incidents" donne la decision immediate :

| Etat | Decision |
| --- | --- |
| Incident critique | Geler les ventes et traiter le dernier incident critique. |
| Alerting degrade | Corriger Resend ou les destinataires avant de compter sur l'alerting. |
| Surveillance saine | Continuer les pilotes avec surveillance normale. |

## 3. Sources a surveiller

- `stripe_invoice_failed` : risque d'abonnement impaye ;
- `stripe_subscription_status` : abonnement a surveiller ;
- `renewal_cron_error` : cron indisponible ;
- `renewal_cron_failed_items` : relances partielles en echec ;
- incidents GoCardless : risque d'encaissement SEPA ;
- notifications Resend `FAILED` : alerting degrade.

## 4. Procedure incident

1. Ouvrir `/admin/notifications`.
2. Lire l'action immediate.
3. Ouvrir l'URL d'action de la derniere alerte critique.
4. Verifier `/admin/ops`.
5. Corriger la cause.
6. Confirmer qu'une nouvelle notification ou un nouveau signal ops est sain.

## 5. Stop rules

Ne pas lancer de nouveau pilote si :

- au moins une alerte critique recente n'est pas expliquee ;
- les emails de notification sont en `FAILED` ;
- `/admin/ops` indique une configuration critique ;
- un webhook Stripe ou GoCardless echoue sans trace dans Supabase.
