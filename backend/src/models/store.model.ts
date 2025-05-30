import { Schema, model } from 'mongoose';
import { Store } from '../types/store.types';
import { getNextSequenceValue } from '../utils/counter';
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
    storeInternalId: { type: Number, required: true, unique: true },
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

StoreSchema.pre('save', async function (NextFunction) {
  if (this.isNew) {
    this.storeInternalId = await getNextSequenceValue('stores');
  }
  NextFunction();
});

StoreSchema.index({ sellerId: 1 });
StoreSchema.index({ 'address.location': '2dsphere' });

export const StoreModel = model('Store', StoreSchema);
