# Runbook pilote ContratPro

Objectif : tester ContratPro avec 1 a 3 chauffagistes reels avant publicite,
campagne froide ou ouverture commerciale large.

Le pilote doit repondre a une seule question : un chauffagiste paierait-il pour
importer son portefeuille, voir ses contrats a relancer et securiser le cash-flow
via relances + SEPA ?

## Profil pilote

Choisir un chauffagiste ou une TPE CVC qui coche au moins 4 criteres :

- 50 a 300 clients dans Excel, Praxedo, Libel, papier ou autre outil ;
- au moins 10 contrats d'entretien recurrents ;
- accepte une session accompagnee de 60 a 90 minutes ;
- accepte de tester sur donnees reelles ou anonymisees ;
- souffre deja des relances, impayes ou oublis d'echeance ;
- peut dire clairement a quel prix il acheterait.

## Preparation avant rendez-vous

1. Confirmer l'accord du pilote sur l'utilisation du fichier client.
2. Demander un export CSV/XLSX avec clients, emails, telephones, adresses,
   equipements, dates de contrat et montants si disponibles.
3. Verifier que la base Supabase de test est separee de la production payante.
4. Executer les controles locaux :

```bash
npm run type-check
npm run test:quality
npm run security:audit
npm run production:audit
npm run build
```

5. Ouvrir les ecrans : `/import`, `/relances`, `/terrain`, `/pricing`,
   `/admin/launch`.

## Scenario de test en 90 minutes

### 1. Import dry-run

- Charger le fichier pilote dans `/import`.
- Ne pas executer l'import tant que le rapport dry-run n'est pas compris.
- Noter les colonnes non reconnues, doublons, erreurs email/date/montant.

Succes attendu : le pilote comprend ce qu'il doit corriger en moins de 15 minutes.

### 2. Import execute

- Importer uniquement les lignes propres.
- Verifier clients, contrats et installations crees.
- Identifier 3 contrats qui ont une valeur commerciale immediate.

Succes attendu : au moins 10 contrats exploitables apres import.

### 3. Relances et Architecte IA

- Ouvrir `/relances`.
- Lire les scores IA avec le pilote.
- Choisir une relance qui serait vraiment envoyee.
- Ajuster le message si besoin.

Succes attendu : le pilote valide au moins une action commerciale concrete.

### 4. Documents

- Generer une facture PDF ou une attestation PDF.
- Envoyer un document en test si Resend est configure.
- Noter les corrections legales ou commerciales demandees.

Succes attendu : maximum 2 corrections de texte avant usage pilote.

### 5. Terrain mobile

- Ouvrir `/terrain` sur smartphone.
- Verifier lisibilite, actions contrat/PDF et comprehension des cartes.
- Demander : "Est-ce que tu pourrais utiliser ca entre deux clients ?"

Succes attendu : la page est jugee utilisable comme premier ecran terrain.

### 6. SEPA et cash-flow

- Ne pas encaisser en live lors du premier test.
- Montrer le parcours GoCardless sandbox ou expliquer le mandat.
- Demander quel montant serait acceptable si les relances + SEPA recuperent du cash.

Succes attendu : le pilote accepte le principe d'un abonnement Starter/Pro.

## Scorecard de fin

Remplir a chaud :

| Question | Reponse |
| --- | --- |
| Le pilote importerait-il sa vraie base ? | Oui / Non / A revoir |
| A-t-il compris les erreurs d'import ? | Oui / Non |
| A-t-il vu au moins 3 contrats a relancer ? | Oui / Non |
| A-t-il valide une relance concrete ? | Oui / Non |
| La page `/terrain` est-elle utilisable sur mobile ? | Oui / Non |
| Accepterait-il 49 EUR/mois ? | Oui / Non |
| Accepterait-il 99 EUR/mois avec SEPA ? | Oui / Non |
| Objection principale | Texte libre |
| Fonction manquante bloquante | Texte libre |
| Decision | Payer / Continuer pilote / Stop |

## Go / no-go

GO pilote suivant si :

- 2 pilotes sur 3 importent une vraie base ;
- 2 pilotes sur 3 identifient des contrats a relancer ;
- au moins 1 pilote accepte un prix Starter ou Pro ;
- aucune faille securite ou juridique bloquante n'apparait.

NO-GO commercial si :

- l'import reste incomprehensible ;
- la page mobile terrain est rejetee ;
- le prix accepte reste inferieur a 49 EUR/mois ;
- les documents exigent une refonte juridique profonde.

## Sortie attendue

Apres 3 pilotes, produire une decision courte :

```text
Segment teste:
Prix accepte:
Fonction bloquante:
Message commercial qui marche:
Decision: vendre / iterer / pivoter
```
