import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { assertAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const supabase = getSupabase();
    const [users, products, requests] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('status, price'),
      supabase.from('requests').select('status'),
    ]);
    if (users.error || products.error || requests.error) {
      throw new Error((users.error || products.error || requests.error)!.message);
    }

    const p = products.data || [];
    const r = requests.data || [];
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.count ?? 0,
        totalProducts: p.length,
        activeProducts: p.filter((x) => x.status === 'active').length,
        soldProducts: p.filter((x) => x.status === 'sold').length,
        totalRequests: r.length,
        acceptedRequests: r.filter((x) => x.status === 'accepted').length,
        completedOrders: r.filter((x) => x.status === 'completed').length,
        totalCatalogValue: p.reduce((a, x) => a + Number(x.price || 0), 0),
      },
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
