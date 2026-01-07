import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { OrderStatus } from '@/types/order';
import type {
  AvailableRider,
  OrderManagementDetails,
  ManualAssignmentResponse,
  ForceStatusResponse,
} from '@/lib/api/admin-client';

/**
 * Get available riders for manual assignment
 */
export const useAvailableRiders = (orderId: string, enabled: boolean = true) => {
  return useQuery<{ status: string; data: { riders: AvailableRider[] } }>({
    queryKey: ['admin', 'riders', orderId],
    queryFn: () => api.admin.getAvailableRiders(orderId),
    enabled: !!orderId && enabled,
  });
};

/**
 * Get order management details
 */
export const useOrderManagementDetails = (orderId: string, enabled: boolean = true) => {
  return useQuery<{ status: string; data: OrderManagementDetails }>({
    queryKey: ['admin', 'order-management', orderId],
    queryFn: () => api.admin.getOrderManagementDetails(orderId),
    enabled: !!orderId && enabled,
  });
};

/**
 * Manually assign a rider to an order
 * Optionally accepts a rider code to immediately verify delivery
 */
export const useAssignRider = () => {
  const queryClient = useQueryClient();

  return useMutation<ManualAssignmentResponse, Error, { orderId: string; riderId: string; riderCode?: string }>({
    mutationFn: ({ orderId, riderId, riderCode }) => api.admin.assignRider(orderId, riderId, riderCode),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order-management', variables.orderId] });
    },
  });
};

/**
 * Force a status transition (admin override)
 */
export const useForceStatusTransition = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ForceStatusResponse,
    Error,
    { orderId: string; status: OrderStatus; reason?: string }
  >({
    mutationFn: ({ orderId, status, reason }) => api.admin.forceStatusTransition(orderId, status, reason),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order-management', variables.orderId] });
    },
  });
};
