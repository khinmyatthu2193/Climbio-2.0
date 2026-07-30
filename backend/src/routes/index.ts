import { Router } from 'express';
import { authRoutes } from './authRoutes.js';

export const apiRoutes = Router();
apiRoutes.use('/auth', authRoutes);
