import dotenv from 'dotenv';

dotenv.config();

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optional = (name: string, fallback: string): string => process.env[name] ?? fallback;

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '4000'), 10),
  databaseUrl: required('DATABASE_URL', 'mysql://root:password@localhost:3306/task_management'),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me-please-change-me-please'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  uploadDir: optional('UPLOAD_DIR', 'uploads'),
  maxUploadSizeMb: parseInt(optional('MAX_UPLOAD_SIZE_MB', '5'), 10),
  rateLimitWindowMin: parseInt(optional('RATE_LIMIT_WINDOW_MIN', '15'), 10),
  rateLimitMax: parseInt(optional('RATE_LIMIT_MAX', '200'), 10),
  isProduction: process.env.NODE_ENV === 'production',
};

export type AppEnv = typeof env;
