import { Types } from 'mongoose';

export type PaymentType = 'hold' | 'capture' | 'refund';

export interface FinalPaymentInfo {
  settledAt: Date;
  capturedAmount: number;
  refundedAmount: number;
}

export interface Payment {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  type: PaymentType;
  finalPaymentInfo?: FinalPaymentInfo;
  amount: number;
  status: string;
  externalId: string;
}
