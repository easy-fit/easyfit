import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { UpdateOrderDTO, OrderCommonResponse, GetMyOrdersResponse } from '@/types/order';
import { ItemDecision } from '@/types/tryPeriod';

export const useOrders = (filters?: Record<string, unknown>) => {
  return useQuery<OrderCommonResponse>({
    queryKey: ['orders', filters],
    queryFn: () => api.orders.getOrders(),
  });
};

export const useMyOrders = (enabled: boolean = true) => {
  return useQuery<GetMyOrdersResponse>({
    queryKey: ['orders', 'my-orders'],
    queryFn: () => api.orders.getMyOrders(),
    enabled, // Only run query if enabled (user is authenticated)
  });
};

export const useOrder = (id: string) => {
  return useQuery<OrderCommonResponse>({
    queryKey: ['orders', id],
    queryFn: () => api.orders.getOrder(id),
    enabled: !!id,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: UpdateOrderDTO }) => api.orders.updateOrder(id, order),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['orders', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.orders.deleteOrder(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['orders', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useVerifyDeliveryCode = () => {
  return useMutation({
    mutationFn: ({ id, code, riderId }: { id: string; code: string; riderId: string }) =>
      api.orders.verifyDeliveryCode(id, code, riderId),
  });
};

export const useSaveDecisions = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: ItemDecision[]) => api.orders.saveDecisions(orderId, items),
    onSuccess: (data) => {
      queryClient.setQueryData(['orders', orderId], data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
