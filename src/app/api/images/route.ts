import { NextRequest, NextResponse } from 'next/server';
import { getActor } from '@/lib/auth';
import { deleteStorageObjects } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/** DELETE /api/images?path=<storage path>  – only the owner (folder = user id) or admin. */
export async function DELETE(req: NextRequest) {
  try {
    const path = new URL(req.url).searchParams.get('path') || '';
    if (!path || path.includes('..')) {
      return NextResponse.json({ error: 'Image path is required' }, { status: 400 });
    }
    const { user, isAdmin } = await getActor(req);
    if (!isAdmin && !(user && path.startsWith(`${user._id}/`))) {
      return NextResponse.json({ error: 'Not allowed to delete this image' }, { status: 403 });
    }
    await deleteStorageObjects([path]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
