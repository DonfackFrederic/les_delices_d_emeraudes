import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

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
  let mockProductsRepository: jest.Mocked<ProductsRepository>;

  beforeEach(async () => {
    mockProductsRepository = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
    } as unknown as jest.Mocked<ProductsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns paginated products with pagination metadata', async () => {
      mockProductsRepository.findAll.mockResolvedValue({ data: sampleProducts, error: null, count: 100 });

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(result.data).toEqual(sampleProducts);
      expect(result.total).toEqual(100);
      expect(result.page).toEqual(1);
      expect(result.limit).toEqual(12);
    });

    it('filters by featured=true', async () => {
      mockProductsRepository.findAll.mockResolvedValue({ data: [sampleProducts[0]], error: null, count: 1 });

      const result = await service.findAll({ featured: true });

      expect(result.data).toEqual([sampleProducts[0]]);
    });

    it('throws InternalServerErrorException on Supabase error', async () => {
      mockProductsRepository.findAll.mockResolvedValue({
        data: null,
        error: {
          message: 'Query failed',
          details: null,
          hint: null,
          code: '',
          name: '',
          toJSON: () => ({}),
        } as any,
        count: null,
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findBySlug', () => {
    it('returns product with eager-loaded relations', async () => {
      mockProductsRepository.findBySlug.mockResolvedValue({ data: sampleProduct, error: null });

      const result = await service.findBySlug('croissant', { include: 'options' });

      expect(result).toEqual(sampleProduct);
    });

    it('returns product without include when no relations requested', async () => {
      mockProductsRepository.findBySlug.mockResolvedValue({ data: sampleProducts[0], error: null });

      const result = await service.findBySlug('croissant');

      expect(result).toEqual(sampleProducts[0]);
    });

    it('throws NotFoundException when product not found', async () => {
      mockProductsRepository.findBySlug.mockResolvedValue({ data: null, error: null });

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on Supabase error', async () => {
      mockProductsRepository.findBySlug.mockResolvedValue({
        data: null,
        error: {
          message: 'Query error',
          details: null,
          hint: null,
          code: '',
          name: '',
          toJSON: () => ({}),
        } as any,
      });

      await expect(service.findBySlug('croissant')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
