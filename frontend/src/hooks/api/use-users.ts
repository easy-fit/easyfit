import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { CreateUserDTO, updateUserDTO } from '@/types/user';
import type { Address } from '@/types/global';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getUsers(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.users.getUser(id),
  });
}

// USER CRUD ONLY BY ADMIN (REGISTER/LOGIN IS HANDLED BY AUTH)
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: CreateUserDTO) => api.users.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: updateUserDTO) => api.users.updateUser(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
}

export function useDeleteUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.users.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.removeQueries({ queryKey: ['user', id] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.users.getMe(),
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: Partial<updateUserDTO>) => api.users.updateMe(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdateMyAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (address: Address) => api.users.updateMyAddress({ address: address }),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
