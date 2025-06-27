import { ReturnDamageRequestModel } from '../models/returnDamage.model';
import { AppError } from '../utils/appError';
import {
  CreateReturnDamageDTO,
  UpdateReturnDamageDTO,
} from '../types/returnDamage.types';
import { R2 } from '../config/env';

const { BUCKET_RETURNS } = R2;

export class ReturnDamageService {
  static async getRequests() {
    return ReturnDamageRequestModel.find();
  }

  static async getRequestById(id: string) {
    const request = await ReturnDamageRequestModel.findById(id);
    this.ensureRequestExists(request);
    return request;
  }

  static async createRequest(data: CreateReturnDamageDTO) {
    return ReturnDamageRequestModel.create(data);
  }

  static async updateRequest(id: string, data: UpdateReturnDamageDTO) {
    const request = await ReturnDamageRequestModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    this.ensureRequestExists(request);

    return request;
  }

  static async deleteRequest(id: string) {
    const request = await ReturnDamageRequestModel.findByIdAndDelete(id);
    this.ensureRequestExists(request);
  }

  private static ensureRequestExists(request: any): void {
    if (!request) {
      throw new AppError('Return damage request not found', 404);
    }
  }
}
