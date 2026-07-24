import {
  Component,
  inject,
  signal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CartService } from '../../../../core/services/cart-service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  templateUrl: './cart-icon.html',
  styleUrl: './cart-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartIconComponent {
  readonly cart = inject(CartService);

  /** Déclenche l'animation bounce à chaque ajout */
  readonly isBouncing = signal(false);

  private previousCount = this.cart.itemCount();

  constructor() {
    effect(() => {
      const count = this.cart.itemCount();
      if (count > this.previousCount) {
        this.triggerBounce();
      }
      this.previousCount = count;
    });
  }

  private triggerBounce(): void {
    this.isBouncing.set(true);
    setTimeout(() => this.isBouncing.set(false), 600);
  }
}