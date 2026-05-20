# Mode operatoire pilote terrain ContratPro

Objectif : verifier qu'un chauffagiste comprend ContratPro sans formation longue.

Ce test ne sert pas a montrer toute la technique. Il sert a voir si un artisan peut demarrer vite : reprendre son fichier client, creer un contrat, preparer un paiement SEPA, sortir une facture et une attestation.

## Materiel necessaire

- URL production : https://contratpro-dun.vercel.app
- Compte de test ContratPro.
- Fichier d'import : `docs/pilote-terrain/martin-chauffage-import.csv`
- Grille d'observation : `docs/pilote-terrain/grille-observation.csv`
- GoCardless en sandbox uniquement.
- Aucune vraie coordonnee bancaire client.

## Phrase de depart

> On va faire comme si vous aviez deja quelques contrats d'entretien chaudiere, PAC et clim dans un fichier Excel. Je vous laisse utiliser ContratPro. Dites-moi juste ce que vous cherchez, ce que vous comprenez, et ce qui vous bloque.

Ne pas vendre le produit pendant le test. Observer d'abord.

## Scenario M. Martin

M. Martin est chauffagiste. Il veut passer d'un fichier Excel a un suivi propre de ses contrats d'entretien.

Il doit arriver a faire ces actions :

1. Se connecter.
2. Comprendre l'action principale proposee apres connexion.
3. Importer le fichier `martin-chauffage-import.csv`.
4. Lire la simulation avant creation.
5. Confirmer l'import si tout parait coherent.
6. Creer ou ouvrir un contrat d'entretien.
7. Comprendre ou se trouve le paiement SEPA.
8. Verifier les informations entreprise.
9. Creer une facture.
10. Generer ou preparer une attestation d'intervention.
11. Revenir au dashboard et comprendre la prochaine action.

## Deroule exact dans le SaaS

### 1. Connexion

Laisser le chauffagiste se connecter.

Observer :
- Voit-il immediatement quoi faire ?
- Clique-t-il sur import, contrat, ou autre chose ?
- Lit-il les textes ou cherche-t-il un bouton ?

Critere OK : il trouve une action utile en moins de 10 secondes.

### 2. Import Excel

Aller sur l'import si le chauffagiste ne l'a pas deja fait.

Action :
- Utiliser le fichier `martin-chauffage-import.csv`.
- Lancer la simulation.
- Lire les lignes reconnues.
- Confirmer seulement si la simulation est claire.

Observer :
- Les colonnes sont-elles comprises ?
- Les mots chauffagiste sont-ils assez concrets ?
- Le bouton de confirmation est-il rassurant ?

Critere OK : il comprend que rien n'est cree avant validation.

### 3. Contrat rapide

Action :
- Creer un contrat depuis le parcours rapide.
- Utiliser un cas simple : chaudiere gaz, entretien annuel, 216 EUR par an, paiement SEPA.

Observer :
- Le decoupage client, equipement, contrat, paiement est-il clair ?
- Les champs obligatoires sont-ils evidents ?
- Le montant annuel est-il compris ?

Critere OK : il cree le contrat sans demander "je mets quoi ici ?" plus d'une fois.

### 4. Paiement SEPA

Action :
- Ouvrir ou preparer le lien mandat sandbox.
- Ne jamais utiliser de vraies informations bancaires.

Observer :
- Comprend-il que le client final signe le mandat ?
- Comprend-il que GoCardless gere le prelevement ?
- Le vocabulaire "mandat", "SEPA", "prelevement" est-il clair ?

Critere OK : il peut expliquer avec ses mots : "j'envoie un lien au client pour autoriser le prelevement".

### 5. Parametres entreprise

Action :
- Verifier la page entreprise.
- Completer ou lire les informations : nom commercial, SIRET, TVA, adresse.

Observer :
- Comprend-il que ces informations servent aux factures et attestations ?
- Les libelles sont-ils assez simples ?

Critere OK : il comprend pourquoi cette page existe.

### 6. Facture

Action :
- Creer une facture depuis un contrat.
- Verifier HT, TVA, TTC.
- Generer le PDF si disponible.

Observer :
- Le montant est-il visible avant validation ?
- Le bouton principal est-il evident ?
- La facture semble-t-elle professionnelle ?

Critere OK : il peut dire "je peux envoyer ca a mon client".

### 7. Attestation

Action :
- Creer ou ouvrir une intervention.
- Generer une attestation si le parcours le permet.

Observer :
- Comprend-il que l'attestation vient apres une visite ?
- Le document rassure-t-il sur le serieux du suivi ?

Critere OK : il comprend l'utilite sans explication longue.

### 8. Retour dashboard

Action :
- Revenir au tableau de bord.

Observer :
- Le dashboard donne-t-il une prochaine action claire ?
- Le chauffagiste sait-il quoi faire ensuite ?

Critere OK : il ne tombe pas sur un ecran vide ou froid.

## Questions a poser a la fin

Poser ces questions dans cet ordre :

1. Qu'est-ce que vous avez compris en premier ?
2. A quel moment vous avez hesite ?
3. Quel mot ne vous parle pas ?
4. Est-ce que vous pourriez importer votre vrai fichier client ?
5. Est-ce que vous oseriez envoyer la facture ou l'attestation a un client ?
6. Combien cela vaut pour vous si ca vous evite Excel, les oublis et les relances ?

## Ce qu'il ne faut pas faire pendant le test

- Ne pas parler de Supabase, Vercel, Stripe, Resend ou architecture.
- Ne pas montrer 30 fonctionnalites.
- Ne pas corriger le chauffagiste pendant qu'il cherche.
- Ne pas utiliser de vraies coordonnees bancaires.
- Ne pas vendre avant d'avoir observe.

## Criteres de decision

Pret pilote si :
- Le premier clic est compris en moins de 10 secondes.
- L'import est compris sans aide lourde.
- Le contrat rapide est compris avec une seule hesitation maximum.
- Le paiement SEPA est compris comme un lien a faire signer.
- La facture et l'attestation paraissent professionnelles.

A corriger avant pilote si :
- Le chauffagiste ne sait pas ou cliquer apres connexion.
- L'import fait peur.
- Les termes metier ne sont pas compris.
- La creation de contrat demande trop d'explications.
- Le paiement SEPA semble dangereux ou flou.

## Resultat attendu

A la fin du test, tu dois avoir une liste courte :

- 3 choses qui marchent.
- 3 choses a simplifier.
- 3 mots a changer.
- 1 decision : pret pour pilote reel, ou correction avant pilote.
