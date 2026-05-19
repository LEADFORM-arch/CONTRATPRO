# Resend readiness ContratPro

Objectif : verifier que les emails factures, attestations, relances et alertes
partent depuis un expediteur Resend maitrise avant toute demo commerciale forte.

## Variables requises

```powershell
RESEND_API_KEY=...
RESEND_FROM_EMAIL="ContratPro <documents@votre-domaine.fr>"
```

`RESEND_FROM_EMAIL` doit pointer vers un domaine verifie dans Resend. Le fallback
`onboarding@resend.dev` ne doit pas etre utilise pour ContratPro en production.

## Controle sans envoi

```powershell
npm run resend:readiness
```

Le script verifie :

- presence de `RESEND_API_KEY` ;
- presence et validite de `RESEND_FROM_EMAIL` ;
- presence du domaine dans le compte Resend ;
- statut verifie du domaine.

## Controle avec envoi reel

Utiliser une adresse interne de test, jamais un client final :

```powershell
$env:CONTRATPRO_RESEND_TEST_TO="votre-email@domaine.fr"
npm run resend:readiness
```

Si l'email part, le script affiche l'identifiant message Resend.

## Definition of done

Resend est pret pour pilote si :

- `npm run resend:readiness` passe sans alerte ;
- le domaine expediteur est verifie ;
- l'email test interne arrive correctement ;
- une facture ou attestation envoyee depuis ContratPro cree une ligne
  `document_sends` en statut `SENT`.
