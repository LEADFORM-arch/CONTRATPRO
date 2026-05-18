# Source de verite base de donnees

ContratPro utilise Supabase PostgreSQL comme base de production et les fichiers
`supabase/*.sql` comme source de verite du schema, des politiques RLS et des
objets metier sensibles.

## Decision actuelle

- Les migrations metier doivent etre appliquees depuis les scripts SQL Supabase.
- `supabase/verify_rls.sql` doit etre execute apres chaque changement de schema.
- Prisma reste present uniquement comme dependance historique tant que la dette
  n'est pas supprimee ou migree proprement.
- `npm run db:push` est volontairement bloque pour eviter une divergence entre
  `prisma/schema.prisma` et les scripts SQL Supabase.

## Pourquoi

Les contrats, mandats SEPA, paiements et relances dependent des politiques RLS
et des journaux d'audit. Une commande Prisma qui pousse un schema sans rejouer
les politiques Supabase peut produire une base fonctionnelle en apparence mais
moins sure en production.

## Regle de travail

Tout changement de base doit inclure :

1. le script SQL dans `supabase/` ;
2. la verification RLS associee ;
3. une note de runbook si l'operation touche les paiements, les contrats ou les
   donnees clients.
