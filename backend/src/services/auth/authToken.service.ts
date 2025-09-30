// auth-token.service.ts
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/user.model';
import { AppError } from '../../utils/appError';
import { signAccessToken, signRefreshToken, verifyToken } from '../../utils/jwt';

export class TokenError extends AppError {
  constructor(message: string, statusCode: number, public readonly shouldClearCookies: boolean = false) {
    super(message, statusCode);
  }
}

export class AuthTokenService {
  static signRefreshToken(userId: string) {
    return signRefreshToken(userId);
  }

  static signAccessToken(userId: string) {
    return signAccessToken(userId);
  }

  static async refreshAccessToken(token: string) {
    try {
      // Verify the token - this will throw if token is expired or invalid
      const decoded = verifyToken(token) as jwt.JwtPayload;

      // Check if user exists
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        // User no longer exists - clear cookies
        throw new TokenError('User not found', 401, true);
      }

      // Check if refresh token matches the one stored
      if (user.refreshToken !== token) {
        // Token mismatch - someone may have logged in from another device
        // Clear cookies as this token is no longer valid
        throw new TokenError('Refresh token has been revoked', 401, true);
      }

      const accessToken = signAccessToken(user._id.toString());
      return { user, accessToken };
    } catch (error) {
      // Handle JWT-specific errors
      if (error instanceof jwt.TokenExpiredError) {
        // Token is expired - clear cookies
        throw new TokenError('Refresh token expired', 401, true);
      } else if (error instanceof jwt.JsonWebTokenError) {
        // Token is malformed or invalid - clear cookies
        throw new TokenError('Invalid refresh token', 401, true);
      } else if (error instanceof TokenError) {
        // Re-throw our custom errors
        throw error;
      }

      // For any other error (database issues, etc.), don't clear cookies
      // This allows retry if the issue is transient
      throw new AppError('Failed to refresh token', 500);
    }
  }
}
