import { Injectable } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';
import type { Category } from '@shared/types';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<{ data: Category[] | null; error: PostgrestError | null }> {
    let qb :any = this.supabaseService.getClient()
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return qb
  }

  async findBySlug(slug: string): Promise<{ data: Category | null; error: PostgrestError | null }> {
    let qb : any = this.supabaseService.getClient()
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    return qb
  }
}
