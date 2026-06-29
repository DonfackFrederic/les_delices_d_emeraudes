import { Injectable, signal } from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeCardElementChangeEvent,
} from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

export interface StripeConfirmResult {
  success: boolean;
  error?: string;
}

/**
 * Service singleton gérant le cycle de vie du SDK Stripe côté Angular.
 *
 * Responsabilités :
 * - Initialiser Stripe une seule fois (lazy, à la première utilisation)
 * - Monter/démonter le CardElement dans un conteneur DOM donné
 * - Exposer l'état de complétion de la carte via un signal
 * - Confirmer le paiement via confirmCardPayment
 *
 * Ce service ne connaît pas la notion de "commande" — c'est CheckoutStore
 * qui orchestre l'appel à l'API backend + la confirmation Stripe.
 */
@Injectable({ providedIn: 'root' })
export class StripeService {
  /** Signal public : true quand le CardElement est rempli et valide. */
  readonly cardComplete = signal(false);

  /** Signal public : message d'erreur de validation de la carte (ex: "Numéro invalide"). */
  readonly cardError = signal<string | null>(null);

  private stripePromise: Promise<Stripe | null>;
  private cardElement: StripeCardElement | null = null;

  constructor() {
    // Initialisation lazy mais préchargée dès l'injection du service
    // (le script Stripe est chargé en arrière-plan, pas bloquant).
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  /**
   * Monte le CardElement dans le conteneur identifié par `elementId`.
   * Appeler cette méthode depuis ngAfterViewInit du composant hôte.
   * Si un élément est déjà monté, il est démonté proprement avant remontage.
   */
  async mountCardElement(elementId: string): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      console.error('Stripe.js n\'a pas pu être chargé.');
      return;
    }

    // Démontage propre si on remonte (ex: navigation retour/avant)
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement = null;
    }

    const elements = stripe.elements({
      // Locale pour les messages d'erreur Stripe en français
      locale: 'fr',
    });

    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '16px',
          color: '#333',
          '::placeholder': {
            color: '#aaa',
          },
        },
        invalid: {
          color: '#c0392b',
        },
      },
      hidePostalCode: true,
    });

    this.cardElement.mount(`#${elementId}`);

    // Écoute les changements pour mettre à jour les signals
    this.cardElement.on('change', (event: StripeCardElementChangeEvent) => {
      this.cardComplete.set(event.complete);
      this.cardError.set(event.error?.message ?? null);
    });
  }

  /**
   * Confirme le paiement avec le clientSecret reçu du backend.
   * Retourne { success: true } ou { success: false, error: "message" }.
   */
  async confirmPayment(clientSecret: string): Promise<StripeConfirmResult> {
    const stripe = await this.stripePromise;

    if (!stripe || !this.cardElement) {
      return {
        success: false,
        error: 'Le module de paiement n\'est pas initialisé.',
      };
    }

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Démonte proprement le CardElement (à appeler dans ngOnDestroy du composant hôte).
   */
  unmountCardElement(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement = null;
      this.cardComplete.set(false);
      this.cardError.set(null);
    }
  }
}