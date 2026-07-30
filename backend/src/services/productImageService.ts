import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const productImageService = {
  async upload(userId: string, file: Express.Multer.File) {
    const extension = extensions[file.mimetype];
    if (!extension) throw new AppError('Unsupported product image format', 422);
    if (env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_publishable_')) {
      throw new AppError(
        'Product image storage is using a publishable key. Configure SUPABASE_SERVICE_ROLE_KEY with the server-side service-role secret.',
        503,
      );
    }

    const client = getSupabaseAdmin();
    const path = `products/${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype, cacheControl: '3600', upsert: false });
    if (error) throw new AppError(`Product image upload failed: ${error.message}`, 502);

    return client.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  },
};
