import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
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

    const rawUsers = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();

    // Enrich each user with aggregate counts
    const users = await Promise.all(
      rawUsers.map(async (u) => {
        const uId = u._id.toString();
        const sellerMatch = {
          $or: [
            { 'seller.id': uId },
            { 'seller.id': u._id },
            { 'seller.phone': u.phone },
            { 'seller.email': u.email },
          ],
        };

        const [listingsCount, activeCount, inquiriesReceived, ordersPlaced, userProducts] =
          await Promise.all([
            productsCollection.countDocuments(sellerMatch),
            productsCollection.countDocuments({ ...sellerMatch, status: 'active' }),
            requestsCollection.countDocuments({
              $or: [{ sellerId: uId }, { sellerId: u.phone }, { sellerEmail: u.email }],
            }),
            requestsCollection.countDocuments({
              $or: [{ buyerId: uId }, { buyerEmail: u.email }, { buyerPhone: u.phone }],
            }),
            productsCollection.find(sellerMatch).project({ price: 1 }).toArray(),
          ]);

        const totalListedValue = userProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

        return {
          _id: uId,
          username: u.username || 'Anonymous User',
          phone: u.phone || 'No phone',
          email: u.email || 'No email',
          avatarUrl: u.avatarUrl || null,
          rating: u.rating || 5.0,
          reviewsCount: u.reviewsCount || 0,
          verified: Boolean(u.verified ?? true),
          city: u.city || 'Bangalore, IN',
          memberSince: u.memberSince || '2024',
          createdAt: u.createdAt || new Date().toISOString(),
          listingsCount,
          activeCount,
          inquiriesReceived,
          ordersPlaced,
          totalListedValue,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error: unknown) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    return NextResponse.json({
      success: true,
      message: 'User removed successfully',
      deletedId: userId,
    });
  } catch (error: unknown) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const body = await req.json();
    const { userId, verified } = body;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { verified: Boolean(verified) } }
    );

    return NextResponse.json({
      success: true,
      message: 'User verification status updated',
    });
  } catch (error: unknown) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
