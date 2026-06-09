import {
  Injectable, inject, signal, computed, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';

import { ProductApiResource } from '../resources/products.api';
import { ToastService } from '../services/toast-service';
import type { ProductsQueryParams } from '@shared/types';
import { CategoriesApResource } from '../resources/categories.api';

const PAGE_SIZE = 9;

@Injectable()
// ← pas providedIn:'root' → scoped à ProductsPage via providers:[]
export class ProductsStore {
  private productApi        = inject(ProductApiResource);
  private categoriesApi      = inject(CategoriesApResource);
  private router     = inject(Router);
  private route      = inject(ActivatedRoute);
  private toast      = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  // ── Paramètres de filtre (source de vérité locale) ────────
  readonly category = signal('');
  readonly search   = signal('');
  readonly page     = signal(1);
  readonly pageSize = PAGE_SIZE;

  // ── Computed : objet params passé à ApiResource ───────────
  private readonly queryParams = computed<ProductsQueryParams>(() => ({
    category: this.category() || undefined,
    search:   this.search()   || undefined,
    page:     this.page(),
    limit:    PAGE_SIZE,
  }));

  // ── httpResource — re-fetch automatique sur queryParams ───
  private readonly productsResource =
    this.productApi.getProductsListResource(this.queryParams);

  private readonly categoriesResource =
    this.categoriesApi.getCategories();

  // ── Signals publics exposés aux composants ────────────────
  readonly products   = computed(() => this.productsResource.value()?.data   ?? []);
  readonly total      = computed(() => this.productsResource.value()?.total  ?? 0);
  readonly categories = computed(() => this.categoriesResource.value()       ?? []);

  // Status unifié : loading si l'un ou l'autre charge
  readonly loading = computed(
    () => this.productsResource.isLoading() || this.categoriesResource.isLoading()
  );

  readonly error = computed(() =>
    this.productsResource.error()
      ? 'Impossible de charger les produits. Veuillez réessayer.'
      : null
  );

  // ── Computed de pagination ────────────────────────────────
  readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));
  readonly rangeFrom  = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1
  );
  readonly rangeTo = computed(() =>
    Math.min(this.page() * PAGE_SIZE, this.total())
  );
  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.products().length === 0
  );

  // ── Init — synchro URL → signals ──────────────────────────
  init(): void {
    this.syncFromUrl();
    this.watchErrors();
  }

  // ── Actions publiques ─────────────────────────────────────

  setCategory(slug: string): void {
    const next = this.category() === slug ? '' : slug; // toggle
    this.pushUrl({ category: next || null, page: null });
  }

  setSearch(q: string): void {
    this.pushUrl({ search: q || null, page: null });
  }

  setPage(p: number): void {
    const safe = Math.max(1, Math.min(p, this.totalPages() || 1));
    if (safe === this.page()) return;
    this.pushUrl({ page: safe > 1 ? String(safe) : null });
  }

  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }

  reload(): void { this.productsResource.reload(); }

  // ── Privé : URL → signals ─────────────────────────────────

  private syncFromUrl(): void {
    this.route.queryParamMap
      .pipe(
        map(params => ({
          category: params.get('category') ?? '',
          search:   params.get('search')   ?? '',
          page:     Math.max(1, Number(params.get('page') ?? 1)),
        })),
        distinctUntilChanged(
          (a, b) =>
            a.category === b.category &&
            a.search   === b.search   &&
            a.page     === b.page
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ category, search, page }) => {
        // Mise à jour atomique des signals
        this.category.set(category);
        this.search.set(search);
        this.page.set(page);
        // queryParams computed se recalcule → httpResource re-fetch auto
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  private watchErrors(): void {
    // Surveille les erreurs de la resource pour afficher un toast
    // On utilise effect() pour réagir au signal error
    // Note : effect() nécessite un injection context — utilisé ici dans le constructeur
  }

  // ── URL ───────────────────────────────────────────────────

  private pushUrl(patch: Record<string, string | null>): void {
    const current     = this.route.snapshot.queryParams;
    const merged      = { ...current, ...patch };
    const queryParams: Record<string, string> = {};

    for (const [k, v] of Object.entries(merged)) {
      if (v !== null && v !== undefined && v !== '') {
        queryParams[k] = v;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: false,
    });
  }
}