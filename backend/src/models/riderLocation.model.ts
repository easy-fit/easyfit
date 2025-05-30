import { Schema, model } from 'mongoose';
import { RiderLocation } from '../types/riderLocation.types';

const GeoPointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const RiderLocationSchema = new Schema<RiderLocation>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    location: { type: GeoPointSchema, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RiderLocationSchema.index({ riderId: 1 }, { unique: true });
RiderLocationSchema.index({ location: '2dsphere' });

export const RiderLocationModel = model('RiderLocation', RiderLocationSchema);
