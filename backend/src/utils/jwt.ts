import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/env';

/**
 * Convert time string (like '10m', '7d', '1h') to milliseconds
 * @param timeString - Time string in format like '10m', '7d', '1h'
 * @returns Time in milliseconds
 */
const convertToMilliseconds = (timeString: string): number => {
  const timeValue = parseInt(timeString);
  const timeUnit = timeString.slice(-1);

  switch (timeUnit) {
    case 's': return timeValue * 1000;
    case 'm': return timeValue * 60 * 1000;
    case 'h': return timeValue * 60 * 60 * 1000;
    case 'd': return timeValue * 24 * 60 * 60 * 1000;
    default: return parseInt(timeString); // Assume milliseconds if no unit
  }
};

const JWT_SECRET: Secret = JWT_CONFIG.SECRET;
const REFRESH_TOKEN_SECRET: Secret = JWT_CONFIG.REFRESH_TOKEN_SECRET;

export const signAccessToken = (id: string): string => {
  const expiresIn = JWT_CONFIG.ACCESS_EXPIRES_IN || '10m';
  return jwt.sign({ id }, JWT_SECRET, { expiresIn } as any);
};

export const signRefreshToken = (id: string): string => {
  const expiresIn = JWT_CONFIG.REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ id }, REFRESH_TOKEN_SECRET, { expiresIn } as any);
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
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  domain: JWT_CONFIG.COOKIE_DOMAIN || undefined,
  path: '/',
  maxAge: convertToMilliseconds(JWT_CONFIG.ACCESS_EXPIRES_IN || '10m'),
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  domain: JWT_CONFIG.COOKIE_DOMAIN || undefined,
  path: '/',
  maxAge: convertToMilliseconds(JWT_CONFIG.REFRESH_EXPIRES_IN || '7d'),
};
