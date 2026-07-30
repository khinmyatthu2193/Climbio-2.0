import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { categoryRoutes } from './categoryRoutes.js';
import { productRoutes } from './productRoutes.js';

export const apiRoutes = Router();
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/products', productRoutes);
apiRoutes.use('/categories', categoryRoutes);
