import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { CategoriesRepository } from './categories.repository';
import type { Category } from '@shared/types';
import { toCamel } from 'src/utils/data-transformer.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  private handleSupabaseError(error: PostgrestError | null): void {
    if (error) {
      throw new InternalServerErrorException(`Supabase query failed: ${error.message}`);
    }
  }

  async findAll(): Promise<Category[]> {
    let { data, error } = await this.categoriesRepository.findAll();
    data = toCamel(data)

    this.handleSupabaseError(error);
    return data ?? [];
  }

  async findBySlug(slug: string): Promise<Category> {
    let { data, error } = await this.categoriesRepository.findBySlug(slug);
    data = toCamel(data)

    this.handleSupabaseError(error);

    if (!data || data.isActive !== true) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }
}