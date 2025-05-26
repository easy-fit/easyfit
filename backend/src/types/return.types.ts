import { Types } from 'mongoose';

export type ReturnDamageRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ReturnDamageRequest {
  orderItemIds: Types.ObjectId[];
  status: ReturnDamageRequestStatus;
  evidencePhotos: string[];
  reviewedBy?: Types.ObjectId;
  resolutionNote?: string;
}
