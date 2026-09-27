import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload & TokenPayload;
    if (!decoded.sub || !decoded.email || !decoded.role) {
      throw new AppError('Invalid token payload', 401, 'INVALID_TOKEN');
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};
