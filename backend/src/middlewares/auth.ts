import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types/user.types';
import { AppError } from '../utils/appError';
import { JWT_CONFIG } from '../config/env';
import { UserModel } from '../models/user.model';
import {
  signAccessToken,
  signRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from '../utils/jwt';

export const createSendToken = (
  user: any,
  statusCode: number,
  res: Response,
): void => {
  const userId = user._id.toString();
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  res.cookie('refresh', refreshToken, refreshTokenCookieOptions);
  res.cookie('jwt', accessToken, accessTokenCookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: { user },
  });
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as { id: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401),
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

export const restrictTo =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

export const assignRoleFromPath = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const path = req.path;

  if (path.includes('/register/rider')) {
    req.body.role = 'rider';
  } else if (path.includes('/register/stores')) {
    req.body.role = 'seller';
  } else {
    req.body.role = 'consumer'; // Default para /register
  }

  next();
};
