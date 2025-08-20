'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { CreateManagerDTO, StoreManagerAssignment } from '@/types/user';

// Query keys
const storeManagersKeys = {
  all: ['store-managers'] as const,
  stores: (storeId: string) => [...storeManagersKeys.all, 'store', storeId] as const,
  managers: (storeId: string) => [...storeManagersKeys.stores(storeId), 'managers'] as const,
  assignment: (storeId: string, managerId: string) => [...storeManagersKeys.stores(storeId), 'assignment', managerId] as const,
  myStores: () => [...storeManagersKeys.all, 'my-stores'] as const,
};

// Get all managers for a specific store
export const useStoreManagers = (storeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: storeManagersKeys.managers(storeId),
    queryFn: async () => {
      const response = await api.storeManagers.getStoreManagers(storeId);
      return response.data.managers;
    },
    enabled: enabled && !!storeId,
  });
};

// Get all stores assigned to current manager (for managers only)
export const useManagerStores = (enabled: boolean = true) => {
  return useQuery({
    queryKey: storeManagersKeys.myStores(),
    queryFn: async () => {
      const response = await api.storeManagers.getManagerStores();
      return response.data.stores;
    },
    enabled,
  });
};

// Get specific manager assignment details
export const useManagerAssignment = (storeId: string, managerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: storeManagersKeys.assignment(storeId, managerId),
    queryFn: async () => {
      const response = await api.storeManagers.getManagerAssignment(storeId, managerId);
      return response.data.assignment;
    },
    enabled: enabled && !!storeId && !!managerId,
  });
};

// Create new manager and assign to store
export const useCreateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateManagerDTO) => {
      return await api.storeManagers.createManager(data);
    },
    onSuccess: (response, variables) => {
      // Invalidate managers list for the store
      queryClient.invalidateQueries({
        queryKey: storeManagersKeys.managers(variables.storeId),
      });

      // Optionally add optimistic update
      queryClient.setQueryData<StoreManagerAssignment[]>(
        storeManagersKeys.managers(variables.storeId),
        (old) => {
          if (!old) return old;
          
          // Create optimistic assignment entry
          const optimisticAssignment: StoreManagerAssignment = {
            _id: response.data.user._id,
            storeId: variables.storeId,
            managerId: response.data.user._id,
            assignedBy: '', // Will be filled by server
            assignedAt: new Date(),
            isActive: true,
            manager: response.data.user,
          };

          return [...old, optimisticAssignment];
        }
      );
    },
    onError: (error) => {
      console.error('Error creating manager:', error);
    },
  });
};

// Assign existing manager to store
export const useAssignManagerToStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, managerId }: { storeId: string; managerId: string }) => {
      return await api.storeManagers.assignManagerToStore(storeId, managerId);
    },
    onSuccess: (_, variables) => {
      // Invalidate managers list for the store
      queryClient.invalidateQueries({
        queryKey: storeManagersKeys.managers(variables.storeId),
      });
      
      // Invalidate manager stores (in case the manager is currently authenticated)
      queryClient.invalidateQueries({
        queryKey: storeManagersKeys.myStores(),
      });
    },
    onError: (error) => {
      console.error('Error assigning manager to store:', error);
    },
  });
};

// Remove manager from store
export const useRemoveManagerFromStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, managerId }: { storeId: string; managerId: string }) => {
      return await api.storeManagers.removeManagerFromStore(storeId, managerId);
    },
    onMutate: async ({ storeId, managerId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: storeManagersKeys.managers(storeId),
      });

      // Snapshot the previous value
      const previousManagers = queryClient.getQueryData<StoreManagerAssignment[]>(
        storeManagersKeys.managers(storeId)
      );

      // Optimistically update to remove manager
      queryClient.setQueryData<StoreManagerAssignment[]>(
        storeManagersKeys.managers(storeId),
        (old) => {
          if (!old) return old;
          return old.filter((assignment) => assignment.managerId !== managerId);
        }
      );

      return { previousManagers };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousManagers) {
        queryClient.setQueryData(
          storeManagersKeys.managers(variables.storeId),
          context.previousManagers
        );
      }
      console.error('Error removing manager from store:', err);
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: storeManagersKeys.managers(variables.storeId),
      });
      
      // Invalidate manager stores (in case the manager is currently authenticated)
      queryClient.invalidateQueries({
        queryKey: storeManagersKeys.myStores(),
      });
    },
  });
};