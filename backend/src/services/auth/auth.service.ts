// auth.service.ts (versión principal simplificada)
import { LoginDTO, RegisterDTO, CreateManagerDTO } from '../../types/user.types';
import { AuthVerificationService } from './authVerification.service';
import { AuthPasswordService } from './authPassword.service';
import { AuthTokenService } from './authToken.service';
import { UserService } from '../user.service';
import { AppError } from '../../utils/appError';
import { UserModel } from '../../models/user.model';
import { StoreManagerModel } from '../../models/storeManager.model';
import { StoreModel } from '../../models/store.model';
import { comparePasswords, hashPassword } from '../../utils/password';
import { EmailService } from '../email.service';
import { Types } from 'mongoose';

export class AuthService {
  static async register(data: RegisterDTO) {
    await UserService.ensureUserNotExists(data.email);

    if (data.merchantInfo?.kyc) {
      const kyc = {
        status: 'pending',
        applicantId: '',
        reviewResult: 'pending',
      };
      data.merchantInfo.kyc = kyc;
    }

    if (data.riderInfo?.kyc) {
      const kyc = {
        status: 'pending',
        applicantId: '',
        reviewResult: 'pending',
      };
      data.riderInfo.kyc = kyc;
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await UserModel.create({
      ...data,
      passwordHash: hashedPassword,
      emailVerification: {
        verified: false,
        attempts: 0,
      },
    });

    const refreshToken = AuthTokenService.signRefreshToken(user._id);

    // Use direct MongoDB collection update to bypass schema validation
    await UserModel.collection.updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    user.refreshToken = refreshToken;

    AuthVerificationService.sendVerificationCode(user.email).catch((err) => {
      console.error(`Error sending verification code to ${user.email}:`, err);
    });

    return user;
  }

  static async login({ email, password }: LoginDTO, userAgent?: string) {
    const user = await UserModel.findOne({ email }).select('+passwordHash');

    if (!user || !user.passwordHash || !(await comparePasswords(password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    const refreshToken = AuthTokenService.signRefreshToken(user._id);

    // Use direct MongoDB collection update to bypass schema validation
    await UserModel.collection.updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    user.refreshToken = refreshToken;

    if (!userAgent) userAgent = 'Desconocido';
    if (user.role === 'merchant') EmailService.sendLoginAlert(email, userAgent);

    return user;
  }

  static async logout(userId: string) {
    // Use direct MongoDB collection update to bypass schema validation
    const result = await UserModel.collection.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $unset: { refreshToken: '' } }
    );

    if (result.matchedCount === 0) throw new AppError('User not found', 404);
  }

  static async refreshToken(token: string) {
    return AuthTokenService.refreshAccessToken(token);
  }

  static async forgotPassword(email: string) {
    return AuthPasswordService.forgotPassword(email);
  }

  static async resetPassword(token: string, newPassword: string) {
    return AuthPasswordService.resetPassword(token, newPassword);
  }

  static async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    return AuthPasswordService.updatePassword(userId, currentPassword, newPassword);
  }

  static async verifyEmail(email: string, code: string) {
    return AuthVerificationService.verifyEmail(email, code);
  }

  static async sendVerificationCode(email: string) {
    return AuthVerificationService.sendVerificationCode(email);
  }

  static async createManager(data: CreateManagerDTO, createdBy: string) {
    // Verify the store exists and the creator has access to it
    const store = await StoreModel.findById(data.storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    if (store.merchantId.toString() !== createdBy.toString()) {
      throw new AppError('You do not have permission to create managers for this store', 403);
    }

    // Check if user already exists
    await UserService.ensureUserNotExists(data.email);

    const hashedPassword = await hashPassword(data.password);
    
    // Create manager user
    const manager = await UserModel.create({
      name: data.name,
      surname: data.surname,
      email: data.email,
      passwordHash: hashedPassword,
      role: 'manager',
      additionalInfo: data.additionalInfo,
      managerInfo: {
        assignedStores: [data.storeId],
        assignedBy: createdBy,
        createdAt: new Date()
      },
      emailVerification: {
        verified: false,
        attempts: 0,
      },
    });

    // Create store-manager relationship
    await StoreManagerModel.create({
      storeId: data.storeId,
      managerId: manager._id,
      assignedBy: createdBy,
      assignedAt: new Date(),
      isActive: true
    });

    // Send verification email
    AuthVerificationService.sendVerificationCode(manager.email).catch((err) => {
      console.error(`Error sending verification code to ${manager.email}:`, err);
    });

    return manager;
  }
}
