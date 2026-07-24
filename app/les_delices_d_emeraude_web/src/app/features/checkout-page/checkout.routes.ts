// ─── À ajouter dans app.routes.ts ────────────────────────────────────────────
// (lazy loading — les composants ne sont chargés que si la route est visitée)

import { Routes } from '@angular/router';
import { CheckoutPage } from './checkout.page';
import { OrderConfirmationPage } from '../order-confirmation-page/order-confirmation.page';
CheckoutPage
OrderConfirmationPage


export const CHECKOUT_ROUTES: Routes = [
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout.page').then(
        (m) => m.CheckoutPage,
      ),
    // Optionnel : ajouter un guard qui redirige vers /products si le panier est vide
    // canActivate: [CartNotEmptyGuard],
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () =>
      import('../order-confirmation-page/order-confirmation.page').then(
        (m) => m.OrderConfirmationPage,
      ),
  },
];

// ─── Exemple d'intégration dans app.routes.ts ─────────────────────────────────
//
// export const routes: Routes = [
//   { path: '', component: HomePageComponent },
//   { path: 'products', component: ProductsPageComponent },
//   { path: 'products/:slug', component: ProductDetailPageComponent },
//   { path: 'login', component: LoginPageComponent },
//   { path: 'register', component: RegisterPageComponent },
//   ...CHECKOUT_ROUTES,                          // ← ajouter ici
//   {
//     path: 'dashboard',
//     canActivate: [AuthGuard],
//     ...
//   },
//   { path: '**', redirectTo: '' },
// ];