/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCheckoutSession, useProcessPayment } from '@/hooks/api/use-checkouts';
import type { PaymentProcessingRequest } from '@/types/checkout';
import { useAuth } from '@/hooks/use-auth';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { ENV } from '@/config/env';
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Clock,
  Shield,
  CreditCard,
  User,
  Zap,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const shippingTypeConfig = {
  simple: {
    name: 'Simple',
    description: 'Delivery tradicional a tu casa',
    icon: Truck,
    tryOnTime: 'Sin tiempo de prueba',
    color: 'bg-blue-100 text-blue-800',
    cost: 0,
  },
  advanced: {
    name: 'Avanzado',
    description: 'El rider espera mientras probás',
    icon: User,
    tryOnTime: '10 minutos para probar',
    color: 'bg-purple-100 text-purple-800',
    cost: 2000,
  },
  premium: {
    name: 'Premium',
    description: 'Más tiempo para decidir con tranquilidad',
    icon: Zap,
    tryOnTime: '17 minutos para probar',
    color: 'bg-green-100 text-green-800',
    cost: 3000,
  },
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useEasyFitToast();
  const { user, isAuthenticated } = useAuth();
  const sessionId = params.id as string;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Initialize MercadoPago
  useEffect(() => {
    initMercadoPago('APP_USR-b545e130-814c-4399-99db-22e25760c4f2');
  }, []);

  // API calls
  const { data: checkoutData, isLoading, error } = useCheckoutSession(sessionId);
  const { mutateAsync: processPayment } = useProcessPayment(sessionId);

  const checkoutSession = checkoutData?.data?.checkoutSession;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !checkoutSession) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Sesión de checkout no encontrada</h3>
              <p className="text-gray-600 mb-4">La sesión de checkout no existe o ha expirado.</p>
              <Button onClick={() => router.push('/cart')} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                Volver al Carrito
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const shippingConfig = shippingTypeConfig[checkoutSession.shipping.type as keyof typeof shippingTypeConfig];
  const ShippingIcon = shippingConfig?.icon || Truck;

  // Mercado Pago configuration
  const initialization = {
    amount: checkoutSession.total,
    preferenceId: checkoutSession.preferenceId,
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all' as const,
      prepaidCard: 'all' as const,
      debitCard: 'all' as const,
      mercadoPago: 'wallet_purchase' as const,
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    setIsProcessingPayment(true);

    return new Promise(async (resolve, reject) => {
      try {
        // Map MercadoPago formData to your PaymentProcessingRequest structure
        const paymentData: PaymentProcessingRequest = {
          token: formData.token,
          issuer_id: formData.issuer_id || '',
          payment_method_id: formData.payment_method_id,
          transaction_amount: checkoutSession.total,
          selectedPaymentMethod: selectedPaymentMethod,
          payment_method_option_id: formData.payment_method_option_id || null,
          processing_mode: formData.processing_mode || null,
          installments: formData.installments || 1,
          payer: {
            email: user?.email || formData.payer?.email || '',
            identification: {
              type: formData.payer?.identification?.type || 'DNI',
              number: formData.payer?.identification?.number || '',
            },
          },
          additional_info: {
            items: checkoutSession.cartItems.map((item) => ({
              id: item.variantId,
              title: item.title,
              quantity: item.quantity,
              unit_price: item.unit_price,
            })),
            payer: {
              first_name: user?.name || formData.payer?.first_name || '',
              last_name: user?.surname || formData.payer?.last_name || '',
              phone: formData.payer?.phone || undefined,
              address: formData.payer?.address || undefined,
            },
          },
        };

        const response = await processPayment(paymentData);

        if (response.status === 'success') {
          toast.success('¡Pago procesado exitosamente!');
          // Redirect to success page or order confirmation
          router.push(`/orders/${response.data.order._id}`);
          resolve(response);
        } else {
          // Use smart error translation to get the actual backend error
          toast.paymentError(response);
          reject(new Error('Payment failed'));
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        toast.paymentError(error);
        reject(error);
      } finally {
        setIsProcessingPayment(false);
      }
    });
  };

  const onError = async (error: any) => {
    console.error('Mercado Pago Brick error:', error);
    toast.error('Error en el método de pago. Intentá nuevamente.');
    setIsProcessingPayment(false);
  };

  const onReady = async () => {
    console.log('Mercado Pago Brick is ready');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-[#DBF7DC] text-[#20313A]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Carrito
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#20313A] font-helvetica mb-2">Finalizar Compra</h1>
          <p className="text-gray-600 font-satoshi">Revisá tu pedido y completá el pago</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Section - Mercado Pago Brick */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessingPayment && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#9EE493]" />
                      <span className="text-[#20313A] font-medium">Procesando pago...</span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Payment
                    initialization={initialization}
                    customization={customization}
                    onSubmit={onSubmit}
                    onReady={onReady}
                    onError={onError}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Información de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipping Type */}
                <div className="flex items-center gap-3 p-3 bg-[#DBF7DC]/30 rounded-lg">
                  <div className="bg-[#9EE493] p-2 rounded-full">
                    <ShippingIcon className="h-4 w-4 text-[#20313A]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#20313A]">Envio {shippingConfig?.name}</h4>
                      <Badge className={shippingConfig?.color}>{checkoutSession.shipping.type.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{shippingConfig?.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{shippingConfig?.tryOnTime}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-semibold text-[#20313A] mb-2">Dirección de Entrega</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-[#20313A] font-medium">
                      {checkoutSession.shipping.address.formatted.street}{' '}
                      {checkoutSession.shipping.address.formatted.streetNumber}
                      {checkoutSession.shipping.address.formatted.apartment &&
                        `, Depto ${checkoutSession.shipping.address.formatted.apartment}`}
                      {checkoutSession.shipping.address.formatted.floor &&
                        `, Piso ${checkoutSession.shipping.address.formatted.floor}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {checkoutSession.shipping.address.formatted.city},{' '}
                      {checkoutSession.shipping.address.formatted.province}
                    </p>
                    <p className="text-sm text-gray-600">CP: {checkoutSession.shipping.address.formatted.postalCode}</p>
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Distancia:</span>
                    <span className="ml-2 font-medium text-[#20313A]">{checkoutSession.shipping.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="ml-2 font-medium text-[#20313A]">
                      {checkoutSession.shipping.durationMinutes} min
                    </span>
                  </div>
                </div>

                {/* Try-on enabled indicator */}
                {checkoutSession.shipping.tryOnEnabled && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Prueba en casa habilitada</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#20313A] font-satoshi">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({checkoutSession.cartItems.length} productos)</span>
                  <span className="font-medium">${checkoutSession.subtotal.toLocaleString('es-AR')}</span>
                </div>

                {/* Shipping Cost Breakdown */}
                {(() => {
                  const shippingTypeCost = shippingConfig?.cost || 0;
                  const totalShippingCost = checkoutSession.shipping.cost;
                  const distanceBasedCost = totalShippingCost - shippingTypeCost;

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío</span>
                        <span className="font-medium">
                          {distanceBasedCost === 0 ? 'GRATIS' : `$${distanceBasedCost.toLocaleString('es-AR')}`}
                        </span>
                      </div>

                      {shippingTypeCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tipo de envio: {shippingConfig?.name}</span>
                          <span className="font-medium">${shippingTypeCost.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-[#20313A]">Total</span>
                  <span className="text-[#20313A]">${checkoutSession.total.toLocaleString('es-AR')}</span>
                </div>

                {/* Payment Status */}
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-800 font-medium">
                      {isProcessingPayment ? 'Procesando pago...' : 'Esperando pago'}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    {isProcessingPayment
                      ? 'No cierres esta ventana mientras procesamos tu pago.'
                      : 'Completá el pago para confirmar tu pedido de prueba.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-[#DBF7DC]/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-[#9EE493] p-2 rounded-full">
                    <Shield className="h-5 w-5 text-[#20313A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#20313A] mb-2">Compra Protegida</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Solo pagás por lo que te quedás</li>
                      <li>• Devolución gratuita</li>
                      <li>• Pago 100% seguro</li>
                      <li>• Soporte 24/7</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
