import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  CheckoutCommonResponse,
  CreateCheckoutSessionDTO,
  UpdateCheckoutSessionDTO,
  PaymentProcessingRequest,
} from '@/types/checkout';

export const useCheckoutSessions = () => {
  return useQuery({
    queryKey: ['checkoutSessions'],
    queryFn: () => api.checkout.getCheckoutSessions(),
    staleTime: 60000,
  });
};

export const useCheckoutSession = (id: string) => {
  return useQuery<CheckoutCommonResponse>({
    queryKey: ['checkoutSession', id],
    queryFn: () => api.checkout.getCheckoutSessionById(id),
  });
};

export const useCreateCheckoutSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionDTO) => api.checkout.createCheckoutSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkoutSessions'] });
    },
  });
};

export const useUpdateCheckoutSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCheckoutSessionDTO }) =>
      api.checkout.updateCheckoutSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkoutSessions'] });
    },
  });
};

export const useProcessPayment = (id: string) => {
  return useMutation({
    mutationFn: (data: PaymentProcessingRequest) => api.checkout.processPayment(data, id),
  });
};
