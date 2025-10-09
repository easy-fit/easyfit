/* eslint-disable @typescript-eslint/no-explicit-any */
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
  StoreBillingResponse,
  UpdateBillingDTO,
  UploadTaxDocumentDTO,
  TaxDocumentUploadResponse,
  UpdateDocumentStatusDTO,
  UpdateBillingStatusDTO,
  BillingStatusResponse,
} from '@/types/store';
import { StoreAnalyticsApiResponse, DateRangeFilter, OrderTypeFilter } from '@/types/analytics';
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

  public async getManagerDashboard(): Promise<getDashboardResponse> {
    return this.fetchApi<getDashboardResponse>(`/stores/manager/dashboard`);
  }

  public async getUserStoreAccess(storeId: string): Promise<{
    status: string;
    data: {
      storeId: string;
      hasAccess: boolean;
      accessType: 'owner' | 'manager' | 'none';
      isOwner: boolean;
      isManager: boolean;
      managerAssignment?: any;
    };
  }> {
    return this.fetchApi(`/stores/id/${storeId}/access`);
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

  public async getStoreOrders(
    storeId: string,
    params?: {
      status?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      since?: string;
    },
  ): Promise<StoreOrdersResponse> {
    const searchParams = new URLSearchParams();

    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.since) searchParams.set('since', params.since);

    const query = searchParams.toString();
    const url = `/stores/id/${storeId}/orders${query ? `?${query}` : ''}`;

    return this.fetchApi<StoreOrdersResponse>(url);
  }

  public async getStoreDetailedAnalytics(
    storeId: string,
    params?: {
      dateRange?: DateRangeFilter;
      orderType?: OrderTypeFilter;
    },
  ): Promise<StoreAnalyticsApiResponse> {
    const searchParams = new URLSearchParams();

    if (params?.dateRange) searchParams.set('dateRange', params.dateRange);
    if (params?.orderType) searchParams.set('orderType', params.orderType);

    const query = searchParams.toString();
    const url = `/stores/id/${storeId}/analytics/detailed${query ? `?${query}` : ''}`;

    return this.fetchApi<StoreAnalyticsApiResponse>(url);
  }

  public async getStoreProductMetrics(storeId: string): Promise<{ status: string; data: any }> {
    return this.fetchApi<{ status: string; data: any }>(`/stores/id/${storeId}/products/metrics`);
  }

  public async getStoreProducts(
    storeId: string,
    params?: {
      search?: string;
      category?: string;
      status?: string;
      stockStatus?: string;
      page?: number;
      limit?: number;
      sort?: string;
    },
  ): Promise<{ status: string; results: number; pagination: any; data: { products: any[] } }> {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.stockStatus) searchParams.set('stockStatus', params.stockStatus);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString();
    const url = `/stores/id/${storeId}/products${query ? `?${query}` : ''}`;

    return this.fetchApi<{ status: string; results: number; pagination: any; data: { products: any[] } }>(url);
  }

  public async exportStoreProducts(storeId: string): Promise<{ status: string; data: any[] }> {
    return this.fetchApi<{ status: string; data: any[] }>(`/stores/id/${storeId}/products/export`);
  }

  // Billing Management Methods
  public async getStoreBilling(storeId: string): Promise<StoreBillingResponse> {
    return this.fetchApi<StoreBillingResponse>(`/stores/id/${storeId}/billing`);
  }

  public async updateStoreBilling(storeId: string, data: UpdateBillingDTO): Promise<StoreBillingResponse> {
    return this.fetchApi<StoreBillingResponse>(`/stores/id/${storeId}/billing`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async uploadTaxDocument(storeId: string, data: UploadTaxDocumentDTO): Promise<TaxDocumentUploadResponse> {
    return this.fetchApi<TaxDocumentUploadResponse>(`/stores/id/${storeId}/billing/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async deleteTaxDocument(storeId: string, documentId: string): Promise<StoreBillingResponse> {
    return this.fetchApi<StoreBillingResponse>(`/stores/id/${storeId}/billing/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  public async updateDocumentStatus(
    storeId: string,
    documentId: string,
    data: UpdateDocumentStatusDTO,
  ): Promise<StoreBillingResponse> {
    return this.fetchApi<StoreBillingResponse>(`/stores/id/${storeId}/billing/documents/${documentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async updateBillingStatus(storeId: string, data: UpdateBillingStatusDTO): Promise<BillingStatusResponse> {
    return this.fetchApi<BillingStatusResponse>(`/stores/id/${storeId}/billing/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}
