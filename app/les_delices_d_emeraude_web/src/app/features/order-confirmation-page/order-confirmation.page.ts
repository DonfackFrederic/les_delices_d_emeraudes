import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart-service';
import { Order } from '@shared/types';
import { environment } from '../../../environments/environment';

type PageState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-order-confirmation.page',
  imports: [RouterLink, DatePipe],
  templateUrl: './order-confirmation.page.html',
  styleUrl: './order-confirmation.page.scss',
})
export class OrderConfirmationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);
 
  protected readonly state = signal<PageState>('loading');
  protected readonly order = signal<Order | null>(null);
 
  private cartCleared = false;
 
  constructor() {
    // Vide le panier une seule fois, uniquement quand la commande est chargée
    // avec succès. On évite de vider si l'utilisateur arrive ici par erreur.
    effect(() => {
      if (this.state() === 'success' && !this.cartCleared) {
        this.cartCleared = true;
        this.cartService.clearCart();
      }
    });
  }
 
  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.state.set('error');
      return;
    }
    this.loadOrder(orderId);
  }
 
  private loadOrder(orderId: string): void {
    this.http
      .get<Order>(`${environment.apiUrl}/orders/${orderId}`)
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.state.set('success');
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  formattedPrice(value : number): string {
    return value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
  }
}
