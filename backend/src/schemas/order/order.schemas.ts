import { Schema } from 'mongoose';

export const DeliveryVerificationSchema = new Schema({
  code: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending',
  },
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
    enum: ['simple', 'advanced', 'premium'],
    required: true,
    default: 'simple',
  },
  address: {
    formatted: {
      street: { type: String, required: true },
      streetNumber: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  tryOnEnabled: { type: Boolean, required: true },
  distanceKm: { type: Number },
  durationMinutes: { type: Number },
});

export const TryPeriodSchema = new Schema({
  isActive: { type: Boolean, default: false },
  startedAt: { type: Date },
  endsAt: { type: Date },
  duration: { type: Number }, // seconds
  status: {
    type: String,
    enum: ['active', 'expired', 'finalized'],
    default: 'active',
  },
  exceededTime: { type: Number, default: 0 }, // seconds over limit
  finalizedAt: { type: Date },
});
