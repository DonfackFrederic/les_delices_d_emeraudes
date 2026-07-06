import {
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
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
 
  /**
   * Breadcrumb dérivé de l'URL active, recalculé à chaque navigation.
   * toSignal transforme le flux router.events en signal réactif.
   */
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
}
