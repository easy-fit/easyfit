'use client';

import React from 'react';

import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { translateError, translateAndExtractError, extractErrorMessage } from '@/lib/error-translations';

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

    // ==========================================
    // SMART ERROR TRANSLATION METHODS
    // ==========================================

    /**
     * Smart error handler that automatically extracts and translates backend error messages
     * @param error - Error object from API calls, can be various formats
     * @param fallbackMessage - Optional Spanish fallback message if no translation found
     */
    smartError: (error: any, fallbackMessage?: string) => {
      const translatedMessage = translateAndExtractError(error, fallbackMessage);
      showToast('error', translatedMessage);
    },

    /**
     * Translates a raw English error message to Spanish
     * @param englishMessage - Raw English error message from backend
     */
    translateError: (englishMessage: string) => {
      const translatedMessage = translateError(englishMessage);
      showToast('error', translatedMessage);
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

    addressSaved: () =>
      toast.success('Dirección guardada', {
        description: 'Tu dirección se actualizó correctamente',
        duration: 1500,
      }),

    emailVerified: () =>
      toast.success('Email verificado exitosamente', {
        description: 'Tu cuenta está ahora completamente activada',
        duration: 2000,
      }),

    // ==========================================
    // CONTEXT-SPECIFIC ERROR METHODS
    // ==========================================

    /**
     * Smart cart/inventory error handler - detects stock/quantity issues
     */
    quantityUpdateError: (error: any) => {
      const englishMessage = extractErrorMessage(error);

      // Check for stock-related errors
      if (
        englishMessage?.toLowerCase().includes('stock') ||
        englishMessage?.toLowerCase().includes('inventory') ||
        englishMessage?.toLowerCase().includes('quantity') ||
        englishMessage?.toLowerCase().includes('not enough')
      ) {
        toast.error('Stock insuficiente para esta cantidad');
      } else {
        // Use smart translation for other errors
        const translatedMessage = translateAndExtractError(error, 'Error al actualizar la cantidad');
        toast.error(translatedMessage);
      }
    },

    /**
     * Smart payment error handler - handles MercadoPago and payment issues
     */
    paymentError: (error: any) => {
      const englishMessage = extractErrorMessage(error);

      // Check for stock-related errors during payment
      if (
        englishMessage?.toLowerCase().includes('stock') ||
        englishMessage?.toLowerCase().includes('inventory') ||
        englishMessage?.toLowerCase().includes('not enough') ||
        englishMessage?.toLowerCase().includes('out of stock')
      ) {
        toast.error('Uno o más productos no tienen stock suficiente');
      } else if (englishMessage?.includes('MercadoPago')) {
        toast.error('Error en el procesamiento del pago. Verificá tus datos.');
      } else if (englishMessage?.toLowerCase().includes('card declined')) {
        toast.error('Tarjeta rechazada. Verificá los datos o usá otra tarjeta.');
      } else if (englishMessage?.toLowerCase().includes('insufficient funds')) {
        toast.error('Fondos insuficientes en tu cuenta.');
      } else {
        const translatedMessage = translateAndExtractError(error, 'Error al procesar el pago');
        toast.error(translatedMessage);
      }
    },

    /**
     * Smart authentication error handler
     */
    authError: (error: any) => {
      const englishMessage = extractErrorMessage(error);

      if (englishMessage?.includes('token expired')) {
        toast.error('Tu sesión expiró. Iniciá sesión nuevamente.');
      } else if (
        englishMessage?.includes('invalid credentials') ||
        englishMessage?.includes('Invalid email or password')
      ) {
        toast.error('Email o contraseña inválidos.');
      } else {
        const translatedMessage = translateAndExtractError(error, 'Error de autenticación');
        toast.error(translatedMessage);
      }
    },

    /**
     * Smart file upload error handler
     */
    uploadError: (error: any) => {
      const englishMessage = extractErrorMessage(error);

      if (englishMessage?.includes('file too large')) {
        toast.error('El archivo es demasiado grande. Máximo permitido.');
      } else if (
        englishMessage?.includes('invalid file format') ||
        englishMessage?.includes('Only PDF, JPG, and PNG')
      ) {
        toast.error('Formato de archivo no válido. Solo se permiten PDF, JPG y PNG.');
      } else {
        const translatedMessage = translateAndExtractError(error, 'Error al subir el archivo');
        toast.error(translatedMessage);
      }
    },

    /**
     * Network/connection error handler
     */
    networkError: (error?: any) => {
      toast.error('Error de conexión', {
        description: 'Verificá tu conexión a internet',
        action: {
          label: 'Reintentar',
          onClick: () => window.location.reload(),
        },
      });
    },

    /**
     * Generic form validation error
     */
    validationError: (field: string, customMessage?: string) => {
      if (customMessage) {
        toast.warning(customMessage, {
          description: 'Por favor verificá la información ingresada',
          duration: 1500,
        });
      } else {
        toast.warning(`El campo "${field}" es inválido`, {
          description: 'Por favor completá todos los campos correctamente',
          duration: 1500,
        });
      }
    },
  };
};
