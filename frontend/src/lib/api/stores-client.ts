import { BaseApiClient } from './base-client';
import {
  CreateStoreDTO,
  GetStoresResponse,
  StoreAssetUploadResponse,
  StoreFilterOptions,
  StoreCommonResponse,
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
}
