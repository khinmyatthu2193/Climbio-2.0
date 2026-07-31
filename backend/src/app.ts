import 'express-async-errors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRoutes } from './routes/index.js';
import { AppError } from './utils/AppError.js';

export const app = express();
const allowedOrigins = env.FRONTEND_URL.split(',').map((origin) => origin.trim().replace(/\/$/, ''));
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    console.warn('[cors] rejected origin', { origin });
    return callback(new AppError('Origin not allowed by CORS', 403));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);
