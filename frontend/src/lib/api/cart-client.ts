import { BaseApiClient } from './base-client';
import { GetCartItemsResponse, GetCartItemResponse, CreateCartItemDTO, UpdateCartItemDTO } from '@/types/cart';

export class CartClient extends BaseApiClient {
  public async getCartItems(): Promise<GetCartItemsResponse> {
    return this.fetchApi<GetCartItemsResponse>('/cart');
  }

  public async createCartItem(data: CreateCartItemDTO): Promise<GetCartItemResponse> {
    return this.fetchApi<GetCartItemResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateCartItem(id: string, data: UpdateCartItemDTO): Promise<GetCartItemResponse> {
    return this.fetchApi<GetCartItemResponse>(`/cart/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async deleteCartItem(id: string): Promise<void> {
    return this.fetchApi<void>(`/cart/${id}`, { method: 'DELETE' });
  }

  public async cleanCart(): Promise<void> {
    return this.fetchApi<void>('/cart', { method: 'DELETE' });
  }
}
