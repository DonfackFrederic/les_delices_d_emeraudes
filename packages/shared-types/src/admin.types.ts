// ─── KPIs tableau de bord admin ──────────────────────────────────────────────

export interface DailyStatPoint {
  date: string;     // 'YYYY-MM-DD'
  count: number;
  revenue: number;
}

export interface AdminStats {
  todayOrders: number;
  monthRevenue: number;
  activeProducts: number;
  pendingOrders: number;
  last30DaysChart: DailyStatPoint[];
}