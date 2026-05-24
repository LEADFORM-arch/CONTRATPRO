# Runbook pilote ContratPro

Objectif : tester ContratPro avec 1 a 3 chauffagistes reels avant publicite,
campagne froide ou ouverture commerciale large.

Le pilote doit repondre a une seule question : un chauffagiste paierait-il pour
importer son portefeuille, voir ses contrats a relancer et securiser le cash-flow
via relances + SEPA ?

Les frustrations reseaux sociaux reprises dans
`docs/frustrations-chauffagistes-reseaux-sociaux.md` doivent guider les questions :
rush saisonnier, rendez-vous decales, pression prix, litiges "avant ca marchait",
confusion entretien/depannage et attestations a envoyer sous 15 jours.

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

## Script de rendez-vous

Utiliser la page `/admin/pilots` comme conducteur d'appel. Le bon ton n'est pas
"voici toutes les features", mais "voyons si ContratPro recupere ou protege du
revenu recurrent".

1. Ouverture : "Je ne vais pas vous vendre un logiciel aujourd'hui. Je veux voir
   si ContratPro vous fait gagner ou recuperer de l'argent sur vos contrats
   d'entretien."
2. Fichier reel : demander comment le pilote retrouve les clients a relancer ce
   mois-ci.
3. Import : lancer un dry-run et rappeler que rien n'est cree tant que le rapport
   n'est pas compris.
4. Valeur : demander quels contrats seraient vraiment relances.
5. Prix : tester Starter a 49 EUR/mois et Pro a 99 EUR/mois avec SEPA.
6. Cloture : classer le pilote en vendre / iterer / stop avec une objection
   bloquante ecrite.

Objections a cadrer :

- "J'ai deja Excel" -> revenir au dry-run et aux relances generees depuis Excel.
- "49 EUR, c'est cher" -> revenir au nombre de contrats recuperables.
- "Je n'aime pas le SEPA" -> expliquer Starter sans SEPA puis Pro avec SEPA.
- "Il me faut une app terrain complete" -> rappeler que le pari est d'abord de
  proteger le revenu recurrent.

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

## Fiche de sortie pilote

La page `/admin/pilots` contient maintenant une fiche copiable pour imposer une
decision nette apres chaque rendez-vous :

- Vendre : le pilote voit au moins 3 contrats relancables et accepte Starter ou
  Pro sans blocage majeur.
- Iterer : la valeur est comprise, mais une objection precise bloque l'achat.
- Stop : le segment n'est pas bon, le besoin sort du coeur contrats ou le prix
  accepte reste sous 49 EUR/mois.

Copier la note a chaud dans le CRM fondateur avec le nom du pilote, la date, la
preuve observee et la prochaine action. Sans note ecrite, le rendez-vous n'est
pas considere comme exploitable.

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

## Kit operationnel court

Pour un rendez-vous terrain rapide, utiliser le dossier :

```text
docs/pilote-terrain/
```

Ordre recommande :

1. `README.md` pour preparer le rendez-vous.
2. `script-rdv-10-min.md` pendant le rendez-vous.
3. `martin-chauffage-import.csv` pour l'import fictif.
4. `grille-observation.csv` pour noter les blocages.
5. `fiche-decision-pilote.md` pour trancher juste apres.
