'use client';

import { CheckCircle2, Circle, Clock, Package, Truck, MapPin, ShoppingBag, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  timestamps?: Record<string, string>;
}

interface StatusStep {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const ORDER_FLOW_STEPS: StatusStep[] = [
  {
    key: 'order_placed',
    label: 'Pedido Realizado',
    description: 'El cliente realizó el pedido',
    icon: Package,
    color: 'orange'
  },
  {
    key: 'order_accepted',
    label: 'Pedido Aceptado',
    description: 'La tienda aceptó el pedido',
    icon: CheckCircle2,
    color: 'green'
  },
  {
    key: 'pending_rider',
    label: 'Buscando Repartidor',
    description: 'Buscando repartidor disponible',
    icon: Clock,
    color: 'blue'
  },
  {
    key: 'rider_assigned',
    label: 'Repartidor Asignado',
    description: 'Repartidor asignado al pedido',
    icon: Truck,
    color: 'blue'
  },
  {
    key: 'in_transit',
    label: 'En Camino',
    description: 'Pedido en camino al cliente',
    icon: MapPin,
    color: 'purple'
  },
  {
    key: 'delivered',
    label: 'Entregado',
    description: 'Pedido entregado al cliente',
    icon: ShoppingBag,
    color: 'green'
  }
];

const FINAL_STATES: Partial<Record<OrderStatus, StatusStep>> = {
  'purchased': {
    key: 'purchased',
    label: 'Comprado',
    description: 'Cliente decidió comprar los productos',
    icon: CheckCircle2,
    color: 'green'
  },
  'return_completed': {
    key: 'return_completed',
    label: 'Devolución Completada',
    description: 'Productos devueltos exitosamente',
    icon: Package,
    color: 'gray'
  },
  'order_canceled': {
    key: 'order_canceled',
    label: 'Pedido Cancelado',
    description: 'El pedido fue cancelado',
    icon: XCircle,
    color: 'red'
  },
  'stolen': {
    key: 'stolen',
    label: 'Pedido Robado',
    description: 'El pedido fue reportado como robado',
    icon: AlertTriangle,
    color: 'red'
  },
  'awaiting_return_pickup': {
    key: 'awaiting_return_pickup',
    label: 'Esperando Retiro',
    description: 'Esperando que el repartidor retire los productos',
    icon: Clock,
    color: 'orange'
  },
  'returning_to_store': {
    key: 'returning_to_store',
    label: 'Retornando a Tienda',
    description: 'Productos en camino de vuelta a la tienda',
    icon: Truck,
    color: 'orange'
  },
  'store_checking_returns': {
    key: 'store_checking_returns',
    label: 'Revisando Retorno',
    description: 'La tienda está revisando los productos devueltos',
    icon: Package,
    color: 'yellow'
  }
};

export function OrderStatusTimeline({ currentStatus, timestamps }: OrderStatusTimelineProps) {
  const getCurrentStepIndex = (status: OrderStatus): number => {
    const index = ORDER_FLOW_STEPS.findIndex(step => step.key === status);
    return index;
  };

  const isStepCompleted = (step: StatusStep): boolean => {
    const currentIndex = getCurrentStepIndex(currentStatus);
    const stepIndex = ORDER_FLOW_STEPS.findIndex(s => s.key === step.key);
    
    // If current status is in the main flow, compare indices
    if (currentIndex >= 0) {
      return stepIndex <= currentIndex;
    }
    
    // Handle special cases for final states
    if (currentStatus === 'purchased' || currentStatus === 'return_completed') {
      // These states mean the order went through delivery
      return stepIndex <= ORDER_FLOW_STEPS.findIndex(s => s.key === 'delivered');
    }
    
    if (currentStatus === 'order_canceled') {
      // Only the first step (order_placed) was completed
      return stepIndex === 0;
    }
    
    return false;
  };

  const isCurrentStep = (step: StatusStep): boolean => {
    return step.key === currentStatus;
  };

  const getStepColor = (step: StatusStep): string => {
    if (isCurrentStep(step)) {
      return `text-${step.color}-600 bg-${step.color}-100 border-${step.color}-200`;
    }
    if (isStepCompleted(step)) {
      return `text-green-600 bg-green-100 border-green-200`;
    }
    return 'text-gray-400 bg-gray-100 border-gray-200';
  };

  const getConnectorColor = (index: number): string => {
    const currentIndex = getCurrentStepIndex(currentStatus);
    if (currentIndex >= 0 && index < currentIndex) {
      return 'bg-green-500';
    }
    return 'bg-gray-300';
  };

  // Check if we need to show a final state
  const finalStateStep = FINAL_STATES[currentStatus];
  const showFinalState = finalStateStep && !ORDER_FLOW_STEPS.find(step => step.key === currentStatus);

  return (
    <div className="space-y-6">
      {/* Main Flow Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {ORDER_FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = isStepCompleted(step);
            const isCurrent = isCurrentStep(step);
            
            return (
              <div key={step.key} className="flex flex-col items-center relative">
                {/* Connector line */}
                {index < ORDER_FLOW_STEPS.length - 1 && (
                  <div 
                    className={cn(
                      'absolute top-5 left-1/2 w-full h-0.5 transform translate-x-1/2 z-0',
                      getConnectorColor(index)
                    )}
                    style={{ width: `calc(100vw / ${ORDER_FLOW_STEPS.length} - 2rem)` }}
                  />
                )}
                
                {/* Step Circle */}
                <div className={cn(
                  'relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                  isCompleted ? 'bg-green-100 border-green-500 text-green-600' : 
                  isCurrent ? `bg-${step.color}-100 border-${step.color}-500 text-${step.color}-600` :
                  'bg-gray-100 border-gray-300 text-gray-400'
                )}>
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center max-w-24">
                  <p className={cn(
                    'text-xs font-medium',
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                  {timestamps?.[step.key] && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(timestamps[step.key]).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final State (if applicable) */}
      {showFinalState && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center',
              `bg-${finalStateStep.color}-100 border-${finalStateStep.color}-500 text-${finalStateStep.color}-600`
            )}>
              <finalStateStep.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{finalStateStep.label}</p>
              <p className="text-sm text-gray-600">{finalStateStep.description}</p>
            </div>
            {timestamps?.[currentStatus] && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date(timestamps[currentStatus]).toLocaleString('es-AR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return Flow (if in return process) */}
      {['awaiting_return_pickup', 'returning_to_store', 'store_checking_returns'].includes(currentStatus) && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Proceso de Devolución</h4>
          <div className="space-y-3">
            {[
              FINAL_STATES['awaiting_return_pickup'],
              FINAL_STATES['returning_to_store'],
              FINAL_STATES['store_checking_returns']
            ].filter((step): step is StatusStep => step !== undefined).map((step, index) => {
              const Icon = step.icon;
              const isCurrent = currentStatus === step.key;
              const isCompleted = ['awaiting_return_pickup', 'returning_to_store', 'store_checking_returns']
                .indexOf(currentStatus) > ['awaiting_return_pickup', 'returning_to_store', 'store_checking_returns']
                .indexOf(step.key);
              
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full border flex items-center justify-center',
                    isCurrent ? `bg-${step.color}-100 border-${step.color}-500 text-${step.color}-600` :
                    isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm',
                      isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    )}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}