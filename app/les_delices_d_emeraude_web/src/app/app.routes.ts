import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Productspage } from './features/productspage/productspage';
import { ProductDetailPage } from './features/prodcut-detail-page/prodcut-detail-page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: Homepage },
  { path: 'products', component: Productspage },
  { path: 'products/:slug', component: ProductDetailPage },
  { path: '', loadChildren: () => import('./features/auth/auth.route').then((m) => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/checkout-page/checkout.routes').then((m) => m.CHECKOUT_ROUTES)},
  // { path: 'login', component: LoginPageComponent },
  // { path: 'register', component: RegisterPageComponent },
  // {
  //   path: 'dashboard',
  //   canActivate: [AuthGuard],
  //   component: DashboardLayoutComponent,
  //   children: [
  //     { path: 'orders', component: OrdersListPageComponent },
  //     { path: 'orders/:id', component: OrderDetailPageComponent },
  //     { path: 'profile', component: ProfilePageComponent },
  //   ]
  // },
  // {
  //   path: 'admin',
  //   canActivate: [AdminGuard],
  //   component: AdminLayoutComponent,
  //   children: [ /* Sprint 3 */ ]
  // },
  { path: '**', redirectTo: 'home' }
];
