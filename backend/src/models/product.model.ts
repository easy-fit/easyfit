import { Schema, model } from 'mongoose';
import { Product } from '../types/product.types';

const ProductSchema = new Schema<Product>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['published', 'archived', 'deleted'],
      default: 'published',
    },
    category: {
      type: String,
      enum: ['clothing', 'accessory', 'footwear', 'fragrance'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = model('Product', ProductSchema);
