import { Schema } from 'mongoose';

export const PickupHoursEntrySchema = new Schema({
  day: {
    type: String,
    enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    required: true,
  },
  open: { type: String, required: true },
  close: { type: String, required: true },
});

export const ShippingOptionSchema = new Schema({
  enabled: { type: Boolean, required: true },
  minOrderAmount: Number,
  promoLabel: String,
});

export const StoreCustomizationSchema = new Schema({
  logoUrl: String,
  bannerUrl: String,
  socialLinks: {
    instagram: String,
    facebook: String,
    twitter: String,
    tiktok: String,
  },
});
