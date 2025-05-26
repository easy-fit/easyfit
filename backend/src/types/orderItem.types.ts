import { Types } from 'mongoose';

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
  metadata: OrderItemMetadata;
}
