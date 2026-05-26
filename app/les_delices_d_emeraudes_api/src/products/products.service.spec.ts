import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { SupabaseService } from 'src/supabase/supabase.service';

const sampleProducts = [
  {
    id: 1,
    name: 'Croissant',
    slug: 'croissant',
    description: 'Delicious butter croissant',
    featured: true,
    category_slug: 'pastries',
  },
  {
    id: 2,
    name: 'Éclair',
    slug: 'eclair',
    description: 'Chocolate éclair',
    featured: false,
    category_slug: 'pastries',
  },
];

const sampleProduct = {
  id: 1,
  name: 'Croissant',
  slug: 'croissant',
  description: 'Delicious butter croissant',
  featured: true,
  category_slug: 'pastries',
  options: [
    { id: 1, name: 'Size', values: ['Small', 'Large'] },
  ],
};

describe('ProductsService', () => {
  let service: ProductsService;
  let mockSupabaseService: any;

  beforeEach(async () => {
    mockSupabaseService = {
      getClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns paginated products with pagination metadata', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: sampleProducts, error: null, count: 100 }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(result.data).toEqual(sampleProducts);
      expect(result.meta).toEqual({ total: 100, page: 1, limit: 12 });
    });

    it('filters by featured=true', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: [sampleProducts[0]], error: null, count: 1 }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await service.findAll({ featured: true });

      expect(mockQuery.eq).toHaveBeenCalledWith('featured', true);
      expect(result.data).toEqual([sampleProducts[0]]);
    });

    it('throws InternalServerErrorException on Supabase error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: null, error: { message: 'Query failed' }, count: null }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findBySlug', () => {
    it('returns product with eager-loaded relations', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: sampleProduct, error: null }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await service.findBySlug('croissant', { include: 'options' });

      expect(mockQuery.select).toHaveBeenCalledWith('*,options(*)');
      expect(result).toEqual(sampleProduct);
    });

    it('returns product without include when no relations requested', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: sampleProducts[0], error: null }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await service.findBySlug('croissant');

      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(sampleProducts[0]);
    });

    it('throws NotFoundException when product not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: null, error: null }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on Supabase error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: null, error: { message: 'Query error' } }),
      };
      mockSupabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue(mockQuery),
      });

      await expect(service.findBySlug('croissant')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
