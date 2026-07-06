import { Injectable } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { Category } from '@shared/types';
import { toCamel, toSnake } from 'src/utils/data-transformer.util';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dto/category.dto';

@Injectable()
export class AdminCategoriesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Toutes les catégories, actives ET inactives — contrairement au
   * catalogue public (CategoriesRepository) qui filtre is_active = true.
   * L'admin doit pouvoir voir/réactiver une catégorie désactivée.
   */
  async findAll(): Promise<{ data: Category[]; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
 
    if (error) return { data: [], error };
    return { data: toCamel(data ?? []) as Category[], error: null };
  }
 
  async findById(id: string): Promise<{
    data: Category | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
 
    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };
    return { data: toCamel(data) as Category, error: null };
  }

  async create(dto: CreateCategoryDto): Promise<{
    data: Category | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .insert(toSnake(dto))
      .select()
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data) as Category, error: null };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<{
    data: Category | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .update(toSnake(dto))
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data) as Category, error: null };
  }

  async delete(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabaseService
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id);

    return { error };
  }

  /**
   * Compte les produits actifs liés à cette catégorie.
   * Utilisé avant suppression pour éviter de laisser des produits orphelins.
   */
  async countActiveProducts(categoryId: string): Promise<number> {
    const { count } = await this.supabaseService
      .getClient()
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('is_active', true);

    return count ?? 0;
  }
}