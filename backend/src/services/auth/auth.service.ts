// auth.service.ts (versión principal simplificada)
import { LoginDTO, RegisterDTO } from '../../types/user.types';
import { AuthVerificationService } from './authVerification.service';
import { AuthPasswordService } from './authPassword.service';
import { AuthTokenService } from './authToken.service';
import { UserService } from '../user.service';
import { AppError } from '../../utils/appError';
import { UserModel } from '../../models/user.model';
import { comparePasswords, hashPassword } from '../../utils/password';

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
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    AuthVerificationService.sendVerificationCode(user.email).catch((err) => {
      console.error(`Error sending verification code to ${user.email}:`, err);
    });

    return user;
  }

  static async login({ email, password }: LoginDTO) {
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user || !(await comparePasswords(password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    const refreshToken = AuthTokenService.signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async logout(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
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

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    return AuthPasswordService.updatePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }

  static async verifyEmail(email: string, code: string) {
    return AuthVerificationService.verifyEmail(email, code);
  }

  static async sendVerificationCode(email: string) {
    return AuthVerificationService.sendVerificationCode(email);
  }
}
