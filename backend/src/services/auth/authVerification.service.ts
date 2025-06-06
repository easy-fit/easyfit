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
}
