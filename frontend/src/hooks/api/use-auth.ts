'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api/client';
import type { LoginCredentials, RegisterCustomerDTO, RegisterMerchantDTO, VerifyEmailResponse } from '@/types/auth';
import type { MessageResponse, DataResponse } from '@/types/global';

export const useLogin = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await login(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
    },
  });
};

export const useRegisterCustomer = () => {
  const { registerCustomer } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterCustomerDTO) => {
      await registerCustomer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Customer registration failed:', error);
    },
  });
};

export const useRegisterMerchant = () => {
  const { registerMerchant } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterMerchantDTO) => {
      await registerMerchant(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Merchant registration failed:', error);
    },
  });
};

export const useVerifyEmail = () => {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string): Promise<VerifyEmailResponse> => {
      return api.auth.verifyEmail(code);
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Email verification failed:', error);
    },
  });
};

export const useResendVerificationCode = () => {
  return useMutation({
    mutationFn: async (): Promise<VerifyEmailResponse> => {
      return api.auth.resendVerificationCode();
    },
    onError: (error: Error) => {
      console.error('Resend verification code failed:', error);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string): Promise<MessageResponse> => {
      return api.auth.forgotPassword(email);
    },
    onError: (error: Error) => {
      console.error('Forgot password failed:', error);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ code, password }: { code: string; password: string }) => {
      return api.auth.resetPassword(code, password);
    },
    onError: (error: Error) => {
      console.error('Password reset failed:', error);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      return api.auth.updatePassword(currentPassword, newPassword);
    },
    onError: (error: Error) => {
      console.error('Password update failed:', error);
    },
  });
};

export const useCreateSumsubApplicant = () => {
  return useMutation({
    mutationFn: async (): Promise<DataResponse> => {
      return api.auth.createSumsubApplicant();
    },
    onError: (error: Error) => {
      console.error('Create Sumsub applicant failed:', error);
    },
  });
};

export const useCreateSumsubSessionLink = () => {
  return useMutation({
    mutationFn: async (): Promise<DataResponse> => {
      return api.auth.createSumsubSessionLink();
    },
    onError: (error: Error) => {
      console.error('Create Sumsub session link failed:', error);
    },
  });
};

export const useRefreshUser = () => {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await refreshUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Refresh user failed:', error);
    },
  });
};
