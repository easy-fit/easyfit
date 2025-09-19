'use client';

import * as React from 'react';
import { ChevronDown, CheckCircle2, XCircle, Package, Clock, Truck, MapPin, ShoppingBag, Star, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { StoreOrder, StoreOrderItem } from '@/types/store';
import type { OrderStatus, ShippingType } from '@/types/order';

// Use the real API types
export type OrderItem = StoreOrderItem;
export type Order = StoreOrder & { status: OrderStatus };

export function OrderCard({
  order,
  acceptingEnabled = true,
  onAccept,
  onReject,
  showActions = true,
  showFullStatus = false,
  clickable = false,
  onOrderClick,
}: {
  order: Order;
  acceptingEnabled?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
  showFullStatus?: boolean;
  clickable?: boolean;
  onOrderClick?: (orderId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const getDeliveryTypeDisplay = (deliveryType?: ShippingType) => {
    if (!deliveryType) return null;

    switch (deliveryType) {
      case 'simple':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs px-2 py-1 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Simple
          </Badge>
        );
      case 'premium':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-1 flex items-center gap-1">
            <Timer className="h-3 w-3" />
            Premium
          </Badge>
        );
      case 'advanced':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Avanzado
          </Badge>
        );
      default:
        return null;
    }
  };

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
      case 'return_completed':
        return (
          <div className="flex items-center gap-1 text-gray-700 text-sm">
            <Package className="h-4 w-4" /> Devolución completada
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

  const handleCardClick = () => {
    if (clickable && onOrderClick) {
      onOrderClick(order.id);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-md border bg-white p-3",
        clickable && "cursor-pointer hover:shadow-md transition-shadow"
      )}
      onClick={clickable ? handleCardClick : undefined}
    >
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
          {getDeliveryTypeDisplay(order.deliveryType)}
          <Badge variant="secondary">{order.total}</Badge>
          <span className="text-xs text-muted-foreground">{order.placedAt}</span>

          {showActions && order.status === 'order_placed' ? (
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
            <div className="flex items-center gap-2">
              {statusEl}
              {showFullStatus && (
                <div className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
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
            {order.items.map((item) => {
              const getReturnStatusDisplay = (status: string) => {
                switch (status) {
                  case 'kept':
                    return <span className="text-green-600 text-xs font-medium">✓ Comprado</span>;
                  case 'returned':
                    return <span className="text-blue-600 text-xs font-medium">↩ Devuelto</span>;
                  case 'returned_damaged':
                    return <span className="text-orange-600 text-xs font-medium">⚠ Devuelto dañado</span>;
                  case 'stolen':
                    return <span className="text-red-600 text-xs font-medium">⚡ Robado</span>;
                  case 'undecided':
                  default:
                    return <span className="text-gray-500 text-xs font-medium">⏳ Pendiente</span>;
                }
              };

              return (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-[#20313A]">{item.name}</div>
                      {(item as any).returnStatus && getReturnStatusDisplay((item as any).returnStatus)}
                    </div>
                    {item.variant && <div className="text-xs text-gray-600">Variante: {item.variant}</div>}
                    <div className="text-xs text-gray-600">SKU: {item.sku}</div>
                    <div className="text-xs text-gray-600">Cantidad: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium text-[#20313A]">{item.price}</div>
                </div>
              );
            })}
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
