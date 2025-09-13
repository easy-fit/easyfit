import { ShippingType } from '../types/order.types';

export const SHIPPING_BASE_COSTS: Record<ShippingType, number> = {
  simple: 0,
  advanced: 1500,
  premium: 2500,
};

export const SHIPPING_CONFIG = {
  costPerKm: 400,
  pickupCost: 400,
  dropoffCost: 400,
};
