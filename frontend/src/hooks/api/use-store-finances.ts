import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { PaginationOptions, FilterOptions } from '@/types/store-finance';

/**
 * Hook to fetch all store balances with pagination
 */
export const useStoreBalances = (params?: PaginationOptions) => {
  return useQuery({
    queryKey: ['admin', 'store-balances', params],
    queryFn: async () => {
      const response = await api.admin.getStoreBalances(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch balance details for a single store
 */
export const useStoreBalance = (storeId: string, enabled = true) => {
  return useQuery({
    queryKey: ['admin', 'store-balance', storeId],
    queryFn: async () => {
      const response = await api.admin.getStoreBalance(storeId);
      return response.data;
    },
    enabled: !!storeId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch detailed order financials for a store
 */
export const useStoreOrderFinancials = (storeId: string, params?: FilterOptions, enabled = true) => {
  return useQuery({
    queryKey: ['admin', 'store-orders', storeId, params],
    queryFn: async () => {
      const response = await api.admin.getStoreOrderFinancials(storeId, params);
      return response.data;
    },
    enabled: !!storeId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
