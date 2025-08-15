/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useStore } from '@/hooks/api/use-stores';
import { Store } from '@/types/store';

interface StoreContextValue {
  store: Store | null;
  isLoading: boolean;
  error: any;
}

const StoreContext = createContext<StoreContextValue | null>(null);

interface StoreProviderProps {
  storeId: string;
  children: ReactNode;
}

export function StoreProvider({ storeId, children }: StoreProviderProps) {
  const { data, isLoading, error } = useStore(storeId);

  const value: StoreContextValue = {
    store: data?.data || null,
    isLoading,
    error,
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
  const { store, isLoading, error } = useStoreContext();

  return {
    store,
    isLoading,
    error,
    storeName: store?.name,
    logoUrl: store?.customization?.logoUrl,
    storeStatus: store?.status || 'inactive',
    isActive: store?.status === 'active',
  };
}
