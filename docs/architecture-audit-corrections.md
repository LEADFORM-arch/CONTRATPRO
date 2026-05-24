# Corrections audit architecture

Ce document transforme les risques releves dans l'audit architecture en actions verifiables dans le repo.

## Corrections appliquees

### P0 - Migrations Supabase versionnees

- `supabase/migration-order.json` fixe l'ordre d'execution des scripts SQL.
- `npm run db:audit` verifie que `schema.sql` ouvre la chaine, que les tables metier existent avant `rls.sql`, et que `verify_rls.sql` reste le dernier filet de securite.
- `scripts/security-audit.mjs` et `scripts/production-readiness.mjs` exigent maintenant ce garde-fou.

### P0 - Isolation multi-tenant

- `tests/quality/tenant-isolation.test.mjs` controle les helpers RLS, l'absence de politique large `using (true)` et la resolution explicite de la portee organisation sur les routes sensibles.
- La creation de contrat verifie le client visible avant d'ecrire installation et contrat.
- La creation d'attestation verifie que l'intervention appartient bien au contrat visible par l'organisation connectee.

### P0 - Webhooks financiers

- `tests/quality/financial-webhooks.test.mjs` garde les webhooks Stripe et GoCardless signes, idempotents et journalises.
- Le webhook Stripe rattache aussi `invoice.payment_succeeded` a l'organisation quand l'abonnement est connu.
- Le webhook GoCardless reste signe et journalise via `payment_events`.

### P1 - Terrain mobile et hors ligne

- `public/service-worker.js` fournit un fallback hors ligne limite et prudent.
- `/offline` explique la situation sans exposer ni mettre en cache de donnees clients.
- `ServiceWorkerRegistration` enregistre le service worker cote client.

Le choix produit est volontaire : ContratPro ne met pas encore les dossiers clients en cache hors ligne. Pour une entreprise CVC, une promesse offline complete doit etre testee terrain et chiffree localement avant d'etre vendue.

## Points differes

### Offline complet

Le vrai mode terrain hors reseau demandera IndexedDB, chiffrement local, resolution de conflit et effacement de session. C'est une evolution produit, pas un patch de securite.

### Facturation electronique PDP

Le chantier PDP reste a planifier quand le calendrier fournisseur et les obligations exactes seront figes. ContratPro garde aujourd'hui des factures PDF propres, pas une promesse PDP prematuree.

### Pricing et pilotage fondateur

Les plans Starter, Business et Enterprise doivent rester coherents entre landing page, README, Stripe et cockpit admin. Les indicateurs ARR, churn et conversion pilote seront utiles apres les premiers retours terrain.

### Gouvernance GitHub

La protection de branche et les regles de revue se configurent dans GitHub, pas dans le code. Le repo contient les checks, mais il faut activer les protections cote GitHub avant une vraie production commerciale.

## Commandes de validation

```bash
npm run type-check
npm run test:quality
npm run db:audit
npm run production:audit
npm run build
```
