import { Types } from 'mongoose';

export interface CartItem {
  userId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
}

export interface CreateCartItemDTO {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}
