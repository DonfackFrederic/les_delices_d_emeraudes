import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { AdminOrdersPage } from './admin-orders-page/admin-orders-page';
AdminOrdersPage


export const ADMIN_ROUTES: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin-layout/admin-layout').then(
        (m) => m.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-dashboard-page/admin-dashboard-page').then(
            (m) => m.AdminDashboardPage,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./admin-categories-page/admin-categories-page').then(
            (m) => m.AdminCategoriesPage,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin-products-page/admin-products-page').then(
            (m) => m.AdminProductsPage,
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./admin-products-page/product-form/product-form').then(
            (m) => m.ProductForm,
          ),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./admin-products-page/product-form/product-form').then(
            (m) => m.ProductForm,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin-orders-page/admin-orders-page').then(
            (m) => m.AdminOrdersPage,
          ),
      },
    ],
  },
];