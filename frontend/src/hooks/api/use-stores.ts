import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { CreateStoreDTO, GetStoresResponse, UpdateStoreDTO, StoreCommonResponse } from '@/types/store';

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
