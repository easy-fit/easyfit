import { Types } from 'mongoose';

export type WalletTransactionDirection = 'in' | 'out';
export type WalletTransactionType = 'earning' | 'adjustment' | 'penalty' | 'withdrawal';
export type WalletTransactionMethod = 'cbu' | 'cvu' | 'alias' | 'manual';

export interface WalletTransaction {
  userId: Types.ObjectId;
  role: 'merchant' | 'rider';
  orderId?: Types.ObjectId;
  amount: number;
  direction: WalletTransactionDirection;
  type: WalletTransactionType;
  method?: WalletTransactionMethod;
  description?: string;
}

export interface CreateWalletTransactionDTO {
  userId: string;
  role: 'merchant' | 'rider';
  orderId?: string;
  amount: number;
  direction: WalletTransactionDirection;
  type: WalletTransactionType;
  method?: WalletTransactionMethod;
  description?: string;
}

export interface UpdateWalletTransactionDTO {
  amount?: number;
  method?: WalletTransactionMethod;
  description?: string;
}
