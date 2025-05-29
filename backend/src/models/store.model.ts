import { Schema, model } from 'mongoose';
import { Store } from '../types/store.types';
import { AddressSchema } from '../schemas/common/address.schema';
import {
  PickupHoursEntrySchema,
  ShippingOptionSchema,
} from '../schemas/store/store.schemas';

const StoreSchema = new Schema<Store>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    address: { type: AddressSchema, required: true },
    pickupHours: { type: [PickupHoursEntrySchema], required: true },
    options: {
      freeShipping: { type: ShippingOptionSchema, required: true },
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'disabled'],
      default: 'active',
    },
    ratingCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    storeId: { type: Number, required: true, unique: true },
    storeType: {
      type: String,
      enum: ['physical', 'online'],
      required: true,
    },
    tags: [String],
    isOpen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const StoreModel = model('Store', StoreSchema);
