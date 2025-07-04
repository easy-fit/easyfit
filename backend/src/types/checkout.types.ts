import { Types } from 'mongoose';
import { ShippingInfo, ShippingType } from './order.types';

export type CheckoutStatus = 'active' | 'completed' | 'cancelled';

export type PaymentMethod = 'credit' | 'debit' | 'mercado_pago';

export interface CheckoutCartItem {
  variantId: string;
  quantity: number;
  price: number;
  metadata: {};
}

export interface CheckoutSession {
  userId: Types.ObjectId;
  cartItems: CheckoutCartItem[];
  subtotal: number;
  shipping: ShippingInfo;
  total: number;
  paymentMethod?: PaymentMethod;
  status: CheckoutStatus;
}

export interface CreateCheckoutSessionDTO {
  paymentMethod?: PaymentMethod;
  shipping: ShippingInfo;
}

export interface UpdateCheckoutSessionDTO {
  paymentMethod?: PaymentMethod;
  deliveryType?: ShippingType;
}
