import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return NextResponse.json({
      success: true,
      user,
      authenticated: Boolean(user),
    });
  } catch (error: unknown) {
    console.error('Auth check error:', error);
    return NextResponse.json({ success: false, user: null, authenticated: false }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { avatarUrl, city } = body;

    const db = await getDatabase();
    const updateDoc: Record<string, unknown> = {};

    if (avatarUrl !== undefined) {
      updateDoc.avatarUrl = avatarUrl || null;
    }
    if (city !== undefined) {
      updateDoc.city = city.trim();
    }

    if (Object.keys(updateDoc).length > 0) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(sessionUser._id) },
        { $set: updateDoc }
      );

      // If avatar was updated, also update products listed by this user
      if (avatarUrl !== undefined) {
        await db.collection('products').updateMany(
          { 'seller.id': sessionUser._id },
          { $set: { 'seller.avatarUrl': avatarUrl || undefined } }
        );
      }
    }

    const updatedUser = {
      ...sessionUser,
      ...updateDoc,
    };

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
