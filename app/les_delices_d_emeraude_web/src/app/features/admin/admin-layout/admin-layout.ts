import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string; // clé simple, le SVG est choisi dans le template
}
 
const NAV_ITEMS: NavItem[] = [
  { path: '/admin', label: 'Tableau de bord', icon: 'dashboard' },
  { path: '/admin/products', label: 'Produits', icon: 'products' },
  { path: '/admin/categories', label: 'Catégories', icon: 'categories' },
  { path: '/admin/orders', label: 'Commandes', icon: 'orders' },
]

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
 
  protected readonly navItems = NAV_ITEMS;
 
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
 
  protected readonly breadcrumb = computed(() => {
    const segments = this.currentUrl()
      .split('/')
      .filter(Boolean)
      .filter((s) => !this.isUuidLike(s));
 
    if (segments.length === 0) return ['Admin'];
    return segments.map((s) => this.humanize(s));
  });
 
  // ── Menu hamburger mobile ──────────────────────────────────────────────
 
  protected readonly isMobileMenuOpen = signal(false);
 
  constructor() {
    // Ferme le menu à chaque navigation, quelle que soit son origine
    // (clic sur un lien, navigation programmatique, retour navigateur).
    this.router.events
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.isMobileMenuOpen.set(false);
        }
      });
  }
 
  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }
 
  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
 
  protected async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/home']);
  }
 
  private isUuidLike(segment: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
  }
 
  private humanize(segment: string): string {
    const labels: Record<string, string> = {
      admin: 'Tableau de bord',
      products: 'Produits',
      categories: 'Catégories',
      orders: 'Commandes',
      new: 'Nouveau',
      edit: 'Modifier',
    };
    return labels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
  }
 
  protected getIcon(icon: string): string {
    const icons: Record<string, string> = {
      dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
      products: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 7L12 3 4 7v10l8 4 8-4V7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 7l8 4 8-4M12 11v10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
      categories: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      orders: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="2"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
    };
    return icons[icon] ?? '';
  }
}
