import { Types } from 'mongoose';
import { ShippingInfo, ShippingType } from './order.types';

export type CheckoutStatus = 'active' | 'completed' | 'cancelled';

export interface CheckoutCartItem {
  variantId: string;
  quantity: number;
  price: number;
  unit_price: number;
  metadata: {};
}

export interface CheckoutSession {
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  cartItems: CheckoutCartItem[];
  subtotal: number;
  shipping: ShippingInfo;
  total: number;
  status: CheckoutStatus;
}

export interface CreateCheckoutSessionDTO {
  shipping: ShippingInfo;
}

export interface UpdateCheckoutSessionDTO {
  deliveryType?: ShippingType;
}
