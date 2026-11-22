import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isUuid } from '@/lib/supabase';
import { getActor } from '@/lib/auth';
import { mapRequest } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin } = await getActor(req);
    if (!user && !isAdmin) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    const sp = new URL(req.url).searchParams;
    const sellerId = sp.get('sellerId');
    const buyerId = sp.get('buyerId');
    const status = sp.get('status');

    let q = getSupabase().from('requests').select('*').order('created_at', { ascending: false });

    if (isAdmin) {
      if (isUuid(sellerId)) q = q.eq('seller_id', sellerId);
      if (isUuid(buyerId)) q = q.eq('buyer_id', buyerId);
    } else {
      // regular users only ever see requests where they are the seller or the buyer
      const me = user!._id;
      if (sellerId && sellerId === me) q = q.eq('seller_id', me);
      else if (buyerId && buyerId === me) q = q.eq('buyer_id', me);
      else q = q.or(`seller_id.eq.${me},buyer_id.eq.${me}`);
    }
    if (status && status !== 'all') q = q.eq('status', status);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const requests = (data || []).map(mapRequest);
    return NextResponse.json({ success: true, requests, count: requests.length });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getActor(req);
    if (!user) return NextResponse.json({ error: 'Please log in to send an offer.' }, { status: 401 });

    const { productId, offeredPrice, message, deliveryType = 'pickup' } = await req.json();
    if (!isUuid(productId) || offeredPrice === undefined || isNaN(parseFloat(offeredPrice))) {
      return NextResponse.json({ error: 'Product ID and offered price are required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: product } = await supabase
      .from('products').select('id, seller_id, title, price, primary_image_url, status')
      .eq('id', productId).maybeSingle();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.seller_id === user._id) {
      return NextResponse.json({ error: 'You cannot make an offer on your own listing.' }, { status: 400 });
    }
    if (product.status === 'sold') {
      return NextResponse.json({ error: 'This item has already been sold.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        product_id: product.id,
        seller_id: product.seller_id,
        buyer_id: user._id,
        product_title: product.title,
        product_image: product.primary_image_url,
        product_price: product.price,
        buyer_name: user.username,
        buyer_email: user.email,
        buyer_phone: user.phone,
        buyer_avatar: user.avatarUrl || null,
        offered_price: parseFloat(offeredPrice),
        message: String(message || "Hi, I'm interested in purchasing this item!").trim(),
        delivery_type: ['pickup', 'delivery', 'shipping'].includes(deliveryType) ? deliveryType : 'pickup',
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, request: mapRequest(data) });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, isAdmin } = await getActor(req);
    if (!user && !isAdmin) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    const { requestId, status } = await req.json();
    if (!isUuid(requestId)) return NextResponse.json({ error: 'Valid Request ID is required' }, { status: 400 });
    if (!['new', 'accepted', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: existing } = await supabase.from('requests').select('*').eq('id', requestId).maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (!isAdmin && existing.seller_id !== user!._id) {
      return NextResponse.json({ error: 'Only the seller can update this request.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('requests').update({ status }).eq('id', requestId).select('*').single();
    if (error) throw new Error(error.message);

    if (status === 'completed') {
      await supabase.from('products').update({ status: 'sold' }).eq('id', existing.product_id);
    }
    return NextResponse.json({ success: true, request: mapRequest(data) });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, isAdmin } = await getActor(req);
    if (!user && !isAdmin) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    const sp = new URL(req.url).searchParams;
    let id = sp.get('id') || sp.get('requestId');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id || body.requestId;
    }
    if (!isUuid(id)) return NextResponse.json({ error: 'Valid Request ID is required' }, { status: 400 });

    const supabase = getSupabase();
    const { data: existing } = await supabase.from('requests').select('id, seller_id, buyer_id').eq('id', id).maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Purchase enquiry not found' }, { status: 404 });
    if (!isAdmin && existing.seller_id !== user!._id && existing.buyer_id !== user!._id) {
      return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
    }

    const { error } = await supabase.from('requests').delete().eq('id', id); // trigger fixes inquiries count
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, message: 'Purchase enquiry deleted successfully', deletedId: id });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Failed to delete purchase enquiry' }, { status: 500 });
  }
}
