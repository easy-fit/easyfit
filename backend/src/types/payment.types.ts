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

export interface CreatePaymentDTO {
  orderId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  externalId: string;
}

export interface UpdatePaymentDTO {
  status?: PaymentStatus;
}
