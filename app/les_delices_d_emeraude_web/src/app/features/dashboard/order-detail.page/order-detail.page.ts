import { Component, inject } from '@angular/core';
import { Order, OrderStatus } from '@shared/types';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';

const STATUS_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready:     'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

@Component({
  selector: 'app-order-detail.page',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order-detail.page.html',
  styleUrl: './order-detail.page.scss',
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
 
  private readonly orderId = this.route.snapshot.paramMap.get('id') ?? '';
 
  protected readonly orderResource = httpResource<Order>(
    () => `${environment.apiUrl}/users/me/orders/${this.orderId}`,
  );
 
  protected readonly statusSteps = STATUS_STEPS;
  protected readonly statusLabels = STATUS_LABELS;
 
  protected isStepDone(currentStatus: OrderStatus, step: OrderStatus): boolean {
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);
    const stepIdx = STATUS_STEPS.indexOf(step);
    return currentIdx > stepIdx;
  }
}
