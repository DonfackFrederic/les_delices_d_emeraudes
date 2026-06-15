import { Component, inject } from '@angular/core';
import { ProductFilters } from "./product-filters/product-filters";
import { ProductsStore } from '../../core/store/products.store';
import { ProductGrid } from "../../shared/components/products-grid/products-grid";
import { ProductPagination } from "./products-pagination/products-pagination";
import { CartService } from '../../core/services/cart-service';
import { Product } from '@shared/types';

@Component({
  selector: 'app-productpage',
  imports: [ProductFilters, ProductGrid, ProductPagination],
  providers: [ProductsStore],
  templateUrl: './productspage.html',
  styleUrl: './productpage.scss',
})
export class Productspage{
    protected readonly store = inject(ProductsStore);
    private readonly cart = inject(CartService);
 
  ngOnInit(): void {
    this.store.init();
  }

  onAddToCart(product: Product): void {
    this.cart.quickAdd(product);
  }

}

