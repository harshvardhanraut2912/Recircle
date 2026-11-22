import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return NextResponse.json({ success: true, user, authenticated: Boolean(user) });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ success: false, user: null, authenticated: false }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { avatarUrl, city } = await req.json();
    const update: Record<string, unknown> = {};
    if (avatarUrl !== undefined) update.avatar_url = avatarUrl || null;
    if (city !== undefined && String(city).trim()) update.city = String(city).trim();

    if (Object.keys(update).length > 0) {
      const { error } = await getSupabase().from('users').update(update).eq('id', sessionUser._id);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        ...sessionUser,
        ...(update.avatar_url !== undefined ? { avatarUrl: (update.avatar_url as string) || undefined } : {}),
        ...(update.city ? { city: update.city as string } : {}),
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
