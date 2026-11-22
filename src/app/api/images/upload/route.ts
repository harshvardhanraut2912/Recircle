import { NextRequest, NextResponse } from 'next/server';
import { processAndUploadImage, MAX_IMAGES_PER_PRODUCT } from '@/lib/gridfs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    const productId = (formData.get('productId') as string) || '';
    const sellerId = (formData.get('sellerId') as string) || 'seller-recircle';
    const primaryIndexStr = formData.get('primaryIndex') as string;
    const primaryIndex = primaryIndexStr ? parseInt(primaryIndexStr, 10) : 0;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files provided in form-data' }, { status: 400 });
    }

    if (files.length > MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product` },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploaded = await processAndUploadImage({
        buffer,
        originalFilename: file.name || `image_${i + 1}.jpg`,
        mimeType: file.type || 'image/jpeg',
        sellerId,
        productId,
        isPrimary: i === primaryIndex,
        position: i,
      });

      uploadedImages.push(uploaded);
    }

    return NextResponse.json({
      success: true,
      count: uploadedImages.length,
      images: uploadedImages,
    });
  } catch (error: unknown) {
    console.error('Image upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
