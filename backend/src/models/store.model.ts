import { Schema, model } from 'mongoose';
import { Store } from '../types/store.types';
import { getNextSequenceValue } from '../utils/counter';
import { AddressSchema } from '../schemas/common/address.schema';
import { PickupHoursEntrySchema, ShippingOptionSchema, StoreCustomizationSchema } from '../schemas/store/store.schemas';
import { STORE_TAGS_VALUES } from '../types/store.constants';

const StoreSchema = new Schema<Store>(
  {
    merchantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
      default: 'inactive',
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
    customization: StoreCustomizationSchema,
    tags: {
      type: [String],
      enum: STORE_TAGS_VALUES,
      default: [],
    },
    isOpen: { type: Boolean, default: false },
    slug: { type: String, required: true },
  },
  { timestamps: true },
);

StoreSchema.pre('validate', async function (next) {
  if (this.isNew && !this.storeInternalId) {
    this.storeInternalId = await getNextSequenceValue('stores');
  }
  next();
});

StoreSchema.index({ merchantId: 1 });
StoreSchema.index({ 'address.location': '2dsphere' });
StoreSchema.index({ slug: 1 }, { unique: true });

export const StoreModel = model('Store', StoreSchema);
