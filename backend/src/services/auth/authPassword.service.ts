// auth-password.service.ts
import crypto from 'crypto';
import { UserModel } from '../../models/user.model';
import { AppError } from '../../utils/appError';
import { hashPassword, comparePasswords } from '../../utils/password';
import { EmailService } from '../email.service';
import { AuthTokenService } from './authToken.service';

export class AuthPasswordService {
  static async forgotPassword(email: string) {
    const response = {
      status: 'success',
      message: 'If this email belongs to an account, a password reset link will be sent shortly',
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

    const refreshToken = AuthTokenService.signRefreshToken(user._id);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await UserModel.findById(userId).select('+passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await comparePasswords(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.passwordHash = await hashPassword(newPassword);
    user.refreshToken = AuthTokenService.signRefreshToken(user._id);
    await user.save({ validateBeforeSave: false });

    return user;
  }

  private static async processPasswordReset(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await EmailService.sendPasswordReset(email, resetToken);
  }
}
