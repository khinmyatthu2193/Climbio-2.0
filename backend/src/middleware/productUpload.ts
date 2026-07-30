import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new AppError('Product image must be a JPG, PNG, or WebP image', 422));
    }
    callback(null, true);
  },
});
