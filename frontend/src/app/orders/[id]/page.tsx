'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useOrder } from '@/hooks/api/use-orders';
import { useAuth } from '@/hooks/use-auth';
import { buildImageUrl } from '@/lib/utils/image-url';
import { ArrowLeft, Clock, Star, Bike, Loader2, Package } from 'lucide-react';
import Image from 'next/image';
import { OrderSuccessModal } from '@/components/orders/order-success-modal';
import { TryPeriodModal } from '@/components/orders/try-period-modal';
import { TryPeriodIndicator } from '@/components/orders/try-period-indicator';
import { OrderStatusProgress } from '@/components/orders/order-status-progress';
import { DeliveryInfoCard } from '@/components/orders/delivery-info-card';
import { CollapsibleProductsSection } from '@/components/orders/collapsible-products-section';
import { useOrderWebSocket } from '@/hooks/use-order-websocket';
import { useSuccessModalState } from '@/hooks/use-success-modal-state';
import { useDeliveryTimeFrame } from '@/hooks/use-delivery-timeframe';
import { formatPrice, formatDate } from '@/utils/formatters';
import { shippingTypeConfig } from '@/constants/shipping-config';
import type { TryPeriodInfo } from '@/types/order';

function OrderTrackingPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTryPeriodModal, setShowTryPeriodModal] = useState(false);
  const [tryPeriodData, setTryPeriodData] = useState<TryPeriodInfo | null>(null);

  const orderId = params.id as string;
  const { data: orderData, isLoading, error, refetch } = useOrder(orderId);
  const { hasShownSuccessModal, markSuccessModalShown } = useSuccessModalState();

  // Delivery time frame hook
  const { getDeliveryTimeFrame } = useDeliveryTimeFrame({
    order: orderData?.data || null,
    riderLocation,
  });

  // WebSocket connection for real-time updates
  useOrderWebSocket({
    order: orderData?.data || null,
    orderId,
    user,
    onStatusUpdate: refetch,
    onRiderLocationUpdate: setRiderLocation,
    onTryPeriodUpdate: (data) => {
      setTryPeriodData(data);
      // Close modal when try period is finalized
      if (data.status === 'finalized') {
        setShowTryPeriodModal(false);
      }
    },
    onShowTryPeriodModal: () => setShowTryPeriodModal(true),
    onShowSuccessModal: () => setShowSuccessModal(true),
    hasShownSuccessModal,
    markSuccessModalShown,
  });

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
  const shippingConfig = shippingTypeConfig[order.shipping.type];

  // Check if this is an active delivery (rider assigned and order in progress)
  const isActiveDelivery = ['rider_assigned', 'in_transit', 'delivered', 'awaiting_return_pickup'].includes(
    order.status,
  );

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-6 order-1">
            {/* Order Status Progress */}
            <OrderStatusProgress
              status={order.status}
              shippingType={order.shipping.type}
              deliveryTimeFrame={isActiveDelivery ? getDeliveryTimeFrame() : undefined}
              isActiveDelivery={isActiveDelivery}
            />

            {/* Try Period Indicator - Mobile: Right after status bar */}
            {tryPeriodData && (
              <div className="lg:hidden">
                <TryPeriodIndicator
                  tryPeriod={tryPeriodData}
                  onOpenModal={() => setShowTryPeriodModal(true)}
                  shippingType={order.shipping.type}
                />
              </div>
            )}

            {/* Priority Delivery Info for Mobile - Only shown during active delivery */}
            {isActiveDelivery && (
              <DeliveryInfoCard
                order={order}
                deliveryTimeFrame={getDeliveryTimeFrame()}
                riderLocation={riderLocation}
              />
            )}

            {/* Try Period Indicator - Desktop: Original position */}
            {tryPeriodData && (
              <div className="hidden lg:block">
                <TryPeriodIndicator
                  tryPeriod={tryPeriodData}
                  onOpenModal={() => setShowTryPeriodModal(true)}
                  shippingType={order.shipping.type}
                />
              </div>
            )}

            {/* Products Section - Collapsible on mobile during active delivery */}
            <CollapsibleProductsSection order={order} isActiveDelivery={isActiveDelivery} />

            {/* Compra Protegida - Hidden on mobile, shown on desktop */}
            <Card className="bg-[#DBF7DC]/30 hidden lg:block">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-[#9EE493] p-2 rounded-full">
                    <Package className="h-5 w-5 text-[#20313A]" />
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

          <div className="space-y-6 order-2">
            {/* Combined Verification Code and Rider Info - Desktop Only */}
            {['rider_assigned', 'in_transit', 'delivered', 'awaiting_return_pickup'].includes(order.status) &&
              order.riderDetails && (
                <Card className="hidden lg:block">
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

          {/* Compra Protegida - Shown at bottom on mobile, hidden on desktop */}
          <div className="lg:hidden order-3">
            <Card className="bg-[#DBF7DC]/30">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-[#9EE493] p-2 rounded-full">
                    <Package className="h-5 w-5 text-[#20313A]" />
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
