import { Schema, model } from 'mongoose';
import { Wallet } from '../types/wallet.types';
import { PayoutMethodSchema } from '../schemas/wallet/wallet.schemas';

const WalletSchema = new Schema<Wallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
    lastPayout: { type: Date },
    availableBalance: { type: Number, required: true }, // in cents
    pendingBalance: { type: Number, required: true }, // in cents
    lastActivity: { type: Date },
    payoutMethod: { type: PayoutMethodSchema, required: true },
  },
  { timestamps: true },
);

export const WalletModel = model('Wallet', WalletSchema);
