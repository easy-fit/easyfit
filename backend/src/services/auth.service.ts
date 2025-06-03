import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/appError';
import { UserService } from './user.service';
import { comparePasswords, hashPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { LoginDTO, RegisterDTO } from '../types/user.types';
import { EmailService } from './email.service';

export class AuthService {
  static async register(data: RegisterDTO) {
    await UserService.ensureUserNotExists(data.email, data.phone);

    const hashedPassword = await hashPassword(data.password);
    const user = await UserModel.create({
      ...data,
      passwordHash: hashedPassword,
      emailVerification: {
        verified: false,
        attempts: 0,
      },
    });

    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    this.sendVerificationCode(user.email).catch((err) => {
      console.error(`Error sending verification code to ${user.email}:`, err);
    });

    return user;
  }

  static async login({ email, password }: LoginDTO) {
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user || !(await comparePasswords(password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    const refreshToken = signRefreshToken(user._id);
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
    const decoded = verifyToken(token) as jwt.JwtPayload;
    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 403);
    }

    const accessToken = signAccessToken(user._id.toString());
    return { user, accessToken };
  }

  static async forgotPassword(email: string) {
    const response = {
      status: 'success',
      message:
        'If this email belongs to an account, a password reset link will be sent shortly',
    };

    this.processPasswordReset(email).catch((err) => {
      console.error('Error processing password reset:', err);
    });

    return response;
  }

  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await UserModel.findById(userId).select('+passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await comparePasswords(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.passwordHash = await hashPassword(newPassword);
    user.refreshToken = signRefreshToken(user._id);
    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async verifyEmail(email: string, code: string) {
    const user = await UserModel.findOne({ email });

    if (!user || user.emailVerification.verified) {
      throw new AppError('Invalid operation', 400);
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (user.emailVerification.attempts >= 3) {
      throw new AppError(
        'Too many failed attempts. Please request a new code.',
        429,
      );
    }

    if (
      user.emailVerification.code !== hashedCode ||
      !user.emailVerification.expires ||
      user.emailVerification.expires < new Date()
    ) {
      user.emailVerification.attempts += 1;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Invalid or expired verification code', 400);
    }

    user.emailVerification.verified = true;
    user.emailVerification.code = undefined;
    user.emailVerification.expires = undefined;
    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async sendVerificationCode(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerification.verified) {
      throw new AppError('Email already verified', 400);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    user.emailVerification.code = hashedCode;
    user.emailVerification.expires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerification.attempts = 0;

    await user.save({ validateBeforeSave: false });

    await EmailService.sendVerificationCode(user.email, code);

    return {
      message: 'Verification code sent successfully',
      expiresAt: user.emailVerification.expires,
    };
  }

  private static async processPasswordReset(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await EmailService.sendPasswordResetEmail(email, resetToken);
  }
}
