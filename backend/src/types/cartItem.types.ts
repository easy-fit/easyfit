import { Types } from 'mongoose';

export interface CartItem {
  userId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
}

export interface CreateCartItemDTO {
  userId: string;
  variantId: string;
  quantity: number;
}
