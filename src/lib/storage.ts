import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { getSupabase, STORAGE_BUCKET } from './supabase';
import { ProductImage } from '@/types';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_PRODUCT = 10;
export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
];

export interface UploadOptions {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  /** Folder inside the bucket, e.g. the user's id or "avatars-signup". */
  folder: string;
  isPrimary?: boolean;
  position?: number;
}

/** Validate, optimise (WebP, max 1600px) and upload to the Supabase Storage bucket. */
export async function processAndUploadImage(o: UploadOptions): Promise<ProductImage> {
  const { buffer, originalFilename, mimeType, folder, isPrimary = false, position = 0 } = o;

  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error(`Unsupported image format: ${mimeType}. Allowed: JPEG, PNG, WebP, AVIF, GIF.`);
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image is larger than 10MB.');
  }

  let optimized: Buffer;
  let width: number | undefined;
  let height: number | undefined;
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.format) throw new Error('Invalid or corrupted image file.');
    let pipeline = sharp(buffer).rotate();
    if ((meta.width && meta.width > 1600) || (meta.height && meta.height > 1600)) {
      pipeline = pipeline.resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
    }
    const out = await pipeline.webp({ quality: 85, effort: 4 }).toBuffer({ resolveWithObject: true });
    optimized = out.data;
    width = out.info.width;
    height = out.info.height;
  } catch (err) {
    throw new Error(`Failed to process image: ${err instanceof Error ? err.message : 'unknown error'}`);
  }

  const path = `${folder}/${randomUUID()}.webp`;
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, optimized, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return {
    fileId: path, // storage path inside the bucket
    url: data.publicUrl,
    filename: originalFilename.replace(/\.[^/.]+$/, '') + '.webp',
    mimeType: 'image/webp',
    size: optimized.length,
    isPrimary,
    position,
    width,
    height,
  };
}

export async function deleteStorageObjects(paths: string[]): Promise<number> {
  const clean = paths.filter(Boolean);
  if (clean.length === 0) return 0;
  const { data, error } = await getSupabase().storage.from(STORAGE_BUCKET).remove(clean);
  if (error) {
    console.warn('Storage delete warning:', error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/** Remove every object in the bucket (admin "wipe"). */
export async function emptyBucket(): Promise<number> {
  const storage = getSupabase().storage.from(STORAGE_BUCKET);
  let removed = 0;

  async function walk(prefix: string) {
    // paginate
    for (;;) {
      const { data, error } = await storage.list(prefix, { limit: 1000 });
      if (error || !data || data.length === 0) return;
      const files: string[] = [];
      for (const item of data) {
        const full = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) await walk(full); // folder
        else files.push(full);
      }
      if (files.length === 0) return;
      const { data: del } = await storage.remove(files);
      removed += del?.length ?? 0;
      if (data.length < 1000) return;
    }
  }
  await walk('');
  return removed;
}
