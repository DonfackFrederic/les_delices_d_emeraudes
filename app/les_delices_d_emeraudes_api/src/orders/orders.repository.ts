import { Injectable } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { Order } from '@shared/types';
import { PricingProduct, CalculatedOrder } from '../types/orders.types';
import { PRODUCT_PRICING_SELECT } from 'src/utils/order-pricing-select.req';
import { toCamel, toSnake } from 'src/utils/data-transformer.util';

@Injectable()
export class OrdersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Recharge un produit (+ options/valeurs) depuis la DB pour la
   * revalidation du prix. Retourne `null` si le produit n'existe pas
   * ou n'est plus actif (= commande refusée).
   */
  async findProductForPricing(
    productId: string,
  ): Promise<{ data: PricingProduct | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select(PRODUCT_PRICING_SELECT)
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    return { data: toCamel(data) as PricingProduct, error: null };
  }

  /**
   * Persiste la commande + ses items + leurs options en une seule
   * transaction atomique via la fonction RPC `create_order_with_items`.
   *
   * Retourne la commande créée (id, status, etc.) — sans les items,
   * le service les recompose lui-même puisqu'il les a déjà en mémoire.
   */
  async createOrderWithItems(
    calculated: CalculatedOrder,
    customer: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      deliveryNotes?: string;
    },
    userId: string | null,
  ): Promise<{ data: Order | null; error: PostgrestError | Error | null }> {
    const orderPayload = toSnake({
      userId,
      status: 'pending',
      totalPrice: calculated.totalPrice,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone ?? null,
      deliveryNotes: customer.deliveryNotes ?? null,
    });

    const itemsPayload = calculated.items.map((item) =>
      toSnake({
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        basePrice: item.basePrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        comment: item.comment,
        options: item.options.map((opt) => toSnake(opt)),
      }),
    );

    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('create_order_with_items', {
        p_order: orderPayload,
        p_items: itemsPayload,
      });

    if (error) return { data: null, error };

    return { data: toCamel(data) as Order, error: null };
  }

  /**
   * Attache le stripe_payment_intent_id à une commande déjà créée.
   */
  async setPaymentIntentId(
    orderId: string,
    paymentIntentId: string,
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.supabaseService
      .getClient()
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntentId })
      .eq('id', orderId);

    return { error };
  }

  /**
   * Appelée depuis le webhook Stripe (payment_intent.succeeded).
   * Marque la commande comme payée et retourne la commande complète
   * (items + options) pour permettre l'envoi de l'email de confirmation.
   * Idempotent : un retry webhook ne duplique rien.
   */
  async markAsPaid(
    stripePaymentIntentId: string,
  ): Promise<{ data: Order | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('mark_order_as_paid', {
        p_stripe_payment_intent_id: stripePaymentIntentId,
      });

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    return { data: toCamel(data) as Order, error: null };
  }

  /**
   * Lecture simple d'une commande par id (utilisée par OrderConfirmationPage
   * côté frontend, et potentiellement /users/me/orders/:id au Sprint 2 suite).
   */
  async findById(
    orderId: string,
  ): Promise<{ data: Order | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('orders')
      .select(
        `
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
      `,
      )
      .eq('id', orderId)
      .maybeSingle();

    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };

    return { data: toCamel(data) as Order, error: null };
  }
}