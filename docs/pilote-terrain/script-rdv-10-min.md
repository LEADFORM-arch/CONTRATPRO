# Script rendez-vous pilote en 10 minutes

Objectif : tester la comprehension immediate, pas faire une demo commerciale.

## Avant de commencer

Phrase a dire :

```text
Je vais vous montrer un cas simple : un fichier client, des contrats d'entretien,
une facture, une attestation et un paiement SEPA en test. Je veux surtout voir
si c'est clair pour vous, pas vous faire une presentation commerciale.
```

Regle : laisser le chauffagiste reagir. Ne pas expliquer avant qu'il bloque.

## Minute 0 a 1 - Probleme metier

Dire :

```text
Le probleme n'est pas de vendre un contrat. C'est de le retrouver au bon moment :
echeance, facture, attestation et relance.
```

Question :

```text
Aujourd'hui, vos contrats d'entretien sont plutot dans Excel, dans un logiciel,
ou dans la tete ?
```

Note attendue : vocabulaire reel du chauffagiste.

## Minute 1 a 3 - Import Excel

Action :

1. Ouvrir `/import`.
2. Deposer `martin-chauffage-import.csv`.
3. Laisser lire la simulation.
4. Demander : "Est-ce que vous comprenez ce qui va etre cree ?"

Signal vert :

- il comprend clients, equipements, contrats ;
- il voit que rien n'est cree avant confirmation ;
- il reconnait son monde : chaudiere, PAC, VMC, echeance, montant annuel.

Signal rouge :

- il cherche trop longtemps le bouton ;
- il ne comprend pas la difference simulation/import ;
- il a peur de casser ses donnees.

## Minute 3 a 5 - Contrats

Action :

1. Ouvrir `/contracts`.
2. Montrer la liste.
3. Ouvrir un dossier contrat.

Dire :

```text
L'idee est de ne plus chercher le client dans Excel. Le dossier doit dire tout
de suite : qui, quelle installation, quelle echeance, quelle prochaine action.
```

Question :

```text
Si vous arrivez ici entre deux interventions, savez-vous quoi faire ?
```

Signal vert : il cite une action concrete : facturer, relancer, preparer SEPA,
sortir l'attestation.

## Minute 5 a 7 - Facture et attestation

Action :

1. Depuis un contrat, creer une facture.
2. Verifier montant, TVA, echeance.
3. Montrer le PDF si disponible.
4. Montrer l'attestation ou le chemin intervention -> attestation.

Question :

```text
Est-ce que ce document est assez propre pour partir chez un client ?
```

Signal vert : corrections mineures seulement.

Signal rouge : le document ne lui inspire pas confiance.

## Minute 7 a 8 - SEPA sandbox

Action :

1. Montrer le bloc paiement SEPA.
2. Montrer le lien mandat sandbox, sans vraie banque.

Dire :

```text
Ici, le client final signe une autorisation de prelevement. Pour le pilote, on
reste en sandbox : aucun vrai prelevement.
```

Question :

```text
Est-ce que vous comprenez qui signe quoi ?
```

Signal vert : il reformule "j'envoie un lien au client".

## Minute 8 a 10 - Prix et decision

Questions a poser dans cet ordre :

1. Ou avez-vous hesite ?
2. Quel mot est trop technique ?
3. Est-ce que vous importeriez votre vrai fichier ?
4. Combien de contrats oublies ou relances tard vous avez par an ?
5. A 49 EUR/mois, est-ce que vous testez ?
6. A 99 EUR/mois avec SEPA et relances, est-ce encore logique ?

Ne pas negocier. Noter les mots exacts.

## Conclusion

Dire :

```text
Merci. Je vais corriger ce qui bloque vraiment. Ce que je cherche, c'est que vous
puissiez retrouver vos contrats et sortir les bons documents sans perdre de temps.
```

Remplir ensuite `fiche-decision-pilote.md` a chaud.

