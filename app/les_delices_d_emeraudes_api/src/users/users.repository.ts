import { Injectable } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { Order, User } from '@shared/types';
import { toCamel, toSnake } from 'src/utils/data-transformer.util';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';

// Sélection complète d'une commande avec items + options (snapshot)
const ORDER_WITH_ITEMS_SELECT = `
  id,
  user_id,
  status,
  total_price,
  customer_name,
  customer_email,
  customer_phone,
  delivery_notes,
  stripe_payment_intent_id,
  paid_at,
  created_at,
  updated_at,
  items:order_items (
    id,
    product_id,
    product_name,
    product_image_url,
    base_price,
    quantity,
    line_total,
    comment,
    options:order_item_options (
      id,
      option_name,
      value,
      price_modifier
    )
  )
` as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Toutes les commandes d'un utilisateur, triées par date décroissante.
   * Inclut les items et leurs options (snapshot complet).
   */
  async findOrdersByUserId(userId: string): Promise<{
    data: Order[];
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('orders')
      .select(ORDER_WITH_ITEMS_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };

    return { data: toCamel(data ?? []) as Order[], error: null };
  }

  /**
   * Une commande par id, uniquement si elle appartient à l'utilisateur.
   * Retourne null si la commande n'existe pas OU si user_id ne correspond pas.
   * Le service traduit null en 403 (ne pas révéler si la commande existe).
   */
  async findOrderByIdForUser(
    orderId: string,
    userId: string,
  ): Promise<{ data: Order | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('orders')
      .select(ORDER_WITH_ITEMS_SELECT)
      .eq('id', orderId)
      .eq('user_id', userId) // filtre ownership côté DB — pas de 404/403 split
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    return { data: toCamel(data) as Order, error: null };
  }

  /**
   * Met à jour le profil de l'utilisateur dans public.users.
   * Seuls full_name et phone sont modifiables (pas email, pas role).
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<{ data: User | null; error: PostgrestError | null }> {
    const payload = toSnake({
      fullName: dto.fullName,
      phone: dto.phone ?? null,
    });

    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select('id, email, full_name, phone, role, created_at, updated_at')
      .single();

    if (error) return { data: null, error };

    return { data: toCamel(data) as User, error: null };
  }
}