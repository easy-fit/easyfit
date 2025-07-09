import { Types } from 'mongoose';

export type PaymentType = 'hold' | 'capture' | 'refund';

export interface Payment {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  type: PaymentType;
  amount: number;
  status: string;
  externalId: string;
}
