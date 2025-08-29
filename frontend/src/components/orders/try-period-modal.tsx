'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Check, X, RotateCcw, Info, Truck } from 'lucide-react';
import type { CompleteOrder, ItemDecision, TryPeriodInfo } from '@/types/order';
import { OrdersClient } from '@/lib/api/orders-client';
import { buildImageUrl } from '@/lib/utils/image-url';
import { toast } from 'sonner';
import Image from 'next/image';

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

  // Calculate time remaining
  useEffect(() => {
    if (!tryPeriod.endsAt || tryPeriod.status !== 'active') return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(tryPeriod.endsAt!).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [tryPeriod.endsAt, tryPeriod.status]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

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
    const newDecisions: Record<string, 'keep' | 'return'> = {};
    orderItems.forEach((item) => {
      newDecisions[item._id] = 'keep';
    });
    setDecisions(newDecisions);
    setHasChanges(true);
  }, [orderItems]);

  const handleReturnAll = useCallback(() => {
    const newDecisions: Record<string, 'keep' | 'return'> = {};
    orderItems.forEach((item) => {
      newDecisions[item._id] = 'return';
    });
    setDecisions(newDecisions);
    setHasChanges(true);
  }, [orderItems]);

  const handleClearAll = useCallback(() => {
    setDecisions({});
    setHasChanges(true);
  }, []);

  // Check if all decisions made for order items
  const allDecisionsMade = orderItems.every((item) => decisions[item._id]);
  const decisionCount = Object.keys(decisions).length;
  const keepCount = Object.values(decisions).filter((d) => d === 'keep').length;
  const returnCount = Object.values(decisions).filter((d) => d === 'return').length;

  // Submit decisions for order items
  const handleSubmit = useCallback(async () => {
    if (!allDecisionsMade) {
      toast.error('Please make a decision for all items');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create decisions with OrderItem IDs for precise targeting
      const items: ItemDecision[] = orderItems.map((item) => ({
        variantId: item.variantId._id,
        orderItemId: item._id, // Include OrderItem ID for individual targeting
        decision: decisions[item._id],
      }));

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
  }, [decisions, allDecisionsMade, orderItems, ordersClient, onDecisionsSubmitted, onClose]);

  // Get time phases based on shipping type
  const getTimePhases = () => {
    const totalDuration = tryPeriod.duration || 0;

    if (order.shipping.type === 'premium') {
      // Premium: 1 min courtesy + 15 min try + 1 min courtesy = 17 min total
      return {
        courtesyStart: 60,
        tryPeriod: 15 * 60,
        courtesyEnd: 60,
        total: totalDuration,
      };
    } else {
      // Advanced: 1 min courtesy + 8 min try + 1 min courtesy = 10 min total
      return {
        courtesyStart: 60,
        tryPeriod: 8 * 60,
        courtesyEnd: 60,
        total: totalDuration,
      };
    }
  };

  const timePhases = getTimePhases();

  // Determine current phase and phase-specific time remaining
  const getCurrentPhaseInfo = () => {
    if (timeRemaining > timePhases.courtesyEnd + timePhases.tryPeriod) {
      // First courtesy period
      const phaseTimeRemaining = timeRemaining - (timePhases.courtesyEnd + timePhases.tryPeriod);
      return {
        phase: 'courtesy-start',
        phaseTimeRemaining,
        phaseDuration: timePhases.courtesyStart,
      };
    } else if (timeRemaining > timePhases.courtesyEnd) {
      // Try period
      const phaseTimeRemaining = timeRemaining - timePhases.courtesyEnd;
      return {
        phase: 'try-period',
        phaseTimeRemaining,
        phaseDuration: timePhases.tryPeriod,
      };
    } else if (timeRemaining > 0) {
      // Final courtesy period
      return {
        phase: 'courtesy-end',
        phaseTimeRemaining: timeRemaining,
        phaseDuration: timePhases.courtesyEnd,
      };
    }
    return {
      phase: 'expired',
      phaseTimeRemaining: 0,
      phaseDuration: 0,
    };
  };

  const { phase: currentPhase, phaseTimeRemaining, phaseDuration } = getCurrentPhaseInfo();

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'courtesy-start':
        return {
          label: 'Cortesía inicial',
          color: 'text-blue-600',
          bgColor: 'stroke-blue-600',
          description: 'Llega tranquilo a tu probador',
        };
      case 'try-period':
        return {
          label: 'Período de prueba',
          color: 'text-green-600',
          bgColor: 'stroke-green-600',
          description: 'Tiempo para probar los productos',
        };
      case 'courtesy-end':
        return {
          label: 'Cortesía final',
          color: 'text-orange-600',
          bgColor: 'stroke-orange-600',
          description: 'Últimos minutos para decidir',
        };
      case 'expired':
        return {
          label: 'Tiempo agotado',
          color: 'text-red-600',
          bgColor: 'stroke-red-600',
          description: 'Decide rápidamente',
        };
      default:
        return {
          label: 'Período de prueba',
          color: 'text-gray-600',
          bgColor: 'stroke-gray-600',
          description: '',
        };
    }
  };

  const phaseInfo = getPhaseInfo(currentPhase);
  // Calculate progress for current phase only
  const phaseProgress = phaseDuration > 0 ? ((phaseDuration - phaseTimeRemaining) / phaseDuration) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (phaseProgress / 100) * circumference;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[65vw] max-w-[800px] max-h-[80vh] overflow-y-auto p-0">
        {/* Header with Circular Timer */}
        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
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
              <div className="flex flex-col items-center">
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className={`${phaseInfo.bgColor} transition-all duration-1000 ease-in-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-mono text-lg font-bold ${phaseInfo.color}`}>
                      {formatTime(phaseTimeRemaining)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className={`font-semibold ${phaseInfo.color} text-sm`}>{phaseInfo.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{phaseInfo.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
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
          <div className="flex gap-2 mb-4">
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

          {/* Products List - Order Item Cards */}
          <div className="space-y-3">
            {orderItems.map((item, index) => {
              const decision = decisions[item._id];
              const firstImage = item.variantId.images?.[0];

              // Group by variant to show numbering for same products
              const sameVariantItems = orderItems.filter((orderItem) => orderItem.variantId._id === item.variantId._id);
              const itemIndex = sameVariantItems.findIndex((orderItem) => orderItem._id === item._id) + 1;
              const hasMultipleOfSameVariant = sameVariantItems.length > 1;

              return (
                <div
                  key={item._id}
                  className={`p-3 border rounded-lg transition-all ${
                    decision === 'keep'
                      ? 'border-green-500 bg-green-50 shadow-green-100 shadow-md'
                      : decision === 'return'
                      ? 'border-orange-500 bg-orange-50 shadow-orange-100 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {firstImage ? (
                        <Image
                          src={buildImageUrl(item.variantId.images[0].key)}
                          alt={item.variantId.productId.title}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#20313A] mb-1 font-helvetica">
                          {item.variantId.productId.title}
                          {hasMultipleOfSameVariant && (
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({itemIndex} de {sameVariantItems.length})
                            </span>
                          )}
                        </h3>
                        <div className="flex gap-1.5 text-gray-600 text-xs mb-1.5">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium text-xs">
                            Talle: {item.variantId.size}
                          </span>
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-medium text-xs">
                            Color: {item.variantId.color}
                          </span>
                        </div>
                        <p className="text-base font-bold text-[#20313A] font-helvetica">
                          ${item.unitPrice.toLocaleString('es-AR')}
                        </p>
                      </div>

                      {/* Decision Buttons */}
                      <div className="flex gap-1.5 mt-2">
                        <Button
                          onClick={() => handleDecisionChange(item._id, 'keep')}
                          variant={decision === 'keep' ? 'default' : 'outline'}
                          size="lg"
                          className={
                            decision === 'keep'
                              ? 'bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 text-xs'
                              : 'text-green-600 border-green-600 hover:bg-green-50 font-semibold px-3 py-1.5 text-xs'
                          }
                        >
                          <Check className="w-3 h-3 mr-0.5" />
                          Me lo quedo
                        </Button>
                        <Button
                          onClick={() => handleDecisionChange(item._id, 'return')}
                          variant={decision === 'return' ? 'default' : 'outline'}
                          size="lg"
                          className={
                            decision === 'return'
                              ? 'bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1.5 text-xs'
                              : 'text-orange-600 border-orange-600 hover:bg-orange-50 font-semibold px-3 py-1.5 text-xs'
                          }
                        >
                          <X className="w-3 h-3 mr-0.5" />
                          Lo devuelvo
                        </Button>
                      </div>
                    </div>

                    {/* Decision Status Indicator */}
                    {decision && (
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            decision === 'keep' ? 'bg-green-600' : 'bg-orange-600'
                          }`}
                        >
                          {decision === 'keep' ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {!allDecisionsMade && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium text-xs">
                    Decide sobre todos los productos para continuar
                  </span>
                </div>
              )}
              {allDecisionsMade && (
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
                disabled={!allDecisionsMade || isSubmitting}
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
