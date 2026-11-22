import { NextRequest, NextResponse } from 'next/server';
import { getImageStream, deleteImage } from '@/lib/gridfs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const result = await getImageStream(id);
    if (!result) {
      return NextResponse.json({ error: 'Image not found in MongoDB GridFS' }, { status: 404 });
    }

    const { stream, fileDoc } = result;
    const contentType = fileDoc.contentType || (fileDoc.metadata?.mimeType as string) || 'image/webp';
    const contentLength = fileDoc.length ? fileDoc.length.toString() : undefined;
    const etag = `"${fileDoc._id.toString()}"`;

    // Handle If-None-Match caching
    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    // Convert Node Readable to Web ReadableStream for standard Next.js Response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (err) => {
          controller.error(err);
        });
      },
      cancel() {
        stream.destroy();
      },
    });

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': etag,
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new Response(webStream, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error('Image streaming error:', error);
    return NextResponse.json({ error: 'Error retrieving image from GridFS' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const success = await deleteImage(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete image or image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Image deleted from GridFS' });
  } catch (error: unknown) {
    console.error('Image deletion error:', error);
    return NextResponse.json({ error: 'Internal server error deleting image' }, { status: 500 });
  }
}
