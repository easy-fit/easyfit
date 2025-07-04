import { Types } from 'mongoose';

export type OrderItemReturnStatus = 'kept' | 'returned' | 'undecided';

export interface OrderItemMetadata {
  productTitle: string;
  variantSize: string;
  variantColor: string;
}

export interface OrderItemReturnVerification {
  checkedBy: string;
  checkedAt: Date;
  result: 'match' | 'mismatch';
}

export interface OrderItem {
  orderId: Types.ObjectId;
  variantId: Types.ObjectId;
  unitPrice: number;
  quantity: number;
  returnStatus: OrderItemReturnStatus;
  metadata: OrderItemMetadata;
  returnVerification?: OrderItemReturnVerification;
}

export interface CreateOrderItemDTO {
  orderId: string;
  variantId: string;
  unitPrice: number;
  quantity: number;
  returnStatus: OrderItemReturnStatus;
  metadata: OrderItemMetadata;
  returnVerification?: OrderItemReturnVerification;
}

export interface UpdateOrderItemDTO {
  returnStatus?: OrderItemReturnStatus;
  metadata?: Partial<OrderItemMetadata>;
  returnVerification?: OrderItemReturnVerification;
}
