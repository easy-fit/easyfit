import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { GetCartItemsResponse, CreateCartItemDTO, UpdateCartItemDTO } from '@/types/cart';

export const useCartItems = () => {
  return useQuery<GetCartItemsResponse>({
    queryKey: ['cart'],
    queryFn: () => api.cart.getCartItems(),
    staleTime: 60000,
  });
};

export const useCreateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCartItemDTO) => api.cart.createCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCartItemDTO }) => api.cart.updateCartItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cart.deleteCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCleanCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.cart.cleanCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
