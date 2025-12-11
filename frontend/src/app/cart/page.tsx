/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartItems, useUpdateCartItem, useDeleteCartItem } from '@/hooks/api/use-cart';
import { useCreateCheckoutSession } from '@/hooks/api/use-checkouts';
import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Truck, Clock, Shield, Package, Zap, User } from 'lucide-react';
import Image from 'next/image';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { CartItem } from '@/types/cart';
import type { ShippingType } from '@/types/order';
import { buildImageUrl } from '@/lib/utils/image-url';
import { formatPrice } from '@/utils/formatters';

interface ShippingOption {
  id: ShippingType;
  name: string;
  description: string;
  price: number;
  tryOnTime: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const shippingOptions: ShippingOption[] = [
  {
    id: 'simple',
    name: 'Envío Simple',
    description: 'Delivery tradicional a tu casa',
    price: 0,
    tryOnTime: 'Sin tiempo de prueba',
    icon: Truck,
    features: ['Entrega en tu domicilio'],
  },
  {
    id: 'advanced',
    name: 'Envío Avanzado',
    description: 'El rider espera mientras probás',
    price: 2000,
    tryOnTime: '10 minutos para probar',
    icon: User,
    features: ['Rider espera afuera', '10 minutos de prueba', 'Devolución inmediata'],
  },
  {
    id: 'premium',
    name: 'Envío Premium',
    description: 'Más tiempo para decidir con tranquilidad',
    price: 3000,
    tryOnTime: '17 minutos para probar',
    icon: Zap,
    features: ['Rider espera afuera', '17 minutos de prueba', 'Devolución inmediata', 'Servicio prioritario'],
  },
];

export default function CartPage() {
  return (
    <AuthGuard>
      <CartPageContent />
    </AuthGuard>
  );
}

function CartPageContent() {
  const router = useRouter();
  const toast = useEasyFitToast();
  const { user, isAuthenticated } = useAuth();
  const [selectedShipping, setSelectedShipping] = useState<ShippingType>('simple');

  // API calls - user is guaranteed to be authenticated here due to AuthGuard
  const { data: cartData, isLoading, error } = useCartItems();
  const updateCartItemMutation = useUpdateCartItem();
  const deleteCartItemMutation = useDeleteCartItem();
  const createCheckoutSessionMutation = useCreateCheckoutSession();

  const cartItems = React.useMemo(() => cartData?.data?.cartItems || [], [cartData]);

  // Check if any product restricts shipping types
  const allowedShippingTypes = React.useMemo(() => {
    if (cartItems.length === 0) return ['simple', 'advanced', 'premium'] as ShippingType[];

    // Start with all types allowed
    let allowed: ShippingType[] = ['simple', 'advanced', 'premium'];

    // For each cart item, intersect with its allowed types
    cartItems.forEach((item: CartItem) => {
      const product = item.variantId?.productId;
      if (product && product.allowedShippingTypes && product.allowedShippingTypes.length > 0) {
        allowed = allowed.filter((type) => product.allowedShippingTypes!.includes(type));
      }
    });

    return allowed;
  }, [cartItems]);

  // Check if current selection is still valid, if not switch to simple
  React.useEffect(() => {
    if (!allowedShippingTypes.includes(selectedShipping)) {
      setSelectedShipping('simple');
    }
  }, [allowedShippingTypes, selectedShipping]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItemMutation.mutateAsync({
        id: itemId,
        data: { quantity: newQuantity },
      });
      toast.success('Cantidad actualizada');
    } catch (error) {
      toast.quantityUpdateError(error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await deleteCartItemMutation.mutateAsync(itemId);
      toast.success('Producto eliminado del carrito');
    } catch (error: any) {
      toast.smartError(error, 'Error al eliminar el producto');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.authError({ message: 'Debes iniciar sesión para continuar' });
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.validationError('carrito', 'Tu carrito está vacío');
      return;
    }

    try {
      const response = await createCheckoutSessionMutation.mutateAsync({
        shippingType: selectedShipping,
      });

      toast.success('¡Sesión de checkout creada exitosamente!');

      // Redirect to checkout page with the session ID
      if (response.data?.checkoutSession?._id) {
        router.push(`/checkout/${response.data.checkoutSession._id}`);
      } else {
        // Fallback to general checkout page
        router.push('/checkout');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.smartError(error, 'Error al crear la sesión de checkout');
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.variantId?.price) return sum;
    
    const price = item.variantId.price;
    const discount = item.variantId.discount || 0;
    const finalPrice = discount > 0 
      ? price - (price * discount / 100) 
      : price;

    return sum + finalPrice * item.quantity;
  }, 0);
  const selectedShippingOption = shippingOptions.find((option) => option.id === selectedShipping)!;
  const shippingCost = selectedShippingOption.price;
  const total = subtotal + shippingCost;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Error al cargar el carrito</h3>
              <p className="text-gray-600 mb-4">Hubo un problema al obtener tus productos.</p>
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

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-[#DBF7DC] text-[#20313A]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Seguir comprando
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#20313A] font-helvetica mb-2">Tu Carrito</h1>
          <p className="text-gray-600 font-satoshi">
            {totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'} para probar en casa
          </p>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#20313A] mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-600 mb-4">Agregá productos para empezar a probar en casa</p>
              <Button onClick={() => router.push('/')} className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]">
                Explorar Productos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItem) => {
                // Skip items with null/undefined variantId
                if (!item.variantId) return null;

                const primaryImage = item.variantId.images.find((img) => img.order === 1) || item.variantId.images[0];
                const imageUrl = primaryImage ? `/${primaryImage.key}` : '/placeholder.svg';

                return (
                  <Card
                    key={item._id}
                    className="overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <Image
                            src={buildImageUrl(imageUrl) || '/placeholder.svg'}
                            alt={primaryImage?.altText || item.variantId.productId.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 96px"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-[#20313A] text-base sm:text-lg font-helvetica mb-1 truncate">
                                {item.variantId.productId.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
                                <span>
                                  Talle <strong className="text-[#20313A]">{item.variantId.size}</strong>
                                </span>
                                <div className="flex items-center gap-1">
                                  <span>Color</span>
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: item.variantId.color }}
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={deleteCartItemMutation.isPending}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>

                          {/* Price and Quantity - Responsive Layout */}
                          <div className="space-y-3 sm:space-y-0">
                            {/* Price */}
                            <div className="text-right sm:mb-3">
                            <div className="flex flex-col items-end">
                              {(item.variantId.discount || 0) > 0 ? (
                                <>
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatPrice((item.variantId.price || 0) * item.quantity)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-red-600 text-white text-[10px] px-1 py-0.5 rounded font-medium">
                                      {item.variantId.discount}% OFF
                                    </span>
                                    <p className="text-lg sm:text-xl font-bold text-[#20313A] font-helvetica">
                                      {formatPrice(
                                        (item.variantId.price - (item.variantId.price * item.variantId.discount!) / 100) * item.quantity
                                      )}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-lg sm:text-xl font-bold text-[#20313A] font-helvetica">
                                  {formatPrice((item.variantId.price || 0) * item.quantity)}
                                </p>
                              )}
                            </div>

                            {item.quantity > 1 && item.variantId.price && (
                              <p className="text-xs sm:text-sm text-gray-500">
                                {(item.variantId.discount || 0) > 0 
                                  ? `${formatPrice(item.variantId.price - (item.variantId.price * item.variantId.discount!) / 100)} por unidad`
                                  : `${formatPrice(item.variantId.price)} por unidad`
                                }
                              </p>
                            )}
                          </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between sm:justify-start gap-3">
                              <span className="text-sm text-gray-600 flex-shrink-0">Cantidad:</span>
                              <div className="flex items-center bg-[#F7F7F7] rounded-lg border">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updateCartItemMutation.isPending}
                                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-[#DBF7DC]"
                                >
                                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <span className="w-10 sm:w-12 text-center font-semibold text-[#20313A] text-sm sm:text-base">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                  disabled={updateCartItemMutation.isPending}
                                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-[#DBF7DC]"
                                >
                                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Shipping Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#20313A] font-satoshi flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Opciones de Envío EasyFit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allowedShippingTypes.length < 3 && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800">
                        Algunos productos en tu carrito solo permiten envío simple (ej: perfumes, skincare, accesorios
                        no probables)
                      </p>
                    </div>
                  )}
                  {shippingOptions.map((option) => {
                    const Icon = option.icon;
                    const isDisabled = !allowedShippingTypes.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                            : selectedShipping === option.id
                            ? 'border-[#9EE493] bg-[#DBF7DC]/30 shadow-sm cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
                        }`}
                        onClick={() => !isDisabled && setSelectedShipping(option.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              selectedShipping === option.id ? 'bg-[#9EE493]' : 'bg-[#DBF7DC]'
                            }`}
                          >
                            <Icon className="h-4 w-4 text-[#20313A]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-[#20313A]">{option.name}</h4>
                              <span className="font-bold text-[#20313A]">
                                {option.price === 0 ? 'GRATIS' : `$${option.price.toLocaleString('es-AR')}`}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                            <div className="flex items-center gap-1 mb-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs font-medium text-[#20313A]">{option.tryOnTime}</span>
                            </div>
                            <div className="space-y-1">
                              {option.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-[#9EE493] rounded-full" />
                                  <span className="text-xs text-gray-600">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#20313A] font-satoshi">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems.length} productos)</span>
                    <span className="font-medium">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío ({selectedShippingOption.name})</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-[#20313A]">Total</span>
                    <span className="text-[#20313A]">${total.toLocaleString('es-AR')}</span>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    size="lg"
                    onClick={handleCheckout}
                    disabled={createCheckoutSessionMutation.isPending || cartItems.length === 0}
                    className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold h-12 mt-6"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    {createCheckoutSessionMutation.isPending ? 'Creando sesión...' : 'Continuar al Checkout'}
                  </Button>

                  {/* Security Info */}
                  <div className="bg-blue-50 p-3 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-800 font-medium">Compra 100% segura</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Solo se cobrará por los productos que decidas quedarte después de probarlos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
