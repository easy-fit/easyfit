'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import type { TryPeriodInfo, ShippingType } from '@/types/order';
import { TryPeriodTimer } from './try-period-timer';
import { useTryPeriodTimer } from '@/hooks/use-try-period-timer';
import { getUrgencyProps } from '@/utils/try-period-phases';

interface TryPeriodIndicatorProps {
  tryPeriod: TryPeriodInfo;
  onOpenModal: () => void;
  shippingType: ShippingType;
}

export function TryPeriodIndicator({ tryPeriod, onOpenModal, shippingType }: TryPeriodIndicatorProps) {
  // Timer hook for try period
  const { timeRemaining } = useTryPeriodTimer({ 
    tryPeriod, 
    shippingType 
  });

  // Get status message and styling
  const getStatusContent = () => {
    switch (tryPeriod.status) {
      case 'active': {
        const props = getUrgencyProps(timeRemaining);
        const Icon = props.icon;
        
        return {
          title: 'Período de prueba activo',
          message: props.level === 'critical' 
            ? '¡Último minuto! Decide ahora'
            : props.level === 'high'
            ? '¡Tiempo limitado! Decide pronto'
            : 'Decide qué productos conservar',
          showTimer: true,
          ...props
        };
      }
      case 'expired':
        return {
          title: 'Período de prueba expirado',
          message: 'El tiempo se agotó. Decide rápidamente para evitar cargos adicionales.',
          showTimer: false,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: CheckCircle,
          pulse: true
        };
      case 'finalized':
        return {
          title: 'Decisiones confirmadas',
          message: 'Has completado tu período de prueba exitosamente.',
          showTimer: false,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: CheckCircle,
          pulse: false
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className={`p-4 rounded-lg border ${content.bgColor} ${content.borderColor} ${content.pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 mt-0.5 ${content.textColor}`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${content.textColor} font-helvetica`}>
              {content.title}
            </h3>
            <p className={`text-sm mt-1 ${content.textColor} opacity-80`}>
              {content.message}
            </p>
            {content.showTimer && (
              <TryPeriodTimer 
                timeRemaining={timeRemaining} 
                className={`mt-2 ${(content as any).timerColor || content.textColor}`}
              />
            )}
          </div>
        </div>

        {tryPeriod.status !== 'finalized' && (
          <Button
            onClick={onOpenModal}
            className={`ml-4 font-semibold ${content.buttonColor}`}
            size="sm"
          >
            {tryPeriod.status === 'active' ? 'Decidir ahora' : 'Ver detalles'}
          </Button>
        )}
      </div>
    </div>
  );
}