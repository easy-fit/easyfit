'use client';

import { Button } from '@/components/ui/button';
import { StoreBalanceSummary } from '@/types/store-finance';

interface StoreBalancesListProps {
  stores: StoreBalanceSummary[];
  onSelectStore: (storeId: string) => void;
}

export function StoreBalancesList({ stores, onSelectStore }: StoreBalancesListProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay transacciones completadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {stores.map((store) => (
        <div
          key={store.storeId}
          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onSelectStore(store.storeId)}
        >
          <div className="flex-1">
            <p className="font-medium text-lg">{store.storeName}</p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Total: ${store.totalEarnings.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
              <span>Envíos: ${store.shippingCosts.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
              <span>Comisión: ${store.platformFee.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {store.totalOrders} pedido{store.totalOrders !== 1 ? 's' : ''} completado{store.totalOrders !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Balance Neto</p>
              <p
                className={`text-xl font-bold ${
                  store.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${store.netBalance.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ver Detalles
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
