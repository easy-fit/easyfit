import { Schema } from 'mongoose';

const kycStatusEnum = [
  'verified',
  'rejected',
  'disabled',
  'documents-requested',
  'resubmission-requested',
  'pending',
  'requires-action',
];

export const RiderInfoSchema = new Schema({
  dni: { type: String, required: true },
  cuil: { type: String, required: true },
  birthDate: { type: Date, required: true },
  vehicleType: {
    type: String,
    enum: ['bike', 'motorcycle'],
    required: true,
  },
  licensePlate: { type: String },
  kycStatus: {
    type: String,
    enum: kycStatusEnum,
    default: 'pending',
  },
});

export const SellerInfoSchema = new Schema({
  dni: { type: String, required: true },
  cuit: { type: String, required: true },
  birthDate: { type: Date, required: true },
  storeCount: { type: Number, default: 0 },
  kycStatus: {
    type: String,
    enum: kycStatusEnum,
    default: 'pending',
  },
});
