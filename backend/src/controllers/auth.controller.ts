import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { createSendToken } from '../middlewares/auth';

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
    await AuthService.logout(req.body.refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.refreshToken(req.body.refreshToken);
    createSendToken(user, 200, res);
  });
}
