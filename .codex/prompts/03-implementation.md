## Prompt Phase 3 : Implémentation — CONTRATPRO

La structure est validée. Implémente la logique fonction par fonction.

Commence par : [FONCTION 1]

RÈGLES :
- Respecte strictement `.codex/instructions.md`
- Gestion d'erreurs typée (AppError, ValidationError, NotFoundError)
- Pas de `any`
- RLS : `organization_id` sur TOUTES les requêtes Supabase
- Billing lock si applicable
- Journalisation métier si applicable (`payment_events`, `document_sends`, `renewal_actions`)
- Tests unitaires après chaque fonction
- Tests `test:quality` si impact sur les garde-fous

Après chaque fonction, attends mon "GO" avant de passer à la suivante.
