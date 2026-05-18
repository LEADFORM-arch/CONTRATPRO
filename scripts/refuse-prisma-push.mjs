console.error("ContratPro database schema is managed by Supabase SQL scripts.");
console.error("Do not run prisma db push: it can diverge from supabase/*.sql and RLS policies.");
console.error("Use Supabase SQL Editor with supabase/rls.sql, billing.sql and verify_rls.sql instead.");
process.exit(1);
