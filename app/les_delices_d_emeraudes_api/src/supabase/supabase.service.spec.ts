import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'fake-service-role-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined and return a Supabase client', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseService],
    }).compile();

    const service = module.get<SupabaseService>(SupabaseService);

    expect(service).toBeDefined();
    expect(service.getClient()).toBeInstanceOf(SupabaseClient);
  });

  it('throws when SUPABASE_URL is missing', async () => {
    process.env = {
      ...originalEnv,
      SUPABASE_SERVICE_ROLE_KEY: 'fake-service-role-key',
    };

    await expect(
      Test.createTestingModule({ providers: [SupabaseService] }).compile(),
    ).rejects.toThrow('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment variables.');
  });

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://example.supabase.co',
    };

    await expect(
      Test.createTestingModule({ providers: [SupabaseService] }).compile(),
    ).rejects.toThrow('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment variables.');
  });
});
