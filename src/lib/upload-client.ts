'use client';

import { ProductImage } from '@/types';

/** Shrink an image in the browser so each request stays well under Vercel's 4.5MB body limit. */
async function compress(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export interface UploadResult {
  success: boolean;
  images: ProductImage[];
  error?: string;
}

/** Uploads images one request per file (Vercel-safe) to /api/images/upload -> Supabase Storage. */
export async function uploadImages(
  files: File[],
  purpose: 'product' | 'avatar' = 'product'
): Promise<UploadResult> {
  const images: ProductImage[] = [];
  for (const original of files) {
    const file = await compress(original);
    if (file.size > 4 * 1024 * 1024) {
      return { success: false, images, error: `"${original.name}" is too large. Please choose a smaller photo.` };
    }
    const fd = new FormData();
    fd.append('images', file);
    fd.append('purpose', purpose);
    const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
    let data: { success?: boolean; images?: ProductImage[]; error?: string } = {};
    try { data = await res.json(); } catch { /* non-JSON error body */ }
    if (!res.ok || !data.success || !data.images?.length) {
      return { success: false, images, error: data.error || 'Failed to upload photo' };
    }
    images.push(...data.images);
  }
  return { success: true, images };
}
