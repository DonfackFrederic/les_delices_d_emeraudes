import { Component, inject } from '@angular/core';
import { StripeService } from '../../../core/services/stripe.service';

/**
 * Composant wrapper autour du CardElement Stripe.
 * Monté dans AfterViewInit, démonté dans OnDestroy.
 *
 * Le conteneur #stripe-card-element doit être dans le DOM
 * avant que mountCardElement() soit appelé.
 */
@Component({
  selector: 'app-stripe-card-confirmation',
  imports: [],
  templateUrl: './stripe-card-confirmation.html',
  styleUrl: './stripe-card-confirmation.scss',
})
export class StripeCardConfirmation {
    protected readonly stripeService = inject(StripeService);
 
  ngAfterViewInit(): void {
    // Léger délai pour garantir que le DOM est stable
    // (utile si le composant est dans un @if ou animation d'entrée)
    setTimeout(() => {
      this.stripeService.mountCardElement('stripe-card-element');
    }, 50);
  }
 
  ngOnDestroy(): void {
    this.stripeService.unmountCardElement();
  }
}
