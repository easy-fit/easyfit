import type { ShippingType } from '@/types/order';

// Shipping type configuration
export const shippingTypeConfig: Record<ShippingType, {
  name: string;
  description: string;
  tryOnTime: string;
}> = {
  simple: {
    name: 'Envío Simple',
    description: 'Delivery tradicional a tu casa',
    tryOnTime: 'Sin tiempo de prueba',
  },
  advanced: {
    name: 'Envío Avanzado',
    description: 'El rider espera mientras probás',
    tryOnTime: '10 minutos para probar',
  },
  premium: {
    name: 'Envío Premium',
    description: 'Más tiempo para decidir con tranquilidad',
    tryOnTime: '17 minutos para probar',
  },
};