# 🔒 Security Guidelines — CONTRATPRO

## Authentification
- [ ] Supabase Auth avec email/password + OAuth (Google, etc.)
- [ ] Middleware Next.js pour protéger les routes dashboard
- [ ] RLS activé sur TOUTES les tables (vérifié par `verify_rls.sql`)

## Autorisation (RLS) — CRITIQUE

```sql
-- Exemple de policy RLS multi-tenant CONTRATPRO
CREATE POLICY "Users can only see their organization's data"
ON clients
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all data"
ON clients
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Règles RLS :**
- TOUTES les tables DOIVENT avoir des policies RLS
- `rls.sql` DOIT être exécuté EN DERNIER (après toutes les tables métier)
- `verify_rls.sql` DOIT retourner `status = OK` pour TOUTES les lignes
- Jamais de `service_role` côté client

## Validation des inputs
- Zod sur TOUS les inputs (API + formulaires + imports CSV)
- Sanitization des outputs HTML (DOMPurify si nécessaire)
- Validation ligne par ligne pour les imports CSV/XLSX

## Secrets
- JAMAIS dans le code
- JAMAIS dans le repo Git (`.env.local` dans `.gitignore`)
- `.env.local.example` et `.env.production.example` pour la documentation

## Webhooks — SIGNATURES OBLIGATOIRES

### Stripe
```typescript
// Vérifier Stripe-Signature
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

### GoCardless
```typescript
// Vérifier Webhook-Signature
const signature = request.headers.get('Webhook-Signature');
// Vérification via GoCardless SDK
```

**Règles webhooks :**
- Vérifier la signature AVANT tout traitement
- Idempotence via `provider_event_id` (Stripe)
- Journaliser dans `payment_events` (GoCardless)
- Ne jamais traiter un webhook non signé

## Cron — PROTECTION
```typescript
// /api/cron/renewals
const authHeader = request.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');
if (token !== process.env.CONTRATPRO_CRON_SECRET) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Billing Lock
```typescript
// Vérifier abonnement actif avant accès métier
if (process.env.CONTRATPRO_REQUIRE_BILLING === 'true') {
  const subscription = await getBillingSubscription(organizationId);
  if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
    return redirect('/settings/billing');
  }
}
```

## Admin Isolation
```typescript
// Espace /admin réservé
const adminEmails = process.env.CONTRATPRO_ADMIN_EMAILS?.split(',') || [];
if (!adminEmails.includes(user.email)) {
  return redirect('/');
}
```

## Headers de sécurité (Vercel)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.gocardless.com;" }
      ]
    }
  ]
}
```

## Dépendances
- Vérifier régulièrement : `npm audit`
- Mettre à jour les dépendances critiques rapidement
- `npm run security:audit` avant chaque déploiement
