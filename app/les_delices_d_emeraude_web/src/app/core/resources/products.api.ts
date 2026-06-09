import { Injectable, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type {
  PaginatedProducts,
  Product,
  ProductsQueryParams,
} from '@shared/types';

/**
 * Couche d'accès aux données via httpResource (Angular 19+).
 * Ne gère aucun état — retourne uniquement des HttpResourceRef typés.
 * Les stores consomment ces refs et exposent leurs propres signals.
 */
@Injectable({ providedIn: 'root' })
export class ProductApiResource {
  private readonly base = environment.apiUrl;

  // ── Produits ──────────────────────────────────────────────

  /**
   * Resource paginée et filtrée.
   * @param params Signal<ProductsQueryParams> — re-fetch automatique
   *               à chaque changement de valeur.
   */
  getProductsListResource(params: Signal<ProductsQueryParams>) {
    return httpResource<PaginatedProducts>(
      () => {
        const p    = params();
        const url  = new URL(`${this.base}/products`);

        if (p.category) url.searchParams.set('category', p.category);
        if (p.search)   url.searchParams.set('search',   p.search);
        if (p.page)     url.searchParams.set('page',     String(p.page));
        url.searchParams.set('limit', String(p.limit ?? 12));

        return url.toString();
      },
      { defaultValue: { data: [], total: 0, page: 1, limit: 12 } }
    );
  }

  /**
   * Détail d'un produit par slug.
   * @param slug Signal<string>
   */
  getProductResource(slug: Signal<string>) {
    return httpResource<Product>(
      () => slug() ? `${this.base}/products/${slug()}` : undefined
    );
  }

}