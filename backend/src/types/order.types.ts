import { Types } from 'mongoose';
import { Address } from './global';

export type OrderStatus =
  | 'order_placed'
  | 'order_accepted'
  | 'order_canceled'
  | 'pending_rider'
  | 'rider_assigned'
  | 'in_transit'
  | 'delivered'
  | 'awaiting_return_pickup'
  | 'returning_to_store'
  | 'store_checking_returns'
  | 'purchased'
  | 'return_completed'
  | 'stolen';

export type PaymentStatus =
  | 'hold_placed'
  | 'paid_full_debit'
  | 'paid_full'
  | 'paid_shipping_only'
  | 'cancelled'
  | 'paid_partially_stolen'
  | 'paid_partial';

export type ShippingType = 'simple' | 'advanced' | 'premium';

export type ShippingSubsidy = 'merchant' | 'platform' | 'user';

export interface ShippingInfo {
  cost: number;
  subsidizedBy?: ShippingSubsidy;
  type: ShippingType;
  address: Address;
  tryOnEnabled: boolean;
  distanceKm?: number;
  durationMinutes?: number;
}

export interface DeliveryVerification {
  code: string;
  attempts: {
    made: number;
    max: number;
  };
  verifiedAt?: Date;
}

export interface TryPeriodInfo {
  isActive: boolean;
  startedAt?: Date;
  endsAt?: Date;
  duration?: number; // seconds
  status: 'active' | 'expired' | 'finalized';
  exceededTime?: number; // seconds over limit
  finalizedAt?: Date;
}

export interface Order {
  _id: string;
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  total: number;
  shipping: ShippingInfo;
  status: OrderStatus;
  externalPaymentId: string;
  paymentStatus: PaymentStatus;
  deliveryVerification: DeliveryVerification;
  tryPeriod?: TryPeriodInfo;
  isStolen: boolean;
  isActive: boolean;
}

export interface CreateOrderDTO {
  userId: string;
  total: number;
  shipping: ShippingInfo;
  holdId: string;
  deliveryVerification: DeliveryVerification;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryVerification?: DeliveryVerification;
  isStolen?: boolean;
  isActive?: boolean;
}
