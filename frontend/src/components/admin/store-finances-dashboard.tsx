'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoreBalances } from '@/hooks/api/use-store-finances';
import { StoreBalancesList } from './store-balances-list';
import { StoreFinanceDialog } from './store-finance-dialog';
import { DollarSign, Store, TrendingUp } from 'lucide-react';

export function StoreFinancesDashboard() {
  const { data, isLoading } = useStoreBalances();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Calculate summary metrics
  const totalPlatformFees = data?.stores.reduce((sum, store) => sum + store.platformFee, 0) || 0;
  const totalOwedToStores = data?.stores.reduce((sum, store) => sum + store.netBalance, 0) || 0;
  const totalEarnings = data?.stores.reduce((sum, store) => sum + store.totalEarnings, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Plataforma</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPlatformFees.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">10% de ingresos totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto Tiendas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalOwedToStores.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">Total a pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalEarnings.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.stores.length || 0} tiendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store List */}
      <Card>
        <CardHeader>
          <CardTitle>Balance de Tiendas</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreBalancesList stores={data?.stores || []} onSelectStore={setSelectedStoreId} />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedStoreId && (
        <StoreFinanceDialog
          storeId={selectedStoreId}
          open={!!selectedStoreId}
          onOpenChange={() => setSelectedStoreId(null)}
        />
      )}
    </div>
  );
}
