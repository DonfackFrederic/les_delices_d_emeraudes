import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginatedProducts, Product } from '@shared/types';
import { ProductService } from '../../../core/services/product-service';
import { CartService } from '../../../core/services/cart-service';
import { ProductGrid } from "../../../shared/components/products-grid/products-grid";

@Component({
  selector: 'app-featured-products',
  imports: [ProductGrid, RouterLink],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
 
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  readonly pageSize = signal(6); 
  ngOnInit(): void {
    this.productService.getProducts({featured: true, limit: 6 }).subscribe({
      next: (res : PaginatedProducts) => {
        this.products.set(res.data);
        // TODO voir comment gere le loading
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les produits.');
        this.loading.set(false);
      },
    });
  }
 
  onAddToCart(product: Product): void {
    this.cartService.quickAdd(product);
  }
 
  trackByProduct(_: number, product: Product): string {
    return product.id;
  }
}
