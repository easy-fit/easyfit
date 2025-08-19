/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useStore, useStoreAccess } from '@/hooks/api/use-stores';
import { Store } from '@/types/store';

interface StoreContextValue {
  store: Store | null;
  isLoading: boolean;
  error: any;
  access: {
    hasAccess: boolean;
    accessType: 'owner' | 'manager' | 'none';
    isOwner: boolean;
    isManager: boolean;
    managerAssignment?: any;
  } | null;
  accessLoading: boolean;
  accessError: any;
}

const StoreContext = createContext<StoreContextValue | null>(null);

interface StoreProviderProps {
  storeId: string;
  children: ReactNode;
}

export function StoreProvider({ storeId, children }: StoreProviderProps) {
  const { data: storeData, isLoading: storeLoading, error: storeError } = useStore(storeId);
  const { data: accessData, isLoading: accessLoading, error: accessError } = useStoreAccess(storeId);

  const value: StoreContextValue = {
    store: storeData?.data || null,
    isLoading: storeLoading,
    error: storeError,
    access: accessData?.data || null,
    accessLoading,
    accessError,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreContext() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }

  return context;
}

// Custom hook for easier access to store data
export function useCurrentStore() {
  const { store, isLoading, error, access, accessLoading, accessError } = useStoreContext();

  return {
    store,
    isLoading: isLoading || accessLoading,
    error: error || accessError,
    storeName: store?.name,
    logoUrl: store?.customization?.logoUrl,
    storeStatus: store?.status || 'inactive',
    isActive: store?.status === 'active',
    // Access information
    access,
    hasAccess: access?.hasAccess || false,
    accessType: access?.accessType || 'none',
    isOwner: access?.isOwner || false,
    isManager: access?.isManager || false,
    managerAssignment: access?.managerAssignment,
    // Convenience flags
    canManageStore: access?.isOwner || false, // Only owners can manage store settings
    canOperateStore: access?.hasAccess || false, // Both owners and managers can operate
  };
}
