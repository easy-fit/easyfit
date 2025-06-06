import { Schema } from 'mongoose';

export const RiderInfoSchema = new Schema({
  dni: { type: String, required: true },
  cuil: { type: String, required: true },
  vehicleType: {
    type: String,
    enum: ['bike', 'motorcycle'],
    required: true,
  },
  licensePlate: { type: String },
  photoUrl: { type: String, default: 'default.png' },
  kyc: {
    status: {
      type: String,
      default: 'pending',
    },
    applicantId: { type: String, default: '' },
    reviewResult: { type: String, default: 'pending' },
    updatedAt: { type: Date, default: Date.now },
  },
  score: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
});

export const MerchantInfoSchema = new Schema({
  dni: { type: String, required: true },
  cuit: { type: String, required: true },
  storeCount: { type: Number, default: 0 },
  kyc: {
    status: {
      type: String,
      default: 'pending',
    },
    applicantId: { type: String, default: '' },
    reviewResult: { type: String, default: 'pending' },
    updatedAt: { type: Date, default: Date.now },
  },
});
