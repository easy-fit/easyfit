import { Schema } from 'mongoose';

export const DeliveryVerificationSchema = new Schema({
  code: { type: String, required: true },
  attempts: {
    made: { type: Number, default: 0 },
    max: { type: Number, default: 3 },
  },
  verifiedAt: { type: Date },
});

export const ShippingSchema = new Schema({
  cost: { type: Number, required: true },
  subsidizedBy: {
    type: String,
    enum: ['merchant', 'platform', 'user'],
    default: 'user',
  },
  type: {
    type: String,
    enum: ['basic', 'advanced', 'premium'],
    required: true,
  },
  tryOnEnabled: { type: Boolean, required: true },
  distanceKm: { type: Number },
});
