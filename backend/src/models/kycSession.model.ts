import { Schema, model } from 'mongoose';
import { KycSession } from '../types/kyc.types';

const KycSessionSchema = new Schema<KycSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    failureReason: { type: String },
  },
  { timestamps: true },
);

KycSessionSchema.index({ status: 1 });

export const KycSessionModel = model('KycSession', KycSessionSchema);
