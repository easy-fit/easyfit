'use client';

import * as React from 'react';
import { ChevronDown, CheckCircle2, XCircle, Package, Clock, Truck, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { StoreOrder, StoreOrderItem } from '@/types/store';
import type { OrderStatus } from '@/types/order';

// Use the real API types
export type OrderItem = StoreOrderItem;
export type Order = StoreOrder & { status: OrderStatus };

export function OrderCard({
  order,
  acceptingEnabled = true,
  onAccept,
  onReject,
}: {
  order: Order;
  acceptingEnabled?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'order_placed':
        return (
          <div className="flex items-center gap-1 text-orange-600 text-sm">
            <Clock className="h-4 w-4" /> Pendiente
          </div>
        );
      case 'order_accepted':
        return (
          <div className="flex items-center gap-1 text-green-700 text-sm">
            <CheckCircle2 className="h-4 w-4" /> Aceptada
          </div>
        );
      case 'order_canceled':
        return (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <XCircle className="h-4 w-4" /> Cancelada
          </div>
        );
      case 'pending_rider':
        return (
          <div className="flex items-center gap-1 text-blue-600 text-sm">
            <Truck className="h-4 w-4" /> Buscando repartidor
          </div>
        );
      case 'rider_assigned':
        return (
          <div className="flex items-center gap-1 text-blue-700 text-sm">
            <Truck className="h-4 w-4" /> Repartidor asignado
          </div>
        );
      case 'in_transit':
        return (
          <div className="flex items-center gap-1 text-purple-600 text-sm">
            <MapPin className="h-4 w-4" /> En camino
          </div>
        );
      case 'delivered':
        return (
          <div className="flex items-center gap-1 text-green-800 text-sm">
            <ShoppingBag className="h-4 w-4" /> Entregada
          </div>
        );
      case 'awaiting_return_pickup':
        return (
          <div className="flex items-center gap-1 text-orange-700 text-sm">
            <Package className="h-4 w-4" /> Esperando retiro
          </div>
        );
      case 'returning_to_store':
        return (
          <div className="flex items-center gap-1 text-orange-800 text-sm">
            <Truck className="h-4 w-4" /> Retornando
          </div>
        );
      case 'store_checking_returns':
        return (
          <div className="flex items-center gap-1 text-yellow-600 text-sm">
            <Package className="h-4 w-4" /> Revisando retorno
          </div>
        );
      case 'purchased':
        return (
          <div className="flex items-center gap-1 text-green-800 text-sm">
            <CheckCircle2 className="h-4 w-4" /> Comprada
          </div>
        );
      case 'returned_ok':
        return (
          <div className="flex items-center gap-1 text-blue-600 text-sm">
            <Package className="h-4 w-4" /> Devuelta OK
          </div>
        );
      case 'returned_partial':
        return (
          <div className="flex items-center gap-1 text-yellow-700 text-sm">
            <Package className="h-4 w-4" /> Devuelta parcial
          </div>
        );
      case 'returned_damaged':
        return (
          <div className="flex items-center gap-1 text-red-700 text-sm">
            <XCircle className="h-4 w-4" /> Devuelta dañada
          </div>
        );
      case 'stolen':
        return (
          <div className="flex items-center gap-1 text-red-800 text-sm">
            <XCircle className="h-4 w-4" /> Robada
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <Clock className="h-4 w-4" /> {status}
          </div>
        );
    }
  };

  const statusEl = getStatusDisplay(order.status);

  return (
    <div className="rounded-md border bg-white p-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-md bg-gray-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-[#20313A]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-[#20313A] truncate">
              {order.number} · {order.customer}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {order.items.length} {order.items.length === 1 ? 'ítem' : 'ítems'} ·{' '}
              {order.items.map((i) => i.name).join(', ')}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <Badge variant="secondary">{order.total}</Badge>
          <span className="text-xs text-muted-foreground">{order.placedAt}</span>

          {order.status === 'order_placed' ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                onClick={() => onAccept?.(order.id)}
                disabled={!acceptingEnabled}
              >
                Aceptar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onReject?.(order.id)}>
                Rechazar
              </Button>
            </div>
          ) : (
            statusEl
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Ver detalles"
            className={cn(
              'ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50 transition',
              open && 'bg-gray-50',
            )}
          >
            <ChevronDown
              className={cn('h-4 w-4 text-gray-700 transition-transform', open ? 'rotate-180' : 'rotate-0')}
            />
          </button>
        </div>
      </div>

      {/* Details */}
      {open && (
        <div className="mt-3 rounded-md border bg-gray-50 p-3">
          <div className="text-xs font-medium text-gray-600 mb-2">Productos del pedido</div>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-[#20313A]">{item.name}</div>
                  {item.variant && <div className="text-xs text-gray-600">Variante: {item.variant}</div>}
                  <div className="text-xs text-gray-600">SKU: {item.sku}</div>
                  <div className="text-xs text-gray-600">Cantidad: {item.quantity}</div>
                </div>
                <div className="text-sm font-medium text-[#20313A]">{item.price}</div>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-sm font-semibold">{order.total}</div>
          </div>
        </div>
      )}
    </div>
  );
}
