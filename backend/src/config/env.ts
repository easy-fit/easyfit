import { config } from 'dotenv';

config(); // carga .env

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || '',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  TIMEZONE: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires',
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
  TEMPLATE_ID_PASSWORD_RESET: process.env.SENDGRID_TEMPLATE_ID_PASSWORD_RESET || '',
  TEMPLATE_ID_EMAIL_VERIFICATION: process.env.SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION || '',
  TEMPLATE_ID_ORDER_RECIPT: process.env.SENDGRID_TEMPLATE_ID_ORDER_RECIPT || '',
  TEMPLATE_ID_LOGIN_ALERT: process.env.SENDGRID_TEMPLATE_ID_LOGIN_ALERT || '',
  ADMIN_ALERT_EMAILS: process.env.ADMIN_ALERT_EMAILS || '',
};

export const SUMSUB_CONFIG = {
  SUMSUB_API_TOKEN: process.env.SUMSUB_API_TOKEN || '',
  SUMSUB_SECRET_KEY: process.env.SUMSUB_SECRET_KEY || '',
  SUMSUB_WEBHOOK_SECRET: process.env.SUMSUB_WEBHOOK_SECRET || '',
  SUMSUB_LEVEL_NAME: process.env.SUMSUB_LEVEL_NAME || 'easyfit-dev',
};

export const R2 = {
  ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
  SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
  ACCOUNT_ID: process.env.R2_ACCOUNT_ID!,
  REGION: process.env.R2_REGION || 'auto',
  BUCKET_PRODUCTS: process.env.R2_BUCKET_PRODUCTS!,
  BUCKET_RETURNS: process.env.R2_BUCKET_RETURNS!,
  BUCKET_ASSETS: process.env.R2_BUCKET_ASSETS!,
  BUCKET_STORE_TAX: process.env.R2_BUCKET_STORES_TAX!,
};

export const MERCADO_PAGO = {
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || '',
  MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY || '',
  MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET || '',
  MP_WEBHOOK_URL: process.env.MP_WEBHOOK_URL || '',
  MP_CLIENT_ID: process.env.MP_CLIENT_ID || '',
  MP_CLIENT_SECRET: process.env.MP_CLIENT_SECRET || '',
};

export const GOOGLE_OAUTH = {
  CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
};