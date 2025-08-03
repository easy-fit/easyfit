'use client';

import React from 'react';

import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle,
        className: 'bg-[#DBF7DC] text-[#20313A] border-[#9EE493]',
        iconColor: '#20313A',
      };
    case 'error':
      return {
        icon: XCircle,
        className: 'bg-red-50 text-red-900 border-red-200',
        iconColor: '#991B1B',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        className: 'bg-yellow-50 text-yellow-900 border-yellow-200',
        iconColor: '#92400E',
      };
    case 'info':
      return {
        icon: Info,
        className: 'bg-blue-50 text-blue-900 border-blue-200',
        iconColor: '#1E40AF',
      };
    case 'loading':
      return {
        icon: Loader2,
        className: 'bg-gray-50 text-gray-900 border-gray-200',
        iconColor: '#374151',
      };
    default:
      return {
        icon: Info,
        className: 'bg-gray-50 text-gray-900 border-gray-200',
        iconColor: '#374151',
      };
  }
};

export const useToast = () => {
  const showToast = (type: ToastType, message: string, options: ToastOptions = {}) => {
    const {
      title,
      description,
      duration = type === 'loading' ? Number.POSITIVE_INFINITY : 4000,
      action,
      dismissible = true,
    } = options;

    const config = getToastConfig(type);
    const Icon = config.icon;

    // Para success, usar el toast success de sonner con estilos personalizados
    if (type === 'success') {
      return sonnerToast.success(message, {
        description: description || title,
        duration,
        dismissible,
        className: 'border-l-4 border-l-[#9EE493]',
        style: {
          backgroundColor: '#DBF7DC',
          color: '#20313A',
          border: '1px solid #9EE493',
        },
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      });
    }

    // Para error, usar el toast error de sonner
    if (type === 'error') {
      return sonnerToast.error(message, {
        description: description || title,
        duration,
        dismissible,
        className: 'border-l-4 border-l-red-500',
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      });
    }

    // Para warning, usar el toast warning de sonner
    if (type === 'warning') {
      return sonnerToast.warning(message, {
        description: description || title,
        duration,
        dismissible,
        className: 'border-l-4 border-l-yellow-500',
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      });
    }

    // Para info y loading, usar toast normal con icono personalizado
    return sonnerToast(message, {
      description: description || title,
      duration,
      dismissible,
      icon: React.createElement(Icon, {
        className: `h-5 w-5 ${type === 'loading' ? 'animate-spin' : ''}`,
        style: { color: config.iconColor },
      }),
      className: `border-l-4 ${type === 'info' ? 'border-l-blue-500' : 'border-l-gray-400'}`,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    });
  };

  return {
    // Métodos específicos para cada tipo
    success: (message: string, options?: ToastOptions) => showToast('success', message, options),

    error: (message: string, options?: ToastOptions) => showToast('error', message, options),

    warning: (message: string, options?: ToastOptions) => showToast('warning', message, options),

    info: (message: string, options?: ToastOptions) => showToast('info', message, options),

    loading: (message: string, options?: ToastOptions) => showToast('loading', message, options),

    // Método genérico
    show: showToast,

    // Métodos de utilidad
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),

    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      },
      options?: ToastOptions,
    ) => {
      return sonnerToast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
        style: {
          backgroundColor: '#DBF7DC',
          color: '#20313A',
          border: '1px solid #9EE493',
        },
        ...options,
      });
    },
  };
};

// Hook para casos específicos de la app
export const useEasyFitToast = () => {
  const toast = useToast();

  return {
    ...toast,

    // Toasts específicos de EasyFit
    locationUpdated: () =>
      toast.success('Ubicación actualizada exitosamente', {
        description: 'Tu dirección se guardó correctamente',
        duration: 2000,
      }),

    loginSuccess: (userName?: string) =>
      toast.success(`¡Bienvenido${userName ? ` ${userName}` : ''} a EasyFit!`, {
        description: 'Ya podés empezar a explorar tiendas',
        duration: 2000,
      }),

    logoutSuccess: () =>
      toast.info('Sesión cerrada exitosamente', {
        description: '¡Hasta la próxima!',
        duration: 1000,
      }),

    orderPlaced: (orderId?: string) =>
      toast.success('¡Pedido realizado exitosamente!', {
        description: orderId ? `Número de pedido: ${orderId}` : 'Tu pedido está siendo procesado',
        duration: 5000,
      }),

    networkError: () =>
      toast.error('Error de conexión', {
        description: 'Verificá tu conexión a internet',
        action: {
          label: 'Reintentar',
          onClick: () => window.location.reload(),
        },
      }),

    validationError: (field: string) =>
      toast.warning(`El campo "${field}" es requerido`, {
        description: 'Por favor completá todos los campos obligatorios',
        duration: 2000,
      }),

    addressSaved: () =>
      toast.success('Dirección guardada', {
        description: 'Tu dirección se actualizó correctamente',
        duration: 2000,
      }),

    emailVerified: () =>
      toast.success('Email verificado exitosamente', {
        description: 'Tu cuenta está ahora completamente activada',
        duration: 2000,
      }),
  };
};
