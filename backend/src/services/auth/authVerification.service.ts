// auth-verification.service.ts
import crypto from 'crypto';
import { UserModel } from '../../models/user.model';
import { AppError } from '../../utils/appError';
import { EmailService } from '../email.service';

export class AuthVerificationService {
  static async verifyEmail(email: string, code: string) {
    const user = await UserModel.findOne({ email });

    if (!user || user.emailVerification.verified) {
      throw new AppError('Invalid operation', 400);
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (user.emailVerification.attempts >= 3) {
      throw new AppError('Too many failed attempts. Please request a new code.', 429);
    }

    if (
      user.emailVerification.code !== hashedCode ||
      !user.emailVerification.expires ||
      user.emailVerification.expires < new Date()
    ) {
      // Increment attempts using findByIdAndUpdate to avoid full document validation
      await UserModel.findByIdAndUpdate(
        user._id,
        { $inc: { 'emailVerification.attempts': 1 } },
        { runValidators: false }
      );
      throw new AppError('Invalid or expired verification code', 400);
    }

    // Update verification status using findByIdAndUpdate to avoid full document validation
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        'emailVerification.verified': true,
        'emailVerification.code': undefined,
        'emailVerification.expires': undefined,
      },
      { runValidators: false }
    );

    user.emailVerification.verified = true;
    user.emailVerification.code = undefined;
    user.emailVerification.expires = undefined;

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

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update verification fields using findByIdAndUpdate to avoid full document validation
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        'emailVerification.code': hashedCode,
        'emailVerification.expires': expiresAt,
        'emailVerification.attempts': 0,
      },
      { runValidators: false }
    );

    await EmailService.sendVerificationCode(user.email, code);

    return {
      message: 'Verification code sent successfully',
      expiresAt,
    };
  }
}
