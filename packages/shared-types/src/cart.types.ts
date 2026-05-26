import type { Product } from './product.types';

// ─── Option sélectionnée par l'utilisateur ────────────────────────────────────

export interface SelectedOption {
  optionId: string;
  optionName: string;
  valueId?: string;        // renseigné pour type 'select'
  value: string;           // texte libre ou 'true'/'false' pour boolean
  priceModifier: number;
}

// ─── Item dans le panier ──────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: SelectedOption[];
  comment: string;
  lineTotal: number;       // (basePrice + Σ priceModifier) × quantity
}

// ─── État du panier ───────────────────────────────────────────────────────────

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}