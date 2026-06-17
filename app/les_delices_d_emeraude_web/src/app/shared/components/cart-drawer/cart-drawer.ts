import {
  Component,
  inject,
  ChangeDetectionStrategy,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart-service'; 

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class CartDrawer {
  readonly cart   = inject(CartService);
  private router  = inject(Router);

  /** Référence au panel pour le focus trap */
  private panel = viewChild<ElementRef<HTMLElement>>('drawerPanel');

  constructor() {
    // Gestion du focus : quand le drawer s'ouvre, focus sur le panel
    effect(() => {
      if (this.cart.isOpen()) {
        // Bloquer le scroll body
        document.body.style.overflow = 'hidden';
        // Donner le focus au panel après le rendu
        setTimeout(() => this.panel()?.nativeElement.focus(), 50);
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  /** Ferme le drawer sur Escape */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cart.closeDrawer();
    }
  }

  checkout(): void {
    this.cart.closeDrawer();
    this.router.navigate(['/checkout']);
  }

  /** Formatte le prix en dollars canadiens */
  formatPrice(value: number): string {
    return value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
  }

  trackByIndex(index: number): number {
    return index;
  }
}