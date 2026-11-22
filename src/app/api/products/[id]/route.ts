import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isUuid } from '@/lib/supabase';
import { getActor } from '@/lib/auth';
import { mapProduct, PRODUCT_SELECT } from '@/lib/mappers';
import { deleteStorageObjects } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Valid Product ID is required' }, { status: 400 });

    const supabase = getSupabase();
    const { data: product, error } = await supabase
      .from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    await supabase.rpc('increment_product_views', { p_id: id });
    product.views += 1;

    const { data: related } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('category', product.category)
      .eq('status', 'active')
      .neq('id', id)
      .limit(4);

    return NextResponse.json({
      success: true,
      product: mapProduct(product),
      related: (related || []).map(mapProduct),
    });
  } catch (error) {
    console.error('Fetch product by id error:', error);
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Valid Product ID is required' }, { status: 400 });

    const { user, isAdmin } = await getActor(req);
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('products').select('id, seller_id, price, original_price').eq('id', id).maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (!isAdmin && user?._id !== existing.seller_id) {
      return NextResponse.json({ error: 'You can only edit your own listings.' }, { status: 403 });
    }

    const b = await req.json();
    const u: Record<string, unknown> = {};
    const set = (k: string, v: unknown) => { if (v !== undefined) u[k] = v; };

    set('title', typeof b.title === 'string' ? b.title.trim() : undefined);
    set('description', typeof b.description === 'string' ? b.description.trim() : undefined);
    set('category', b.category);
    set('subcategory', b.subcategory);
    set('brand', b.brand);
    set('model', b.model);
    set('condition', b.condition);
    set('condition_notes', b.conditionNotes);
    set('purchase_year', b.purchaseYear ? parseInt(b.purchaseYear, 10) : undefined);
    set('has_receipt', b.hasReceipt === undefined ? undefined : Boolean(b.hasReceipt));
    set('has_warranty', b.hasWarranty === undefined ? undefined : Boolean(b.hasWarranty));
    set('has_original_box', b.hasOriginalBox === undefined ? undefined : Boolean(b.hasOriginalBox));
    if (b.status !== undefined && ['active', 'reserved', 'sold'].includes(b.status)) u.status = b.status;
    if (b.location) {
      set('location_city', b.location.city);
      set('location_state', b.location.state);
      set('location_neighborhood', b.location.neighborhood);
      set('location_zip', b.location.zipCode);
    }
    if (b.deliveryOptions) {
      set('delivery_pickup', b.deliveryOptions.pickup);
      set('delivery_delivery', b.deliveryOptions.delivery);
      set('delivery_shipping', b.deliveryOptions.shipping);
    }

    if (b.price !== undefined || b.originalPrice !== undefined) {
      const p = b.price !== undefined ? parseFloat(b.price) : Number(existing.price);
      const op =
        b.originalPrice !== undefined
          ? (b.originalPrice ? parseFloat(b.originalPrice) : null)
          : existing.original_price != null ? Number(existing.original_price) : null;
      u.price = p;
      u.original_price = op;
      u.savings_percentage = op && op > p ? Math.round(((op - p) / op) * 100) : 0;
    }

    // Image changes: diff against current rows
    if (Array.isArray(b.images)) {
      const ownerId = existing.seller_id as string;
      const { data: oldRows } = await supabase
        .from('product_images').select('storage_path').eq('product_id', id);
      const oldPaths = (oldRows || []).map((r) => r.storage_path as string);
      const incoming = b.images.filter(
        (i: { fileId?: string; url?: string }) => i?.fileId?.startsWith(`${ownerId}/`) && i?.url
      );
      const newPaths = incoming.map((i: { fileId: string }) => i.fileId);

      const removed = oldPaths.filter((p) => !newPaths.includes(p));
      if (removed.length) {
        await supabase.from('product_images').delete().eq('product_id', id).in('storage_path', removed);
        await deleteStorageObjects(removed);
      }
      const added = incoming.filter((i: { fileId: string }) => !oldPaths.includes(i.fileId));
      if (added.length) {
        await supabase.from('product_images').insert(
          added.map((i: Record<string, unknown>) => ({
            product_id: id, storage_path: i.fileId, url: i.url, filename: i.filename || '',
            mime_type: i.mimeType || 'image/webp', size_bytes: Number(i.size) || 0,
            width: i.width ?? null, height: i.height ?? null, is_primary: false, position: 0,
          }))
        );
      }
      const primary = incoming.find((i: { isPrimary?: boolean }) => i.isPrimary) || incoming[0];
      for (let idx = 0; idx < incoming.length; idx++) {
        await supabase.from('product_images')
          .update({ position: idx, is_primary: incoming[idx] === primary })
          .eq('product_id', id).eq('storage_path', incoming[idx].fileId);
      }
      if (primary) u.primary_image_url = primary.url;
    }

    if (Object.keys(u).length > 0) {
      const { error } = await supabase.from('products').update(u).eq('id', id);
      if (error) throw new Error(error.message);
    }

    const { data: updated } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).single();
    return NextResponse.json({ success: true, product: mapProduct(updated) });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!isUuid(id)) return NextResponse.json({ error: 'Valid Product ID is required' }, { status: 400 });

    const { user, isAdmin } = await getActor(req);
    const supabase = getSupabase();

    const { data: product } = await supabase
      .from('products').select('id, seller_id').eq('id', id).maybeSingle();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (!isAdmin && user?._id !== product.seller_id) {
      return NextResponse.json({ error: 'You can only delete your own listings.' }, { status: 403 });
    }

    const { data: imgs } = await supabase.from('product_images').select('storage_path').eq('product_id', id);
    const deleted = await deleteStorageObjects((imgs || []).map((i) => i.storage_path as string));

    const { error } = await supabase.from('products').delete().eq('id', id); // cascades to images + requests
    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      message: 'Product and its storage images deleted',
      deletedImagesCount: deleted,
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
