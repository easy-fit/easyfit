import { Schema, model } from 'mongoose';
import { Variant } from '../types/variant.types';

const VariantImageSchema = new Schema({
  key: { type: String, required: true },
  altText: { type: String },
  order: { type: Number },
});

const VariantSchema = new Schema<Variant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true },
    images: { type: [VariantImageSchema], default: [] },
    price: { type: Number, required: true },
  },
  { timestamps: true },
);

export const VariantModel = model('Variant', VariantSchema);
