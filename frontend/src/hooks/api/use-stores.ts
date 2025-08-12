import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { CreateStoreDTO, GetStoresResponse, UpdateStoreDTO, StoreCommonResponse, StoreOrderAnalyticsResponse, StoreOrdersResponse } from '@/types/store';

export const useStores = (filters?: Record<string, unknown>) => {
  return useQuery<GetStoresResponse>({
    queryKey: ['stores', filters],
    queryFn: () => api.stores.getStores(filters),
    staleTime: 60000,
  });
};

export const useStore = (id: string) => {
  return useQuery<StoreCommonResponse>({
    queryKey: ['store', id],
    queryFn: () => api.stores.getStore(id),
  });
};

export const useStoreBySlug = (slug: string) => {
  return useQuery<StoreCommonResponse>({
    queryKey: ['store', 'slug', slug],
    queryFn: () => api.stores.getStoreBySlug(slug),
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (store: CreateStoreDTO) => api.stores.createStore(store),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, store }: { id: string; store: Partial<UpdateStoreDTO> }) => api.stores.updateStore(id, store),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.stores.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useUploadStoreLogo = (storeId: string) => {
  return useMutation({
    mutationFn: ({ key, contentType }: { key: string; contentType: string }) =>
      api.stores.uploadStoreLogo(key, contentType, storeId),
  });
};

export const useUploadStoreBanner = (storeId: string) => {
  return useMutation({
    mutationFn: ({ key, contentType }: { key: string; contentType: string }) =>
      api.stores.uploadStoreBanner(key, contentType, storeId),
  });
};

export const useDeleteStoreLogo = (storeId: string) => {
  return useMutation({
    mutationFn: () => api.stores.deleteStoreLogo(storeId),
  });
};

export const useDeleteStoreBanner = (storeId: string) => {
  return useMutation({
    mutationFn: () => api.stores.deleteStoreBanner(storeId),
  });
};

export const useGetDashboard = () => {
  return useQuery({
    queryKey: ['stores', 'merchant', 'dashboard'],
    queryFn: () => api.stores.getDashboard(),
    staleTime: 60000,
  });
};

export const useSetStoreStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      api.stores.setStoreStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate the stores list query
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      // Invalidate the specific store query to update the dashboard UI
      queryClient.invalidateQueries({ queryKey: ['store', variables.id] });
    },
  });
};

export const useStoreOrderAnalytics = (storeId: string) => {
  return useQuery<StoreOrderAnalyticsResponse>({
    queryKey: ['stores', storeId, 'analytics', 'orders'],
    queryFn: () => api.stores.getStoreOrderAnalytics(storeId),
    staleTime: 30000, // 30 seconds - frequent updates for real-time feel
    enabled: !!storeId,
  });
};

export const useStoreOrders = (
  storeId: string, 
  filters?: {
    status?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  return useQuery<StoreOrdersResponse>({
    queryKey: ['stores', storeId, 'orders', filters],
    queryFn: () => api.stores.getStoreOrders(storeId, filters),
    staleTime: 10000, // 10 seconds for real-time feel
    enabled: !!storeId,
  });
};
