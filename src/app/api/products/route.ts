import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isUuid } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth';
import { mapProduct, PRODUCT_SELECT } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

// strip characters that have meaning inside PostgREST filter strings
const safe = (v: string) => v.replace(/[,()%*\\]/g, ' ').trim();

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const sp = new URL(req.url).searchParams;

    const category = sp.get('category');
    const condition = sp.get('condition');
    const minPrice = sp.get('minPrice');
    const maxPrice = sp.get('maxPrice');
    const search = sp.get('search');
    const sort = sp.get('sort') || 'recent';
    const city = sp.get('city');
    const sellerId = sp.get('sellerId');
    const excludeSellerId = sp.get('excludeSellerId');
    const status = sp.get('status') || 'active';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '20', 10)));

    const sessionUser = await getSessionUser(req);

    let q = supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' });

    if (status !== 'all') q = q.eq('status', status);

    if (sellerId) {
      if (!isUuid(sellerId)) {
        return NextResponse.json({ success: true, products: [], total: 0, page, totalPages: 0 });
      }
      q = q.eq('seller_id', sellerId);
    } else {
      const exclude = excludeSellerId || sessionUser?._id;
      if (isUuid(exclude)) q = q.neq('seller_id', exclude);
    }

    if (category && category !== 'All') q = q.ilike('category', safe(category));

    if (condition && condition !== 'All') {
      const list = condition.split(',').map((c) => c.trim()).filter(Boolean);
      q = list.length === 1 ? q.eq('condition', list[0]) : q.in('condition', list);
    }

    if (city && city !== 'All' && city !== 'All Cities') q = q.ilike('location_city', `%${safe(city)}%`);

    if (minPrice && !isNaN(parseFloat(minPrice))) q = q.gte('price', parseFloat(minPrice));
    if (maxPrice && !isNaN(parseFloat(maxPrice))) q = q.lte('price', parseFloat(maxPrice));

    if (search && safe(search)) {
      const t = `%${safe(search)}%`;
      q = q.or(
        ['title', 'description', 'brand', 'model', 'category', 'location_city']
          .map((c) => `${c}.ilike.${t}`)
          .join(',')
      );
    }

    if (sort === 'price_asc') q = q.order('price', { ascending: true });
    else if (sort === 'price_desc') q = q.order('price', { ascending: false });
    else if (sort === 'savings') q = q.order('savings_percentage', { ascending: false });
    else if (sort === 'popular') q = q.order('views', { ascending: false });
    else if (sort === 'random') q = q.order('updated_at', { ascending: false });
    else q = q.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const { data, error, count } = await q.range(from, from + limit - 1);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return NextResponse.json({
      success: true,
      products: (data || []).map(mapProduct),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

const CO2: Record<string, number> = {
  Electronics: 45, Furniture: 65, Fashion: 15, 'Bicycles & Mobility': 80, Appliances: 55,
};

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Please log in to list an item.' }, { status: 401 });
    }

    const b = await req.json();
    const {
      title, description, category, subcategory, brand, model, condition, conditionNotes,
      price, originalPrice, purchaseYear,
      hasReceipt = false, hasWarranty = false, hasOriginalBox = false,
      location = {}, deliveryOptions = {}, images = [],
    } = b;

    if (!title || !category || !condition || price === undefined || price === null || price === '') {
      return NextResponse.json(
        { error: 'Title, category, condition, and price are required fields.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one product image is required.' }, { status: 400 });
    }

    // Only accept images the user actually uploaded to their own storage folder
    const ownPrefix = `${sessionUser._id}/`;
    const validImages = images.filter(
      (i: { fileId?: string; url?: string }) => i?.fileId?.startsWith(ownPrefix) && i?.url
    );
    if (validImages.length === 0) {
      return NextResponse.json({ error: 'Invalid product images.' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginal = originalPrice ? parseFloat(originalPrice) : null;
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Invalid price.' }, { status: 400 });
    }
    const savings =
      parsedOriginal && parsedOriginal > parsedPrice
        ? Math.round(((parsedOriginal - parsedPrice) / parsedOriginal) * 100)
        : 0;

    const primary = validImages.find((i: { isPrimary?: boolean }) => i.isPrimary) || validImages[0];

    const supabase = getSupabase();
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        seller_id: sessionUser._id,
        title: String(title).trim(),
        description: String(description || '').trim(),
        category,
        subcategory: subcategory || '',
        brand: brand || 'Generic',
        model: model || '',
        condition,
        condition_notes: conditionNotes || '',
        price: parsedPrice,
        original_price: parsedOriginal,
        savings_percentage: savings,
        estimated_co2_savings: CO2[category] ?? 10,
        purchase_year: purchaseYear ? parseInt(purchaseYear, 10) : null,
        has_receipt: Boolean(hasReceipt),
        has_warranty: Boolean(hasWarranty),
        has_original_box: Boolean(hasOriginalBox),
        location_city: location.city || sessionUser.city || 'Bangalore',
        location_state: location.state || 'Karnataka',
        location_neighborhood: location.neighborhood || '',
        location_zip: location.zipCode || '',
        delivery_pickup: Boolean(deliveryOptions.pickup ?? true),
        delivery_delivery: Boolean(deliveryOptions.delivery ?? false),
        delivery_shipping: Boolean(deliveryOptions.shipping ?? false),
        primary_image_url: primary.url,
        status: 'active',
      })
      .select('id')
      .single();
    if (error || !product) throw new Error(error?.message || 'Failed to create product');

    const { error: imgErr } = await supabase.from('product_images').insert(
      validImages.map(
        (i: Record<string, unknown>, idx: number) => ({
          product_id: product.id,
          storage_path: i.fileId,
          url: i.url,
          filename: i.filename || '',
          mime_type: i.mimeType || 'image/webp',
          size_bytes: Number(i.size) || 0,
          width: i.width ?? null,
          height: i.height ?? null,
          is_primary: i === primary,
          position: idx,
        })
      )
    );
    if (imgErr) {
      await supabase.from('products').delete().eq('id', product.id);
      throw new Error(imgErr.message);
    }

    const { data: full } = await supabase
      .from('products').select(PRODUCT_SELECT).eq('id', product.id).single();

    return NextResponse.json({ success: true, product: mapProduct(full) });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
