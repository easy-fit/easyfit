/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from './base-client';
import type { CreateManagerDTO, StoreManagerAssignment } from '@/types/user';
import type { MessageResponse, DataResponse } from '@/types/global';

export interface GetStoreManagersResponse {
  status: string;
  data: {
    managers: StoreManagerAssignment[];
  };
}

export interface GetManagerStoresResponse {
  status: string;
  data: {
    stores: StoreManagerAssignment[];
  };
}

export interface CreateManagerResponse {
  status: string;
  message: string;
  data: {
    user: any;
  };
}

export interface AssignManagerResponse {
  status: string;
  message: string;
  data: {
    assignment: StoreManagerAssignment;
  };
}

export interface GetManagerAssignmentResponse {
  status: string;
  data: {
    assignment: StoreManagerAssignment;
  };
}

export class StoreManagersClient extends BaseApiClient {
  // Get all managers for a specific store
  public async getStoreManagers(storeId: string): Promise<GetStoreManagersResponse> {
    return this.fetchApi<GetStoreManagersResponse>(`/store-managers/stores/${storeId}/managers`, {
      method: 'GET',
    });
  }

  // Get all stores assigned to current manager
  public async getManagerStores(): Promise<GetManagerStoresResponse> {
    return this.fetchApi<GetManagerStoresResponse>('/store-managers/my-stores', {
      method: 'GET',
    });
  }

  // Create new manager and assign to store
  public async createManager(data: CreateManagerDTO): Promise<CreateManagerResponse> {
    return this.fetchApi<CreateManagerResponse>('/auth/create-manager', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Assign existing manager to store
  public async assignManagerToStore(storeId: string, managerId: string): Promise<AssignManagerResponse> {
    return this.fetchApi<AssignManagerResponse>('/store-managers/assign', {
      method: 'POST',
      body: JSON.stringify({ storeId, managerId }),
    });
  }

  // Remove manager from store
  public async removeManagerFromStore(storeId: string, managerId: string): Promise<MessageResponse> {
    // Ensure IDs are strings
    const id = storeId.toString();
    const managerIdStr = managerId.toString();

    return this.fetchApi<MessageResponse>(`/store-managers/stores/${id}/managers/${managerIdStr}`, {
      method: 'DELETE',
    });
  }

  // Get specific manager assignment details
  public async getManagerAssignment(storeId: string, managerId: string): Promise<GetManagerAssignmentResponse> {
    // Ensure IDs are strings
    const storeIdStr = storeId.toString();
    const managerIdStr = managerId.toString();

    return this.fetchApi<GetManagerAssignmentResponse>(
      `/store-managers/stores/${storeIdStr}/managers/${managerIdStr}`,
      {
        method: 'GET',
      },
    );
  }
}
