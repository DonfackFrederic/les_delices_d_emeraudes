/**
 * Représente un produit tel que rechargé depuis la DB pour la revalidation
 * du prix (voir PRODUCT_PRICING_SELECT). Forme déjà passée par toCamel.
 */
export interface PricingProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  isActive: boolean;
  options: {
    id: string;
    name: string;
    values: {
      id: string;
      value: string;
      priceModifier: number;
    }[];
  }[];
}

/**
 * Résultat du calcul de prix serveur pour un item de commande,
 * prêt à être persisté (snapshot complet).
 */
export interface CalculatedOrderItem {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  basePrice: number;
  quantity: number;
  lineTotal: number;
  comment: string | null;
  options: {
    optionName: string;
    value: string;
    priceModifier: number;
  }[];
}

export interface CalculatedOrder {
  items: CalculatedOrderItem[];
  totalPrice: number;
}