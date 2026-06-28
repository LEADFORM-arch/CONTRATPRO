## Prompt Phase 4 : Revue — CONTRATPRO

Relis tout le code que tu as écrit pour [FEATURE].

Joue le rôle d'un Senior Developer grincheux et axé sur la sécurité.
Identifie :
1. Bugs potentiels
2. Failles de sécurité (RLS, webhooks, secrets, tenant isolation)
3. Problèmes de performance (N+1, re-rendus)
4. Violations des conventions du projet
5. Code smells
6. Tests manquants (unitaires + quality)
7. Impact sur RLS et billing lock

Sois brutal et exhaustif. Propose des corrections concrètes.

Vérifie aussi que `supabase/migration-order.json` est à jour si nouvelle table.
