# 🎯 Dossier `.codex/` — Configuration Codex pour CONTRATPRO

> Ce dossier transforme Codex en **Ingénieur Senior** et **Designer compétent** spécialisé dans le SaaS B2B pour chauffagistes CVC.

---

## 📁 Structure

```
📁 .codex/
├── instructions.md          ← RÈGLES GLOBALES CONTRATPRO (le cœur)
├── design-system.md         ← DESIGN (tokens, composants, patterns métier)
├── architecture.md          ← Architecture métier & technique CONTRATPRO
├── stack.md                 ← Stack exacte + versions + variables d'env
├── conventions.md           ← Naming, structure, patterns métier
├── security.md              ← Règles de sécurité (RLS, webhooks, billing)
├── workflow.md              ← Processus de travail avec Codex (4 phases + audit)
├── README.md                ← Ce fichier
├── examples/                ← Code "modèle" CONTRATPRO
│   ├── good-component.tsx   ← ClientCard (avec badges statut)
│   ├── good-service.ts      ← ClientService (multi-tenant + RLS)
│   ├── good-api-route.ts    ← Route API (auth + billing lock)
│   └── good-test.spec.ts    ← Tests (organization_id vérifié)
├── prompts/                 ← Prompts réutilisables CONTRATPRO
│   ├── 01-architecture.md   ← Phase 1 (impact RLS/billing/webhooks)
│   ├── 02-squelette.md      ← Phase 2 (schémas Zod + SQL)
│   ├── 03-implementation.md ← Phase 3 (journalisation métier)
│   └── 04-revue.md          ← Phase 4 (sécurité + garde-fous)
└── snapshots/               ← Snapshots visuels des pages (à créer)
```

---

## 🚀 Installation

### 1. Copier ce dossier dans ton repo CONTRATPRO

```bash
# Copier le dossier .codex/ à la racine de CONTRATPRO
copy .codex C:\chemin\vers\CONTRATPRO\.codex

# Ou via Git :
git add .codex/
git commit -m "chore: add .codex/ configuration for AI-assisted development"
git push
```

### 2. Adapter les fichiers (si besoin)

Les fichiers sont DÉJÀ personnalisés pour CONTRATPRO. Vérifie juste :

| Fichier | À vérifier |
|---------|-----------|
| `instructions.md` | Contexte métier (déjà rempli) |
| `design-system.md` | Palette de couleurs (bleu primary — adaptable) |
| `stack.md` | Variables d'environnement (à compléter avec tes vraies valeurs) |

### 3. Configurer VS Code / Codex

#### Option A : Extension ChatGPT (OpenAI officiel)

1. Ouvre VS Code
2. `Ctrl/Cmd + Shift + P` → "Open User Settings (JSON)"
3. Ajoute :

```json
{
  "chatgpt.promptPrefix.custom": "Tu es un Ingénieur Logiciel Senior (12+ ans) et expert de la stack Next.js 15 + React 19 + TypeScript 5.5 + TailwindCSS 4 + Supabase + shadcn/ui + Stripe + GoCardless + Resend.\n\nTu travailles sur CONTRATPRO, un SaaS B2B pour chauffagistes CVC en France.\n\nRÈGLES ABSOLUES :\n1. PAS DE `any`. JAMAIS.\n2. Server Components par défaut. 'use client' UNIQUEMENT si useState/useEffect/événements DOM.\n3. PAS de useEffect pour le data fetching. Utiliser React Query.\n4. Validation Zod sur TOUS les inputs.\n5. Gestion d'erreurs typée (AppError, ValidationError, NotFoundError).\n6. Fonctions max 40 lignes. Responsabilité unique.\n7. PAS de code mort (pas de // TODO). throw new Error('Not implemented') si manquant.\n8. PAS de console.log. Logger structuré ou tables métier.\n9. RLS activé sur TOUTES les tables Supabase.\n10. Multi-tenant : organization_id sur TOUTES les requêtes.\n11. PAS de secrets dans le code.\n12. Billing lock respecté si CONTRATPRO_REQUIRE_BILLING=true.\n13. Webhooks signés (Stripe + GoCardless).\n14. Cron protégé par CONTRATPRO_CRON_SECRET.\n\nRÈGLES DE DESIGN :\n1. Utiliser UNIQUEMENT les tokens de .codex/design-system.md\n2. JAMAIS de couleurs hardcodées\n3. JAMAIS de style={{}}\n4. JAMAIS de valeurs arbitraires Tailwind\n5. Max 3 couleurs par composant\n6. Hover et focus states obligatoires\n7. Mobile first (PWA terrain)\n8. Badges statut avec couleurs CONTRATPRO (vert/orange/rouge/gris/bleu)\n9. Bloc \"Architecte IA\" respecte le pattern\n10. Stats cards avec icône dans cercle coloré\n\nPROCESSUS :\n1. Analyse (2 phrases)\n2. Questions si contexte manquant (organization_id, billing, RLS)\n3. Plan d'action (fichiers impactés + impact RLS/billing/webhooks)\n4. Code (parties modifiées uniquement)\n5. Tests unitaires + test:quality si impact garde-fous\n\nFORMAT : Blocs de code Markdown. Si bug, expliquer la cause racine AVANT le code.\n\nPERMISSIONS :\n✅ Lire/créer/modifier des fichiers\n❌ Supprimer sans autorisation\n❌ Modifier package.json sans GO\n❌ Modifier supabase/migration-order.json sans GO\n❌ Modifier vercel.json sans GO\n❌ Modifier .github/workflows/ci.yml sans GO\n❌ Installer dépendances sans GO\n❌ Exposer des secrets\n❌ Désactiver RLS ou modifier rls.sql sans audit\n\nRéponds \"Règles comprises. Prêt à architecturer CONTRATPRO. Quelle priorité on attaque ?\" puis attends ma demande."
}
```

#### Option B : Extension Continue.dev

Crée un fichier `.continue/config.json` :

```json
{
  "customCommands": [
    {
      "name": "codex-rules",
      "description": "Load CONTRATPRO project rules",
      "prompt": "Read and follow the rules in .codex/instructions.md and .codex/design-system.md before any code generation. This is a SaaS for HVAC contractors in France."
    }
  ]
}
```

---

## 🔄 Workflow quotidien avec Codex — CONTRATPRO

### Avant chaque session de travail

1. **Donne le contexte** à Codex :

```
Voici les règles du projet CONTRATPRO (lis-les avant de coder) :
- .codex/instructions.md
- .codex/design-system.md
- .codex/architecture.md

Voici les fichiers pertinents pour cette feature :
- [FICHIER 1] : app/(dashboard)/[feature]/page.tsx
- [FICHIER 2] : lib/validations/[feature].schema.ts
- [FICHIER 3] : services/[feature].service.ts
- [FICHIER 4] : supabase/schema.sql (section pertinente)
```

2. **Utilise les prompts des 4 phases** (dans `.codex/prompts/`)

### Après chaque génération

3. **Design Review** (obligatoire pour l'UI) :

```
Relis ce composant du point de vue design CONTRATPRO :
1. Les couleurs viennent-elles des tokens ?
2. Les espacements suivent-ils l'échelle ?
3. Les badges statut utilisent-ils les couleurs CONTRATPRO ?
4. Y a-t-il des hover/focus states ?
5. Le contraste est-il suffisant ?
6. Est-ce responsive (PWA terrain) ?
7. Le bloc "Architecte IA" respecte-t-il le pattern (si applicable) ?
8. Y a-t-il du code mort ou des styles hardcodés ?

Corrige ce qui ne respecte pas le design system.
```

4. **Audit CONTRATPRO** (obligatoire avant commit) :

```bash
npm run type-check
npm run test:quality
npm run security:audit
npm run db:audit
```

5. **Bug Loop** (si erreur) :

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
Corrige l'erreur en respectant les règles CONTRATPRO.
Vérifie l'impact sur RLS, billing lock et webhooks si applicable.
```

---

## 🎨 Comment rendre Codex fort en design sur CONTRATPRO

Le secret : **Codex ne designe pas, il assemble selon le système CONTRATPRO.**

### Ce que tu dois faire :

1. **Définir les tokens** (déjà fait dans `design-system.md`)
   - Bleu primary (confiance)
   - Vert succès (contrat actif, paiement réussi)
   - Orange alerte (relance, échéance proche)
   - Rouge erreur (expiré, échoué)

2. **Verrouiller les composants** (shadcn/ui + patterns CONTRATPRO)
   - Badges statut avec couleurs métier
   - Stats cards avec icône dans cercle coloré
   - Bloc "Architecte IA" avec score + recommandation + actions

3. **Documenter les patterns métier**
   - Dashboard avec 4 stats cards + tableau + actions rapides
   - Formulaire client (raison sociale, SIRET, email, téléphone, adresse)
   - Empty state avec icône + texte + bouton créer
   - Bloc "Architecte IA" pour les pages admin

4. **Donner des références**
   - Vercel Dashboard (layout)
   - Stripe Dashboard (tableaux + badges)
   - Linear (clean + espacements)

### Ce que tu ne dois JAMAIS faire :

- ❌ "Crée-moi une belle page de clients" (trop vague)
- ❌ "Fais comme tu veux pour le design" (Codex fera du générique gris)
- ❌ "Améliore le design" (sans référence précise)

### Ce que tu dois TOUJOURS faire :

- ✅ "Utilise le pattern Stats Cards de design-system.md section 3"
- ✅ "Badge statut : vert pour actif, orange pour à renouveler, rouge pour expiré"
- ✅ "Référence visuelle : https://vercel.com/dashboard (layout) + https://stripe.com (tableaux)"
- ✅ "Palette : primary-600 pour les boutons, neutral-500 pour le texte secondaire, green-100/green-700 pour les badges actifs"
- ✅ "Inclure un bloc Architecte IA avec score + recommandation + boutons valider/copier/journaliser"

---

## 📋 Checklist de mise en place

```
□ Dossier .codex/ copié à la racine du repo CONTRATPRO
□ instructions.md vérifié (contexte métier CONTRATPRO)
□ design-system.md vérifié (palette bleu + badges statut)
□ stack.md vérifié (variables d'env à compléter)
□ Custom Instructions configurées dans VS Code
□ Première feature testée avec le workflow des 4 phases
□ Design review systématique après chaque génération UI
□ Snapshots créés pour les pages principales (dashboard, clients, contrats, relances, paiements)
□ Audit CONTRATPRO lancé : npm run test:quality && npm run security:audit
```

---

## 🆘 En cas de problème

| Problème | Solution |
|----------|----------|
| Codex ignore les règles | Rappelle-lui : "Lis .codex/instructions.md et .codex/design-system.md avant de coder" |
| Codex crée du code moche | Donne une référence URL + exige le respect de design-system.md |
| Codex utilise `any` | Rappelle la règle #1 : "PAS DE any. JAMAIS." |
| Codex oublie `organization_id` | Rappelle : "Multi-tenant OBLIGATOIRE. Toutes les requêtes Supabase filtrent par organization_id." |
| Codex oublie RLS | Rappelle : "RLS sur TOUTES les tables. Vérifier verify_rls.sql." |
| Codex oublie billing lock | Rappelle : "CONTRATPRO_REQUIRE_BILLING=true bloque l'accès si abonnement inactif." |
| Codex fait des fichiers trop longs | Demande le découpage en fonctions < 40 lignes |
| Codex oublie les tests | Demande explicitement : "Propose le test unitaire + test:quality si impact garde-fous" |
| Codex modifie package.json sans GO | Refuse immédiatement et rappelle la permission |

---

## 🎯 RÉFÉRENCES PROJET

- **Repo** : https://github.com/LEADFORM-arch/CONTRATPRO
- **Vercel** : https://vercel.com/contratpro
- **Stack** : Next.js 15 + Supabase + Tailwind + shadcn/ui + Stripe + GoCardless + Resend
- **Commandes** : `npm run dev:clean`, `npm run ci:verify`, `npm run test:quality`

---

**Associé, avec ce dossier, Codex devient ton vrai associé technique sur CONTRATPRO.** 🚀
