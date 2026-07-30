import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const storageService = {
  async uploadLogo(userId: string, file: Express.Multer.File) {
    const client = getSupabaseAdmin();
    const extension = extensions[file.mimetype];
    if (!extension) throw new AppError('Unsupported logo format', 422);
    const path = `logos/${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype, cacheControl: '3600', upsert: false });
    if (error) throw new AppError(`Logo upload failed: ${error.message}`, 502);
    const { data } = client.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
