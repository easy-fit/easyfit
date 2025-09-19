'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useMyOrders } from '@/hooks/api/use-orders';
import { Header } from '@/components/layout/header';
import { buildStoreAssetUrl } from '@/lib/utils/image-url';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  MapPin,
  Store,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { AuthGuard } from '@/components/auth/auth-guard';

const statusConfig = {
  order_placed: {
    label: 'Pedido Realizado',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
    description: 'Tu pedido ha sido realizado',
  },
  order_accepted: {
    label: 'Pedido Aceptado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'La tienda aceptó tu pedido',
  },
  order_canceled: {
    label: 'Pedido Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'El pedido fue cancelado',
  },
  pending_rider: {
    label: 'Buscando Repartidor',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Buscando repartidor disponible',
  },
  rider_assigned: {
    label: 'Repartidor Asignado',
    color: 'bg-blue-100 text-blue-800',
    icon: Truck,
    description: 'Un repartidor fue asignado a tu pedido',
  },
  in_transit: {
    label: 'En Tránsito',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Tu pedido está en camino',
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Pedido entregado - Período de prueba iniciado',
  },
  awaiting_return_pickup: {
    label: 'Esperando Retiro',
    color: 'bg-orange-100 text-orange-800',
    icon: Clock,
    description: 'Esperando retiro de productos devueltos',
  },
  returning_to_store: {
    label: 'Regresando a Tienda',
    color: 'bg-blue-100 text-blue-800',
    icon: Truck,
    description: 'Los productos están regresando a la tienda',
  },
  store_checking_returns: {
    label: 'Revisando Devoluciones',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Package,
    description: 'La tienda está revisando los productos devueltos',
  },
  purchased: {
    label: 'Comprado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Compra finalizada exitosamente',
  },
  return_completed: {
    label: 'Devolución Completada',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle,
    description: 'Proceso de devolución finalizado',
  },
  stolen: {
    label: 'Robado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Pedido reportado como robado',
  },
};

const paymentStatusConfig = {
  hold_placed: {
    label: 'Retención Colocada',
    description: 'Fondos retenidos hasta finalizar prueba',
  },
  paid_full_debit: {
    label: 'Pagado',
    description: 'Pago procesado exitosamente',
  },
  paid_full: {
    label: 'Pagado',
    description: 'Pago procesado exitosamente',
  },
  pending: {
    label: 'Pendiente',
    description: 'Pago pendiente de procesamiento',
  },
  failed: {
    label: 'Fallido',
    description: 'Error en el procesamiento del pago',
  },
  cancelled: {
    label: 'Reembolsado',
    description: 'Pago reembolsado',
  },
  paid_shipping_only: {
    label: 'Solo Envío Pagado',
    description: 'Pago solo del envío realizado',
  },
  paid_partial: {
    label: 'Pago Parcial',
    description: 'Pago parcial realizado',
  },
};

// Helper function to identify active orders that need tracking
const isActiveOrder = (status: string): boolean => {
  const activeStatuses = [
    'order_placed',
    'order_accepted',
    'pending_rider',
    'rider_assigned',
    'in_transit',
    'delivered',
    'awaiting_return_pickup',
    'returning_to_store',
    'store_checking_returns',
  ];
  return activeStatuses.includes(status);
};

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // API call - only fetch orders if user is authenticated
  const { data: ordersData, isLoading: ordersLoading, error } = useMyOrders(isAuthenticated);

  const isLoading = authLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Error al cargar pedidos</h3>
              <p className="text-gray-600 mb-4">Hubo un problema al obtener tus pedidos. Intentá nuevamente.</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const orders = ordersData?.data || [];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'todos') return true;
    return order.status === statusFilter;
  });

  // Find the most recent active order for tracking
  const activeOrders = orders.filter((order) => isActiveOrder(order.status));
  const mostRecentActiveOrder =
    activeOrders.length > 0
      ? activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Get unique statuses from orders for filter options
  const availableStatuses = [...new Set(orders.map((order) => order.status))];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 hover:bg-[#DBF7DC] text-[#20313A]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#20313A] font-helvetica mb-2">Mis Pedidos</h1>
            <p className="text-gray-600 font-satoshi">Seguí el estado de tus pedidos y pruebas</p>
          </div>

          {/* Active Order Tracking Card */}
          {mostRecentActiveOrder && (
            <Card className="mb-6 bg-gradient-to-r from-[#9EE493] to-[#8dd482] border-[#9EE493]">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-white p-2 md:p-3 rounded-full shadow-sm flex-shrink-0">
                      <Navigation className="h-5 w-5 md:h-6 md:w-6 text-[#20313A]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-[#20313A] mb-1">
                        Pedido Activo en Seguimiento
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Image
                          src={buildStoreAssetUrl(mostRecentActiveOrder.storeId.customization?.logoUrl)}
                          alt={mostRecentActiveOrder.storeId.name}
                          width={20}
                          height={20}
                          className="rounded-full flex-shrink-0"
                        />
                        <p className="text-[#20313A] font-medium text-sm md:text-base truncate">
                          #{mostRecentActiveOrder._id.slice(-4).toUpperCase()} • {mostRecentActiveOrder.storeId.name}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge
                          className={
                            statusConfig[mostRecentActiveOrder.status as keyof typeof statusConfig]?.color ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {statusConfig[mostRecentActiveOrder.status as keyof typeof statusConfig]?.label ||
                            mostRecentActiveOrder.status}
                        </Badge>
                        {(mostRecentActiveOrder.status === 'in_transit' ||
                          mostRecentActiveOrder.status === 'pending_rider' ||
                          mostRecentActiveOrder.status === 'rider_assigned') && (
                          <div className="flex items-center gap-1 text-[#20313A]">
                            <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="text-xs md:text-sm font-medium">Requiere seguimiento</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/orders/${mostRecentActiveOrder._id}`)}
                    className="bg-[#20313A] hover:bg-[#1a252e] text-white px-4 md:px-6 py-2 md:py-3 font-medium w-full sm:w-auto"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Seguir Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#20313A]">Filtrar por estado:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los pedidos</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusConfig[status as keyof typeof statusConfig]?.label || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} de {ordersData?.total || 0} total
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#20313A] mb-2">No hay pedidos</h3>
                  <p className="text-gray-600 mb-4">
                    {statusFilter === 'todos'
                      ? 'Aún no has realizado ningún pedido'
                      : `No tienes pedidos con este estado`}
                  </p>
                  <Button onClick={() => router.push('/')} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                    Explorar Tiendas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || {
                  label: order.status,
                  color: 'bg-gray-100 text-gray-800',
                  icon: Package,
                  description: 'Estado del pedido',
                };
                const paymentStatus = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig] || {
                  label: order.paymentStatus,
                  description: 'Estado del pago',
                };
                const StatusIcon = status.icon;
                const isExpanded = expandedOrder === order._id;

                return (
                  <Card key={order._id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Image
                              src={buildStoreAssetUrl(order.storeId.customization?.logoUrl)}
                              alt={order.storeId.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <CardTitle className="text-lg text-[#20313A] font-satoshi">
                                #{order._id.slice(-4).toUpperCase()}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Store className="h-3 w-3" />
                                {order.storeId.name} • {new Date(order.createdAt).toLocaleDateString('es-AR')}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order._id)}
                            className="hover:bg-[#DBF7DC]"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Order Summary */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-600">{status.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#20313A]">${order.total.toLocaleString('es-AR')}</p>
                          <p className="text-xs text-gray-600">{paymentStatus.description}</p>
                        </div>
                      </div>

                      {/* Contact Button */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contactar
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t pt-4 space-y-4">
                          {/* Shipping Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-[#20313A] mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Dirección de envío
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.shipping.address.formatted.street}{' '}
                                {order.shipping.address.formatted.streetNumber}
                              </p>
                              {order.shipping.address.formatted.building && (
                                <p className="text-sm text-gray-600">
                                  Edificio: {order.shipping.address.formatted.building}
                                  {order.shipping.address.formatted.floor &&
                                    `, Piso: ${order.shipping.address.formatted.floor}`}
                                  {order.shipping.address.formatted.apartment &&
                                    `, Depto: ${order.shipping.address.formatted.apartment}`}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {order.shipping.address.formatted.city}, {order.shipping.address.formatted.province}
                              </p>
                              <p className="text-sm text-gray-600">CP: {order.shipping.address.formatted.postalCode}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-[#20313A] mb-2">Información de envío</h4>
                              <p className="text-sm text-gray-600">
                                Tipo: {order.shipping.type === 'premium' ? 'Premium' : 'Estándar'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Costo: ${order.shipping.cost.toLocaleString('es-AR')}
                              </p>
                              <p className="text-sm text-gray-600">Distancia: {order.shipping.distanceKm} km</p>
                              <p className="text-sm text-gray-600">
                                Duración estimada: {order.shipping.durationMinutes} min
                              </p>
                              {order.shipping.tryOnEnabled && (
                                <p className="text-sm text-green-600">✓ Prueba habilitada</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Help Section */}
          <Card className="mt-8 bg-[#DBF7DC]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#9EE493] p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-[#20313A]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#20313A] mb-1">¿Necesitás ayuda con tu pedido?</h3>
                  <p className="text-sm text-gray-600">
                    Nuestro equipo está disponible para ayudarte con cualquier consulta sobre tus pedidos.
                  </p>
                </div>
                <Button variant="outline" className="border-[#2F4858] text-[#2F4858] hover:bg-[#DBF7DC] bg-transparent">
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
