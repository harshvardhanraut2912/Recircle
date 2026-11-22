import { GridFSBucket, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { Readable } from 'stream';
import { getDatabase } from './mongodb';
import { ProductImage } from '@/types';

export const BUCKET_NAME = 'product_images';
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_PRODUCT = 10;
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

export async function getImageBucket(): Promise<GridFSBucket> {
  const db = await getDatabase();
  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

export interface UploadOptions {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  sellerId?: string;
  productId?: string;
  isPrimary?: boolean;
  position?: number;
}

export async function processAndUploadImage(options: UploadOptions): Promise<ProductImage> {
  const {
    buffer,
    originalFilename,
    mimeType,
    sellerId = 'user-default',
    productId = '',
    isPrimary = false,
    position = 0,
  } = options;

  // 1. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error(`Unsupported image format: ${mimeType}. Allowed formats: JPEG, PNG, WebP, AVIF, GIF.`);
  }

  // 2. Validate file size
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Image file size exceeds limit of 10MB (current size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`);
  }

  // 3. Optimize image with Sharp (validate actual image data, resize if oversized, compress)
  let optimizedBuffer: Buffer;
  let metadata: sharp.Metadata;

  try {
    const sharpInstance = sharp(buffer);
    metadata = await sharpInstance.metadata();

    if (!metadata.format) {
      throw new Error('Invalid or corrupted image file.');
    }

    // Resize if dimensions exceed 1600px, maintain aspect ratio, convert to WebP for optimal compression
    let pipeline = sharpInstance.rotate(); // auto-orient based on EXIF

    if ((metadata.width && metadata.width > 1600) || (metadata.height && metadata.height > 1600)) {
      pipeline = pipeline.resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Output as high quality WebP
    pipeline = pipeline.webp({ quality: 85, effort: 4 });
    optimizedBuffer = await pipeline.toBuffer();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown image processing error';
    throw new Error(`Failed to process image: ${errorMsg}`);
  }

  // 4. Upload to MongoDB GridFS
  const bucket = await getImageBucket();
  const fileId = new ObjectId();
  const cleanFilename = originalFilename.replace(/\.[^/.]+$/, '') + '.webp';

  const uploadStream = bucket.openUploadStreamWithId(fileId, cleanFilename, {
    contentType: 'image/webp',
    metadata: {
      originalFilename,
      mimeType: 'image/webp',
      originalMimeType: mimeType,
      size: optimizedBuffer.length,
      originalSize: buffer.length,
      sellerId,
      productId: productId ? new ObjectId(productId) : null,
      isPrimary,
      position,
      width: metadata.width,
      height: metadata.height,
      uploadDate: new Date(),
    },
  });

  await new Promise<void>((resolve, reject) => {
    const readable = Readable.from(optimizedBuffer);
    readable
      .pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', () => resolve());
  });

  return {
    fileId: fileId.toString(),
    url: `/api/images/${fileId.toString()}`,
    filename: cleanFilename,
    mimeType: 'image/webp',
    size: optimizedBuffer.length,
    isPrimary,
    position,
    width: metadata.width,
    height: metadata.height,
  };
}

export async function getImageStream(fileIdString: string) {
  if (!ObjectId.isValid(fileIdString)) {
    return null;
  }

  const fileId = new ObjectId(fileIdString);
  const db = await getDatabase();
  const bucket = await getImageBucket();

  const filesCollection = db.collection(`${BUCKET_NAME}.files`);
  const fileDoc = await filesCollection.findOne({ _id: fileId });

  if (!fileDoc) {
    return null;
  }

  const stream = bucket.openDownloadStream(fileId);
  return {
    stream,
    fileDoc,
  };
}

export async function deleteImage(fileIdString: string): Promise<boolean> {
  if (!ObjectId.isValid(fileIdString)) {
    return false;
  }

  try {
    const bucket = await getImageBucket();
    const fileId = new ObjectId(fileIdString);
    await bucket.delete(fileId);
    return true;
  } catch (err) {
    console.warn(`GridFS delete warning for ${fileIdString}:`, err);
    return false;
  }
}

export async function deleteProductImages(productIdString: string): Promise<number> {
  if (!productIdString) return 0;

  try {
    const db = await getDatabase();
    const bucket = await getImageBucket();
    const filesCollection = db.collection(`${BUCKET_NAME}.files`);

    let query: Record<string, unknown> = { 'metadata.productId': productIdString };
    if (ObjectId.isValid(productIdString)) {
      query = {
        $or: [
          { 'metadata.productId': productIdString },
          { 'metadata.productId': new ObjectId(productIdString) },
        ],
      };
    }

    const files = await filesCollection.find(query).toArray();
    let deletedCount = 0;

    for (const file of files) {
      try {
        await bucket.delete(file._id);
        deletedCount++;
      } catch (err) {
        console.warn(`Failed to delete GridFS image ${file._id}:`, err);
      }
    }

    return deletedCount;
  } catch (err) {
    console.error('Error deleting product images:', err);
    return 0;
  }
}

export async function associateImagesWithProduct(
  imageFileIds: string[],
  productId: string,
  sellerId: string
): Promise<void> {
  if (!imageFileIds || imageFileIds.length === 0) return;

  const db = await getDatabase();
  const filesCollection = db.collection(`${BUCKET_NAME}.files`);
  const objectIds = imageFileIds.filter(ObjectId.isValid).map((id) => new ObjectId(id));

  await filesCollection.updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        'metadata.productId': ObjectId.isValid(productId) ? new ObjectId(productId) : productId,
        'metadata.sellerId': sellerId,
        'metadata.associatedAt': new Date(),
      },
    }
  );
}
