import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const paramSellerId = searchParams.get('sellerId');
    const sellerId = paramSellerId || sessionUser?._id || 'seller-recircle-user';

    const db = await getDatabase();
    const productsColl = db.collection('products');
    const requestsColl = db.collection('requests');

    // If demo account Aarav Sharma, match both his id and legacy 'seller-recircle-user'
    let sellerMatch: unknown = sellerId;
    if (sellerId === '6aef65d4676b6547b4dbb657' || sellerId === 'seller-recircle-user') {
      sellerMatch = { $in: ['6aef65d4676b6547b4dbb657', 'seller-recircle-user'] };
    }

    const [activeListings, soldProducts, allSellerProducts, pendingRequests] = await Promise.all([
      productsColl.countDocuments({ 'seller.id': sellerMatch, status: 'active' }),
      productsColl.find({ 'seller.id': sellerMatch, status: 'sold' }).toArray(),
      productsColl.find({ 'seller.id': sellerMatch }).toArray(),
      requestsColl.countDocuments({ sellerId: sellerMatch, status: 'new' }),
    ]);

    const totalViews = allSellerProducts.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalEarnings = soldProducts.reduce((acc, curr) => acc + (curr.price || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        activeListings,
        totalViews,
        pendingRequests,
        totalEarnings,
        itemsSold: soldProducts.length,
      },
    });
  } catch (error: unknown) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
