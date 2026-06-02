import { Injectable } from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';
import type { ProductsQueryParams } from '@shared/types';

@Injectable()
export class ProductsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(query: ProductsQueryParams = {}): Promise<{ data: any[] | null; count: number | null; error: PostgrestError | null }> {
    const { category, featured, search, page = 1, limit = 12 } = query;
    const offset = (page - 1) * limit;
    const select = '*,category:categories(*)';

    let qb: any = this.supabaseService
      .getClient()
      .from('products')
      .select(select, { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (category) {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(category);
      qb = isUuid ? qb.eq('category_id', category) : qb.eq('categories.slug', category);
    }

    if (featured !== undefined && featured !== null) {
      const isFeatured = featured === true || String(featured).toLowerCase() === 'true' || String(featured) === '1';
      qb = qb.eq('is_featured', isFeatured);
    }

    if (search) {
      const term = `%${search}%`;
      qb = qb.or(`name.ilike.${term},description.ilike.${term}`);
    }

    return qb
  }

  async findBySlug(slug: string, include?: string): Promise<{ data: any | null; error: PostgrestError | null }> {
    const includeParts = include ? include.split(',').map((part) => part.trim()) : [];
    let select = '*';

    if (includeParts.length > 0) {
      const relations = includeParts.map((relation) => `${relation}(*)`).join(',');
      select = `*,${relations}`;
    }

    return this.supabaseService
      .getClient()
      .from('products')
      .select(select)
      .eq('slug', slug)
      .maybeSingle();
  }
}
