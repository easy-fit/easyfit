import type { Address } from './address';
import type { VariantImage } from './variant';

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

export type OrderItemReturnStatus = 'kept' | 'returned' | 'undecided' | 'returned_damaged' | 'stolen';

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

export interface ItemDecision {
  variantId: string;
  orderItemId?: string; // For individual OrderItem targeting
  decision: 'keep' | 'return';
}

export interface TryPeriodDecisionRequest {
  items: ItemDecision[];
}

export interface Order {
  _id: string;
  userId: string;
  storeId: string;
  total: number;
  shipping: ShippingInfo;
  status: OrderStatus;
  externalPaymentId: string;
  paymentStatus: PaymentStatus;
  deliveryVerification: DeliveryVerification;
  tryPeriod?: TryPeriodInfo;
  isStolen: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryVerification?: DeliveryVerification;
  isStolen?: boolean;
  isActive?: boolean;
}

export interface OrderCommonResponse {
  total?: number;
  data: Order[];
}

export interface OrderItem {
  _id: string;
  quantity: number;
  unitPrice: number;
  returnStatus: OrderItemReturnStatus;
  variantId: {
    _id: string;
    size: string;
    color: string;
    images: VariantImage[];
    price: number;
    sku: string;
    productId: {
      _id: string;
      title: string;
      description: string;
      category: string;
      slug: string;
    };
  };
}

export interface RiderDetails {
  _id: string;
  name: string;
  surname: string;
  phone?: string;
  profilePictureUrl?: string;
  rating?: number;
}

export interface RiderAssignment {
  _id: string;
  orderId: string;
  riderId: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteOrder extends Order {
  storeId: {
    _id: string;
    name: string;
    customization: {
      logoUrl: string;
    };
  };
  orderItems: OrderItem[];
  riderAssignment?: RiderAssignment;
  riderDetails?: RiderDetails;
}

export interface SingleOrderResponse {
  data: CompleteOrder;
}

import type { Order } from './order';

export interface GetMyOrdersResponse {
  total: number;
  data: Array<{
    _id: string;
    userId: string;
    storeId: {
      _id: string;
      name: string;
      customization: {
        logoUrl: string;
      };
    };
    total: number;
    shipping: {
      address: {
        formatted: {
          street: string;
          streetNumber: string;
          city: string;
          province: string;
          postalCode: string;
          building?: string;
          floor?: string;
          apartment?: string;
        };
        coordinates: [number, number];
      };
      cost: number;
      subsidizedBy: string;
      type: string;
      tryOnEnabled: boolean;
      distanceKm: number;
      durationMinutes: number;
      _id: string;
    };
    status: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
}
