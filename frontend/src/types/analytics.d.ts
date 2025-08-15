// Analytics Types for Store Dashboard

export interface AnalyticsKPIs {
  totalRevenue: {
    current: number;
    previous: number;
    change: number;
  };
  totalOrders: {
    current: number;
    previous: number;
    change: number;
  };
  averageTicket: {
    current: number;
    previous: number;
    change: number;
  };
  purchaseRate: {
    current: number;
    previous: number;
    change: number;
  };
  uniqueCustomers: number;
}

export interface ChartDataPoint {
  date: string;
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
}

export interface CategoryData {
  category: 'clothing' | 'footwear' | 'accessory' | 'fragrance';
  value: number; // percentage
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export interface PerformanceMetrics {
  conversionRate: number;
  returnRate: number;
  avgRating: number;
}

export interface StoreAnalyticsResponse {
  kpis: AnalyticsKPIs;
  chartData: ChartDataPoint[];
  categoryData: CategoryData[];
  topProducts: TopProduct[];
  performanceMetrics: PerformanceMetrics;
  dateRange: {
    current: { start: string; end: string };
    previous: { start: string; end: string };
  };
}

export interface StoreAnalyticsApiResponse {
  status: 'success';
  data: StoreAnalyticsResponse;
}

export type DateRangeFilter = 'today' | '7days' | '30days';
export type OrderTypeFilter = 'all' | 'completed' | 'returned' | 'purchased';