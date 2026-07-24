import { computed, inject, Injectable, signal } from '@angular/core';
import { CartItem, Product, SelectedOption } from '@shared/types';
import { ToastService } from './toast-service';
import { Router } from '@angular/router';

 
@Injectable({ providedIn: 'root' })
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly KEY   = 'patisserie_cart';
  private toast          = inject(ToastService);
  private router         = inject(Router);
 
  private _items         = signal<CartItem[]>(this.load());
  private _isOpen        = signal(false);
 
  readonly items         = this._items.asReadonly();
  readonly isOpen        = this._isOpen.asReadonly();
  readonly total         = computed(() => this._items().reduce((s, i) => s + i.lineTotal, 0));
  readonly itemCount     = computed(() => this._items().reduce((s, i) => s + i.quantity,  0));
 
  // ── Actions ───────────────────────────────────────────────
 
  addItem(product: Product, qty: number, options: SelectedOption[] = [], comment = ''): void {
    const optTotal  = options.reduce((s, o) => s + o.priceModifier, 0);
    const lineTotal = (product.basePrice + optTotal) * qty;
    this._items.update(list => [...list, { product, quantity: qty, selectedOptions: options, comment, lineTotal }]);
    this.save();
    this.toast.success('Ajouté au panier 🛒', `${product.name} × ${qty}`);
  }
 
  /** Depuis la liste : redirige si options requises, sinon ajout direct */
  quickAdd(product: Product): void {
    const hasRequired = product.options?.some(o => o.isRequired);
    if (hasRequired) {
      this.router.navigate(['/products', product.slug]);
      this.toast.info('Personnalisation requise', `Choisissez vos options pour "${product.name}".`);
      return;
    }
    this.addItem(product, 1);
  }
 
  updateQuantity(index: number, qty: number): void {
    if (qty <= 0) { this.removeItem(index); return; }
    this._items.update(list => {
      const items = [...list];
      const item  = items[index];
      const opt   = item.selectedOptions.reduce((s, o) => s + o.priceModifier, 0);
      items[index] = { ...item, quantity: qty, lineTotal: (item.product.basePrice + opt) * qty };
      return items;
    });
    this.save();
  }
 
  removeItem(index: number): void {
    const name = this._items()[index]?.product.name ?? '';
    this._items.update(list => list.filter((_, i) => i !== index));
    this.save();
    if (name) this.toast.warning('Retiré du panier', name);
  }
 
  clearCart(): void {
    this._items.set([]);
    localStorage.removeItem(this.KEY);
  }
 
  openDrawer():   void { this._isOpen.set(true);        }
  closeDrawer():  void { this._isOpen.set(false);       }
  toggleDrawer(): void { this._isOpen.update(v => !v);  }
 
  // ── Persistance ───────────────────────────────────────────
 
  private save(): void {
    try { localStorage.setItem(this.KEY, JSON.stringify(this._items())); } catch { /* quota */ }
  }
 
  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? '[]'); } catch { return []; }
  }
}
 
