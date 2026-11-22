import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { associateImagesWithProduct } from '@/lib/gridfs';
import { getSessionUser } from '@/lib/auth';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('products');
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';
    const city = searchParams.get('city');
    const sellerId = searchParams.get('sellerId');
    const excludeSellerId = searchParams.get('excludeSellerId');
    const status = searchParams.get('status') || 'active';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));

    const sessionUser = await getSessionUser(req);

    // Build Mongo Query
    const query: Record<string, unknown> = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (sellerId) {
      // If fetching listings for dashboard
      if (sellerId === '6aef65d4676b6547b4dbb657' || sellerId === 'seller-recircle-user') {
        query['seller.id'] = { $in: ['6aef65d4676b6547b4dbb657', 'seller-recircle-user'] };
      } else {
        query['seller.id'] = sellerId;
      }
    } else {
      // When browsing public marketplace:
      // Exclude the current user's own listings so they don't see their own items to purchase
      const effectiveExcludeId = excludeSellerId || sessionUser?._id;
      if (effectiveExcludeId) {
        const excludeList = [effectiveExcludeId];
        if (effectiveExcludeId === '6aef65d4676b6547b4dbb657' || effectiveExcludeId === 'seller-recircle-user') {
          excludeList.push('6aef65d4676b6547b4dbb657', 'seller-recircle-user');
        }
        query['seller.id'] = { $nin: excludeList };
      }
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (condition && condition !== 'All') {
      const conditions = condition.split(',');
      if (conditions.length === 1) {
        query.condition = conditions[0];
      } else {
        query.condition = { $in: conditions };
      }
    }

    if (city && city !== 'All') {
      query['location.city'] = { $regex: new RegExp(city, 'i') };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        (query.price as Record<string, number>).$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (query.price as Record<string, number>).$lte = parseFloat(maxPrice);
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { category: searchRegex },
        { 'location.city': searchRegex },
      ];
    }

    // Sort order
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'savings') {
      sortOptions = { savingsPercentage: -1 };
    } else if (sort === 'popular') {
      sortOptions = { views: -1 };
    } else if (sort === 'random') {
      sortOptions = { updatedAt: -1 };
    }

    const total = await collection.countDocuments(query);
    const rawProducts = await collection
      .find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const products = rawProducts.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const body = await req.json();
    const {
      title,
      description,
      category,
      subcategory,
      brand,
      model,
      condition,
      conditionNotes,
      price,
      originalPrice,
      purchaseYear,
      hasReceipt = false,
      hasWarranty = false,
      hasOriginalBox = false,
      location = { city: 'Bangalore' },
      deliveryOptions = { pickup: true, delivery: false, shipping: false },
      images = [],
      seller,
    } = body;

    if (!title || !category || !condition || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Title, category, condition, and price are required fields.' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one product image is required.' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : undefined;

    // Calculate savings percentage
    let savingsPercentage = 0;
    if (parsedOriginalPrice && parsedOriginalPrice > parsedPrice) {
      savingsPercentage = Math.round(
        ((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100
      );
    }

    // Calculate estimated carbon reduction based on category
    let estimatedCo2Savings = 10;
    if (category === 'Electronics') estimatedCo2Savings = 45;
    else if (category === 'Furniture') estimatedCo2Savings = 65;
    else if (category === 'Fashion') estimatedCo2Savings = 15;
    else if (category === 'Bicycles & Mobility') estimatedCo2Savings = 80;
    else if (category === 'Appliances') estimatedCo2Savings = 55;

    // Identify primary image
    const primaryImg = images.find((img: { isPrimary?: boolean }) => img.isPrimary) || images[0];
    const primaryImageUrl = primaryImg ? primaryImg.url : '/placeholder-product.png';

    // Priority: authenticated session user > client seller object > default fallback
    const resolvedSellerId = sessionUser?._id || seller?.id || 'seller-recircle-user';
    const resolvedSellerName = sessionUser?.username || seller?.name || 'ReCircle Seller';
    const resolvedSellerEmail = sessionUser?.email || seller?.email || 'member@recircle.org';
    const resolvedSellerPhone = sessionUser?.phone || seller?.phone || '';
    const resolvedSellerAvatar = sessionUser?.avatarUrl || seller?.avatarUrl || undefined;

    const activeSeller = {
      id: resolvedSellerId,
      name: resolvedSellerName,
      email: resolvedSellerEmail,
      phone: resolvedSellerPhone,
      avatarUrl: resolvedSellerAvatar,
      rating: sessionUser?.rating || seller?.rating || 5.0,
      reviewsCount: sessionUser?.reviewsCount || seller?.reviewsCount || 0,
      verified: Boolean(sessionUser?.verified ?? seller?.verified ?? true),
      memberSince: sessionUser?.memberSince || seller?.memberSince || '2024',
      responseTime: seller?.responseTime || 'Replies in 15 mins',
    };

    const newProductId = new ObjectId();
    const newProduct: Omit<Product, '_id'> & { _id: ObjectId } = {
      _id: newProductId,
      title: title.trim(),
      description: (description || '').trim(),
      category,
      subcategory: subcategory || '',
      brand: brand || 'Generic',
      model: model || '',
      condition,
      conditionNotes: conditionNotes || '',
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      savingsPercentage,
      estimatedCo2Savings,
      purchaseYear: purchaseYear ? parseInt(purchaseYear, 10) : undefined,
      hasReceipt: Boolean(hasReceipt),
      hasWarranty: Boolean(hasWarranty),
      hasOriginalBox: Boolean(hasOriginalBox),
      location: {
        city: location.city || 'Bangalore',
        state: location.state || 'Karnataka',
        neighborhood: location.neighborhood || 'Indiranagar',
        zipCode: location.zipCode || '560038',
      },
      deliveryOptions: {
        pickup: Boolean(deliveryOptions.pickup ?? true),
        delivery: Boolean(deliveryOptions.delivery ?? false),
        shipping: Boolean(deliveryOptions.shipping ?? false),
      },
      images,
      primaryImageUrl,
      seller: activeSeller,
      status: 'active',
      views: 1,
      inquiries: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await getDatabase();
    await db.collection('products').insertOne(newProduct);

    // Link uploaded GridFS images with the new product ObjectId
    const imageFileIds = images.map((img: { fileId: string }) => img.fileId).filter(Boolean);
    if (imageFileIds.length > 0) {
      await associateImagesWithProduct(imageFileIds, newProductId.toString(), newProduct.seller.id);
    }

    return NextResponse.json({
      success: true,
      product: {
        ...newProduct,
        _id: newProductId.toString(),
      },
    });
  } catch (error: unknown) {
    console.error('Product creation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
