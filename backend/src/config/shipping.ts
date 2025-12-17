import { ShippingType } from '../types/order.types';

export const SHIPPING_BASE_COSTS: Record<ShippingType, number> = {
  simple: 0,
  advanced: 0,  // antes 2000
  premium: 0,  // antes 3000
};

export const SHIPPING_CONFIG = {
  costPerKm: 400,
  pickupCost: 400,
  dropoffCost: 400,
};
