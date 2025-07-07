import { Types } from 'mongoose';

export type PaymentType = 'hold' | 'capture' | 'refund';
export type PaymentStatus = 'placed' | 'success' | 'failed';

export interface Payment {
  orderId: Types.ObjectId;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  externalId: string;
}
