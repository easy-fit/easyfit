import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/env';

const JWT_SECRET: Secret = JWT_CONFIG.SECRET;
const REFRESH_TOKEN_SECRET: Secret = JWT_CONFIG.REFRESH_TOKEN_SECRET;

export const signAccessToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: Number(JWT_CONFIG.ACCESS_EXPIRES_IN),
  };
  return jwt.sign({ id }, JWT_SECRET, options);
};

export const signRefreshToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: Number(JWT_CONFIG.REFRESH_EXPIRES_IN),
  };
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return decoded;
};

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: JWT_CONFIG.COOKIE_DOMAIN,
  maxAge: parseInt(JWT_CONFIG.ACCESS_EXPIRES_IN) * 1000,
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: JWT_CONFIG.COOKIE_DOMAIN,
  maxAge: parseInt(JWT_CONFIG.REFRESH_EXPIRES_IN) * 1000,
};
