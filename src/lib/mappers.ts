/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product, PurchaseRequest, UserProfile, ProductImage } from '@/types';

export const USER_PUBLIC_COLUMNS =
  'id, username, email, phone, avatar_url, rating, reviews_count, verified, member_since, city';

export function mapUser(u: any): UserProfile {
  return {
    _id: u.id,
    username: u.username,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url || undefined,
    rating: Number(u.rating ?? 5),
    reviewsCount: u.reviews_count ?? 0,
    verified: Boolean(u.verified),
    memberSince: u.member_since || '2024',
    city: u.city || 'Bangalore',
  };
}

export function mapImage(i: any): ProductImage {
  return {
    fileId: i.storage_path,
    url: i.url,
    filename: i.filename,
    mimeType: i.mime_type,
    size: i.size_bytes,
    isPrimary: i.is_primary,
    position: i.position,
    width: i.width ?? undefined,
    height: i.height ?? undefined,
  };
}

/** Row from: products select('*, seller:users(...), product_images(*)') */
export function mapProduct(p: any): Product {
  const images: ProductImage[] = (p.product_images || [])
    .slice()
    .sort((a: any, b: any) => a.position - b.position)
    .map(mapImage);
  const s = p.seller || {};
  return {
    _id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    subcategory: p.subcategory || '',
    brand: p.brand,
    model: p.model || '',
    condition: p.condition,
    conditionNotes: p.condition_notes || '',
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
    savingsPercentage: p.savings_percentage,
    estimatedCo2Savings: p.estimated_co2_savings,
    purchaseYear: p.purchase_year ?? undefined,
    hasReceipt: p.has_receipt,
    hasWarranty: p.has_warranty,
    hasOriginalBox: p.has_original_box,
    location: {
      city: p.location_city,
      state: p.location_state,
      neighborhood: p.location_neighborhood,
      zipCode: p.location_zip,
    },
    deliveryOptions: {
      pickup: p.delivery_pickup,
      delivery: p.delivery_delivery,
      shipping: p.delivery_shipping,
    },
    images,
    primaryImageUrl: p.primary_image_url || images[0]?.url || '/placeholder-product.png',
    seller: {
      id: p.seller_id,
      name: s.username || 'ReCircle Seller',
      email: s.email || '',
      phone: s.phone || '',
      avatarUrl: s.avatar_url || undefined,
      rating: Number(s.rating ?? 5),
      reviewsCount: s.reviews_count ?? 0,
      verified: Boolean(s.verified ?? true),
      memberSince: s.member_since || '2024',
      responseTime: 'Replies in 15 mins',
    },
    status: p.status,
    views: p.views,
    inquiries: p.inquiries,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export const PRODUCT_SELECT = `*, seller:users!products_seller_id_fkey(${USER_PUBLIC_COLUMNS}), product_images(*)`;

export function mapRequest(r: any): PurchaseRequest {
  return {
    _id: r.id,
    productId: r.product_id,
    productTitle: r.product_title,
    productImage: r.product_image,
    productPrice: Number(r.product_price),
    sellerId: r.seller_id,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    buyerEmail: r.buyer_email,
    buyerPhone: r.buyer_phone || undefined,
    buyerAvatar: r.buyer_avatar || undefined,
    offeredPrice: Number(r.offered_price),
    message: r.message,
    status: r.status,
    deliveryType: r.delivery_type,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
