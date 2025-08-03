import { BaseApiClient } from './base-client';
import { Order, UpdateOrderDTO, OrderCommonResponse, GetMyOrdersResponse } from '@/types/order';
import { ItemDecision } from '@/types/tryPeriod';
import { MessageResponse } from '@/types/global';

export class OrdersClient extends BaseApiClient {
  public async getOrders(): Promise<OrderCommonResponse> {
    return this.fetchApi<OrderCommonResponse>('/orders');
  }

  public async getMyOrders(): Promise<GetMyOrdersResponse> {
    return this.fetchApi<GetMyOrdersResponse>('/orders/my-orders');
  }

  public async getOrder(id: string): Promise<OrderCommonResponse> {
    return this.fetchApi<OrderCommonResponse>(`/orders/${id}`);
  }

  public async updateOrder(id: string, order: UpdateOrderDTO): Promise<OrderCommonResponse> {
    return this.fetchApi<OrderCommonResponse>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(order),
    });
  }

  public async deleteOrder(id: string): Promise<void> {
    return this.fetchApi<void>(`/orders/${id}`, { method: 'DELETE' });
  }

  public async verifyDeliveryCode(
    id: string,
    code: string,
    riderId: string,
  ): Promise<{ status: string; message: string; data: Order }> {
    return this.fetchApi<{ status: string; message: string; data: Order }>(`/orders/${id}/verify-delivery`, {
      method: 'POST',
      body: JSON.stringify({ code, riderId }),
    });
  }

  public async saveDecisions(id: string, items: ItemDecision[]): Promise<MessageResponse> {
    return this.fetchApi<MessageResponse>(`/orders/${id}/try-period/save-decisions`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }
}
