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
  orderItemIds: string;
  evidencePhotos: string[];
}

export interface UpdateReturnDamageDTO {
  status?: ReturnDamageRequestStatus;
  reviewedBy?: string;
  resolutionNote?: string;
}
