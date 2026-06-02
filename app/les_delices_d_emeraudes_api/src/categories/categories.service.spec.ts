import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
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

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockCategoriesRepository: any;

  beforeEach(async () => {
    mockCategoriesRepository = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
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
      mockCategoriesRepository.findAll.mockResolvedValue({ data: sampleCategories, error: null });

      const result = await service.findAll();

      expect(result).toEqual(sampleCategories);
    });

    it('throws InternalServerErrorException when Supabase returns an error', async () => {
      mockCategoriesRepository.findAll.mockResolvedValue({ data: null, error: { message: 'Supabase unavailable' } });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findBySlug', () => {
    it('returns a category when it exists and is active', async () => {
      mockCategoriesRepository.findBySlug.mockResolvedValue({ data: sampleCategory, error: null });

      const result = await service.findBySlug('chocolats');

      expect(result).toEqual(sampleCategory);
    });

    it('throws NotFoundException when category is missing', async () => {
      mockCategoriesRepository.findBySlug.mockResolvedValue({ data: null, error: null });

      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when category is not active', async () => {
      const inactiveCategory = { ...sampleCategory, is_active: false } as Category;
      mockCategoriesRepository.findBySlug.mockResolvedValue({ data: inactiveCategory, error: null });

      await expect(service.findBySlug('chocolats')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when Supabase returns an error', async () => {
      mockCategoriesRepository.findBySlug.mockResolvedValue({ data: null, error: { message: 'Query failed' } });

      await expect(service.findBySlug('chocolats')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
