import { Clock, AlertTriangle } from 'lucide-react';

// Get phase information including styling and labels
export const getPhaseInfo = (phase: string) => {
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

// Get urgency level and colors for try period indicator
export const getUrgencyProps = (seconds: number) => {
  if (seconds <= 60) {
    return {
      level: 'critical' as const,
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
      level: 'high' as const,
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
      level: 'medium' as const,
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
    level: 'low' as const,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    timerColor: 'text-blue-600',
    buttonColor: 'bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]',
    icon: Clock,
    pulse: false
  };
};