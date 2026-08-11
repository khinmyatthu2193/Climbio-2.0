import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new AppError('Logo must be a JPG, PNG, or WebP image', 422));
    callback(null, true);
  },
});

const applicationTypes = new Set([...allowedTypes, 'application/pdf']);

export const applicationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, callback) => {
    const valid = file.fieldname === 'shopLogo' ? allowedTypes.has(file.mimetype) : applicationTypes.has(file.mimetype);
    if (!valid) return callback(new AppError(
      file.fieldname === 'shopLogo'
        ? 'Shop logo must be a JPG, PNG, or WebP image'
        : 'Business proof must be a PDF, JPG, PNG, or WebP file',
      422,
    ));
    callback(null, true);
  },
});
