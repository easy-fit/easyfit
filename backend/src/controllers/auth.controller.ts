import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { OAuthService } from '../services/auth/oauth.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { RegisterDTO, CreateManagerDTO, GoogleAuthDTO } from '../types/user.types';
import { createSendToken } from '../middlewares/auth';
import { accessTokenCookieOptions } from '../utils/jwt';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const data: RegisterDTO = req.body;
    const user = await AuthService.register(data);
    createSendToken(user, 201, res);
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.login(req.body, req.headers['user-agent']);
    createSendToken(user, 200, res);
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    await AuthService.logout(req.user._id);

    // Clear cookies with the same options they were set with
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      domain: accessTokenCookieOptions.domain,
      path: '/',
    };

    res.clearCookie('jwt', clearCookieOptions);
    res.clearCookie('refresh', clearCookieOptions);
    res.status(200).json({ message: 'Logged out successfully' });
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refresh;
    if (!token) throw new AppError('No refresh token found', 401);

    try {
      const { user, accessToken } = await AuthService.refreshToken(token);
      res.cookie('jwt', accessToken, accessTokenCookieOptions);

      res.status(200).json({
        status: 'success',
        token: accessToken,
        data: { user },
      });
    } catch (error: any) {
      // Only clear cookies if the error indicates we should
      // This prevents clearing cookies for transient errors (database issues, etc.)
      if (error.shouldClearCookies) {
        const clearCookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
          domain: accessTokenCookieOptions.domain,
          path: '/',
        };

        res.clearCookie('jwt', clearCookieOptions);
        res.clearCookie('refresh', clearCookieOptions);
      }
      throw error;
    }
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

    const user = await AuthService.updatePassword(req.user._id, currentPassword, newPassword);

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

  static sendVerificationCode = catchAsync(async (req: Request, res: Response) => {
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
  });

  static createManager = catchAsync(async (req: Request, res: Response) => {
    const data: CreateManagerDTO = req.body;
    const createdBy = req.user._id.toString();

    const manager = await AuthService.createManager(data, createdBy);

    res.status(201).json({
      status: 'success',
      message: 'Manager created successfully',
      data: { user: manager },
    });
  });

  static googleAuth = catchAsync(async (req: Request, res: Response) => {
    const { idToken }: GoogleAuthDTO = req.body;

    if (!idToken) {
      throw new AppError('Google ID token is required', 400);
    }

    const user = await OAuthService.googleLogin(idToken);
    createSendToken(user, 200, res);
  });
}
