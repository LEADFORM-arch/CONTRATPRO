# Solutions ContratPro aux frustrations chauffagistes

Objectif : chaque frustration terrain doit avoir une reponse produit claire,
visible et testable pendant un pilote.

## 1. Rush saisonnier et pannes au premier froid

Frustration : les appels explosent, les contrats cachés dans Excel deviennent
urgents, le dirigeant ne sait plus quoi traiter en premier.

Solution ContratPro :

- file du jour limitee a quelques dossiers ;
- contrats sous 15 et 45 jours mis en avant ;
- cockpit dirigeant centre sur une prochaine action ;
- relances preparees avant la haute saison.

Ce qui existe deja :

- dashboard "Aujourd'hui" ;
- page `/relances` avec file courte ;
- score revenu recurrent et contrats critiques.

Prochaine evolution apres pilote :

- mode "pre-saison hiver" : liste des contrats chaudiere/PAC a reprendre avant
  octobre.

## 2. Rendez-vous decales, client absent, tournee cassee

Frustration : un report client ou une absence au domicile casse la journee.

Solution ContratPro :

- dossier contrat avec telephone, adresse, equipement, prochaine visite ;
- page `/terrain` mobile pour retrouver rapidement le dossier ;
- historique intervention et attestation rattaches au contrat.

Ce qui existe deja :

- `/terrain` ;
- fiche contrat ;
- creation intervention rattachee au contrat.

Prochaine evolution apres pilote :

- statut "client absent" ;
- replanification rapide ;
- SMS/email de confirmation de visite.

## 3. Devis complementaire mal compris

Frustration : le client confond entretien annuel et reparation. Le chauffagiste
doit justifier pourquoi une piece ou une intervention supplementaire est payante.

Solution ContratPro :

- separer contrat, facture, intervention et attestation ;
- garder les conditions et le paiement visibles dans le dossier ;
- ajouter un message pilote : "entretien ne veut pas dire toutes reparations incluses".

Ce qui existe deja :

- cadre contractuel dans la fiche contrat ;
- facture creee depuis contrat ;
- historique intervention.

Prochaine evolution apres pilote :

- module devis complementaire depuis intervention ;
- mention explicite "hors contrat" ou "inclus contrat".

## 4. Litige "avant votre passage ca marchait"

Frustration : une panne apres visite est attribuee au technicien. Il faut des
preuves simples, datees et faciles a retrouver.

Solution ContratPro :

- bloc "Bouclier preuves" dans la fiche contrat ;
- intervention, attestation, facture et paiement relies au meme dossier ;
- documents PDF et historique d'envoi.

Ce qui existe deja :

- fiche contrat avec historique ;
- attestations ;
- factures PDF ;
- historique d'envoi documents.

Prochaine evolution apres pilote :

- photos terrain ;
- signature client ;
- horodatage complet du rapport de visite.

## 5. Attestation sous 15 jours

Frustration : l'attestation est obligatoire, mais peut partir trop tard pendant
le rush.

Solution ContratPro :

- attestation visible comme action documentaire ;
- chemin direct contrat -> intervention -> attestation -> PDF ;
- page `/certificates` centree sur documents a envoyer.

Ce qui existe deja :

- creation intervention ;
- page attestations ;
- PDF attestation ;
- envoi email pret via Resend quand le domaine sera configure.

Prochaine evolution apres pilote :

- alerte J+7 / J+12 apres intervention realisee ;
- statut "attestation remise sur place".

## 6. Pression prix et concurrence grands groupes

Frustration : le client compare 15 ou 20 EUR sans comprendre la valeur du suivi
local.

Solution ContratPro :

- montrer le revenu protege ;
- transformer le suivi en preuve professionnelle ;
- calculer les contrats oublies avec le simulateur.

Ce qui existe deja :

- `/simulateur` ;
- dashboard revenu recurrent ;
- pricing Starter/Pro/Business.

Prochaine evolution apres pilote :

- rapport client "suivi annuel entretien" pour rendre visible la valeur du
  service local.

## Regle produit

Ne pas ajouter une grosse fonctionnalite pour une frustration isolee.

Chercher le pattern sur 3 pilotes :

```text
1 frustration repetee + 1 ecran ou elle bloque + 1 action mesurable = priorite produit.
```

