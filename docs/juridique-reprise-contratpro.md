# Reprise juridique ContratPro

Objectif : transformer les documents Word fournis en actions exploitables avant
pilote, sans publier de texte incomplet.

Documents sources analyses :

- `POLITIQUE_CONFIDENTIALITE_CONTRATPRO.docx`
- `RGPD_CONTRATPRO (1).docx`
- `STATUTS_SASU_CONTRATPRO (1).docx`

## Decision de reprise

Les documents sont utiles, mais ils contiennent encore des placeholders :

- denomination sociale ;
- capital ;
- SIREN / SIRET ;
- RCS ;
- siege social ;
- representant legal ;
- email RGPD ;
- domaine final ;
- date de mise a jour.

Ils ne doivent donc pas etre publies tels quels.

## Ce qui a ete integre dans l'application

Pages publiques consolidees :

```text
/legal
/privacy
/terms
/cookies
/dpa
```

Changements :

- correction des textes publics avec encodage propre ;
- politique de confidentialite enrichie avec donnees traitees, finalites,
  bases juridiques, roles RGPD, sous-traitants, conservation, securite, droits ;
- creation d'une page `/dpa` pour cadrer le role de sous-traitant de ContratPro
  vis-a-vis des donnees clients finaux importees par les chauffagistes ;
- maintien du bandeau cookies CNIL deja present ;
- ajout de `/dpa` au footer, sitemap, robots, smoke test et audit production.

## Ce qui reste a completer avant commercialisation publique

Informations societe :

```text
Denomination sociale :
Forme juridique :
Capital :
SIREN :
SIRET :
RCS :
Siege social :
Representant legal :
Email contact :
Email RGPD :
Nom de domaine final :
TVA intracommunautaire :
```

Sous-traitants a confirmer :

```text
Supabase : region, DPA, sauvegardes, retention
Vercel : DPA, region, logs, protection deployment
Stripe : DPA, webhooks, donnees paiement
GoCardless : DPA, mandat SEPA, statut live
Resend : DPA, domaine expediteur, SPF/DKIM/DMARC
```

Documents internes a tenir :

- registre des traitements ;
- registre des sous-traitants ;
- procedure violation de donnees ;
- procedure droit d'acces / suppression / export ;
- politique de conservation ;
- registre des incidents ;
- preuves de consentement cookies.

## Points a faire valider par avocat

1. Role exact de ContratPro pour GoCardless global : mandataire, sous-mandataire
   ou simple outil technique.
2. Responsabilite sur les attestations CVC generees.
3. CGV B2B et limitation de responsabilite.
4. DPA client final : statut responsable / sous-traitant.
5. Durees de conservation exactes selon documents, factures, contrats et SEPA.
6. Conditions de suspension/resiliation et export des donnees.

## Position pour le pilote

Pour un pilote sandbox, le niveau actuel est acceptable si :

- aucune vraie coordonnee bancaire client final n'est utilisee ;
- GoCardless reste en sandbox ;
- Resend/domaine live restent differes ;
- les pages legales indiquent clairement qu'elles sont des bases a finaliser ;
- les documents finaux sont relus avant signature client payant.

Pour une commercialisation publique, les placeholders doivent etre remplaces et
les documents relus.

