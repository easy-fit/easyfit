import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { JWT_CONFIG, SUMSUB_CONFIG } from '../config/env';
import { UserModel } from '../models/user.model';
import {
  signAccessToken,
  signRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from '../utils/jwt';
import crypto from 'crypto';

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
  token = req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');

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

  if (path.includes('/register/riders')) {
    req.body.role = 'rider';
  } else if (path.includes('/register/stores')) {
    req.body.role = 'merchant';
  } else {
    req.body.role = 'customer'; // Default para /register
  }

  next();
};

export const isEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user.emailVerification?.verified) {
    return next(new AppError('Email is not verified', 403));
  }

  next();
};

export const validateSumsubWebhook = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payloadDigest = req.headers['x-payload-digest'] as string;
    const digestAlg = req.headers['x-payload-digest-alg'] as string;

    if (!payloadDigest || !digestAlg) {
      console.error('Missing Sumsub webhook headers');
      return next(new AppError('Missing Sumsub webhook headers', 400));
    }

    if (digestAlg !== 'HMAC_SHA256_HEX') {
      console.error(`Unsupported digest algorithm: ${digestAlg}`);
      return next(
        new AppError(`Unsupported digest algorithm: ${digestAlg}`, 400),
      );
    }

    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      console.error('Body is not a Buffer:', typeof rawBody);
      return next(new AppError('Invalid request body', 400));
    }

    const calculatedDigest = crypto
      .createHmac('sha256', SUMSUB_CONFIG.SUMSUB_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (payloadDigest !== calculatedDigest) {
      console.error('Invalid webhook signature');
      return next(new AppError('Invalid webhook signature', 400));
    }

    req.body = JSON.parse(rawBody.toString('utf8'));

    next();
  } catch (err) {
    console.error('Error validating webhook:', err);
    return next(new AppError('Error validating webhook', 500));
  }
};

export const isKYCVerified = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user.role === 'admin') {
    return next();
  }
  if (
    req.user.role === 'rider' &&
    req.user.riderInfo?.kyc.status !== 'verified'
  ) {
    return next(new AppError('KYC not verified', 403));
  }
  if (
    req.user.role === 'merchant' &&
    req.user.merchantInfo?.kyc.status !== 'verified'
  ) {
    return next(new AppError('KYC not verified', 403));
  }
  next();
};
