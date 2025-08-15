'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { StoreNotFound } from '@/components/404/store-not-found';
import { StoreProvider, useStoreContext } from '@/contexts/store-context';

interface StoreLayoutProps {
  children: React.ReactNode;
}

// Inner component that consumes the store context
function StoreLayoutContent({ children }: StoreLayoutProps) {
  const { store, isLoading, error } = useStoreContext();

  // Handle loading state
  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
            <p className="text-gray-600">Cargando tienda...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Handle error state (store not found)
  if (error || !store) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <StoreNotFound
            title="Tienda no encontrada"
            description="La tienda que estás buscando no existe o no tienes permisos para acceder a ella."
            showCreateStore={true}
          />
        </div>
      </AuthGuard>
    );
  }

  // Store exists, render children
  return <AuthGuard>{children}</AuthGuard>;
}

// Main layout component that provides store context
export default function StoreLayout({ children }: StoreLayoutProps) {
  const { id } = useParams() as { id: string };

  return (
    <StoreProvider storeId={id}>
      <StoreLayoutContent>{children}</StoreLayoutContent>
    </StoreProvider>
  );
}
