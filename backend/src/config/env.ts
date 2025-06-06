import { config } from 'dotenv';

config(); // carga .env

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || '',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
};

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
  ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',
};

export const SENDGRID_CONFIG = {
  API_KEY: process.env.SENDGRID_API_KEY!,
  FROM_EMAIL: process.env.FROM_EMAIL!,
};

export const SUMSUB_CONFIG = {
  SUMSUB_API_TOKEN: process.env.SUMSUB_API_TOKEN || '',
  SUMSUB_SECRET_KEY: process.env.SUMSUB_SECRET_KEY || '',
  SUMSUB_WEBHOOK_SECRET: process.env.SUMSUB_WEBHOOK_SECRET || '',
  SUMSUB_LEVEL_NAME: process.env.SUMSUB_LEVEL_NAME || 'easyfit-dev',
};
