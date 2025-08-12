import { BaseApiClient } from './base-client';
import {
  CreateStoreDTO,
  GetStoresResponse,
  StoreAssetUploadResponse,
  StoreFilterOptions,
  StoreCommonResponse,
  getDashboardResponse,
  StoreOrderAnalyticsResponse,
  StoreOrdersResponse,
} from '@/types/store';
import { buildQueryString } from '@/lib/utils';

export class StoresClient extends BaseApiClient {
  public async getStores(filters?: StoreFilterOptions): Promise<GetStoresResponse> {
    const queryString = filters ? buildQueryString(filters) : '';
    return this.fetchApi<GetStoresResponse>(`/stores${queryString}`);
  }

  public async getStore(id: string): Promise<StoreCommonResponse> {
    return this.fetchApi<StoreCommonResponse>(`/stores/id/${id}`);
  }

  public async getStoreBySlug(slug: string): Promise<StoreCommonResponse> {
    return this.fetchApi<StoreCommonResponse>(`/stores/${slug}`);
  }

  public async createStore(store: CreateStoreDTO): Promise<StoreCommonResponse> {
    return this.fetchApi<StoreCommonResponse>('/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    });
  }

  public async updateStore(id: string, store: Partial<CreateStoreDTO>): Promise<StoreCommonResponse> {
    return this.fetchApi<StoreCommonResponse>(`/stores/id/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(store),
    });
  }

  public async deleteStore(id: string): Promise<void> {
    return this.fetchApi<void>(`/stores/id/${id}`, { method: 'DELETE' });
  }

  public async uploadStoreLogo(key: string, contentType: string, storeId: string): Promise<StoreAssetUploadResponse> {
    return this.fetchApi<StoreAssetUploadResponse>(`/stores/id/${storeId}/assets/logo`, {
      method: 'POST',
      body: JSON.stringify({ key, contentType }),
    });
  }

  public async uploadStoreBanner(key: string, contentType: string, storeId: string): Promise<StoreAssetUploadResponse> {
    return this.fetchApi<StoreAssetUploadResponse>(`/stores/id/${storeId}/assets/banner`, {
      method: 'POST',
      body: JSON.stringify({ key, contentType }),
    });
  }

  public async deleteStoreBanner(storeId: string): Promise<void> {
    return this.fetchApi<void>(`/stores/id/${storeId}/assets/banner`, {
      method: 'DELETE',
    });
  }

  public async deleteStoreLogo(storeId: string): Promise<void> {
    return this.fetchApi<void>(`/stores/id/${storeId}/assets/logo`, {
      method: 'DELETE',
    });
  }

  public async getDashboard(): Promise<getDashboardResponse> {
    return this.fetchApi<getDashboardResponse>(`/stores/merchant/dashboard`);
  }

  public async setStoreStatus(id: string, status: 'active' | 'inactive'): Promise<StoreCommonResponse> {
    return this.fetchApi<StoreCommonResponse>(`/stores/id/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async getStoreOrderAnalytics(storeId: string): Promise<StoreOrderAnalyticsResponse> {
    return this.fetchApi<StoreOrderAnalyticsResponse>(`/stores/id/${storeId}/analytics/orders`);
  }

  public async getStoreOrders(storeId: string, params?: {
    status?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<StoreOrdersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    const url = `/stores/id/${storeId}/orders${query ? `?${query}` : ''}`;
    
    return this.fetchApi<StoreOrdersResponse>(url);
  }
}
