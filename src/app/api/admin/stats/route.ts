import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { assertAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const productsCollection = db.collection('products');
    const requestsCollection = db.collection('requests');

    const [
      totalUsers,
      totalProducts,
      activeProducts,
      soldProducts,
      totalRequests,
      acceptedRequests,
      completedOrders,
      productsWithPrices,
    ] = await Promise.all([
      usersCollection.countDocuments(),
      productsCollection.countDocuments(),
      productsCollection.countDocuments({ status: 'active' }),
      productsCollection.countDocuments({ status: 'sold' }),
      requestsCollection.countDocuments(),
      requestsCollection.countDocuments({ status: 'accepted' }),
      requestsCollection.countDocuments({ status: 'completed' }),
      productsCollection.find({}).project({ price: 1 }).toArray(),
    ]);

    const totalCatalogValue = productsWithPrices.reduce(
      (acc, curr) => acc + (Number(curr.price) || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        activeProducts,
        soldProducts,
        totalRequests,
        acceptedRequests,
        completedOrders,
        totalCatalogValue,
      },
    });
  } catch (error: unknown) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
