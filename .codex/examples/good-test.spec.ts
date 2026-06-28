// tests/unit/services/client.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientService } from '@/services/client.service';
import { ValidationError, NotFoundError } from '@/types/errors';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('ClientService', () => {
  let mockSupabase: SupabaseClient;
  let service: ClientService;
  const ORG_ID = 'org_test_123';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as unknown as SupabaseClient;

    service = new ClientService(mockSupabase, ORG_ID);
  });

  describe('create', () => {
    it('should create a client with valid input and organization_id', async () => {
      const input = {
        raisonSociale: 'SARL Martin Chauffage',
        email: 'contact@martin.fr',
        telephone: '0123456789',
      };

      const mockClient = { 
        id: '1', 
        ...input, 
        organization_id: ORG_ID,
        created_at: new Date().toISOString() 
      };
      mockSupabase.single.mockResolvedValue({ data: mockClient, error: null });

      const result = await service.create(input);

      expect(result).toEqual(mockClient);
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      // Vérifier que organization_id est injecté
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({ organization_id: ORG_ID })
      );
    });

    it('should throw ValidationError for invalid input', async () => {
      const input = { raisonSociale: '', email: 'invalid' };

      await expect(service.create(input as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should include organization_id in query', async () => {
      const mockClient = { id: '1', raisonSociale: 'Test', organization_id: ORG_ID };
      mockSupabase.single.mockResolvedValue({ data: mockClient, error: null });

      await service.findById('1');

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', ORG_ID);
    });

    it('should throw NotFoundError when client not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.findById('999')).rejects.toThrow(NotFoundError);
    });
  });
});
