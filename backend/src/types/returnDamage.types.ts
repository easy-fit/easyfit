import { Types } from 'mongoose';

export type ReturnDamageRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ReturnDamageRequest {
  orderItemIds: Types.ObjectId[];
  status: ReturnDamageRequestStatus;
  evidencePhotos: string[];
  reviewedBy?: Types.ObjectId;
  resolutionNote?: string;
}

export interface CreateReturnDamageDTO {
  orderItemIds: Types.ObjectId[];
  evidencePhotos: string[];
}

export interface UpdateReturnDamageDTO {
  status?: ReturnDamageRequestStatus;
  reviewedBy?: Types.ObjectId;
  resolutionNote?: string;
}
