// auth-token.service.ts
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/user.model';
import { AppError } from '../../utils/appError';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from '../../utils/jwt';

export class AuthTokenService {
  static signRefreshToken(userId: string) {
    return signRefreshToken(userId);
  }

  static signAccessToken(userId: string) {
    return signAccessToken(userId);
  }

  static async refreshAccessToken(token: string) {
    const decoded = verifyToken(token) as jwt.JwtPayload;
    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 403);
    }

    const accessToken = signAccessToken(user._id.toString());
    return { user, accessToken };
  }
}
