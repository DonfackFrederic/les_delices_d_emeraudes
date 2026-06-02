import { Component, inject, OnInit, signal } from '@angular/core';
import { PaginatedProducts, Product } from '@shared/types';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductService } from '../../../core/services/product-service';
import { CartService } from '../../../core/services/cart-service';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
 
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
 
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
    // Produits vedettes sans options sélectionnées → naviguer vers le détail
    // Le CartService est appelé depuis ProductDetailPage après sélection des options
    // TODO
    // this.cartService.openDrawer();
  }
 
  trackByProduct(_: number, product: Product): string {
    return product.id;
  }
}
