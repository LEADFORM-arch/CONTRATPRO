# Runbook onboarding premium ContratPro

Objectif : transformer un compte client brut en compte exploitable sans perdre
le pilote dans une checklist trop longue.

## 1. Score de lancement

La page `/onboarding` calcule un score simple sur 6 jalons :

- identite entreprise ;
- base clients ;
- contrats actifs ;
- documents legaux ;
- paiement recurrent ;
- securite production.

Ce score ne sert pas a faire joli. Il sert a decider quoi vendre et quoi
bloquer.

## 2. Lecture Architecte IA activation

Le bloc "Architecte IA activation" applique trois seuils :

| Score | Decision | Lecture |
| --- | --- | --- |
| 0-59 | Demarrer accompagne | Ne pas vendre un go-live. Faire importer et completer les bases. |
| 60-84 | Pilote facturable | Vendre un pilote payant avec une liste courte d'actions. |
| 85-100 | Go-live limite | Ouvrir Pro ou Business, puis surveiller ops, emails, webhooks et cron. |

La regle est volontairement dure : si le prochain clic ne fait pas progresser
un signal concret, l'onboarding devient cosmetique.

## 3. Session client recommandee

1. Ouvrir `/onboarding` avec le dirigeant.
2. Lire le score et la decision Architecte IA.
3. Ouvrir uniquement la prochaine action prioritaire.
4. Corriger le jalon.
5. Revenir sur `/onboarding`.
6. Decider : Starter, Pro, Business, ou accompagnement avant vente.

## 4. Preuves attendues

Avant de facturer Pro ou Business :

- l'entreprise a un SIRET, une adresse et un email ;
- au moins un import ou une base client existe ;
- au moins un contrat actif existe ;
- une facture ou une attestation PDF a ete generee ;
- le billing Stripe est compris ;
- le compte ne depend pas du tenant demo.

## 5. Stop rules

Ne pas lancer un pilote payant si :

- le client ne fournit pas de fichier client reel ;
- le dirigeant ne comprend pas la prochaine action ;
- aucun contrat recurrent n'est identifiable ;
- la securite production ou le billing lock est encore flou ;
- l'objection principale est une feature terrain hors scope du pilote.
