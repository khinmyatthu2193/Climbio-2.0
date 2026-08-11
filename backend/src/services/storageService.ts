import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

async function upload(userId: string, folder: string, file: Express.Multer.File) {
  const client = getSupabaseAdmin();
  const extension = extensions[file.mimetype];
  if (!extension) throw new AppError('Unsupported file format', 422);
  const path = `${folder}/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype, cacheControl: '3600', upsert: false });
  if (error) throw new AppError(`File upload failed: ${error.message}`, 502);
  const { data } = client.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const storageService = {
  async uploadLogo(userId: string, file: Express.Multer.File) {
    return upload(userId, 'logos', file);
  },
  uploadVerificationDocument: (userId: string, file: Express.Multer.File) => upload(userId, 'verification-documents', file),
};
