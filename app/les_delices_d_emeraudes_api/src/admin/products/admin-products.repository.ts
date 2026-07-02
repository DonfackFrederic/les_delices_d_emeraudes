import { Injectable } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { Product } from '@shared/types';
import { toCamel, toSnake } from 'src/utils/data-transformer.util';

import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductOptionDto,
  UpdateProductOptionDto,
  CreateOptionValueDto,
  UpdateOptionValueDto,
} from '../../dto/product.dto';

const ADMIN_PRODUCT_SELECT = `
  id, name, slug, description, base_price, image_url, images,
  is_active, is_featured, sort_order, category_id, created_at, updated_at,
  category:categories!category_id (id, name, slug),
  options:product_options (
    id, name, type, is_required, sort_order, created_at,
    values:product_option_values (id, value, price_modifier, sort_order)
  )
` as const;

@Injectable()
export class AdminProductsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ── Produits ──────────────────────────────────────────────────────────────

  async findAll(): Promise<{ data: Product[]; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select(ADMIN_PRODUCT_SELECT)
      .order('sort_order', { ascending: true });

    if (error) return { data: [], error };
    return { data: toCamel(data ?? []) as Product[], error: null };
  }

  async findById(id: string): Promise<{
    data: Product | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select(ADMIN_PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };
    return { data: toCamel(data) as Product, error: null };
  }

  async create(dto: CreateProductDto): Promise<{
    data: Product | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .insert(toSnake(dto))
      .select(ADMIN_PRODUCT_SELECT)
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data) as Product, error: null };
  }

  async update(id: string, dto: UpdateProductDto): Promise<{
    data: Product | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .update(toSnake(dto))
      .eq('id', id)
      .select(ADMIN_PRODUCT_SELECT)
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data) as Product, error: null };
  }

  /**
   * Soft delete — met is_active à false plutôt que de supprimer la ligne.
   * Préserve l'historique des commandes liées (cf. ADR-003).
   */
  async softDelete(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabaseService
      .getClient()
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    return { error };
  }

  // ── Options ───────────────────────────────────────────────────────────────

  async createOption(productId: string, dto: CreateProductOptionDto): Promise<{
    data: any | null;
    error: PostgrestError | null;
  }> {
    const { values, ...optionData } = dto;

    const { data: option, error: optionError } = await this.supabaseService
      .getClient()
      .from('product_options')
      .insert(toSnake({ ...optionData, productId }))
      .select()
      .single();

    if (optionError) return { data: null, error: optionError };

    // Insérer les valeurs initiales si fournies (type 'select')
    if (values && values.length > 0) {
      const { error: valuesError } = await this.supabaseService
        .getClient()
        .from('product_option_values')
        .insert(
          values.map((v) => toSnake({ ...v, optionId: option.id })),
        );

      if (valuesError) return { data: null, error: valuesError };
    }

    return { data: toCamel(option), error: null };
  }

  async updateOption(id: string, dto: UpdateProductOptionDto): Promise<{
    data: any | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_options')
      .update(toSnake(dto))
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data), error: null };
  }

  async deleteOption(id: string): Promise<{ error: PostgrestError | null }> {
    // ON DELETE CASCADE en DB supprime automatiquement les valeurs liées
    const { error } = await this.supabaseService
      .getClient()
      .from('product_options')
      .delete()
      .eq('id', id);

    return { error };
  }

  // ── Valeurs d'option ──────────────────────────────────────────────────────

  async createOptionValue(optionId: string, dto: CreateOptionValueDto): Promise<{
    data: any | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_option_values')
      .insert(toSnake({ ...dto, optionId }))
      .select()
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data), error: null };
  }

  async updateOptionValue(id: string, dto: UpdateOptionValueDto): Promise<{
    data: any | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_option_values')
      .update(toSnake(dto))
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data), error: null };
  }

  async deleteOptionValue(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabaseService
      .getClient()
      .from('product_option_values')
      .delete()
      .eq('id', id);

    return { error };
  }
}