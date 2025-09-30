import { Schema, model } from 'mongoose';
import { Product } from '../types/product.types';
import { PRODUCT_CATEGORY_VALUES } from '../types/category.types';

const ProductSchema = new Schema<Product>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['published', 'draft', 'deleted'],
      default: 'published',
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORY_VALUES,
      required: true,
    },
    slug: { type: String, required: true },
    allowedShippingTypes: {
      type: [String],
      enum: ['simple', 'advanced', 'premium'],
      default: ['simple', 'advanced', 'premium'],
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ storeId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ storeId: 1, status: 1 });

export const ProductModel = model('Product', ProductSchema);
