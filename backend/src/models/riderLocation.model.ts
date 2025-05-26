import { Schema, model } from 'mongoose';

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

const RiderLocationSchema = new Schema(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    location: { type: GeoPointSchema, required: true },
  },
  { timestamps: true },
);

RiderLocationSchema.index({ location: '2dsphere' });

export const RiderLocationModel = model('RiderLocation', RiderLocationSchema);
