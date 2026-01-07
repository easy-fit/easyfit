'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderFinancialDetail } from '@/types/store-finance';
import { OrderStatus } from '@/types/order';

interface StoreOrderFinancialsListProps {
  orders: OrderFinancialDetail[];
}

const getStatusInfo = (
  status: OrderStatus
): { color: 'default' | 'secondary' | 'destructive' | 'outline'; label: string } => {
  switch (status) {
    case 'delivered':
      return { color: 'default', label: 'Entregado' };
    case 'purchased':
      return { color: 'default', label: 'Comprado' };
    case 'order_placed':
      return { color: 'secondary', label: 'Pendiente' };
    case 'pending_rider':
      return { color: 'secondary', label: 'Buscando Repartidor' };
    case 'rider_assigned':
      return { color: 'outline', label: 'Repartidor Asignado' };
    case 'in_transit':
      return { color: 'outline', label: 'En Tránsito' };
    case 'order_canceled':
      return { color: 'destructive', label: 'Cancelado' };
    case 'stolen':
      return { color: 'destructive', label: 'Extraviado' };
    case 'awaiting_return_pickup':
      return { color: 'secondary', label: 'Esperando Retiro' };
    case 'returning_to_store':
      return { color: 'outline', label: 'Volviendo a Tienda' };
    case 'store_checking_returns':
      return { color: 'outline', label: 'Revisando Devoluciones' };
    case 'return_completed':
      return { color: 'default', label: 'Devolución Completa' };
    default:
      return { color: 'outline', label: status.replace('_', ' ') };
  }
};

export function StoreOrderFinancialsList({ orders }: StoreOrderFinancialsListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay pedidos completados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        return (
          <div key={order.orderId} className="p-3 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">Pedido #{order.orderId.slice(-8)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.orderDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Cliente: {order.customerName}</p>
              </div>
              <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Capturado</p>
                <p className="font-medium">
                  ${order.capturedAmount.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Reembolsado</p>
                <p className="font-medium text-red-600">
                  ${order.refundedAmount.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Envío</p>
                <p className="font-medium">
                  ${order.shippingCost.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  {order.shippingSubsidizedBy === 'merchant' && (
                    <span className="text-xs text-red-600"> (tienda)</span>
                  )}
                  {order.shippingSubsidizedBy === 'platform' && (
                    <span className="text-xs text-green-600"> (plataforma)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Comisión</p>
                <p className="font-medium">
                  ${order.platformFee.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Neto a Tienda</span>
              <span
                className={`font-bold ${
                  order.netToStore >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${order.netToStore.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
