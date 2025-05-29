import { KycSessionModel } from '../models/kycSession.model';
import { AppError } from '../utils/appError';
import { CreateKycSessionDTO, UpdateKycSessionDTO } from '../types/kyc.types';

export class KycSessionService {
  static async getSessions() {
    return KycSessionModel.find();
  }

  static async getSessionById(id: string) {
    const session = await KycSessionModel.findById(id);
    if (!session) {
      throw new AppError('KYC session not found', 404);
    }
    return session;
  }

  static async createSession(data: CreateKycSessionDTO) {
    return KycSessionModel.create(data);
  }

  static async updateSession(id: string, updates: UpdateKycSessionDTO) {
    const session = await KycSessionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!session) {
      throw new AppError('KYC session not found', 404);
    }

    return session;
  }
}
