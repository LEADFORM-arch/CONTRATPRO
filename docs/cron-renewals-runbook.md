# Runbook cron relances ContratPro

Objectif : executer les relances quotidiennes sans envoyer de message non
controle, avec preuve de journalisation et alerte fondateur en cas d'echec.

## 1. Variables requises

Configurer dans Vercel :

```text
CRON_SECRET=...
CONTRATPRO_ORG_ID=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
CONTRATPRO_NOTIFICATION_EMAILS=...
```

`CONTRATPRO_CRON_SECRET` reste accepte pour les environnements historiques,
mais `CRON_SECRET` est la variable la plus simple pour Vercel Cron.

## 2. Dry-run obligatoire

Avant tout envoi reel :

```text
GET /api/cron/renewals?dryRun=true
Authorization: Bearer ${CRON_SECRET}
```

Preuve attendue :

```json
{
  "dryRun": true,
  "processed": 0,
  "sent": 0,
  "failed": 0
}
```

`processed` peut etre superieur a zero. En dry-run, `sent` doit rester a zero.

## 3. Envoi reel controle

L'envoi reel doit rester une decision explicite pendant les pilotes :

```text
POST /api/cron/renewals
Authorization: Bearer ${CRON_SECRET}
Content-Type: application/json

{
  "dryRun": false
}
```

Preuve attendue :

- email Resend envoye au client ;
- ligne `renewal_actions` creee avec `status = SENT` ;
- en cas d'echec, ligne `renewal_actions` creee avec `status = TODO`.

## 4. Verification Supabase

Dans Supabase SQL Editor :

```sql
select id, contract_id, status, channel, outcome, created_at
from renewal_actions
order by created_at desc
limit 10;
```

Chaque relance doit etre auditables depuis `/relances` et visible comme signal
recent dans `/admin/ops`.

## 5. Alerting fondateur

Simuler un echec sans toucher aux secrets live :

1. lancer un dry-run ;
2. verifier que `/admin/ops` reste stable ;
3. provoquer un echec controle en environnement de test ;
4. verifier `/admin/notifications`.

Le fondateur doit voir une notification `renewal_cron_failed_items` ou
`renewal_cron_error` sans exposition de secret.

## 6. Decision pilote

GO cron reel si :

- dry-run lisible et sans surprise ;
- `CONTRATPRO_ORG_ID` pointe vers la bonne organisation pilote ;
- Resend est configure avec un domaine expediteur valide ;
- `renewal_actions` journalise correctement ;
- `/admin/notifications` remonte les echecs.

STOP si :

- le dry-run cible trop de contrats non verifies ;
- les emails clients ne sont pas fiables ;
- le fondateur ne recoit pas d'alerte sur echec ;
- la base Supabase n'a pas encore de backup active.
