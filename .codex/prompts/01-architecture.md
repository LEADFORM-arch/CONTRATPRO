## Prompt Phase 1 : Architecture — CONTRATPRO

Je veux implémenter : [DÉCRIRE LA FEATURE] pour CONTRATPRO.

CONTEXTE :
- Projet : CONTRATPRO — SaaS gestion contrats CVC pour chauffagistes
- Stack : Next.js 15 + Supabase + Tailwind + shadcn/ui + Stripe + GoCardless + Resend
- Cible : Chauffagistes CVC (France)
- Repo : https://github.com/LEADFORM-arch/CONTRATPRO

CONTRAINTES :
- Respecter les règles de `.codex/instructions.md`
- Server Components par défaut
- Validation Zod obligatoire
- RLS Supabase activé sur TOUTES les tables
- Multi-tenant (organization_id obligatoire)
- Billing lock si `CONTRATPRO_REQUIRE_BILLING=true`
- Webhooks signés (Stripe + GoCardless)
- Tests `test:quality` à jour

MISSION :
1. Analyse le repo actuel (lis les fichiers pertinents)
2. Résume le besoin en 2 phrases
3. Liste les fichiers à créer/modifier avec justification
4. Identifie l'impact sur :
   - RLS (nouvelle table ? nouvelle policy ?)
   - Billing (nouvelle route protégée ?)
   - Webhooks (nouveau endpoint ?)
   - Tests (nouveau test quality ?)
5. Identifie les pièges potentiels
6. Pose les questions de clarification si besoin

⚠️ NE TOUCHE À AUCUN FICHIER. Mode "Ask" uniquement.
