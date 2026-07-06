import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { Product } from '@shared/types';
import { AdminProductsService } from '../services/admin-products.service';
import { environment } from '../../../environments/environment';

export type ProductFormTab = 'info' | 'images' | 'options';

/**
 * Store du formulaire produit — fourni au niveau du composant ProductFormPage
 * (providers: [ProductFormStore]), détruit avec lui.
 *
 * Mode déterminé par la présence d'un productId (édition) ou son absence
 * (création). En mode création, les onglets Images/Options ne sont
 * accessibles qu'après la première sauvegarde (un produit doit exister en
 * DB avant d'y attacher des options ou de servir d'entityId pour l'upload).
 */
@Injectable()
export class ProductFormStore {
  private readonly productsService = inject(AdminProductsService);
  private readonly router = inject(Router);

  // ── Identité / mode ───────────────────────────────────────────────────────

  readonly productId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.productId());

  /**
   * httpResource ne se déclenche que si productId() est non-null
   * (le composant appelle setProductId() dans son ngOnInit).
   */
  readonly productResource = httpResource<Product>(() => {
    const id = this.productId();
    return id ? `${environment.apiUrl}/admin/products/${id}` : undefined;
  });

  readonly product = this.productResource.value;

  // ── Onglet actif ──────────────────────────────────────────────────────────

  readonly activeTab = signal<ProductFormTab>('info');

  /** Les onglets Images/Options nécessitent un produit déjà créé. */
  readonly canAccessSecondaryTabs = computed(() => this.isEditMode());

  // ── Champs du formulaire (infos de base) ─────────────────────────────────

  readonly categoryId = signal('');
  readonly name = signal('');
  readonly slug = signal('');
  readonly description = signal('');
  readonly basePrice = signal(0);
  readonly isActive = signal(true);
  readonly isFeatured = signal(false);
  readonly imageUrl = signal('');

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);

  private slugManuallyEdited = false;

  /**
   * Initialise le store en mode édition — appelé depuis ngOnInit avec
   * l'id extrait de la route.
   */
  loadForEdit(productId: string): void {
    this.productId.set(productId);
  }

  /**
   * Synchronise les signals du formulaire depuis le produit chargé.
   * À appeler via un effect() dans le composant, qui observe product().
   */
  populateFromProduct(product: Product): void {
    this.categoryId.set(product.categoryId);
    this.name.set(product.name);
    this.slug.set(product.slug);
    this.description.set(product.description ?? '');
    this.basePrice.set(product.basePrice);
    this.isActive.set(product.isActive);
    this.isFeatured.set(product.isFeatured);
    this.imageUrl.set(product.imageUrl ?? '');
    this.slugManuallyEdited = true;
  }

  onNameChange(value: string): void {
    this.name.set(value);
    if (!this.slugManuallyEdited && !this.isEditMode()) {
      this.slug.set(this.slugify(value));
    }
  }

  onSlugManualEdit(): void {
    this.slugManuallyEdited = true;
  }

  /**
   * Sauvegarde les infos de base. En mode création, redirige ensuite vers
   * l'URL d'édition (le produit a maintenant un id, les onglets
   * Images/Options deviennent accessibles).
   */
  async saveBasicInfo(): Promise<void> {
    this.isSaving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    const dto = {
      categoryId: this.categoryId(),
      name: this.name().trim(),
      slug: this.slug().trim(),
      description: this.description().trim() || null,
      basePrice: this.basePrice(),
      imageUrl: this.imageUrl().trim() || null,
      isActive: this.isActive(),
      isFeatured: this.isFeatured(),
    };

    try {
      if (this.isEditMode()) {
        await this.productsService.update(this.productId()!, dto);
        this.productResource.reload();
      } else {
        const created = await this.productsService.create(dto);
        // Redirige vers le mode édition — débloque les onglets suivants.
        await this.router.navigate(['/admin/products', created.id, 'edit']);
        return;
      }

      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 2500);
    } catch (err: unknown) {
      this.saveError.set(this.extractErrorMessage(err));
    } finally {
      this.isSaving.set(false);
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const apiError = (err as { error: { message?: string } }).error;
      if (apiError?.message) return apiError.message;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}