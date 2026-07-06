
import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { DailyStatPoint } from '@shared/types';
 
interface ChartBar {
  x: number;
  y: number;
  width: number;
  height: number;
  date: string;
  revenue: number;
  count: number;
  isToday: boolean;
}
 
const CHART_HEIGHT = 180;
const CHART_PADDING_TOP = 12;
const BAR_GAP = 3;

@Component({
  selector: 'app-revenue-chart',
  imports: [DecimalPipe],
  templateUrl: './revenue-chart.html',
  styleUrl: './revenue-chart.scss',
})
export class RevenueChart {
  readonly data = input.required<DailyStatPoint[]>();
 
  protected readonly chartHeight = CHART_HEIGHT;
 
  private readonly maxRevenue = computed(() => {
    const max = Math.max(...this.data().map((d) => d.revenue), 1);
    return max;
  });
 
  protected readonly svgWidth = computed(() => this.data().length * 14);
 
  protected readonly totalRevenue = computed(() =>
    this.data().reduce((sum, d) => sum + d.revenue, 0),
  );
 
  protected readonly firstDate = computed(() =>
    this.formatShortDate(this.data()[0]?.date),
  );
 
  protected readonly lastDate = computed(() =>
    this.formatShortDate(this.data()[this.data().length - 1]?.date),
  );
 
  protected readonly bars = computed<ChartBar[]>(() => {
    const points = this.data();
    const max = this.maxRevenue();
    const barWidth = 14 - BAR_GAP;
    const today = new Date().toISOString().slice(0, 10);
 
    return points.map((point, i) => {
      const availableHeight = this.chartHeight - CHART_PADDING_TOP;
      const height = Math.max((point.revenue / max) * availableHeight, point.count > 0 ? 3 : 1);
 
      return {
        x: i * 14,
        y: this.chartHeight - height,
        width: barWidth,
        height,
        date: this.formatFullDate(point.date),
        revenue: point.revenue,
        count: point.count,
        isToday: point.date === today,
      };
    });
  });
 
  private formatShortDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  }
 
  private formatFullDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}
