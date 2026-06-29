import { Component, inject } from '@angular/core';
import { CheckoutStore } from '../../core/store/checkout.store';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderSummary } from './order-summary/order-summary';
import { StripeCardConfirmation } from './stripe-card-confirmation/stripe-card-confirmation';
import { CommonModule } from '@angular/common';

/**
 * Page Checkout — composant pur "vue".
 * Toute la logique vit dans CheckoutStore (fourni localement).
 */
@Component({
  selector: 'app-checkout.page',
  imports: [FormsModule, RouterLink, OrderSummary, StripeCardConfirmation, CommonModule],
  providers: [CheckoutStore],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
})
export class CheckoutPage {
  protected readonly store = inject(CheckoutStore);
 
  ngOnInit(): void {
    this.store.initFromAuth();
  }
}
