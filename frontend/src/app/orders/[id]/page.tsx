'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useOrder } from '@/hooks/api/use-orders';
import { webSocketClient } from '@/lib/websocket/websocket-client';
import { useAuth } from '@/hooks/use-auth';
import { buildImageUrl } from '@/lib/utils/image-url';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, User, Shield, Star, Bike, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEasyFitToast } from '@/hooks/use-toast';
import { OrderSuccessModal } from '@/components/orders/order-success-modal';
import { TryPeriodModal } from '@/components/orders/try-period-modal';
import { TryPeriodIndicator } from '@/components/orders/try-period-indicator';
import type { OrderStatus, TryPeriodInfo } from '@/types/order';

// Status mapping for UI display
const statusMapping = {
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
};

// Shipping type configuration
const shippingTypeConfig = {
  simple: {
    name: 'Envío Simple',
    description: 'Delivery tradicional a tu casa',
    tryOnTime: 'Sin tiempo de prueba',
  },
  advanced: {
    name: 'Envío Avanzado',
    description: 'El rider espera mientras probás',
    tryOnTime: '10 minutos para probar',
  },
  premium: {
    name: 'Envío Premium',
    description: 'Más tiempo para decidir con tranquilidad',
    tryOnTime: '17 minutos para probar',
  },
};

// Helper function to get relevant status steps based on order status and shipping type
const getStatusSteps = (currentStatus: OrderStatus, shippingType: string) => {
  const baseStatuses = [statusMapping.order_placed, statusMapping.order_accepted];

  // Always include rider assignment step for all shipping types
  baseStatuses.push(statusMapping.rider_assigned, statusMapping.in_transit, statusMapping.delivered);

  // Add return flow statuses if applicable
  const returnFlowStatuses: OrderStatus[] = [
    'awaiting_return_pickup',
    'returning_to_store',
    'store_checking_returns',
    'return_completed',
  ];

  // If current status is in return flow, add all return flow steps
  if (returnFlowStatuses.includes(currentStatus)) {
    baseStatuses.push(
      statusMapping.awaiting_return_pickup,
      statusMapping.returning_to_store,
      statusMapping.store_checking_returns,
    );

    // Add final return status based on current status
    if (currentStatus === 'return_completed') {
      baseStatuses.push(statusMapping.return_completed);
    }
  } else if (currentStatus === 'purchased') {
    // For purchased status, show completed flow
    baseStatuses.push(statusMapping.purchased);
  }

  return baseStatuses;
};

function OrderTrackingPageContent() {
  const params = useParams();
  const router = useRouter();
  const toast = useEasyFitToast();
  const { user } = useAuth();
  const [codeCopied, setCodeCopied] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTryPeriodModal, setShowTryPeriodModal] = useState(false);
  const [tryPeriodData, setTryPeriodData] = useState<TryPeriodInfo | null>(null);

  const orderId = params.id as string;
  const { data: orderData, isLoading, error, refetch } = useOrder(orderId);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }, []);

  const getDeliveryTimeFrame = useCallback(() => {
    if (!orderData?.data) return '';

    const order = orderData.data;

    // If rider has real-time location, calculate dynamic ETA
    if (riderLocation && order.shipping.address.coordinates) {
      const [customerLng, customerLat] = order.shipping.address.coordinates;
      const distance = calculateDistance(riderLocation.latitude, riderLocation.longitude, customerLat, customerLng);

      // Estimate time based on distance (assuming 20 km/h average speed)
      const estimatedMinutes = Math.ceil(distance * 3); // 3 minutes per km
      const bufferMinutes = Math.max(5, Math.min(15, estimatedMinutes * 0.3)); // 30% buffer, min 5, max 15

      const now = new Date();
      const startTime = new Date(now.getTime() + estimatedMinutes * 60000);
      const endTime = new Date(now.getTime() + (estimatedMinutes + bufferMinutes) * 60000);

      const formatTimeFrame = (date: Date) => {
        return date.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      };

      return `${formatTimeFrame(startTime)} - ${formatTimeFrame(endTime)}`;
    }

    // Static calculation based on assignment time
    if (order.riderAssignment?.assignedAt) {
      const assignedTime = new Date(order.riderAssignment.assignedAt);
      const estimatedDuration = order.shipping.durationMinutes || 45;

      const startTime = new Date(assignedTime.getTime() + 5 * 60000);
      const endTime = new Date(assignedTime.getTime() + estimatedDuration * 60000);

      const formatTimeFrame = (date: Date) => {
        return date.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      };

      return `${formatTimeFrame(startTime)} - ${formatTimeFrame(endTime)}`;
    }

    // Fallback for non-assigned orders
    const now = new Date();
    const startTime = new Date(now.getTime() + 15 * 60000);
    const endTime = new Date(now.getTime() + 50 * 60000);

    const formatTimeFrame = (date: Date) => {
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };

    return `${formatTimeFrame(startTime)} - ${formatTimeFrame(endTime)}`;
  }, [orderData?.data, riderLocation, calculateDistance]);

  // Helper function to check if success modal was already shown for this order
  const hasShownSuccessModal = useCallback((orderId: string): boolean => {
    try {
      const shownOrders = localStorage.getItem('easyfit-shown-success-modals');
      if (!shownOrders) return false;
      const parsedOrders = JSON.parse(shownOrders);
      return Array.isArray(parsedOrders) && parsedOrders.includes(orderId);
    } catch {
      return false;
    }
  }, []);

  // Helper function to mark success modal as shown for this order
  const markSuccessModalShown = useCallback((orderId: string) => {
    try {
      const shownOrders = localStorage.getItem('easyfit-shown-success-modals');
      let parsedOrders: string[] = [];

      if (shownOrders) {
        parsedOrders = JSON.parse(shownOrders) || [];
      }

      if (!parsedOrders.includes(orderId)) {
        parsedOrders.push(orderId);
        localStorage.setItem('easyfit-shown-success-modals', JSON.stringify(parsedOrders));
      }
    } catch (error) {
      console.warn('Failed to save success modal state to localStorage:', error);
    }
  }, []);

  // Helper function to check if order is completed
  const isOrderCompleted = useCallback((status: OrderStatus) => {
    return ['purchased', 'return_completed', 'stolen'].includes(status);
  }, []);

  // WebSocket connection for real-time updates (only for active orders)
  useEffect(() => {
    if (orderData?.data && user) {
      const order = orderData.data;
      
      // Skip WebSocket connection for completed orders
      if (isOrderCompleted(order.status)) {
        console.log(`Order ${orderId} is completed (${order.status}), skipping WebSocket connection`);
        return;
      }

      webSocketClient.connect();
      webSocketClient.joinOrder(orderId);

      // Define event handlers
      const handleStatusUpdate = (data: any) => {
        if (data.data.order._id === orderId) {
          const newStatus = data.data.newStatus as OrderStatus;

          // Update the query cache with new status
          refetch();

          // Handle final statuses - show success modal
          if (newStatus === 'purchased' || newStatus === 'return_completed') {
            // Check if we've already shown the success modal for this order
            if (!hasShownSuccessModal(orderId)) {
              // Mark as shown and display the modal
              markSuccessModalShown(orderId);
              setShowSuccessModal(true);
            }
          } else {
            // Show regular toast for other status updates
            toast.info(`Estado actualizado: ${statusMapping[newStatus]?.label || newStatus}`);
          }
        }
      };

      const handleTrackingUpdate = (data: any) => {
        if (data.data.orderId === orderId) {
          // Update rider location for real-time tracking
          if (data.data.location) {
            setRiderLocation(data.data.location);
          }

          console.log('Delivery tracking update:', data);
          toast.info('Ubicación del repartidor actualizada');
        }
      };

      const handleTryPeriodUpdate = (data: any) => {
        if (data.data.orderId === orderId) {
          console.log('Try period update:', data);

          switch (data.data.type) {
            case 'try_period_started':
              setTryPeriodData(data.data.tryPeriod);
              setShowTryPeriodModal(true);
              toast.info('¡Período de prueba iniciado! Decide qué productos conservar.');
              break;

            case 'try_period_updated':
              setTryPeriodData(data.data.tryPeriod);
              break;

            case 'try_period_expired':
              setTryPeriodData(data.data.tryPeriod);
              toast.warning('¡Tiempo agotado! Decide rápidamente para evitar cargos adicionales.');
              break;

            case 'try_period_finalized':
              setTryPeriodData(data.data.tryPeriod);
              setShowTryPeriodModal(false);
              toast.success('Decisiones confirmadas. Procesando tu pedido...');
              refetch(); // Refresh order data
              break;
          }
        }
      };

      // Listen for events
      webSocketClient.on('order:status_update', handleStatusUpdate);
      webSocketClient.on('delivery:tracking_update', handleTrackingUpdate);
      webSocketClient.on('try_period:update', handleTryPeriodUpdate);

      return () => {
        webSocketClient.leaveOrder(orderId);
        webSocketClient.off('order:status_update', handleStatusUpdate);
        webSocketClient.off('delivery:tracking_update', handleTrackingUpdate);
        webSocketClient.off('try_period:update', handleTryPeriodUpdate);
      };
    }
  }, [orderData?.data, orderId, user, refetch, toast, hasShownSuccessModal, markSuccessModalShown, isOrderCompleted]);

  // Initialize try period data from order
  useEffect(() => {
    if (orderData?.data?.tryPeriod) {
      setTryPeriodData(orderData.data.tryPeriod);
    }
  }, [orderData?.data?.tryPeriod]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#9EE493]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData?.data) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Pedido no encontrado</h3>
              <p className="text-gray-600 mb-4">El pedido no existe o no tienes permisos para verlo.</p>
              <Button onClick={() => router.push('/orders')} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                Ver mis pedidos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const order = orderData.data;
  const statusSteps = getStatusSteps(order.status, order.shipping.type);
  const currentStatusIndex = statusSteps.findIndex((s) => s === statusMapping[order.status]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')}`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const shippingConfig = shippingTypeConfig[order.shipping.type as keyof typeof shippingTypeConfig];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-[#DBF7DC] text-[#20313A]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#20313A] font-helvetica mb-2">Seguimiento de Pedido</h1>
          <p className="text-gray-600 font-satoshi">
            Pedido #{order._id.slice(-4).toUpperCase()} • {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Horizontal Order Status Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Estado del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOrderCompleted(order.status) ? (
                  // Simplified completed status display
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[#9EE493] flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-[#20313A]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#20313A] mb-2">
                      {statusMapping[order.status]?.label}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {statusMapping[order.status]?.description}
                    </p>
                    <Badge className="bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480] mt-3">
                      Pedido Completado
                    </Badge>
                  </div>
                ) : (
                  // Regular progress tracking for active orders
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-[#9EE493] transition-all duration-300"
                        style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>

                    {/* Status Steps */}
                    <div className="relative flex justify-between">
                      {statusSteps.map((status, index) => {
                        const Icon = status.icon;
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                          <div
                            key={`${status.label}-${index}`}
                            className="flex flex-col items-center text-center max-w-[120px]"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 ${
                                isCompleted
                                  ? 'bg-[#9EE493] border-[#9EE493] text-[#20313A]'
                                  : 'bg-white border-gray-300 text-gray-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p
                                className={`text-sm font-semibold mb-1 ${
                                  isCurrent ? 'text-[#20313A]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                                }`}
                              >
                                {status.label}
                              </p>
                              <p className="text-xs text-gray-600">{status.description}</p>
                              {isCurrent && (
                                <Badge className="bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480] mt-1 text-xs">
                                  En progreso
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Try Period Indicator */}
            {tryPeriodData && (
              <TryPeriodIndicator tryPeriod={tryPeriodData} onOpenModal={() => setShowTryPeriodModal(true)} />
            )}

            {/* Products Section - Now moved up for better visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi">Productos del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden">
                      <Image
                        src={buildImageUrl(item.variantId.images?.[0].key)}
                        alt={item.variantId.productId.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#20313A] font-helvetica mb-1">{item.variantId.productId.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">
                        Talle {item.variantId.size}, {item.variantId.color}
                      </p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#20313A] font-helvetica">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} por unidad</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Compra Protegida - Moved above products */}
            <Card className="bg-[#DBF7DC]/30">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-[#9EE493] p-2 rounded-full">
                    <Shield className="h-5 w-5 text-[#20313A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#20313A] mb-2">Compra Protegida</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Solo pagás por lo que te quedás</li>
                      <li>• Devolución automatica</li>
                      <li>• Soporte 24/7</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Delivery Time Frame */}
            {['rider_assigned', 'in_transit', 'delivered'].includes(order.status) && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-6 h-6 text-[#9EE493]" />
                      <p className="text-2xl font-bold text-[#20313A] font-helvetica">{getDeliveryTimeFrame()}</p>
                      {riderLocation && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Tracking en vivo" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {riderLocation ? 'Tiempo estimado (tracking en vivo)' : 'Tiempo estimado de llegada'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Combined Verification Code and Rider Info */}
            {['rider_assigned', 'in_transit', 'delivered', 'awaiting_return_pickup'].includes(order.status) &&
              order.riderDetails && (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Verification Code */}
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-gray-600" />
                        <h3 className="font-bold text-[#20313A] font-helvetica">Código de Verificación</h3>
                      </div>
                      <div className="bg-gray-100 px-6 py-3 rounded-lg border border-gray-300">
                        <span className="text-2xl font-bold text-[#20313A] tracking-widest font-helvetica">
                          {order.deliveryVerification.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Muestra este código al repartidor</p>
                    </div>

                    <Separator />

                    {/* Rider Info */}
                    {order.riderDetails && (
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                          <Bike className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#20313A] font-helvetica text-sm">Tu Repartidor</p>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-medium text-[#20313A]">
                                {order.riderDetails.name} {order.riderDetails.surname}
                              </p>
                              {order.riderDetails.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-600">{order.riderDetails.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({order.orderItems.length} productos)</span>
                  <span className="font-medium">{formatPrice(order.total - order.shipping.cost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío ({shippingConfig?.name})</span>
                  <span className="font-medium text-[#9EE493]">
                    {order.shipping.cost === 0 ? 'GRATIS' : formatPrice(order.shipping.cost)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-[#20313A]">Total</span>
                  <span className="text-[#20313A]">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && orderData?.data && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          order={orderData.data}
        />
      )}

      {/* Try Period Modal */}
      {showTryPeriodModal && orderData?.data && tryPeriodData && (
        <TryPeriodModal
          isOpen={showTryPeriodModal}
          onClose={() => setShowTryPeriodModal(false)}
          order={orderData.data}
          tryPeriod={tryPeriodData}
          onDecisionsSubmitted={() => {
            // Modal will be closed by WebSocket event handler
            refetch();
          }}
        />
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <AuthGuard>
      <OrderTrackingPageContent />
    </AuthGuard>
  );
}
