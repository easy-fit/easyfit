'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { TryPeriodInfo } from '@/types/order';

interface TryPeriodIndicatorProps {
  tryPeriod: TryPeriodInfo;
  onOpenModal: () => void;
}

export function TryPeriodIndicator({ tryPeriod, onOpenModal }: TryPeriodIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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

  // Get urgency level and colors
  const getUrgencyProps = useCallback((seconds: number) => {
    if (seconds <= 60) {
      return {
        level: 'critical',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        timerColor: 'text-red-600',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        icon: AlertTriangle,
        pulse: true
      };
    }
    if (seconds <= 180) {
      return {
        level: 'high',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        timerColor: 'text-orange-600',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        icon: AlertTriangle,
        pulse: true
      };
    }
    if (seconds <= 300) {
      return {
        level: 'medium',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        timerColor: 'text-yellow-600',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        icon: Clock,
        pulse: false
      };
    }
    return {
      level: 'low',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      timerColor: 'text-blue-600',
      buttonColor: 'bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]',
      icon: Clock,
      pulse: false
    };
  }, []);

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
          icon: AlertTriangle,
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
              <div className="mt-2 flex items-center gap-2">
                <Clock className={`w-4 h-4 ${(content as any).timerColor || content.textColor}`} />
                <span className={`font-mono font-bold text-lg ${(content as any).timerColor || content.textColor}`}>
                  {formatTime(timeRemaining)}
                </span>
                <span className={`text-sm ${content.textColor} opacity-80`}>
                  restantes
                </span>
              </div>
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