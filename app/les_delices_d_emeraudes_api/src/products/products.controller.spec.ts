import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const sampleProducts = [
  {
    id: 1,
    name: 'Croissant',
    slug: 'croissant',
    description: 'Delicious butter croissant',
    featured: true,
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
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: any;

  beforeEach(async () => {
    mockProductsService = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('calls service.findAll with query params', async () => {
      mockProductsService.findAll.mockResolvedValue({
        data: sampleProducts,
        meta: { total: 1, page: 1, limit: 12 },
      });

      await controller.findAll('pastries', 'true', 'croissant', '1', '12');

      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        category: 'pastries',
        featured: 'true',
        search: 'croissant',
        page: 1,
        limit: 12,
      });
    });

    it('uses default pagination values', async () => {
      mockProductsService.findAll.mockResolvedValue({
        data: sampleProducts,
        meta: { total: 1, page: 1, limit: 12 },
      });

      await controller.findAll();

      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        category: undefined,
        featured: undefined,
        search: undefined,
        page: 1,
        limit: 12,
      });
    });
  });

  describe('findBySlug', () => {
    it('calls service.findBySlug with slug and include option', async () => {
      mockProductsService.findBySlug.mockResolvedValue(sampleProduct);

      await controller.findBySlug('croissant', 'options,reviews');

      expect(mockProductsService.findBySlug).toHaveBeenCalledWith('croissant', {
        include: 'options,reviews',
      });
    });

    it('calls service.findBySlug without include when not provided', async () => {
      mockProductsService.findBySlug.mockResolvedValue(sampleProduct);

      await controller.findBySlug('croissant');

      expect(mockProductsService.findBySlug).toHaveBeenCalledWith('croissant', {
        include: undefined,
      });
    });
  });
});
