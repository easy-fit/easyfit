import { Schema, model } from 'mongoose';
import { ReturnDamageRequest } from '../types/return.types';

const ReturnDamageRequestSchema = new Schema<ReturnDamageRequest>(
  {
    orderItemIds: {
      type: [Schema.Types.ObjectId],
      ref: 'OrderItem',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    evidencePhotos: {
      type: [String],
      default: [],
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String },
  },
  { timestamps: true },
);

export const ReturnDamageRequestModel = model(
  'ReturnDamageRequest',
  ReturnDamageRequestSchema,
);
