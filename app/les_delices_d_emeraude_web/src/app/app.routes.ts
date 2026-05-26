import { Routes } from '@angular/router';

export const routes: Routes = [
  // { path: '', component: HomePageComponent },
  // { path: 'products', component: ProductsPageComponent },
  // { path: 'products/:slug', component: ProductDetailPageComponent },
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
  { path: '**', redirectTo: '' }
];
