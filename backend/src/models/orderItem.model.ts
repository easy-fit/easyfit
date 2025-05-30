import { Schema, model } from 'mongoose';
import { OrderItem } from '../types/orderItem.types';

const OrderItemMetadataSchema = new Schema({
  productTitle: { type: String, required: true },
  variantSize: { type: String, required: true },
  variantColor: { type: String, required: true },
});

const returnVerificationSchema = new Schema({
  checkedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  checkedAt: { type: Date },
  result: { type: String, enum: ['match', 'mismatch'] },
});

const OrderItemSchema = new Schema<OrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    metadata: { type: OrderItemMetadataSchema, required: true },
    returnStatus: {
      type: String,
      enum: ['kept', 'returned', 'undecided'],
      default: 'undecided',
      required: true,
    },
    returnVerification: {
      type: returnVerificationSchema,
      default: null,
      validate: {
        validator: function (this: any) {
          return !this.returnVerification || this.returnStatus === 'returned';
        },
        message:
          'Return verification can only be set if returnStatus is "returned".',
      },
    },
  },
  { timestamps: true },
);

OrderItemSchema.index({ orderId: 1 });

export const OrderItemModel = model('OrderItem', OrderItemSchema);
