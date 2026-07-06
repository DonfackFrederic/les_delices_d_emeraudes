import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { httpResource } from '@angular/common/http';
import { AdminStats } from '@shared/types';
import { KpiCard } from "./kpi-card/kpi-card";
import { RevenueChart } from "./revenue-chart/revenue-chart";

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [KpiCard, RevenueChart],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.scss',
})
export class AdminDashboardPage {
  protected readonly statsResource = httpResource<AdminStats>(
    () => `${environment.apiUrl}/admin/stats`,
  );
 
  protected formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} $`;
  }
}
