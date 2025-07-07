import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { RegisterDTO } from '../types/user.types';
import { createSendToken } from '../middlewares/auth';
import { accessTokenCookieOptions } from '../utils/jwt';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const data: RegisterDTO = req.body;
    const user = await AuthService.register(data);
    createSendToken(user, 201, res);
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.login(req.body);
    createSendToken(user, 200, res);
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    await AuthService.logout(req.user._id);
    res.clearCookie('jwt', accessTokenCookieOptions);
    res.clearCookie('refresh', accessTokenCookieOptions);
    res.status(200).json({ message: 'Logged out successfully' });
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refresh;
    if (!token) throw new AppError('No refresh token found', 401);

    const { user, accessToken } = await AuthService.refreshToken(token);
    res.cookie('jwt', accessToken, accessTokenCookieOptions);

    res.status(200).json({
      status: 'success',
      token: accessToken,
      data: { user },
    });
  });

  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new AppError('Password is required', 400);
    }

    const user = await AuthService.resetPassword(token, password);

    createSendToken(user, 200, res);
  });

  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    await AuthService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: 'If an account exists, a password reset email has been sent',
    });
  });

  static updatePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password are required', 400);
    }

    const user = await AuthService.updatePassword(
      req.user._id,
      currentPassword,
      newPassword,
    );

    createSendToken(user, 200, res);
  });

  static verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { code } = req.body;
    const { email } = req.user;

    if (!email || !code) {
      throw new AppError('Email and verification code are required', 400);
    }
    await AuthService.verifyEmail(email, code);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  });

  static sendVerificationCode = catchAsync(
    async (req: Request, res: Response) => {
      const { email } = req.user;

      if (!email) {
        throw new AppError('Email is required', 400);
      }

      const result = await AuthService.sendVerificationCode(email);

      res.status(200).json({
        status: 'success',
        message: 'Verification code sent successfully',
        expiresAt: result.expiresAt,
      });
    },
  );
}
