import jwt from 'jsonwebtoken';
import { ENV } from '@/config/env';

export interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}
