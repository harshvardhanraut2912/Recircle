export type ProductCondition = 'Brand New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';

export type ProductCategory =
  | 'Electronics'
  | 'Furniture'
  | 'Fashion'
  | 'Bicycles & Mobility'
  | 'Books & Media'
  | 'Sports & Outdoors'
  | 'Collectibles & Art'
  | 'Appliances';

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  rating?: number;
  reviewsCount?: number;
  verified: boolean;
  memberSince: string;
  city?: string;
}

export interface ProductImage {
  fileId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  isPrimary: boolean;
  position: number;
  width?: number;
  height?: number;
}

export interface SellerInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  memberSince: string;
  responseTime: string;
  phone?: string;
}

export interface ProductLocation {
  city: string;
  state?: string;
  neighborhood?: string;
  zipCode?: string;
}

export interface DeliveryOptions {
  pickup: boolean;
  delivery: boolean;
  shipping: boolean;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: ProductCategory | string;
  subcategory?: string;
  brand: string;
  model?: string;
  condition: ProductCondition;
  conditionNotes?: string;
  price: number;
  originalPrice?: number;
  savingsPercentage?: number;
  estimatedCo2Savings?: number; // in kg
  purchaseYear?: number;
  hasReceipt: boolean;
  hasWarranty: boolean;
  hasOriginalBox: boolean;
  location: ProductLocation;
  deliveryOptions: DeliveryOptions;
  images: ProductImage[];
  primaryImageUrl: string;
  seller: SellerInfo;
  status: 'active' | 'reserved' | 'sold';
  views: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  _id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  buyerAvatar?: string;
  offeredPrice: number;
  message: string;
  status: 'new' | 'accepted' | 'rejected' | 'completed';
  deliveryType: 'pickup' | 'delivery' | 'shipping';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  activeListings: number;
  totalViews: number;
  pendingRequests: number;
  totalEarnings: number;
  itemsSold: number;
}
