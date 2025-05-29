import { Types } from 'mongoose';

export type OrderStatus =
  | 'order_placed'
  | 'order_accepted'
  | 'order_canceled'
  | 'pending_rider'
  | 'in_transit'
  | 'delivered'
  | 'purchased'
  | 'returned_ok'
  | 'returned_partial'
  | 'returned_damaged'
  | 'stolen';

export type PaymentStatus =
  | 'hold_placed'
  | 'paid_full'
  | 'paid_shipping_only'
  | 'cancelled'
  | 'paid_partially_stolen'
  | 'paid_partial';

export type ShippingType = 'basic' | 'advanced' | 'premium';

export type ShippingSubsidy = 'seller' | 'platform' | 'user';

export interface ShippingInfo {
  cost: number;
  subsidizedBy?: ShippingSubsidy;
  type: ShippingType;
  tryOnEnabled: boolean;
  distanceKm?: number;
}

export interface DeliveryVerification {
  code: string;
  attempts: {
    made: number;
    max: number;
  };
  verifiedAt?: Date;
}

export interface Order {
  userId: Types.ObjectId;
  total: number;
  shipping: ShippingInfo;
  status: OrderStatus;
  holdId: string;
  paymentStatus: PaymentStatus;
  deliveryVerification: DeliveryVerification;
  isStolen: boolean;
  isActive: boolean;
}

export interface CreateOrderDTO {
  userId: Types.ObjectId;
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
}
