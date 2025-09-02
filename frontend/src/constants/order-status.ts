import { Package, CheckCircle, Clock, User, Truck, Shield } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

// Status mapping for UI display
export const statusMapping = {
  order_placed: { label: 'Pedido realizado', icon: Package, description: 'Esperando aprobacion de la tienda' },
  order_accepted: {
    label: 'Confirmado por la tienda',
    icon: CheckCircle,
    description: 'La tienda esta preparando tu pedido',
  },
  pending_rider: { label: 'Buscando repartidor', icon: Clock, description: 'Asignando repartidor' },
  rider_assigned: { label: 'Repartidor asignado', icon: User, description: 'Un repartidor tomó tu pedido' },
  in_transit: { label: 'En camino', icon: Truck, description: 'Tu pedido está en camino' },
  delivered: { label: 'Entregado', icon: CheckCircle, description: 'Pedido entregado exitosamente' },
  // Additional statuses
  order_canceled: { label: 'Cancelado', icon: Package, description: 'Pedido cancelado' },
  awaiting_return_pickup: {
    label: 'Devolucion de productos',
    icon: Package,
    description: 'Esperando retiro de productos',
  },
  returning_to_store: { label: 'Regresando a tienda', icon: Truck, description: 'Productos regresando a la tienda' },
  store_checking_returns: {
    label: 'Revisando devolución',
    icon: CheckCircle,
    description: 'La tienda revisa los productos',
  },
  purchased: { label: 'Comprado', icon: CheckCircle, description: 'Compra finalizada' },
  return_completed: {
    label: 'Devolución completada',
    icon: CheckCircle,
    description: 'Proceso de devolución finalizado',
  },
  stolen: { label: 'Robado', icon: Shield, description: 'Pedido reportado como robado' },
} as const;

// Completed order statuses
export const COMPLETED_ORDER_STATUSES: OrderStatus[] = ['purchased', 'return_completed', 'stolen'];

// Return flow statuses
export const RETURN_FLOW_STATUSES: OrderStatus[] = [
  'awaiting_return_pickup',
  'returning_to_store',
  'store_checking_returns',
  'return_completed',
];