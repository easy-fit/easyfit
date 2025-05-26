import { Types } from 'mongoose';

export type PayoutMethodType = 'cbu' | 'cvu' | 'alias';

export interface PayoutMethod {
  type: PayoutMethodType;
  value: string;
}

export interface Wallet {
  userId?: Types.ObjectId;
  storeId?: Types.ObjectId;
  lastPayout?: Date;
  availableBalance: number;
  pendingBalance: number;
  lastActivity?: Date;
  payoutMethod: PayoutMethod;
}
