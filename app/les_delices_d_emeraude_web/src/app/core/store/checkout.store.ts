import {
  computed,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StripeService } from '../services/stripe.service';
import { CreateOrderDto, CreateOrderIntentResponse } from '@shared/types';
import { CartService } from '../services/cart-service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export type CheckoutStep = 'form' | 'processing' | 'done' | 'error';

export interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryNotes: string;
}

/**
 * Store du checkout — toute la logique en signals, aucune logique dans le composant page.
 *
 * Flux principal :
 * 1. L'utilisateur remplit le formulaire (signals form*)
 * 2. submitOrder() → POST /orders/create-intent (validation prix serveur)
 * 3. → stripe.confirmPayment(clientSecret)
 * 4. → navigation vers /order-confirmation/:orderId
 *
 * Le store est fourni au niveau du composant page (not root) pour être
 * détruit avec lui et éviter de conserver un état périmé entre navigations.
 */
@Injectable()
export class CheckoutStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly stripeService = inject(StripeService);

  // ── État du formulaire ────────────────────────────────────────────────────

  readonly customerName = signal('');
  readonly customerEmail = signal('');
  readonly customerPhone = signal('');
  readonly deliveryNotes = signal('');

  // ── État de soumission ────────────────────────────────────────────────────

  readonly step = signal<CheckoutStep>('form');
  readonly stripeError = signal<string | null>(null);

  /** Bloque le bouton dès le premier clic — évite la double soumission. */
  readonly isSubmitting = computed(() => this.step() === 'processing');

  // ── Données du panier (lecture seule depuis CartService) ──────────────────

  readonly items = this.cartService.items;
  readonly total = this.cartService.total;
  readonly isEmpty = computed(() => this.items().length === 0);

  // ── Validation formulaire ─────────────────────────────────────────────────

  readonly isFormValid = computed(() => {
    const name = this.customerName().trim();
    const email = this.customerEmail().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return name.length >= 2 && emailRegex.test(email);
  });

  /** Le bouton "Payer" est actif seulement si formulaire + carte valides. */
  readonly canSubmit = computed(
    () =>
      this.isFormValid() &&
      this.stripeService.cardComplete() &&
      !this.isSubmitting() &&
      !this.isEmpty(),
  );

  // ── Initialisation ────────────────────────────────────────────────────────

  /**
   * Pré-remplit le formulaire avec les données de l'utilisateur connecté.
   * À appeler dans ngOnInit de la page.
   */
  initFromAuth(): void {
    const user = this.authService.currentUser();
    if (user) {
      // user est l'objet Supabase Auth brut (User de @supabase/supabase-js).
      // full_name vit dans user_metadata (renseigné à l'inscription),
      // email et phone sont des champs natifs de l'objet Auth.
      const fullName: string = user.user_metadata?.["full_name"] ?? '';
      this.customerName.set(fullName);
      this.customerEmail.set(user.email ?? '');
      this.customerPhone.set(user.phone ?? '');
    }
  }

  // ── Action principale ─────────────────────────────────────────────────────

  async submitOrder(): Promise<void> {
    if (!this.canSubmit()) return;

    this.step.set('processing');
    this.stripeError.set(null);

    try {
      // 1. Construire le DTO depuis les signals
      const dto = this.buildCreateOrderDto();

      // 2. POST /orders/create-intent → validation prix serveur + création DB
      const { orderId, clientSecret } = await firstValueFrom(
        this.http.post<CreateOrderIntentResponse>(
          `${environment.apiUrl}/orders/create-intent`,
          dto,
        ),
      );

      // 3. Confirmation Stripe côté client
      const result = await this.stripeService.confirmPayment(clientSecret);

      if (!result.success) {
        // Erreur Stripe (carte refusée, 3DS échoué, etc.) — on revient
        // au formulaire pour que l'utilisateur puisse corriger.
        this.stripeError.set(result.error ?? 'Paiement refusé. Veuillez réessayer.');
        this.step.set('form');
        return;
      }

      // 4. Succès — navigation vers la page de confirmation
      // Le panier est vidé depuis OrderConfirmationPage (effect conditionnel)
      // pour éviter de le vider si l'utilisateur fait "retour" depuis la page de confirmation.
      this.step.set('done');
      await this.router.navigate(['/order-confirmation', orderId]);
    } catch (err: unknown) {
      // Erreur réseau ou erreur 400 (prix incohérent, produit indisponible)
      const message = this.extractErrorMessage(err);
      this.stripeError.set(message);
      this.step.set('form');
    }
  }

  // ── Helpers privés ────────────────────────────────────────────────────────

  private buildCreateOrderDto(): CreateOrderDto {
    return {
      customerName: this.customerName().trim(),
      customerEmail: this.customerEmail().trim(),
      customerPhone: this.customerPhone().trim() || undefined,
      deliveryNotes: this.deliveryNotes().trim() || undefined,
      items: this.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        comment: item.comment || undefined,
      })),
      expectedTotal: this.total(),
    };
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const apiError = (err as { error: { message?: string } }).error;
      if (apiError?.message) return apiError.message;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}