import { Schema, model } from 'mongoose';
import { Order } from '../types/order.types';
import { DeliveryVerificationSchema, ShippingSchema, TryPeriodSchema } from '../schemas/order/order.schemas';

const statusEnum = [
  'order_placed',
  'order_accepted',
  'order_canceled',
  'pending_rider',
  'rider_assigned',
  'in_transit',
  'delivered',
  'awaiting_return_pickup',
  'returning_to_store',
  'store_checking_returns',
  'purchased',
  'return_completed',
  'stolen',
];

const OrderSchema = new Schema<Order>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    total: { type: Number, required: true },
    shipping: { type: ShippingSchema, required: true },
    status: {
      type: String,
      enum: statusEnum,
      default: 'order_placed',
    },
    externalPaymentId: { type: String, required: true },
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
    tryPeriod: {
      type: TryPeriodSchema,
      required: false,
    },
    isStolen: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel = model('Order', OrderSchema);
