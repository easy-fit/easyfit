'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, Info, Truck } from 'lucide-react';
import type { CompleteOrder, TryPeriodInfo } from '@/types/order';
import { OrdersClient } from '@/lib/api/orders-client';
import { toast } from 'sonner';
import { CircularTimer } from './circular-timer';
import { TryPeriodProductCard } from './try-period-product-card';
import { useTryPeriodTimer } from '@/hooks/use-try-period-timer';
import { allDecisionsMade, getDecisionCounts, createBulkDecisions, transformDecisionsForAPI } from '@/utils/try-period-decisions';

interface TryPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CompleteOrder;
  tryPeriod: TryPeriodInfo;
  onDecisionsSubmitted?: () => void;
}

export function TryPeriodModal({ isOpen, onClose, order, tryPeriod, onDecisionsSubmitted }: TryPeriodModalProps) {
  const [decisions, setDecisions] = useState<Record<string, 'keep' | 'return'>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Use actual orderItems from backend (each is now an individual physical item)
  const orderItems = order.orderItems;

  const ordersClient = useCallback(() => new OrdersClient(), []);
  
  // Timer hook for try period
  const { currentPhase, phaseTimeRemaining, phaseDuration } = useTryPeriodTimer({ 
    tryPeriod, 
    shippingType: order.shipping.type 
  });

  // Handle decision change for order items
  const handleDecisionChange = useCallback((orderItemId: string, decision: 'keep' | 'return') => {
    setDecisions((prev) => ({
      ...prev,
      [orderItemId]: decision,
    }));
    setHasChanges(true);
  }, []);

  // Bulk actions for order items
  const handleKeepAll = useCallback(() => {
    const newDecisions = createBulkDecisions(orderItems, 'keep');
    setDecisions(newDecisions);
    setHasChanges(true);
  }, [orderItems]);

  const handleReturnAll = useCallback(() => {
    const newDecisions = createBulkDecisions(orderItems, 'return');
    setDecisions(newDecisions);
    setHasChanges(true);
  }, [orderItems]);

  const handleClearAll = useCallback(() => {
    setDecisions({});
    setHasChanges(true);
  }, []);

  // Check if all decisions made for order items
  const allItemDecisionsMade = allDecisionsMade(orderItems, decisions);
  const { decisionCount, keepCount, returnCount } = getDecisionCounts(decisions);

  // Submit decisions for order items
  const handleSubmit = useCallback(async () => {
    if (!allItemDecisionsMade) {
      toast.error('Please make a decision for all items');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = transformDecisionsForAPI(orderItems, decisions);
      await ordersClient().saveDecisions(order._id, items);
      toast.success('Decisions saved successfully!');
      onDecisionsSubmitted?.();
      onClose();
    } catch (error) {
      console.error('Failed to save decisions:', error);
      toast.error('Failed to save decisions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [decisions, allItemDecisionsMade, orderItems, ordersClient, onDecisionsSubmitted, onClose]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:w-[65vw] sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-0">
        {/* Header with Circular Timer */}
        <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          {/* Mobile Layout - Stacked */}
          <div className="sm:hidden space-y-3">
            {/* Timer on top for mobile */}
            {tryPeriod.status === 'active' && (
              <div className="flex justify-center">
                <CircularTimer
                  timeRemaining={phaseTimeRemaining}
                  currentPhase={currentPhase}
                  phaseDuration={phaseDuration}
                  phaseTimeRemaining={phaseTimeRemaining}
                />
              </div>
            )}
            
            {/* Text content */}
            <div className="text-center">
              {/* Progress indicator - Mobile */}
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
                <span className="font-medium bg-white px-2 py-0.5 rounded-full">
                  {decisionCount} de {orderItems.length} decididos
                </span>
                {decisionCount > 0 && (
                  <>
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      {keepCount} conservar
                    </span>
                    <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                      {returnCount} devolver
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Side by side */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex-1 pr-8">
              <h2 className="text-2xl font-bold text-[#20313A] font-helvetica mb-2">Período de prueba</h2>
              <p className="text-gray-600 font-satoshi text-base mb-3">
                Decide qué productos te quedas y cuáles devuelves
              </p>

              {/* Progress indicator */}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-medium bg-white px-2 py-0.5 rounded-full">
                  {decisionCount} de {orderItems.length} decididos
                </span>
                {decisionCount > 0 && (
                  <>
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      {keepCount} conservar
                    </span>
                    <span className="text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                      {returnCount} devolver
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Circular Timer */}
            {tryPeriod.status === 'active' && (
              <CircularTimer
                timeRemaining={phaseTimeRemaining}
                currentPhase={currentPhase}
                phaseDuration={phaseDuration}
                phaseTimeRemaining={phaseTimeRemaining}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* Return Instructions Banner */}
          {returnCount > 0 && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 text-sm mb-1">
                    ¡Importante! Productos marcados para devolución
                  </h4>
                  <p className="text-orange-700 text-xs leading-relaxed">
                    Los productos que decidas devolver deben estar listos para ser recogidos por nuestro repartidor.
                    Manténlos en su embalaje original y en perfectas condiciones.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Info className="w-3 h-3 text-orange-600" />
                    <span className="text-xs text-orange-600 font-medium">
                      {returnCount} producto{returnCount > 1 ? 's' : ''} para devolver
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="mb-4">
            {/* Mobile - Stacked buttons */}
            <div className="flex flex-col gap-2 sm:hidden">
              <Button
                onClick={handleKeepAll}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50 font-semibold py-2 text-xs bg-transparent w-full"
              >
                <Check className="w-3 h-3 mr-1" />
                Conservar todo
              </Button>
              <Button
                onClick={handleReturnAll}
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-600 hover:bg-orange-50 font-semibold py-2 text-xs bg-transparent w-full"
              >
                <X className="w-3 h-3 mr-1" />
                Devolver todo
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50 font-semibold py-2 text-xs bg-transparent w-full"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Limpiar decisiones
              </Button>
            </div>

            {/* Desktop - Horizontal buttons */}
            <div className="hidden sm:flex gap-2">
              <Button
                onClick={handleKeepAll}
                variant="outline"
                size="lg"
                className="text-green-600 border-green-600 hover:bg-green-50 font-semibold px-3 py-1.5 text-xs bg-transparent"
              >
                <Check className="w-3 h-3 mr-1" />
                Conservar todo
              </Button>
              <Button
                onClick={handleReturnAll}
                variant="outline"
                size="lg"
                className="text-orange-600 border-orange-600 hover:bg-orange-50 font-semibold px-3 py-1.5 text-xs bg-transparent"
              >
                <X className="w-3 h-3 mr-1" />
                Devolver todo
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="lg"
                className="text-gray-600 border-gray-300 hover:bg-gray-50 font-semibold px-3 py-1.5 text-xs bg-transparent"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Limpiar decisiones
              </Button>
            </div>
          </div>

          {/* Products List - Order Item Cards */}
          <div className="space-y-3">
            {orderItems.map((item) => {
              const decision = decisions[item._id];
              
              // Group by variant to show numbering for same products
              const sameVariantItems = orderItems.filter((orderItem) => orderItem.variantId._id === item.variantId._id);
              const itemIndex = sameVariantItems.findIndex((orderItem) => orderItem._id === item._id) + 1;

              return (
                <TryPeriodProductCard
                  key={item._id}
                  item={item}
                  decision={decision}
                  onDecisionChange={handleDecisionChange}
                  sameVariantItems={sameVariantItems}
                  itemIndex={itemIndex}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100 sticky bottom-0">
          {/* Mobile Layout - Stacked */}
          <div className="sm:hidden space-y-3">
            {/* Status message */}
            <div className="text-center text-sm">
              {!allItemDecisionsMade && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium text-xs">
                    Decide sobre todos los productos para continuar
                  </span>
                </div>
              )}
              {allItemDecisionsMade && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-green-600 font-bold text-sm">¡Todas las decisiones tomadas!</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={!allItemDecisionsMade || isSubmitting}
                size="lg"
                className="w-full bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-bold py-3 text-sm"
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar decisiones'}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
                size="lg"
                className="w-full font-semibold py-3 text-sm bg-transparent"
              >
                {hasChanges ? 'Guardar y cerrar' : 'Cerrar'}
              </Button>
            </div>
          </div>

          {/* Desktop Layout - Side by side */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="text-sm">
              {!allItemDecisionsMade && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium text-xs">
                    Decide sobre todos los productos para continuar
                  </span>
                </div>
              )}
              {allItemDecisionsMade && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-green-600 font-bold text-base">¡Todas las decisiones tomadas!</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
                size="lg"
                className="font-semibold px-4 py-2 text-sm bg-transparent"
              >
                {hasChanges ? 'Guardar y cerrar' : 'Cerrar'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allItemDecisionsMade || isSubmitting}
                size="lg"
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-bold px-6 py-2 text-sm"
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar decisiones'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
