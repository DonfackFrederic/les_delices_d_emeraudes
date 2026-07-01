import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-layout/dashboard-layout').then(
        (m) => m.DashboardLayout,
      ),
    children: [
      // Redirection par défaut vers les commandes
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders-list.page/orders-list.page').then(
            (m) => m.OrdersListPage,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./order-detail.page/order-detail.page').then(
            (m) => m.OrderDetailPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile.page/profile.page').then(
            (m) => m.ProfilePage,
          ),
      },
    ],
  },
];