import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { categoryRoutes } from './categoryRoutes.js';
import { dashboardRoutes } from './dashboardRoutes.js';
import { invoiceRoutes } from './invoiceRoutes.js';
import { productRoutes } from './productRoutes.js';
import { publicShopRoutes } from './publicShopRoutes.js';

export const apiRoutes = Router();
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/products', productRoutes);
apiRoutes.use('/categories', categoryRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
apiRoutes.use('/invoices', invoiceRoutes);
apiRoutes.use('/shop', publicShopRoutes);
