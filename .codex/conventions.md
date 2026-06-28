# 📋 Conventions de Code — CONTRATPRO

## Naming

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase | `ClientCard`, `ContractForm`, `DashboardLayout` |
| Fonctions | camelCase | `getClientById`, `handleSubmitContract` |
| Server Actions | camelCase + suffixe `Action` | `createClientAction`, `updateContractAction` |
| Constants | UPPER_SNAKE_CASE | `MAX_CONTRACT_DURATION`, `RENEWAL_DAYS_THRESHOLD` |
| Types/Interfaces | PascalCase + suffixe | `ClientProps`, `CreateContractInput`, `ContractStatus` |
| Hooks | camelCase + prefixe `use` | `useClients`, `useContracts`, `useAuth` |
| Fichiers composants | kebab-case | `client-card.tsx`, `contract-form.tsx` |
| Fichiers utilitaires | camelCase | `formatDate.ts`, `formatCurrency.ts` |
| Fichiers schémas | kebab-case + suffixe `.schema.ts` | `client.schema.ts`, `contract.schema.ts` |
| Fichiers services | kebab-case + suffixe `.service.ts` | `client.service.ts` |

## Structure des composants CONTRATPRO

```typescript
// 1. Imports (ordre strict : React > Libs > UI > Features > Types > Utils)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientCard } from '@/components/features/clients/client-card';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

// 2. Types/Props
interface ClientListProps {
  clients: Client[];
  onEdit: (clientId: string) => void;
  className?: string;
}

// 3. Composant
export function ClientList({ clients, onEdit, className }: ClientListProps) {
  // Hooks
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Handlers
  const handleSelect = (clientId: string) => setSelectedClient(clientId);
  const handleEdit = () => selectedClient && onEdit(selectedClient);

  // Render
  return (
    <div className={cn('space-y-4', className)}>
      {/* ... */}
    </div>
  );
}
```

## Ordre des imports (STRICT)

1. React / Next.js (`react`, `next/*`)
2. Bibliothèques externes (`@tanstack/react-query`, `zod`, `lucide-react`)
3. Composants UI shadcn (`@/components/ui/*`)
4. Composants features CONTRATPRO (`@/components/features/*`)
5. Composants layout (`@/components/layout/*`)
6. Hooks (`@/hooks/*`)
7. Types (`@/types/*`)
8. Services (`@/services/*`)
9. Utilitaires (`@/lib/*`)
10. Styles (CSS modules si utilisés)

## Gestion des états CONTRATPRO

| Type d'état | Solution | Exemple |
|-------------|----------|---------|
| Auth (global) | Supabase Auth + Context | `useAuth()` |
| Server state (clients, contrats) | React Query | `useQuery`, `useMutation` |
| Local UI (modales, sélection) | useState / useReducer | `isOpen`, `selectedClient` |
| Formulaires | React Hook Form + Zod | `useForm({ resolver: zodResolver(...) })` |
| Multi-step (onboarding) | useReducer + Context | `onboardingReducer` |

## Patterns métier CONTRATPRO

### Formatage
```typescript
// Formatage monétaire (EUR)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Formatage date (français)
function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

// Formatage téléphone français
function formatPhone(phone: string): string {
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}
```

### Statuts métier (enum)
```typescript
// types/index.ts
export type ContractStatus = 'active' | 'renewal_due' | 'expired' | 'cancelled';
export type PaymentStatus = 'pending' | 'submitted' | 'paid' | 'failed';
export type AttestationStatus = 'valid' | 'due' | 'overdue';
export type InterventionStatus = 'scheduled' | 'completed' | 'cancelled';
```
