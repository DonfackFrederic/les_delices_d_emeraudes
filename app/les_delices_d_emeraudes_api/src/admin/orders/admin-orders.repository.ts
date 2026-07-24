import { Injectable } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase/supabase.service';
import { Order, OrderStatus } from '@shared/types';
import { toCamel } from 'src/utils/data-transformer.util';

const ADMIN_ORDER_SELECT = `
  id, user_id, status, total_price,
  customer_name, customer_email, customer_phone,
  delivery_notes, stripe_payment_intent_id,
  paid_at, created_at, updated_at,
  items:order_items (
    id, product_id, product_name, product_image_url,
    base_price, quantity, line_total, comment,
    options:order_item_options (
      id, option_name, value, price_modifier
    )
  )
` as const;

export interface AdminOrdersFilter {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminOrdersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters: AdminOrdersFilter): Promise<{
    data: Order[];
    total: number;
    error: PostgrestError | null;
  }> {
    const { status, page = 1, limit = 20 } = filters;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabaseService
      .getClient()
      .from('orders')
      .select(ADMIN_ORDER_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) return { data: [], total: 0, error };
    return {
      data: toCamel(data ?? []) as Order[],
      total: count ?? 0,
      error: null,
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<{
    data: Order | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(ADMIN_ORDER_SELECT)
      .single();

    if (error) return { data: null, error };
    return { data: toCamel(data) as Order, error: null };
  }
}