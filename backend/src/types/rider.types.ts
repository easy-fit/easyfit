export interface WeeklySummaryDTO {
  ordersCompleted: number;
  weeklyEarnings: number;
  rating: number;
  activeTimeToday: number; // minutes - estimated from delivery activity or location updates
}

export interface RecentActivityItemDTO {
  orderId: string;
  orderNumber: string;
  location: string;
  deliveredAt: Date;
  earnings: number;
  timeSinceDelivery: string; // e.g., "Hace 2 horas"
}

export interface RecentActivityDTO {
  activities: RecentActivityItemDTO[];
}

export interface RiderDashboardStatsDTO {
  weeklySummary: WeeklySummaryDTO;
  recentActivity: RecentActivityDTO;
}