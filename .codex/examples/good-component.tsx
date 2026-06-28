// components/features/clients/client-card.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Pencil, FileText } from 'lucide-react';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: Client;
  onEdit: (clientId: string) => void;
  onViewContracts: (clientId: string) => void;
  className?: string;
}

export function ClientCard({ client, onEdit, onViewContracts, className }: ClientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = () => onEdit(client.id);
  const handleViewContracts = () => onViewContracts(client.id);

  return (
    <Card className={cn('shadow-sm border border-neutral-200', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{client.raisonSociale}</CardTitle>
            <CardDescription className="text-sm text-neutral-500">
              {client.siret && `SIRET : ${client.siret}`}
            </CardDescription>
          </div>
          <Badge 
            className={client.isActive 
              ? 'bg-green-100 text-green-700 hover:bg-green-100' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
            }
          >
            {client.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Mail className="h-4 w-4 text-neutral-400" />
          {client.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Phone className="h-4 w-4 text-neutral-400" />
          {client.telephone}
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <MapPin className="h-4 w-4 text-neutral-400" />
          {client.adresse}, {client.codePostal} {client.ville}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewContracts}>
            <FileText className="h-4 w-4 mr-1" />
            Contrats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
