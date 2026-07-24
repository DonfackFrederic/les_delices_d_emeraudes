import { Component } from '@angular/core';
import { Order, OrderStatus } from '@shared/types';
import { environment } from '../../../../environments/environment';
import { httpResource } from '@angular/common/http';
import { RouterLink } from "@angular/router";
import { CurrencyPipe, DatePipe } from '@angular/common';

const STATUS_CONFIG: Record<OrderStatus, { label: string; class: string }> = {
  pending:   { label: 'En attente',    class: 'badge--pending'   },
  confirmed: { label: 'Confirmée',     class: 'badge--confirmed' },
  preparing: { label: 'En prépa.',     class: 'badge--preparing' },
  ready:     { label: 'Prête',         class: 'badge--ready'     },
  delivered: { label: 'Livrée',        class: 'badge--delivered' },
  cancelled: { label: 'Annulée',       class: 'badge--cancelled' },
};

@Component({
  selector: 'app-orders-list.page',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './orders-list.page.html',
  styleUrl: './orders-list.page.scss',
})
export class OrdersListPage {
  protected readonly ordersResource = httpResource<Order[]>(
    ()=> `${environment.apiUrl}/users/me/orders`,
  );
 
  protected readonly orders = this.ordersResource.value;
 
  protected statusConfig(status: OrderStatus) {
    return STATUS_CONFIG[status] ?? { label: status, class: '' };
  }
}
