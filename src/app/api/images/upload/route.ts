import { NextRequest, NextResponse } from 'next/server';
import { processAndUploadImage, MAX_IMAGES_PER_PRODUCT } from '@/lib/storage';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    const purpose = (formData.get('purpose') as string) || 'product';
    const primaryIndex = parseInt((formData.get('primaryIndex') as string) || '0', 10);

    if (!files.length) {
      return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
    }

    // Logged-in users upload into their own folder. The only anonymous upload
    // allowed is a single signup avatar.
    let folder: string;
    if (user) {
      folder = user._id;
    } else if (purpose === 'avatar' && files.length === 1) {
      folder = 'signup-avatars';
    } else {
      return NextResponse.json({ error: 'Please log in to upload photos.' }, { status: 401 });
    }

    if (files.length > MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images per request` },
        { status: 400 }
      );
    }

    const images = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      images.push(
        await processAndUploadImage({
          buffer: Buffer.from(await file.arrayBuffer()),
          originalFilename: file.name || `image_${i + 1}.jpg`,
          mimeType: file.type || 'image/jpeg',
          folder,
          isPrimary: i === primaryIndex,
          position: i,
        })
      );
    }

    return NextResponse.json({ success: true, count: images.length, images });
  } catch (error) {
    console.error('Image upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
