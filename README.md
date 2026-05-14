# ContratPro

SaaS de gestion des contrats de maintenance CVC pour chauffagistes : clients,
contrats annuels, interventions, attestations, paiements, relances et
documents legaux.

Depot GitHub officiel : https://github.com/admincairn/CONTRATPRO

Espace Vercel de reference : https://vercel.com/contratpro

Un espace admin fondateur separe sert a piloter l'acquisition ContratPro
et la prospection Facebook.

## Developpement

Utiliser la commande propre pour eviter d'empiler plusieurs serveurs Next :

```powershell
npm run dev:clean
```

Puis ouvrir :

```text
http://localhost:3000/login
```

Si le serveur tourne deja correctement, `npm run dev` reste possible. En cas de
lenteur, crash VS Code ou port bloque, preferer `npm run dev:clean`.

## Verification

```powershell
npm run type-check
npm run test:quality
npm run security:audit
npm run production:audit
```

## Priorite 2 - Documents PDF et emails

Executer dans Supabase SQL Editor avant `supabase/rls.sql` :

```text
supabase/document_sends.sql
```

Puis reexecuter :

```text
supabase/rls.sql
supabase/verify_rls.sql
```

Toutes les lignes de verification doivent retourner `status = OK`, y compris
`document_sends`.

Variables email a ajouter dans `.env.local` pour activer l'envoi client :

```text
RESEND_API_KEY=...
RESEND_FROM_EMAIL=ContratPro <documents@votre-domaine.fr>
```

Les factures et attestations disposent maintenant :

- d'une route PDF serveur reelle, protegee par session ;
- d'un envoi email client via Resend avec PDF en piece jointe ;
- d'un historique `document_sends` : destinataire, sujet, provider, statut,
  date d'envoi et erreur eventuelle.

## Priorite 3 - Encaissement recurrent SEPA

Executer dans Supabase SQL Editor avant `supabase/rls.sql` :

```text
supabase/payment_events.sql
```

Variables provider a ajouter dans `.env.local` pour soumettre les prelevements :

```text
GOCARDLESS_ACCESS_TOKEN=...
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_VERSION=2015-07-06
```

Les paiements SEPA disposent maintenant :

- d'une soumission provider GoCardless depuis la page paiements ;
- d'un stockage de l'identifiant provider `gc_payment_id` ;
- d'un journal `payment_events` pour creation, soumission, echec provider et
  changement de statut ;
- d'une route protegee `/api/payments/[id]/submit` pour envoyer le paiement au
  provider.

## Priorite 4 - Webhooks GoCardless

Variable webhook a ajouter dans `.env.local` :

```text
GOCARDLESS_WEBHOOK_ENDPOINT_SECRET=...
```

Configurer dans GoCardless l'URL :

```text
https://votre-domaine.fr/api/webhooks/gocardless
```

Le webhook verifie le header `Webhook-Signature`, traite les evenements
`payments`, met a jour `sepa_payments.status`, renseigne `failure_reason` en cas
d'echec et ajoute une ligne dans `payment_events`.

## Priorite 5 - Relances renouvellement

La page `/relances` permet maintenant d'envoyer directement une relance client
via Resend. L'API protegee `/api/relances/send` recupere l'email depuis le
contrat, envoie le message de renouvellement, puis cree une ligne
`renewal_actions` en statut `SENT`. En cas d'echec provider, une action reste
journalisee en `TODO` avec le detail de l'erreur dans `outcome`.

La page embarque aussi un premier agent "Architecte IA de croissance" :
scoring des contrats a risque, revenu annuel a securiser, prochaine action
recommandee et message propose. L'agent ne declenche pas d'envoi sans validation
humaine : les boutons d'envoi, copie et journalisation restent les points de
controle.

## Priorite 5b - Mobile terrain PWA

ContratPro expose un premier socle mobile installable :

```text
/manifest.webmanifest
/terrain
```

La page `/terrain` est protegee par le layout dashboard et reprend les
interventions sous forme de cartes tactiles : client, ville, equipement,
technicien, prochaine visite, statut d'attestation et actions rapides vers le
contrat ou le PDF. Ce lot ne remplace pas encore une application offline
complete, mais il pose le premier ecran terrain manquant pour les pilotes.

## Priorite 5c - Pilotes chauffagistes

Le runbook `docs/pilot-runbook.md` decrit le test a mener avec 1 a 3
chauffagistes : import dry-run, import execute, relances, documents, page
terrain mobile, SEPA sandbox et scorecard go/no-go. Le cockpit fondateur
`/admin/launch` affiche aussi le plan pilote terrain, et `/admin/pilots`
centralise la scorecard a utiliser pendant chaque rendez-vous. Cette page
embarque un bloc "Architecte IA pilote" qui force la decision premium :
vendre, iterer ou stopper avant d'ajouter une nouvelle feature.

## Priorite 5d - Activation production live

Le runbook `docs/live-production-activation.md` formalise le passage live :
freeze release, backup Supabase, RLS, variables Vercel, Stripe live, GoCardless
live, smoke tests et rollback. Le cockpit `/admin/launch` affiche aussi la
sequence "Activation production live" pour eviter tout lancement client sans
preuves operationnelles.

## Priorite 6 - Cron relances quotidiennes

Variable a ajouter dans `.env.local` :

```text
CONTRATPRO_CRON_SECRET=une-valeur-longue-et-aleatoire
```

Endpoint planifiable :

```text
POST /api/cron/renewals
Authorization: Bearer ${CONTRATPRO_CRON_SECRET}
```

Corps recommande :

```json
{
  "organizationId": "org_demo",
  "dryRun": true
}
```

Par defaut, `dryRun` vaut `true`. Passez `dryRun: false` seulement lorsque
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` et
`CONTRATPRO_ORG_ID` sont valides. Le moteur cible les contrats a moins de 45
jours, ignore les contrats deja relances recemment, envoie l'email via Resend,
puis journalise dans `renewal_actions`.

Le runbook `docs/cron-renewals-runbook.md` formalise le passage du dry-run a
l'envoi reel : variables Vercel, preuve Supabase, controle Resend et alerte
fondateur. Le cockpit `/admin/ops` affiche aussi le panneau "Cron relances sous
controle" pour verifier la priorite 6 sans exposer les secrets.

## Priorite 7 - Supervision production

Endpoints disponibles :

```text
GET /api/health
GET /api/admin/ops
```

`/api/health` est volontairement minimal pour un uptime monitor. Le detail
operationnel reste reserve aux admins via `/admin/ops` et `/api/admin/ops` :
score de readiness, configuration auth/RLS, integrations email/SEPA/cron et
signaux recents issus de Supabase. Les secrets ne sont jamais affiches.

## Priorite 8 - Billing SaaS Stripe

Executer dans Supabase SQL Editor avant `supabase/rls.sql` :

```text
supabase/billing.sql
```

Variables Stripe a ajouter dans `.env.local` :

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_... # optionnel, sinon prix dynamique 49 EUR/mois
STRIPE_PRICE_ID_PRO=price_... # optionnel, sinon prix dynamique 99 EUR/mois
STRIPE_PRICE_ID_BUSINESS=price_... # optionnel, sinon prix dynamique 199 EUR/mois
# STRIPE_PRICE_ID reste accepte comme fallback historique pour le plan Pro.
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONTRATPRO_REQUIRE_BILLING=false
```

Endpoints :

```text
POST /api/billing/checkout
POST /api/billing/portal
POST /api/webhooks/stripe
```

Configurer dans Stripe l'URL webhook :

```text
https://votre-domaine.fr/api/webhooks/stripe
```

Evenements recommandes :

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
invoice.payment_succeeded
```

La page `/settings/billing` permet d'activer les abonnements ContratPro Starter
49 EUR/mois, Pro 99 EUR/mois ou Business 199 EUR/mois, puis d'ouvrir le portail
Stripe. Quand
`CONTRATPRO_REQUIRE_BILLING=true`, les statuts `active` et `trialing` donnent
acces au produit ; les statuts impayes bloquent les pages et API metier avec un
renvoi vers l'abonnement.

Le bloc "Architecte IA billing" de `/settings/billing` force le bon usage des
3 paliers : Starter pour l'entree Excel, Pro pour prouver le ROI SEPA, Business
pour un go-live accompagne. Le webhook Stripe est idempotent via
`provider_event_id` pour eviter les doubles notifications lors des retries.

## Priorite 9 - Onboarding client premium

La page `/onboarding` est le cockpit d'activation d'une entreprise cliente :
score de lancement, prochaine action prioritaire, jalons entreprise, base
clients, contrats, documents, SEPA, billing et securite. Elle s'appuie sur les
donnees Supabase reelles et sur le statut billing pour guider le client vers une
mise en production exploitable.

Le bloc "Architecte IA activation" transforme ce score en decision commerciale :
0-59 = accompagnement avant vente, 60-84 = pilote facturable, 85-100 = go-live
limite. Le runbook `docs/onboarding-activation-runbook.md` donne la sequence a
suivre avec un dirigeant CVC pendant l'activation.

La page `/import` permet maintenant d'importer un fichier clients CSV ou XLSX
avec simulation obligatoire avant ecriture. Le flux cree les clients, les
equipements et les contrats annuels apres confirmation, detecte les doublons par
email ou raison sociale, et fournit un modele CSV telechargeable pour
l'onboarding accompagne.

Endpoint dedie :

```text
POST /api/import/clients
```

Corps attendu :

```json
{
  "mode": "dry-run",
  "rows": []
}
```

Passer `mode` a `execute` seulement apres validation du plan d'import.

## Priorite 10 - Notifications internes

Executer dans Supabase SQL Editor avant `supabase/rls.sql` :

```text
supabase/notifications.sql
```

Variable optionnelle :

```text
CONTRATPRO_NOTIFICATION_EMAILS=esport.hub.pro@proton.me
```

Si `CONTRATPRO_NOTIFICATION_EMAILS` est absent, les emails listes dans
`CONTRATPRO_ADMIN_EMAILS` recoivent les alertes. Les notifications sont aussi
journalisees dans `internal_notifications`, avec le statut `SENT`, `FAILED` ou
`SKIPPED`. L'espace `/admin/notifications` permet de suivre les alertes :
nouveaux leads, echecs SEPA, incidents GoCardless, factures Stripe impayees,
abonnements a surveiller et erreurs de cron.

Le bloc "Architecte IA incidents" de `/admin/notifications` transforme le
journal en decision : surveillance saine, alerting degrade ou gel des ventes en
cas d'incident critique. Le runbook
`docs/internal-notifications-runbook.md` precise les stop rules avant nouveau
pilote.

## Priorite 11 - Qualite produit

Suite de regression legere, sans dependance externe :

```powershell
npm run test:quality
```

Ces tests verifient les garde-fous qui ne doivent pas regresser : auth tenant,
RLS, billing lock, routes admin, API metier protegees, webhooks signes, cron
protege, PDF serveur, envoi document, notifications internes et scripts
Supabase alignes. Ils completent `npm run security:audit`, qui controle aussi la
configuration locale `.env.local`.

## Priorite 12 - Deploiement production

Le repo contient maintenant :

- `vercel.json` avec un cron quotidien sur `/api/cron/renewals` ;
- `.env.production.example` pour preparer les variables Vercel ;
- `npm run production:audit` pour verifier la configuration deploiement ;
- `/api/health` pour monitoring uptime externe.

Commandes avant de deployer :

```powershell
npm run type-check
npm run test:quality
npm run security:audit
npm run production:audit
npm run build
```

Variables minimales a renseigner dans Vercel :

```text
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr
CONTRATPRO_APP_URL=https://votre-domaine.fr
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_RLS_ENABLED=true
CONTRATPRO_REQUIRE_BILLING=true
CONTRATPRO_ADMIN_EMAILS=esport.hub.pro@proton.me
CONTRATPRO_NOTIFICATION_EMAILS=esport.hub.pro@proton.me
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

Webhooks production :

```text
Stripe      https://votre-domaine.fr/api/webhooks/stripe
GoCardless  https://votre-domaine.fr/api/webhooks/gocardless
Health      https://votre-domaine.fr/api/health
```

Vercel Cron appelle les routes en `GET` et envoie `Authorization: Bearer
$CRON_SECRET` si la variable `CRON_SECRET` est configuree. La route
`/api/cron/renewals` accepte aussi `CONTRATPRO_CRON_SECRET` pour les schedulers
externes.

## Priorite 13 - Finition commerciale

Pages publiques disponibles hors session :

```text
/demo
/pricing
/legal
/privacy
/terms
```

La page `/login` expose aussi les liens Demo, Tarif et Confidentialite. Ces
pages donnent une base propre pour vendre ContratPro avant connexion : offre a
49/99/199 EUR/mois, scenario de demonstration, mentions legales, confidentialite et
CGV. Les textes juridiques sont des bases de lancement a faire relire avant une
commercialisation publique.

## Priorite 14 - Industrialisation production

Le repo contient maintenant un gate de production automatise :

- `.github/workflows/ci.yml` lance la CI sur pull request et push vers
  `main`/`master` ;
- `.github/pull_request_template.md` force la checklist production et les notes
  de release ;
- `docs/production-runbook.md` documente variables Vercel, Supabase, webhooks,
  verification post-deploiement et retour arriere ;
- `npm run ci:verify` rejoue localement la meme chaine de controles que la CI.

Commande de validation complete avant merge ou deploiement :

```powershell
npm run ci:verify
```

## Priorite 15 - Mise en ligne Vercel

Checklist dediee :

```text
docs/vercel-launch-checklist.md
```

Le projet est prepare pour un import Vercel depuis :

```text
https://github.com/admincairn/CONTRATPRO
```

ContratPro force Node `24.x` via `package.json`. Le template production pointe
vers le projet Supabase :

```text
https://yotafzxcpyyrkkpeyfpp.supabase.co
```

Commandes de controle :

```powershell
npm run deploy:preflight
npm run deploy:smoke -- https://votre-deploiement.vercel.app
npm run deploy:smoke:journey -- https://votre-deploiement.vercel.app
```

`deploy:preflight` verifie la preparation du repo avant import Vercel.
`deploy:smoke` controle les routes publiques critiques apres le premier
deploiement. `deploy:smoke:journey` rejoue le parcours client authentifie sans
creer de donnees.

## Priorite 17 - Environnement local et smoke test authentifie

Si `vercel env pull` remplace les secrets locaux par `[]`, restaurer `.env.local`
depuis :

```text
.env.local.example
docs/local-development-env.md
```

Verification locale :

```powershell
npm run security:audit
```

Verification authentifiee production, avec les identifiants fournis uniquement
dans le terminal courant :

```powershell
$env:CONTRATPRO_SMOKE_EMAIL="esport.hub.pro@proton.me"
$env:CONTRATPRO_SMOKE_PASSWORD="votre-mot-de-passe"
npm run deploy:smoke:auth -- https://contratpro-dun.vercel.app
```

## Priorite 30 - Parcours client complet

Runbook :

```text
docs/customer-journey-runbook.md
```

Commande production avec un compte smoke dedie :

```powershell
$env:CONTRATPRO_DEPLOYMENT_URL="https://contratpro-dun.vercel.app"
$env:CONTRATPRO_SMOKE_EMAIL="compte-smoke@votre-domaine.fr"
$env:CONTRATPRO_SMOKE_PASSWORD="mot-de-passe-temporaire"
npm run deploy:smoke:journey -- $env:CONTRATPRO_DEPLOYMENT_URL
```

Le test couvre connexion, dashboard, onboarding, import, clients, contrats,
relances, factures, attestations, paiements, entreprise, billing et securite.

## Priorite 18 - Cockpit Go-Live fondateur

Page reservee admin :

```text
/admin/launch
```

Elle donne un score go-live et les blocages avant une vente forte :

- Stripe Billing et paywall SaaS ;
- GoCardless live ;
- auth/RLS/admin ;
- URL production et repo GitHub ;
- cron, emails et operations CVC.

## Priorite 19 - Stripe Billing test

Runbook :

```text
docs/stripe-test-billing.md
```

Scripts :

```powershell
npm run stripe:create-test-billing
npm run stripe:readiness
```

Le flux recommande est de creer les produits/prix Stripe en mode test, ajouter
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_STARTER`,
`STRIPE_PRICE_ID_PRO` et `STRIPE_PRICE_ID_BUSINESS` dans Vercel, tester
`/settings/billing`, puis passer `CONTRATPRO_REQUIRE_BILLING=true`.

## Variables importantes

Dans `.env.local` :

```text
CONTRATPRO_REQUIRE_AUTH=true
CONTRATPRO_RLS_ENABLED=true
CONTRATPRO_ADMIN_EMAILS=esport.hub.pro@proton.me
CONTRATPRO_NOTIFICATION_EMAILS=esport.hub.pro@proton.me
CONTRATPRO_REQUIRE_BILLING=false
```

`supabase/rls.sql` doit etre execute en dernier dans Supabase SQL Editor apres
les scripts metier (`schema.sql`, `seed.sql`, `renewal_actions.sql`,
`prospection.sql`, `document_sends.sql`, `payment_events.sql`, `billing.sql`,
`notifications.sql`). La commande `npm run security:audit`
verifie la configuration locale, la presence des politiques RLS dans le repo et
les garde-fous de l'espace admin.

Pour confirmer l'etat reel de Supabase, executer ensuite :

```text
supabase/verify_rls.sql
```

Toutes les lignes doivent retourner `status = OK`.

## Espace admin fondateur

Acces reserve aux emails listes dans `CONTRATPRO_ADMIN_EMAILS`.

```text
http://localhost:3000/admin
```

Cet espace contient le dashboard de prospection interne, les leads fondateur et
la configuration du canal Facebook. Il ne fait pas partie du produit livre aux
chauffagistes clients.
