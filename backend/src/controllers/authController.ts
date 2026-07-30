import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { authService } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';
import { storageService } from '../services/storageService.js';

const cookieName = 'climbio_refresh';
const isProduction = env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  partitioned: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};
const sendSession = (res: Response, session: Awaited<ReturnType<typeof authService.login>>) => {
  res.cookie(cookieName, session.refreshToken, cookieOptions);
  res.json({ user: session.user, accessToken: session.accessToken });
};

export const authController = {
  register: async (req: Request, res: Response) => sendSession(res.status(201), await authService.register(req.body)),
  login: async (req: Request, res: Response) => sendSession(res, await authService.login(req.body)),
  refresh: async (req: Request, res: Response) => {
    const token = req.cookies[cookieName] as string | undefined;
    if (!token) throw new AppError('Refresh token is required', 401);
    sendSession(res, await authService.refresh(token));
  },
  logout: async (req: Request, res: Response) => {
    await authService.logout(req.cookies[cookieName] as string | undefined);
    res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
    res.status(204).send();
  },
  me: async (req: Request, res: Response) => {
    const user = await authService.getUser(req.user!.id);
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
  },
  updateProfile: async (req: Request, res: Response) => {
    res.json(await authService.updateProfile(req.user!.id, req.body));
  },
  changePassword: async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
    res.status(204).send();
  },
  uploadLogo: async (req: Request, res: Response) => {
    if (!req.file) throw new AppError('A logo file is required', 422);
    const logoUrl = await storageService.uploadLogo(req.user!.id, req.file);
    res.json(await authService.updateLogo(req.user!.id, logoUrl));
  },
};
