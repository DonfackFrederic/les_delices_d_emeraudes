import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Productspage } from './features/productspage/productspage';
import { ProductDetailPage } from './features/prodcut-detail-page/prodcut-detail-page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: Homepage },
  { path: 'products', component: Productspage },
  { path: 'products/:slug', component: ProductDetailPage },
  { path: '', loadChildren: () => import('./features/auth/auth.route').then((m) => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/checkout-page/checkout.routes').then((m) => m.CHECKOUT_ROUTES)},
  { path: 'dashboard',
    canActivate: [authGuard], 
    loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
  },
  { path: '', loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: '**', redirectTo: 'home' }
];
