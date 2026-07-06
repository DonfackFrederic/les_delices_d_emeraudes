import { Component, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { httpResource } from '@angular/common/http';
import { Product } from '@shared/types';
import { AdminProductsService } from '../../../core/services/admin-products.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type SortKey = 'name' | 'basePrice' | 'sortOrder';

@Component({
  selector: 'app-admin-products-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-products-page.html',
  styleUrl: './admin-products-page.scss',
})
export class AdminProductsPage {
  private readonly productsService = inject(AdminProductsService);
 
  protected readonly productsResource = httpResource<Product[]>(
    () => `${environment.apiUrl}/admin/products`,
  );
 
  protected readonly searchTerm = signal('');
  protected readonly sortKey = signal<SortKey>('sortOrder');
  protected readonly actionError = signal<string | null>(null);
 
  /**
   * Recherche + tri entièrement côté client (signals computed) — le
   * catalogue admin reste de taille modeste (dizaines de produits),
   * pas besoin de pagination serveur ni de requêtes réseau répétées.
   */
  protected readonly filteredProducts = computed(() => {
    const products = this.productsResource.value() ?? [];
    const term = this.searchTerm().trim().toLowerCase();
    const key = this.sortKey();
 
    const filtered = term
      ? products.filter((p) => p.name.toLowerCase().includes(term))
      : products;
 
    return [...filtered].sort((a, b) => {
      if (key === 'name') return a.name.localeCompare(b.name);
      if (key === 'basePrice') return a.basePrice - b.basePrice;
      return a.sortOrder - b.sortOrder;
    });
  });
 
  protected async confirmDeactivate(product: Product): Promise<void> {
    const confirmed = window.confirm(
      `Désactiver "${product.name}" ? Il n'apparaîtra plus dans le catalogue public.`,
    );
    if (!confirmed) return;
 
    this.actionError.set(null);
 
    try {
      await this.productsService.delete(product.id);
      this.productsResource.reload();
    } catch {
      this.actionError.set('Impossible de désactiver ce produit.');
      setTimeout(() => this.actionError.set(null), 4000);
    }
  }
}
