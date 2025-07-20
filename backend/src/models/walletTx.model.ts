import { Schema, model } from 'mongoose';
import { WalletTransaction } from '../types/walletTx.types';

const WalletTransactionSchema = new Schema<WalletTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['merchant', 'rider'], required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true }, // in cents
    direction: { type: String, enum: ['in', 'out'], required: true },
    type: {
      type: String,
      enum: ['earning', 'adjustment', 'penalty', 'withdrawal'],
      required: true,
    },
    method: {
      type: String,
      enum: ['cbu', 'cvu', 'alias', 'manual'],
    },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);

WalletTransactionSchema.index({ walletId: 1 });
WalletTransactionSchema.index({ createdAt: -1 });

export const WalletTransactionModel = model('WalletTransaction', WalletTransactionSchema);
