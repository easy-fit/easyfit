import { Schema } from 'mongoose';

export const RiderInfoSchema = new Schema({
  cuit: { type: String, required: true },
  vehicleType: {
    type: String,
    enum: ['bike', 'motorcycle', 'car'],
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

export const ManagerInfoSchema = new Schema({
  assignedStores: [{ type: Schema.Types.ObjectId, ref: 'Store' }],
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
