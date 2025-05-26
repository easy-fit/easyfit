import { config } from 'dotenv';

config(); // carga .env

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || '',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SUMSUB_APP_TOKEN: process.env.SUMSUB_APP_TOKEN || '',
  SUMSUB_SECRET_KEY: process.env.SUMSUB_SECRET_KEY || '',
};
