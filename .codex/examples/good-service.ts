// services/client.service.ts
import { createServerClient } from '@/lib/supabase/server';
import { clientSchema } from '@/lib/validations/client.schema';
import type { CreateClientInput, Client } from '@/types';
import { AppError, ValidationError, NotFoundError } from '@/types/errors';
import type { SupabaseClient } from '@supabase/supabase-js';

export class ClientService {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  async create(input: CreateClientInput): Promise<Client> {
    const validated = clientSchema.safeParse(input);

    if (!validated.success) {
      throw new ValidationError(validated.error.message);
    }

    const { data, error } = await this.supabase
      .from('clients')
      .insert({
        ...validated.data,
        organization_id: this.organizationId,  // ← Multi-tenant OBLIGATOIRE
      })
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to create client: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    if (!data) {
      throw new AppError('Client creation returned no data', 'DB_ERROR', 500);
    }

    return data as Client;
  }

  async findById(id: string): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('organization_id', this.organizationId)  // ← RLS + tenant
      .single();

    if (error) {
      throw new AppError(
        `Failed to fetch client: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    if (!data) {
      throw new NotFoundError('Client');
    }

    return data as Client;
  }

  async list(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('organization_id', this.organizationId)  // ← Tenant isolation
      .order('raison_sociale', { ascending: true });

    if (error) {
      throw new AppError(
        `Failed to list clients: ${error.message}`,
        'DB_ERROR',
        500
      );
    }

    return (data || []) as Client[];
  }
}
