import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ error: 'A record with these details already exists' });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    res.status(404).json({ error: 'Record not found' });
    return;
  }
  if (error instanceof multer.MulterError) {
    res.status(422).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2 MB or smaller' : error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'An unexpected error occurred' });
};
