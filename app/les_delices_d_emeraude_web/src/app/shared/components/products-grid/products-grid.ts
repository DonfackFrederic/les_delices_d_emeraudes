import { Component, input, output } from '@angular/core';
import { ProductCard } from "../product-card/product-card";
import { Product } from '@shared/types';

@Component({
  selector: 'app-products-grid',
  imports: [ProductCard],
  templateUrl: './products-grid.html',
  styleUrl: './products-grid.scss',
})
export class ProductGrid {
  products = input<Product[]>([]);
  loading = input(false);
  error = input<string | null>(null);
  skeletonCount = input(12);
  addToCart = output<Product>();

  readonly skeletons = Array.from({ length: 12 });

  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
  }

  trackById(_: number, p: Product): string {
    return p.id;
  }

}
 

