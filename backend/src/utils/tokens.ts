import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

export interface TokenPayload { sub: string; email: string; role: Role; }
const sign = (payload: TokenPayload, secret: string, expiresIn: string) =>
  jwt.sign(payload, secret, { expiresIn } as SignOptions);

export const createAccessToken = (payload: TokenPayload) =>
  sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
export const createRefreshToken = (payload: TokenPayload) =>
  sign(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');
