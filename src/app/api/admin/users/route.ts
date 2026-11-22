import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isUuid } from '@/lib/supabase';
import { assertAdminAuthorized } from '@/lib/admin-auth';
import { deleteStorageObjects } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const supabase = getSupabase();
    const [u, p, r] = await Promise.all([
      supabase.from('users')
        .select('id, username, phone, email, avatar_url, rating, reviews_count, verified, city, member_since, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('products').select('seller_id, status, price'),
      supabase.from('requests').select('seller_id, buyer_id'),
    ]);
    if (u.error || p.error || r.error) throw new Error((u.error || p.error || r.error)!.message);

    const users = (u.data || []).map((x) => {
      const mine = (p.data || []).filter((pr) => pr.seller_id === x.id);
      return {
        _id: x.id,
        username: x.username || 'Anonymous User',
        phone: x.phone || 'No phone',
        email: x.email || 'No email',
        avatarUrl: x.avatar_url || null,
        rating: Number(x.rating ?? 5),
        reviewsCount: x.reviews_count ?? 0,
        verified: Boolean(x.verified),
        city: x.city || 'Bangalore',
        memberSince: x.member_since || '2024',
        createdAt: x.created_at,
        listingsCount: mine.length,
        activeCount: mine.filter((pr) => pr.status === 'active').length,
        inquiriesReceived: (r.data || []).filter((rq) => rq.seller_id === x.id).length,
        ordersPlaced: (r.data || []).filter((rq) => rq.buyer_id === x.id).length,
        totalListedValue: mine.reduce((a, pr) => a + Number(pr.price || 0), 0),
      };
    });

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const userId = new URL(req.url).searchParams.get('id');
    if (!isUuid(userId)) return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });

    const supabase = getSupabase();
    // clean up the user's stored images first (DB rows cascade automatically)
    const { data: prods } = await supabase.from('products').select('id').eq('seller_id', userId);
    const ids = (prods || []).map((x) => x.id);
    if (ids.length) {
      const { data: imgs } = await supabase.from('product_images').select('storage_path').in('product_id', ids);
      await deleteStorageObjects((imgs || []).map((i) => i.storage_path as string));
    }
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: 'User removed successfully', deletedId: userId });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const { userId, verified } = await req.json();
    if (!isUuid(userId)) return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });

    const { error } = await getSupabase().from('users').update({ verified: Boolean(verified) }).eq('id', userId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, message: 'User verification status updated' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
