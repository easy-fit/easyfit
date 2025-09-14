'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import type { CompleteOrder } from '@/types/order';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CompleteOrder;
}

export function OrderSuccessModal({ isOpen, onClose, order }: OrderSuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  // Format price helper
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')}`;
  };

  // Utility functions for calculating different item categories
  const getKeptItems = () => {
    return order.orderItems.filter(item => item.returnStatus === 'kept');
  };

  const getReturnedItems = () => {
    return order.orderItems.filter(item => item.returnStatus === 'returned');
  };

  const getDamagedItems = () => {
    return order.orderItems.filter(item => item.returnStatus === 'returned_damaged');
  };

  const getChargedItems = () => {
    return order.orderItems.filter(item => 
      item.returnStatus === 'kept' || item.returnStatus === 'returned_damaged'
    );
  };

  const calculateItemsTotal = (items: typeof order.orderItems) => {
    return items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  };

  const calculateChargedItemsTotal = () => {
    const chargedItems = getChargedItems();
    return calculateItemsTotal(chargedItems);
  };

  // Calculate totals for different categories
  const keptItems = getKeptItems();
  const returnedItems = getReturnedItems();
  const damagedItems = getDamagedItems();
  
  const keptItemsTotal = calculateItemsTotal(keptItems);
  const damagedItemsTotal = calculateItemsTotal(damagedItems);
  const chargedItemsTotal = calculateChargedItemsTotal();
  const finalChargedAmount = chargedItemsTotal + order.shipping.cost;

  // Countdown and auto-redirect logic
  // useEffect(() => {
  //   if (!isOpen) return;

  //   const interval = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(interval);
  //         handleGoHome();
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [isOpen]);

  const handleGoHome = () => {
    onClose();
    router.push('/');
  };

  const handleViewOrders = () => {
    onClose();
    router.push('/orders');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden bg-white">
        <div className="p-6 text-center space-y-6">
          {/* Success Icon with Animation */}
          <div className="mx-auto w-16 h-16 bg-[#9EE493] rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-8 h-8 text-[#20313A]" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#20313A] font-helvetica">¡Compra completada exitosamente! 🎉</h2>
            <p className="text-gray-600 font-satoshi">Gracias por tu compra en EasyFit</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Pedido #{order._id.slice(-4).toUpperCase()} finalizado</span>
            </div>

            <div className="space-y-2">
              {/* Show kept items */}
              {keptItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {keptItems.length} {keptItems.length === 1 ? 'producto comprado' : 'productos comprados'}
                  </span>
                  <span className="font-medium text-[#20313A]">{formatPrice(keptItemsTotal)}</span>
                </div>
              )}

              {/* Show returned items (no charge) */}
              {returnedItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {returnedItems.length} {returnedItems.length === 1 ? 'producto devuelto' : 'productos devueltos'}
                  </span>
                  <span className="font-medium text-green-600">$0</span>
                </div>
              )}

              {/* Show damaged items (charged) */}
              {damagedItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    {damagedItems.length} {damagedItems.length === 1 ? 'producto devuelto' : 'productos devueltos'} (dañado{damagedItems.length === 1 ? '' : 's'}) 
                    <span className="text-amber-500">⚠️</span>
                  </span>
                  <span className="font-medium text-[#20313A]">{formatPrice(damagedItemsTotal)}</span>
                </div>
              )}

              {order.shipping.cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium text-[#20313A]">{formatPrice(order.shipping.cost)}</span>
                </div>
              )}

              <div className="border-t pt-2 flex justify-between font-semibold">
                <span className="text-[#20313A]">Total pagado</span>
                <span className="text-[#20313A]">{formatPrice(finalChargedAmount)}</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleViewOrders}
              className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-semibold py-3"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver todos mis pedidos
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Button>
          </div>

          {/* Auto-redirect countdown */}
          <p className="text-xs text-gray-500 font-satoshi">
            Redirigiendo automáticamente al inicio en {countdown} segundos...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
