import { Component, input } from '@angular/core';
import { CartItem } from '@shared/types';

@Component({
  selector: 'app-order-summary',
  imports: [],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummary {
  readonly items = input.required<CartItem[]>();
  readonly total = input.required<number>();

  formattedPrice(value : number): string{
    return value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
  }
}