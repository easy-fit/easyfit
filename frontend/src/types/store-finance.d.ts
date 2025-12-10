import { OrderStatus } from './order';

export interface BankingInfo {
  accountType: 'cbu' | 'alias' | '';
  cbu?: string;
  bankName?: string;
  accountHolder?: string;
  alias?: string;
}

export interface StoreBalanceSummary {
  storeId: string;
  storeName: string;
  totalEarnings: number;
  shippingCosts: number;
  platformFee: number;
  netBalance: number;
  totalOrders: number;
  completedOrders: number;
  bankingInfo: BankingInfo;
}

export interface OrderFinancialDetail {
  orderId: string;
  orderDate: string | Date;
  customerName: string;
  customerId: string;
  orderTotal: number;
  capturedAmount: number;
  refundedAmount: number;
  shippingCost: number;
  shippingSubsidizedBy: 'merchant' | 'platform' | 'user';
  platformFee: number;
  netToStore: number;
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
