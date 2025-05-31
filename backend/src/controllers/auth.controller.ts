import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { createSendToken } from '../middlewares/auth';
import { accessTokenCookieOptions } from '../utils/jwt';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    createSendToken(user, 201, res);
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.login(req.body);
    createSendToken(user, 200, res);
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }
    await AuthService.logout(req.user._id);
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
}
