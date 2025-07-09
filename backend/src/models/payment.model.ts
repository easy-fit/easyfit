import { Schema, model } from 'mongoose';
import { Payment } from '../types/payment.types';

const PaymentSchema = new Schema<Payment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['hold', 'capture', 'refund'],
      required: true,
    },
    amount: { type: Number, required: true }, // in cents (e.g. $24.99 → 2499)
    status: {
      type: String,
      required: true,
    },
    externalId: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ externalId: 1 }, { unique: true });

export const PaymentModel = model('Payment', PaymentSchema);
