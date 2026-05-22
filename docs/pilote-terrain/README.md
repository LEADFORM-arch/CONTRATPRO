# Kit pilote chauffagiste ContratPro

Objectif : tester ContratPro avec un chauffagiste presse, sans demo longue et
sans discours technique.

Le test doit repondre a une seule question :

```text
Est-ce qu'un chauffagiste comprend assez vite pour vouloir revenir dans le SaaS ?
```

## Documents du kit

| Fichier | Usage |
| --- | --- |
| `script-rdv-10-min.md` | Conducteur exact du rendez-vous court. |
| `martin-chauffage-import.csv` | Fichier Excel/CSV fictif mais realiste a importer. |
| `grille-observation.csv` | Grille a remplir pendant le test. |
| `fiche-decision-pilote.md` | Verdict a chaud : vendre, corriger ou stopper. |
| `mode-operatoire-pilote.md` | Version detaillee si le rendez-vous dure plus longtemps. |

## Regle principale

Ne pas presenter ContratPro comme un logiciel complet.

Presenter ContratPro comme un outil de travail pour :

- retrouver les contrats au bon moment ;
- eviter les oublis d'echeance ;
- sortir facture et attestation vite ;
- preparer le paiement recurrent sans courir apres le client.

## Ce qu'il faut preparer avant le rendez-vous

1. Ouvrir l'URL production :

```text
https://contratpro-dun.vercel.app
```

2. Avoir un compte de test connectable.
3. Garder le fichier `martin-chauffage-import.csv` pret.
4. Garder `grille-observation.csv` ouvert pour prendre des notes.
5. Rappeler que GoCardless est en sandbox : aucune vraie coordonnee bancaire.
6. Ne pas parler de Supabase, Vercel, Stripe, Resend, CI ou architecture.

## Scenario court a montrer

1. Importer le fichier client.
2. Voir les contrats retrouves.
3. Ouvrir un dossier contrat.
4. Creer une facture.
5. Generer ou preparer une attestation.
6. Montrer le SEPA sandbox comme prochaine etape.

Si le chauffagiste demande "je clique ou ?", la page doit etre corrigee.
Si le chauffagiste dit "ca me ferait gagner du temps", le signal est bon.

## Questions de fin

Poser seulement ces questions :

1. Qu'est-ce qui est clair immediatement ?
2. Ou avez-vous hesite ?
3. Quel mot ne parle pas chauffagiste ?
4. Est-ce que vous importeriez votre vrai fichier ?
5. Est-ce que vous pourriez envoyer cette facture/attestation a un client ?
6. A quel prix mensuel cela devient interessant ?

## Decision attendue

Apres le rendez-vous, remplir `fiche-decision-pilote.md`.

Ne pas ajouter de feature sur une seule remarque. Chercher d'abord un pattern
sur 3 chauffagistes.

