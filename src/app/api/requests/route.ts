import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { PurchaseRequest } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('requests');
    const { searchParams } = new URL(req.url);

    const sellerId = searchParams.get('sellerId');
    const buyerId = searchParams.get('buyerId');
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};
    if (sellerId) {
      if (sellerId === '6aef65d4676b6547b4dbb657' || sellerId === 'seller-recircle-user') {
        query.sellerId = { $in: ['6aef65d4676b6547b4dbb657', 'seller-recircle-user'] };
      } else {
        query.sellerId = sellerId;
      }
    }
    if (buyerId) query.buyerId = buyerId;
    if (status && status !== 'all') query.status = status;

    const rawRequests = await collection.find(query).sort({ createdAt: -1 }).toArray();
    const requests = rawRequests.map((r) => ({
      ...r,
      _id: r._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error: unknown) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      productTitle,
      productImage,
      productPrice,
      sellerId,
      buyerId = 'buyer-demo-user',
      buyerName = 'Priya Patel',
      buyerEmail = 'priya.patel@recircle.org',
      buyerAvatar,
      offeredPrice,
      message,
      deliveryType = 'pickup',
    } = body;

    if (!productId || offeredPrice === undefined) {
      return NextResponse.json(
        { error: 'Product ID and offered price are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newRequest: Omit<PurchaseRequest, '_id'> & { _id: ObjectId } = {
      _id: new ObjectId(),
      productId,
      productTitle: productTitle || 'Pre-loved Item',
      productImage: productImage || '/placeholder-product.png',
      productPrice: parseFloat(productPrice) || parseFloat(offeredPrice),
      sellerId: sellerId || 'seller-recircle-user',
      buyerId,
      buyerName,
      buyerEmail,
      buyerAvatar,
      offeredPrice: parseFloat(offeredPrice),
      message: (message || "Hi, I'm interested in purchasing this item!").trim(),
      status: 'new',
      deliveryType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('requests').insertOne(newRequest);

    // Increment inquiries counter on product
    if (ObjectId.isValid(productId)) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(productId) },
        { $inc: { inquiries: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        ...newRequest,
        _id: newRequest._id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: 'Valid Request ID is required' }, { status: 400 });
    }

    if (!['new', 'accepted', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await getDatabase();
    const requestCollection = db.collection('requests');

    const result = await requestCollection.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // If marked completed, optionally update product status to 'sold'
    if (status === 'completed' && result.productId && ObjectId.isValid(result.productId)) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(result.productId) },
        { $set: { status: 'sold', updatedAt: new Date().toISOString() } }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        ...result,
        _id: result._id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Update request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id') || searchParams.get('requestId');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id || body.requestId;
    }

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid Request ID is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const reqDoc = await db.collection('requests').findOne({ _id: new ObjectId(id) });
    if (!reqDoc) {
      return NextResponse.json({ error: 'Purchase enquiry not found' }, { status: 404 });
    }

    await db.collection('requests').deleteOne({ _id: new ObjectId(id) });

    // Decrement inquiries counter on product if available
    if (reqDoc.productId && ObjectId.isValid(reqDoc.productId)) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(reqDoc.productId), inquiries: { $gt: 0 } },
        { $inc: { inquiries: -1 } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase enquiry deleted successfully',
      deletedId: id,
    });
  } catch (error: unknown) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Failed to delete purchase enquiry' }, { status: 500 });
  }
}
