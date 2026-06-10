import { Component, input, output} from '@angular/core';
import { Product } from '@shared/types';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
  showBadge = input(true);
  addToCart = output<Product>();
  loading = input(false);
 
  get formattedPrice(): string | null {
    const value = Number(this.product().basePrice);
    if (!Number.isFinite(value)) {
      return null;
    }

    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
 
  onAddToCart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

}
