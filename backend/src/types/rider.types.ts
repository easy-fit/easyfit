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

export interface ActiveAssignmentCustomerDTO {
  name: string;
  surname: string;
}

export interface ActiveAssignmentStoreDTO {
  name: string;
  address: any; // Store address object
}

export interface ActiveAssignmentDTO {
  riderId: string;
  isAvailable: boolean;
  inService: boolean;
  activeAssignment: {
    _id: string;
    orderId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    assignedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    customer: ActiveAssignmentCustomerDTO;
    store: ActiveAssignmentStoreDTO;
    shipping: any; // Shipping object
    orderStatus: string;
  } | null;
  currentStatus: string | null;
}