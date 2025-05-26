import { Types } from 'mongoose';

export type KycSessionStatus = 'pending' | 'verified' | 'rejected';

export interface KycSession {
  userId: Types.ObjectId;
  sessionId: string;
  status: KycSessionStatus;
  failureReason?: string;
}
