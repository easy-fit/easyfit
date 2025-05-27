import { Types } from 'mongoose';

export type OrderItemReturnStatus = 'kept' | 'returned' | 'undecided';

export interface OrderItemMetadata {
  productTitle: string;
  variantSize: string;
  variantColor: string;
}

export interface OrderItem {
  orderId: Types.ObjectId;
  variantId: Types.ObjectId;
  unitPrice: number;
  quantity: number;
  returnStatus: OrderItemReturnStatus;
  metadata: OrderItemMetadata;
}
