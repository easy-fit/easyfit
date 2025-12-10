import { OrderStatus } from './order.types';

export interface BankingInfo {
  accountType: 'cbu' | 'alias';
  cbu?: string;
  bankName?: string;
  accountHolder?: string;
  alias?: string;
}

export interface StoreBalanceSummary {
  storeId: string;
  storeName: string;
  totalEarnings: number; // Sum of capturedAmount
  shippingCosts: number; // Sum of shipping costs (only merchant-subsidized)
  platformFee: number; // 10% of totalEarnings
  netBalance: number; // totalEarnings - shippingCosts - platformFee
  totalOrders: number;
  completedOrders: number;
  bankingInfo: BankingInfo;
}

export interface OrderFinancialDetail {
  orderId: string;
  orderDate: Date;
  customerName: string;
  customerId: string;
  orderTotal: number; // Original order total
  capturedAmount: number; // Actual amount captured
  refundedAmount: number; // Amount refunded
  shippingCost: number;
  shippingSubsidizedBy: 'merchant' | 'platform' | 'user';
  platformFee: number; // 10% of capturedAmount
  netToStore: number; // capturedAmount - shipping - platformFee
  status: OrderStatus;
  paymentStatus: string;
}

export interface StoreOrderDetails {
  storeId: string;
  storeName: string;
  orders: OrderFinancialDetail[];
  summary: StoreBalanceSummary;
}

export interface PaginatedStoreBalances {
  stores: StoreBalanceSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions extends PaginationOptions {
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus;
}
