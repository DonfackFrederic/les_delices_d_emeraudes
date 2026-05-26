import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import type { Category } from '@shared/types';

const sampleCategories: Category[] = [
  {
    id: 1,
    name: 'Pâtisserie',
    slug: 'patisserie',
    is_active: true,
    sort_order: 1,
  } as unknown as Category,
];

const sampleCategory: Category = {
  id: 2,
  name: 'Chocolats',
  slug: 'chocolats',
  is_active: true,
  sort_order: 2,
} as unknown as Category;

const createQueryBuilder = (result: any) => {
  const builder: any = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    then: (resolve: any) => resolve(result),
    catch: jest.fn(),
  };
  return builder;
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockSupabaseService: { getClient: any };

  beforeEach(async () => {
    mockSupabaseService = {
      getClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns active categories ordered by sort_order', async () => {
      const queryBuilder = createQueryBuilder({ data: sampleCategories, error: null });
      mockSupabaseService.getClient.mockReturnValue(queryBuilder);

      const result = await service.findAll();

      expect(result).toEqual(sampleCategories);
      expect(queryBuilder.from).toHaveBeenCalledWith('categories');
      expect(queryBuilder.eq).toHaveBeenCalledWith('is_active', true);
      expect(queryBuilder.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    });

    it('throws InternalServerErrorException when Supabase returns an error', async () => {
      const queryBuilder = createQueryBuilder({ data: null, error: { message: 'Supabase unavailable' } });
      mockSupabaseService.getClient.mockReturnValue(queryBuilder);

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findBySlug', () => {
    it('returns a category when it exists and is active', async () => {
      const queryBuilder = createQueryBuilder({ data: sampleCategory, error: null });
      mockSupabaseService.getClient.mockReturnValue(queryBuilder);

      const result = await service.findBySlug('chocolats');

      expect(result).toEqual(sampleCategory);
      expect(queryBuilder.from).toHaveBeenCalledWith('categories');
      expect(queryBuilder.eq).toHaveBeenCalledWith('slug', 'chocolats');
      expect(queryBuilder.maybeSingle).toHaveBeenCalled();
    });

    it('throws NotFoundException when category is missing', async () => {
      const queryBuilder = createQueryBuilder({ data: null, error: null });
      mockSupabaseService.getClient.mockReturnValue(queryBuilder);

      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when category is not active', async () => {
      const inactiveCategory = { ...sampleCategory, is_active: false } as Category;
      const queryBuilder = createQueryBuilder({ data: inactiveCategory, error: null });
      mockSupabaseService.getClient.mockReturnValue(queryBuilder);

      await expect(service.findBySlug('chocolats')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when Supabase returns an error', async () => {
      const queryBuilder = createQueryBuilder({ data: null, error: { message: 'Query failed' } });
      mockSupabaseService.getClient.mockReturnValue(queryBuilder);

      await expect(service.findBySlug('chocolats')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
