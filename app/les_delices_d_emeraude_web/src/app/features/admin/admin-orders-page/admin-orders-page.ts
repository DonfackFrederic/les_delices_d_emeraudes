import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { Order, OrderStatus, PaginatedOrders } from '@shared/types';
import { environment } from '../../../../environments/environment';
import { OrderDetailPanel } from "./order-detail-panel/order-detail-panel";


type StatusFilter = OrderStatus | 'all';
 
const TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prêtes' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

@Component({
  selector: 'app-admin-orders-page',
  imports: [OrderDetailPanel],
  templateUrl: './admin-orders-page.html',
  styleUrl: './admin-orders-page.scss',
})
export class AdminOrdersPage {
  protected readonly tabs = TABS;
  protected readonly activeFilter = signal<StatusFilter>('all');
  protected readonly selectedOrder = signal<Order | null>(null);
 
  /**
   * httpResource recalculé automatiquement à chaque changement de
   * activeFilter() — la fonction URL est réactive aux signals qu'elle lit.
   */
  protected readonly ordersResource = httpResource<PaginatedOrders>(() => {
    const filter = this.activeFilter();
    const params = filter === 'all' ? '' : `?status=${filter}`;
    return `${environment.apiUrl}/admin/orders${params}`;
  });
 
  protected readonly orders = computed(() => this.ordersResource.value()?.data ?? []);
 
  protected statusLabel(status: OrderStatus): string {
    return TABS.find((t) => t.value === status)?.label ?? status;
  }
 
  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
 
  protected onStatusChanged(): void {
    this.selectedOrder.set(null);
    this.ordersResource.reload();
  }
}
