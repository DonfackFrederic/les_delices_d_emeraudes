import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus, PaginatedOrders } from '@shared/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/orders`;

  updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return firstValueFrom(
      this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status }),
    );
  }
}