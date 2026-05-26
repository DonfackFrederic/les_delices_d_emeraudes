import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import type { Category } from '@shared/types';

const sampleCategory: Category = {
  id: 2,
  name: 'Chocolats',
  slug: 'chocolats',
  is_active: true,
  sort_order: 2,
} as unknown as Category;

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockCategoriesService: { findAll: any; findBySlug: any };

  beforeEach(async () => {
    mockCategoriesService = {
      findAll: jest.fn(async () => [sampleCategory]),
      findBySlug: jest.fn(async () => sampleCategory),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to CategoriesService.findAll and returns categories', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([sampleCategory]);
      expect(mockCategoriesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('delegates to CategoriesService.findBySlug with the provided slug', async () => {
      const result = await controller.findBySlug('chocolats');

      expect(result).toEqual(sampleCategory);
      expect(mockCategoriesService.findBySlug).toHaveBeenCalledWith('chocolats');
    });
  });
});
