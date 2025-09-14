'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusTimeline } from './order-status-timeline';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  CreditCard,
  Truck,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { StoreOrder } from '@/types/store';
import type { OrderStatus } from '@/types/order';

interface OrderDetailsModalProps {
  order: (StoreOrder & { status: OrderStatus }) | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate?: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderUpdate,
}: OrderDetailsModalProps) {
  const toast = useEasyFitToast();

  if (!order) return null;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.number);
    toast.success('Número de pedido copiado');
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'order_placed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'order_accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'order_canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_rider':
      case 'rider_assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'purchased':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'return_completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'stolen':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'order_placed':
        return 'Pendiente';
      case 'order_accepted':
        return 'Aceptado';
      case 'order_canceled':
        return 'Cancelado';
      case 'pending_rider':
        return 'Buscando repartidor';
      case 'rider_assigned':
        return 'Repartidor asignado';
      case 'in_transit':
        return 'En camino';
      case 'delivered':
        return 'Entregado';
      case 'awaiting_return_pickup':
        return 'Esperando retiro';
      case 'returning_to_store':
        return 'Retornando a tienda';
      case 'store_checking_returns':
        return 'Revisando retorno';
      case 'purchased':
        return 'Comprado';
      case 'return_completed':
        return 'Devolución completada';
      case 'stolen':
        return 'Robado';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-[#20313A]" />
              <div>
                <DialogTitle className="text-xl">
                  Pedido {order.number}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyOrderNumber}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  Realizado el {formatDateTime(order.createdAt)}
                </DialogDescription>
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline currentStatus={order.status} />
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{order.customer}</span>
              </div>
              {/* Add more customer details if available from API */}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos ({order.items.length} {order.items.length === 1 ? 'ítem' : 'ítems'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id || index} className="flex items-start justify-between py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-[#20313A]">{item.name}</div>
                      {item.variant && (
                        <div className="text-sm text-gray-600 mt-1">
                          Variante: {item.variant}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>SKU: {item.sku}</span>
                        <span>Cantidad: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.price}</div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium">Total del Pedido</span>
                  <span className="text-lg font-bold text-[#20313A]">{order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Número de pedido:</span>
                  <p className="font-medium">{order.number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Fecha de pedido:</span>
                  <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Estado actual:</span>
                  <p className="font-medium">{getStatusText(order.status)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total:</span>
                  <p className="font-medium">{order.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {order.status === 'order_placed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                    onClick={() => {
                      onOrderUpdate?.(order.id, 'order_accepted');
                      toast.success('Pedido aceptado');
                    }}
                  >
                    Aceptar Pedido
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOrderUpdate?.(order.id, 'order_canceled');
                      toast.success('Pedido rechazado');
                    }}
                  >
                    Rechazar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}