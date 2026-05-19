# Runbook parcours client ContratPro

Objectif : verifier qu'un chauffagiste qui decouvre ContratPro peut passer de
la promesse commerciale a un compte exploitable sans blocage majeur.

Ce runbook ne remplace pas les tests techniques. Il sert a confirmer que le
produit se vend et s'utilise comme un outil metier.

## 1. Preconditions

- `CONTRATPRO_REQUIRE_AUTH=true` en production.
- `CONTRATPRO_RLS_ENABLED=true` apres execution de `supabase/rls.sql`.
- Un compte smoke dedie existe dans Supabase Auth.
- Le compte smoke est rattache a une organisation non demo.
- Stripe, Resend et Supabase sont configures dans Vercel.
- Les tables `import_logs`, `document_sends`, `payment_events` et
  `prospection_leads` existent.

Variables locales pour le test :

```bash
set CONTRATPRO_DEPLOYMENT_URL=https://votre-domaine.fr
set CONTRATPRO_SMOKE_EMAIL=compte-smoke@votre-domaine.fr
set CONTRATPRO_SMOKE_PASSWORD=mot-de-passe-temporaire
```

Ne jamais commiter ces valeurs. Les scripts chargent aussi `.env.local` si les
variables ne sont pas deja definies dans le terminal.

## 2. Smoke public

```bash
npm run deploy:smoke -- %CONTRATPRO_DEPLOYMENT_URL%
```

Le prospect doit voir :

- `/` : promesse claire et CTA demo / simulateur ;
- `/simulateur` : calcul de perte annuelle ;
- `/pricing` : offres Starter, Pro, Business ;
- `/demo` : formulaire de demande demonstration ;
- `/attestation-entretien-chaudiere` : page SEO metier.

## 3. Smoke authentifie

```bash
npm run smoke:auth
npm run deploy:smoke:auth -- %CONTRATPRO_DEPLOYMENT_URL%
```

Le compte smoke doit pouvoir se connecter et ouvrir `/onboarding`. Le test
echoue si l'ecran de reprise dashboard remplace silencieusement la page metier.

## 4. Parcours client complet

```bash
npm run smoke:journey
npm run deploy:smoke:journey -- %CONTRATPRO_DEPLOYMENT_URL%
```

Le script verifie sans creer de donnees :

- session utilisateur ;
- dashboard dirigeant ;
- onboarding ;
- import clients et contrats ;
- clients ;
- contrats ;
- relances ;
- factures ;
- attestations ;
- paiements SEPA ;
- identite entreprise ;
- abonnement ContratPro ;
- securite.

Un redirect vers `/settings/billing` est accepte si le billing lock bloque
normalement les ecrans metier.

## 5. Test manuel avec un vrai fichier

Avant le Loom ou une demo commerciale, rejouer le scenario M. Martin :

```bash
npm run smoke:demo
npm run deploy:smoke:demo -- %CONTRATPRO_DEPLOYMENT_URL%
```

Ce script cree des donnees fictives uniques et controle :

- import dry-run puis execution ;
- creation d'un contrat rapide SEPA ;
- generation d'un lien mandat GoCardless sandbox ;
- creation d'une facture ;
- generation du PDF facture ;
- email facture pret, sans envoi par defaut.

Pour tester Resend en reel, activer volontairement :

```bash
set CONTRATPRO_DEMO_SEND_EMAIL=true
npm run smoke:demo
```

Apres les smokes, faire une session manuelle sur une base pilote :

1. Ouvrir `/onboarding` et noter le score.
2. Importer un fichier CSV/XLSX dans `/import` en dry-run.
3. Corriger les colonnes ou erreurs bloquantes.
4. Executer l'import uniquement si le rapport est compris.
5. Ouvrir `/customers` et verifier 3 fiches clients.
6. Ouvrir `/contracts` et verifier 3 contrats annuels.
7. Ouvrir `/relances` et choisir une relance qui serait vraiment envoyee.
8. Generer une facture PDF.
9. Generer une attestation PDF.
10. Envoyer un document test si Resend est configure.
11. Ouvrir `/payments` et verifier le parcours SEPA sans encaissement live.
12. Revenir sur `/onboarding` et verifier que le score a progresse.

## 6. Definition of done

Le parcours client est pret pour pilote payant si :

- les trois smokes passent ;
- le fichier pilote est compris en moins de 15 minutes ;
- au moins 10 contrats exploitables existent apres import ;
- une facture PDF et une attestation PDF sont generees ;
- une prochaine relance est claire ;
- le dirigeant comprend l'offre Starter / Pro ;
- aucune donnee demo n'apparait dans le compte production.

## 7. Stop rules

Ne pas inviter un nouveau client si :

- le smoke authentifie echoue ;
- le parcours complet echoue sur un ecran metier ;
- l'import cree des donnees sans dry-run compris ;
- les PDF ou emails ne sont pas fiables ;
- le compte smoke pointe vers `org_demo` ;
- Stripe ou GoCardless live sont ambigus.
