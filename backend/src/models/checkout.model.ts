import mongoose, { Schema } from 'mongoose';
import { CheckoutSession } from '../types/checkout.types';
import { ShippingSchema } from '../schemas/order/order.schemas';

const CheckoutSessionSchema = new Schema<CheckoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cartItems: { type: [Object], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: ShippingSchema, required: true },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['credit', 'debit', 'mercado_pago', ''],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true },
);

CheckoutSessionSchema.index({ userId: 1, status: 1 });

export const CheckoutSessionModel = mongoose.model<CheckoutSession>(
  'CheckoutSession',
  CheckoutSessionSchema,
);
