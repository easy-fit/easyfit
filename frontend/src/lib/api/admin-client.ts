import { BaseApiClient } from './base-client';
import { OrderStatus } from '@/types/order';

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
}
