import mongoose, { Schema, Types } from 'mongoose';
import { CartItem } from '../types/cartItem.types';

const CartItemSchema = new Schema<CartItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const CartItemModel = mongoose.model<CartItem>(
  'CartItem',
  CartItemSchema,
);
