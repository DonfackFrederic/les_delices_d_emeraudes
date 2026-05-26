import type { SelectedOption } from './cart.types';

// ─── Statuts ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

// ─── Snapshot option dans une commande ───────────────────────────────────────

export interface OrderItemOption {
  id: string;
  orderItemId: string;
  optionName: string;
  value: string;
  priceModifier: number;
}

// ─── Snapshot item dans une commande ─────────────────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;    // nullable si produit supprimé
  productName: string;         // snapshot
  productImageUrl: string | null;
  basePrice: number;           // snapshot
  quantity: number;
  lineTotal: number;
  comment: string | null;
  options: OrderItemOption[];
}

// ─── Commande complète ────────────────────────────────────────────────────────

export interface Order {
  id: string;
  userId: string | null;       // null = commande invité
  status: OrderStatus;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryNotes: string | null;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// ─── DTO : item envoyé au backend lors de la création ─────────────────────────

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  selectedOptions: SelectedOption[];
  comment?: string;
}

// ─── DTO : corps de POST /orders/create-intent ────────────────────────────────

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryNotes?: string;
  items: CreateOrderItemDto[];
  expectedTotal: number;       // vérifié côté serveur
}

// ─── Réponse de POST /orders/create-intent ────────────────────────────────────

export interface CreateOrderIntentResponse {
  orderId: string;
  clientSecret: string;        // Stripe PaymentIntent client_secret
}

// ─── DTO admin : changement de statut ────────────────────────────────────────

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// ─── Filtre admin : GET /admin/orders ────────────────────────────────────────

export interface AdminOrdersQueryParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

// ─── Réponse paginée ─────────────────────────────────────────────────────────

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}