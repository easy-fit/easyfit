import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../models/user.model';
import { AppError } from '../../utils/appError';
import { GOOGLE_OAUTH } from '../../config/env';
import { AuthTokenService } from './authToken.service';

const client = new OAuth2Client(GOOGLE_OAUTH.CLIENT_ID);

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  sub: string; // Google user ID
}

export class OAuthService {
  static async googleLogin(idToken: string) {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_OAUTH.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError('Invalid Google token', 401);
    }

    const googleUserInfo: GoogleUserInfo = {
      email: payload.email!,
      name: payload.name || '',
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      sub: payload.sub,
    };

    if (!googleUserInfo.email) {
      throw new AppError('Email not provided by Google', 400);
    }

    // Find existing user by googleId or email
    let user = await UserModel.findOne({
      $or: [
        { googleId: googleUserInfo.sub },
        { email: googleUserInfo.email }
      ]
    });

    if (user) {
      // Link Google account if user exists by email but doesn't have googleId
      if (!user.googleId) {
        user.googleId = googleUserInfo.sub;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await UserModel.create({
        name: googleUserInfo.given_name || googleUserInfo.name.split(' ')[0] || 'User',
        surname: googleUserInfo.family_name || googleUserInfo.name.split(' ').slice(1).join(' ') || '',
        email: googleUserInfo.email,
        googleId: googleUserInfo.sub,
        role: 'customer',
        additionalInfo: {},
        emailVerification: {
          verified: true, // Auto-verify for OAuth users
          attempts: 0,
        },
      });
    }

    // Generate refresh token and save
    const refreshToken = AuthTokenService.signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return user;
  }
}
