import { BaseApiClient } from './base-client';
import { OrderStatus } from '@/types/order';
import {
  PaginatedStoreBalances,
  StoreBalanceSummary,
  StoreOrderDetails,
  PaginationOptions,
  FilterOptions,
} from '@/types/store-finance';

export interface AvailableRider {
  _id: string;
  name: string;
  surname: string;
  email: string;
  isAvailable: boolean;
  location: {
    type: string;
    coordinates: [number, number];
  } | null;
}

export interface OrderManagementDetails {
  order: any;
  currentStatus: OrderStatus;
  validTransitions: OrderStatus[];
  allStatuses: OrderStatus[];
}

export interface ManualAssignmentResponse {
  status: string;
  message: string;
  data: {
    success: boolean;
    message: string;
    order: any;
    deliveryVerified?: boolean;
  };
}

export interface ForceStatusResponse {
  status: string;
  message: string;
  data: {
    success: boolean;
    message: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    order: any;
  };
}

export class AdminClient extends BaseApiClient {
  /**
   * Get available riders for manual assignment
   */
  public async getAvailableRiders(orderId: string): Promise<{ status: string; data: { riders: AvailableRider[] } }> {
    return this.fetchApi<{ status: string; data: { riders: AvailableRider[] } }>(
      `/admin/orders/${orderId}/available-riders`,
    );
  }

  /**
   * Manually assign a rider to an order
   * Optionally accepts a rider code to immediately verify delivery
   */
  public async assignRider(orderId: string, riderId: string, riderCode?: string): Promise<ManualAssignmentResponse> {
    return this.fetchApi<ManualAssignmentResponse>(`/admin/orders/${orderId}/assign-rider`, {
      method: 'POST',
      body: JSON.stringify({ riderId, riderCode }),
    });
  }

  /**
   * Force a status transition (admin override)
   */
  public async forceStatusTransition(
    orderId: string,
    status: OrderStatus,
    reason?: string,
  ): Promise<ForceStatusResponse> {
    return this.fetchApi<ForceStatusResponse>(`/admin/orders/${orderId}/force-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  /**
   * Get order details for manual management
   */
  public async getOrderManagementDetails(orderId: string): Promise<{ status: string; data: OrderManagementDetails }> {
    return this.fetchApi<{ status: string; data: OrderManagementDetails }>(
      `/admin/orders/${orderId}/management-details`,
    );
  }

  /**
   * Get balances for all stores
   */
  public async getStoreBalances(params?: PaginationOptions): Promise<{ status: string; data: PaginatedStoreBalances }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/admin/finances/stores${queryString ? `?${queryString}` : ''}`;

    return this.fetchApi<{ status: string; data: PaginatedStoreBalances }>(url);
  }

  /**
   * Get balance details for a single store
   */
  public async getStoreBalance(storeId: string): Promise<{ status: string; data: StoreBalanceSummary }> {
    return this.fetchApi<{ status: string; data: StoreBalanceSummary }>(`/admin/finances/stores/${storeId}`);
  }

  /**
   * Get detailed order breakdown for a store
   */
  public async getStoreOrderFinancials(
    storeId: string,
    params?: FilterOptions,
  ): Promise<{ status: string; data: StoreOrderDetails }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/admin/finances/stores/${storeId}/orders${queryString ? `?${queryString}` : ''}`;

    return this.fetchApi<{ status: string; data: StoreOrderDetails }>(url);
  }
}
