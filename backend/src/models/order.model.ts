import { Schema, model } from 'mongoose';
import { Order } from '../types/order.types';
import {
  DeliveryVerificationSchema,
  ShippingSchema,
} from '../schemas/order/order.schemas';

const statusEnum = [
  'order_placed',
  'order_accepted',
  'order_canceled',
  'pending_rider',
  'in_transit',
  'delivered',
  'purchased',
  'returned_ok',
  'returned_partial',
  'returned_damaged',
  'stolen',
];

const OrderSchema = new Schema<Order>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckoutSession',
      required: true,
    },
    total: { type: Number, required: true },
    shipping: { type: ShippingSchema, required: true },
    status: {
      type: String,
      enum: statusEnum,
      default: 'order_placed',
    },
    paymentId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: [
        'hold_placed',
        'paid_full',
        'paid_full_debit',
        'paid_shipping_only',
        'cancelled',
        'paid_partially_stolen',
        'paid_partial',
      ],
      required: true,
    },
    deliveryVerification: {
      type: DeliveryVerificationSchema,
      required: true,
    },
    isStolen: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel = model('Order', OrderSchema);
