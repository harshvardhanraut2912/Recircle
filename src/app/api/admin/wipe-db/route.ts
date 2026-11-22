import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { assertAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Strictly verify admin authentication server-side
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const confirmation = body.confirmation;

    if (confirmation !== 'DELETE ALL DATA') {
      return NextResponse.json(
        { error: 'Confirmation phrase "DELETE ALL DATA" required.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // 2. Wipe all collections in the database
    const [delUsers, delProds, delReqs, delFiles, delChunks] = await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('products').deleteMany({}),
      db.collection('requests').deleteMany({}),
      db.collection('product_images.files').deleteMany({}),
      db.collection('product_images.chunks').deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Entire database wiped out successfully.',
      details: {
        usersDeleted: delUsers.deletedCount,
        productsDeleted: delProds.deletedCount,
        requestsDeleted: delReqs.deletedCount,
        gridFSFilesDeleted: delFiles.deletedCount,
        gridFSChunksDeleted: delChunks.deletedCount,
      },
    });
  } catch (error: unknown) {
    console.error('Wipe database error:', error);
    return NextResponse.json({ error: 'Failed to wipe database' }, { status: 500 });
  }
}
