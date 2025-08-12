import { Schema, model } from 'mongoose';
import { Variant } from '../types/variant.types';

const VariantImageSchema = new Schema({
  key: { type: String },
  altText: { type: String },
  order: { type: Number },
  contentType: { type: String },
});

const VariantSchema = new Schema<Variant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true },
    images: { type: [VariantImageSchema], default: [] },
    price: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
    sku: { type: String, required: true },
  },
  { timestamps: true },
);

VariantSchema.index({ stock: 1 });
VariantSchema.index({ productId: 1, isDefault: -1 });

export const VariantModel = model('Variant', VariantSchema);
