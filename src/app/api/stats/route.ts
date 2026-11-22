import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    const supabase = getSupabase();
    const [{ data: products, error: pErr }, { count: pending, error: rErr }] = await Promise.all([
      supabase.from('products').select('status, price, views').eq('seller_id', user._id),
      supabase.from('requests').select('id', { count: 'exact', head: true })
        .eq('seller_id', user._id).eq('status', 'new'),
    ]);
    if (pErr || rErr) throw new Error((pErr || rErr)!.message);

    const list = products || [];
    const sold = list.filter((p) => p.status === 'sold');
    return NextResponse.json({
      success: true,
      stats: {
        activeListings: list.filter((p) => p.status === 'active').length,
        totalViews: list.reduce((a, p) => a + (p.views || 0), 0),
        pendingRequests: pending ?? 0,
        totalEarnings: sold.reduce((a, p) => a + Number(p.price || 0), 0),
        itemsSold: sold.length,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
