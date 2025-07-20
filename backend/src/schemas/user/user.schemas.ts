import { Schema } from 'mongoose';

export const RiderInfoSchema = new Schema({
  cuit: { type: String, required: true },
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
