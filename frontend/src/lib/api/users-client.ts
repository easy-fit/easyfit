import { Address } from '@/types/global';
import { BaseApiClient } from './base-client';
import { User, updateUserDTO, getUsersResponse, getUserResponse, CreateUserDTO, Me } from '@/types/user';

export class UsersClient extends BaseApiClient {
  public async getUsers(): Promise<getUsersResponse> {
    return this.fetchApi<getUsersResponse>('/users');
  }

  public async getUser(id: string): Promise<getUserResponse> {
    return this.fetchApi<getUserResponse>(`/users/${id}`);
  }

  public async createUser(user: CreateUserDTO): Promise<User> {
    return this.fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  public async updateUser(id: string, user: updateUserDTO): Promise<User> {
    return this.fetchApi<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
  }

  public async deleteUser(id: string): Promise<void> {
    return this.fetchApi<void>(`/users/${id}`, { method: 'DELETE' });
  }

  public async getMe(): Promise<Me> {
    return this.fetchApi<Me>('/users/me');
  }

  public async updateMe(user: Partial<updateUserDTO>): Promise<User> {
    return this.fetchApi<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
  }

  public async updateMyAddress(address: { address: Address }): Promise<User> {
    return this.fetchApi<User>('/users/me/address', {
      method: 'PATCH',
      body: JSON.stringify(address),
    });
  }
}
