# 🔄 Workflow Codex — Protocole des 4 Phases — CONTRATPRO

## Phase 1 : Architecture (Mode "Ask")
**Prompt type :**
> "Je veux implémenter [FEATURE] pour CONTRATPRO. Ne touche à aucun fichier. Analyse le repo actuel et propose un plan architectural. Liste les fichiers à créer/modifier et les pièges potentiels."

**Ce que tu attends :**
- Résumé du besoin (2 phrases)
- Liste des fichiers impactés
- Impact sur RLS (nouvelle table ? nouvelle policy ?)
- Impact sur Billing (nouvelle route protégée ?)
- Impact sur Webhooks (nouveau endpoint ?)
- Risques identifiés
- Questions de clarification

**Questions typiques pour CONTRATPRO :**
- "Quel est le `organization_id` cible ?"
- "Le feature doit-elle être protégée par le billing lock ?"
- "Quel est le statut RLS requis pour cette table ?"
- "Le webhook doit-il être idempotent ?"
- "Faut-il un test `test:quality` supplémentaire ?"

**Ton action :** Valider ou ajuster le plan.

---

## Phase 2 : Squelette (Mode "Agent" — permissions limitées)
**Prompt type :**
> "Implémente uniquement les interfaces TypeScript et les signatures de fonctions vides. Pas de logique métier. Je veux valider la structure avant."

**Ce que tu attends :**
- Types/interfaces (Zod schemas inclus)
- Signatures de fonctions (Server Actions incluses)
- Structure des dossiers
- Schéma SQL (si nouvelle table)
- **Pas une ligne de logique**

**Ton action :** Valider la structure.

---

## Phase 3 : Implémentation (Mode "Agent" — full)
**Prompt type :**
> "Implémente la logique fonction par fonction. Commence par [FONCTION 1]. Après chaque fonction, attends mon GO."

**Ce que tu attends :**
- Code fonctionnel
- Respect des règles du projet (pas de `any`, RLS, billing lock)
- Gestion d'erreurs typée
- Journalisation métier (`payment_events`, `document_sends`, etc. si applicable)

**Ton action :** Tester (`npm run build`, `npm run test:quality`).

---

## Phase 4 : Revue (Mode "Ask")
**Prompt type :**
> "Relis tout le code que tu as écrit. Joue le rôle d'un Senior Developer grincheux. Identifie : bugs, failles de sécurité, problèmes de perf, violations des conventions. Sois brutal."

**Ce que tu attends :**
- Liste des problèmes
- Failles de sécurité (RLS, webhooks, secrets)
- Problèmes de performance (N+1, re-rendus)
- Violations des conventions
- Tests manquants

**Ton action :** Corriger ou demander les corrections.

---

## Phase 5 : Audit (OBLIGATOIRE pour CONTRATPRO)
**Prompt type :**
> "Avant de finaliser, vérifie que les garde-fous CONTRATPRO sont respectés : RLS, billing lock, webhooks signés, tests quality, migration-order.json à jour."

**Commandes à lancer :**
```bash
npm run type-check
npm run test:quality
npm run security:audit
npm run db:audit
```

---

## Feedback d'erreurs (Le "Bug Loop")

Quand il y a une erreur :

```
## Erreur
```
[COPIE-COLLE l'erreur EXACTE]
```

## Fichier
`chemin/du/fichier.ts`

## Contexte
J'ai lancé `npm run build` après ta dernière modification.

## Attendu
Corrige l'erreur en respectant les règles du projet.
Vérifie aussi l'impact sur RLS et billing si applicable.
```

---

## Astuce : Le "3 Fichiers + Contexte" pour CONTRATPRO

Pour une feature complexe, donne le contexte complet :

```
Voici :
1. [FICHIER À MODIFIER] : `chemin/fichier.ts`
   [COPIE-COLLE le fichier]

2. [FICHIER APPELANT] : `chemin/appelant.ts`
   [COPIE-COLLE le fichier]

3. [SCHÉMA ZOD] : `lib/validations/[feature].schema.ts`
   [COPIE-COLLE le fichier]

4. [RÈGLES] : `.codex/instructions.md` (sections pertinentes)
5. [DESIGN] : `.codex/design-system.md` (patterns UI)

MISSION : Implémente [FONCTION] avec ces contraintes...
- Respecter RLS (organization_id obligatoire)
- Respecter billing lock si applicable
- Journaliser dans [table métier] si applicable
```
