import {
  Injectable, inject, signal, computed, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, distinctUntilChanged, EMPTY, catchError } from 'rxjs';

import { CartService } from '../services/cart-service';
import { ToastService } from '../services/toast-service';
import type { ProductOption, SelectedOption } from '@shared/types';
import { ProductApiResource } from '../resources/products.api';

@Injectable()
export class ProductDetailStore {
  private api        = inject(ProductApiResource);
  private cart       = inject(CartService);
  private toast      = inject(ToastService);
  private route      = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // ── Slug courant (lu depuis l'URL) ────────────────────────
  readonly slug = signal('');

  // ── httpResource — re-fetch si slug change ────────────────
  private readonly resource = this.api.getProductResource(this.slug);

  // ── Signals publics — données ─────────────────────────────
  readonly product  = computed(() => this.resource.value() ?? null);
  readonly loading  = this.resource.isLoading;
  readonly error    = computed(() =>
    this.resource.error() ? 'Impossible de charger ce produit.' : null
  );

  // ── Galerie ───────────────────────────────────────────────
  readonly activeImageIndex = signal(0);
  readonly activeImage = computed(() => {
    const p = this.product();
    if (!p) return null;
    const images = [p.imageUrl, ...(p.images ?? [])].filter(Boolean) as string[];
    return images[this.activeImageIndex()] ?? null;
  });
  readonly galleryImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [p.imageUrl, ...(p.images ?? [])].filter(Boolean) as string[];
  });

  // ── Options sélectionnées ─────────────────────────────────
  // Map<optionId, SelectedOption>
  private readonly _selections = signal(new Map<string, SelectedOption>());

  readonly selections = computed(() => [...this._selections().values()]);

  // ── Quantité ──────────────────────────────────────────────
  readonly quantity = signal(1);

  // ── Prix calculé dynamiquement ────────────────────────────
  readonly optionsTotal = computed(() =>
    this.selections().reduce((sum, o) => sum + o.priceModifier, 0)
  );

  readonly unitPrice = computed(() =>
    (this.product()?.basePrice ?? 0) + this.optionsTotal()
  );

  readonly totalPrice = computed(() => this.unitPrice() * this.quantity());

  // ── Validation : toutes les options requises sont choisies ─
  readonly requiredOptions = computed(() =>
    this.product()?.options?.filter(o => o.isRequired) ?? []
  );

  readonly isFormValid = computed(() => {
    const sel = this._selections();
    return this.requiredOptions().every(o => sel.has(o.id));
  });

  // ── Détail des modificateurs pour l'affichage du prix ─────
  readonly priceBreakdown = computed(() => {
    const items: { label: string; amount: number }[] = [];
    const sel = this._selections();
    sel.forEach(s => {
      if (s.priceModifier !== 0) {
        items.push({ label: `${s.optionName} : ${s.value}`, amount: s.priceModifier });
      }
    });
    return items;
  });

  // ── Init ──────────────────────────────────────────────────
  init(): void {
    this.route.paramMap
      .pipe(
        map(p => p.get('slug') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(slug => {
        this.slug.set(slug);
        // Réinitialiser la sélection à chaque changement de produit
        this._selections.set(new Map());
        this.quantity.set(1);
        this.activeImageIndex.set(0);
      });
  }

  // ── Actions ───────────────────────────────────────────────

  setActiveImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  selectOption(option: ProductOption, selected: SelectedOption): void {
    this._selections.update(map => {
      const next = new Map(map);
      next.set(option.id, selected);
      return next;
    });
  }

  clearOption(optionId: string): void {
    this._selections.update(map => {
      const next = new Map(map);
      next.delete(optionId);
      return next;
    });
  }

  toggleBoolean(option: ProductOption, priceModifier: number): void {
    this._selections.update(map => {
      const next = new Map(map);
      if (next.has(option.id)) {
        next.delete(option.id);
      } else {
        next.set(option.id, {
          optionId:      option.id,
          optionName:    option.name,
          value:         'Oui',
          priceModifier,
        });
      }
      return next;
    });
  }

  setQuantity(qty: number): void {
    this.quantity.set(Math.max(1, Math.min(99, qty)));
  }

  addToCart(): void {
    const product = this.product();
    if (!product || !this.isFormValid()) return;

    this.cart.addItem(
      product,
      this.quantity(),
      this.selections(),
      '',
    );
  }
}