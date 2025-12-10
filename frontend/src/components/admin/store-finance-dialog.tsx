'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoreBalance, useStoreOrderFinancials } from '@/hooks/api/use-store-finances';
import { StoreOrderFinancialsList } from './store-order-financials-list';

interface StoreFinanceDialogProps {
  storeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoreFinanceDialog({ storeId, open, onOpenChange }: StoreFinanceDialogProps) {
  const { data: balance, isLoading: balanceLoading } = useStoreBalance(storeId, open);
  const { data: orderDetails, isLoading: ordersLoading } = useStoreOrderFinancials(storeId, {}, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalles Financieros - {balance?.storeName || 'Cargando...'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Banking Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Bancaria</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tipo de Cuenta</p>
                    <p className="font-medium">
                      {balance?.bankingInfo?.accountType?.toUpperCase() || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CBU/Alias</p>
                    <p className="font-medium">
                      {balance?.bankingInfo?.accountType === 'cbu'
                        ? balance?.bankingInfo?.cbu || 'No especificado'
                        : balance?.bankingInfo?.alias || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Titular</p>
                    <p className="font-medium">
                      {balance?.bankingInfo?.accountHolder || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Banco</p>
                    <p className="font-medium">
                      {balance?.bankingInfo?.bankName || 'No especificado'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Ingresos</span>
                    <span className="font-medium">
                      ${balance?.totalEarnings.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Costos de Envío</span>
                    <span>
                      -${balance?.shippingCosts.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Comisión Plataforma (10%)</span>
                    <span>
                      -${balance?.platformFee.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Balance Neto</span>
                    <span
                      className={
                        (balance?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      ${balance?.netBalance.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Pedidos ({orderDetails?.orders.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <StoreOrderFinancialsList orders={orderDetails?.orders || []} />
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
