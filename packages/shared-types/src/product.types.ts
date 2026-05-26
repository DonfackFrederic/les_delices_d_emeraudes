import type { Category } from './category.types.ts';

// ─── Option value ────────────────────────────────────────────────────────────

export interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;
  priceModifier: number;
  sortOrder: number;
}

export interface CreateOptionValueDto {
  value: string;
  priceModifier?: number;
  sortOrder?: number;
}

export type UpdateOptionValueDto = Partial<CreateOptionValueDto>;

// ─── Option ──────────────────────────────────────────────────────────────────

export type ProductOptionType = 'select' | 'text' | 'boolean';

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  type: ProductOptionType;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  values: ProductOptionValue[]; // chargé en eager sur GET /products/:slug
}

export interface CreateProductOptionDto {
  name: string;
  type: ProductOptionType;
  isRequired?: boolean;
  sortOrder?: number;
  values?: CreateOptionValueDto[];
}

export type UpdateProductOptionDto = Partial<Omit<CreateProductOptionDto, 'values'>>;

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  options: ProductOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  imageUrl?: string | null;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

// ─── Query params GET /products ───────────────────────────────────────────────

export interface ProductsQueryParams {
  category?: string;   // slug de la catégorie
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Réponse paginée ─────────────────────────────────────────────────────────

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}