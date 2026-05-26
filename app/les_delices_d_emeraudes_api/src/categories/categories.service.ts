import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';
import type { Category } from '@shared/types';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private handleSupabaseError(error: PostgrestError | null): void {
    if (error) {
      throw new InternalServerErrorException(`Supabase query failed: ${error.message}`);
    }
  }

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    this.handleSupabaseError(error);
    return data ?? [];
  }

  async findBySlug(slug: string): Promise<Category> {
    const { data, error } = await this.supabaseService.getClient()
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    this.handleSupabaseError(error);

    if (!data || data.is_active !== true) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }
}