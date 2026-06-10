import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { Product, ProductsQueryParams } from '@shared/types';
import { PRODUCT_DETAIL_SELECT, PRODUCT_LIST_SELECT } from 'src/utils/product-select.req.util';

@Injectable()
export class ProductsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findBySlug(
    slug: string,
  ): Promise<{ data: Product | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select(PRODUCT_DETAIL_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) return { data: null, error };

    // Normaliser le tri des options et valeurs (sort_order ASC)
    if (data?.options) {
      data.options.sort((a: any, b: any) => a.sort_order - b.sort_order);
      data.options.forEach((opt: any) => {
        if (opt.values) {
          opt.values.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
      });
    }

    return { data: data as unknown as Product, error: null };
  }

  async findAll(filters: ProductsQueryParams): Promise<{
    data: any[];
    count: number;
    error: PostgrestError | null;
  }> {
    const { page = 1, limit = 12, category, featured, search } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const productListSelect = PRODUCT_LIST_SELECT(category ?? '');

    let query = this.supabaseService
      .getClient()
      .from('products')
      .select(productListSelect, { count: 'exact' })
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .range(from, to);

    if (featured !== undefined) query = query.eq('is_featured', featured);
    if (search) query = query.ilike('name', `%${search}%`);

    if (category) {
      // Filtrer via la relation : on récupère d'abord l'id de la catégorie
      const { data: cat } = await this.supabaseService
        .getClient()
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (cat) query = query.eq('category_id', cat.id);
    }

    const { data, error, count } = await query;
    return { data: data ?? [], count: count ?? 0, error };
  }
}