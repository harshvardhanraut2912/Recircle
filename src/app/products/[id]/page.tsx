'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  Leaf,
  Calendar,
  FileCheck,
  Award,
  Package,
  Truck,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Send,
  X,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Product, ProductImage } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user, loading: authLoading } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Purchase Request Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery' | 'shipping'>('pickup');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Requirement: If user visits product page without being logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !user && id) {
      toast.info('Please log in or create an account to view item details, share, or purchase.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
    }
  }, [user, authLoading, router, id]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          setOfferPrice(data.product.price.toString());
          setBuyerMessage(`Hi ${data.product.seller?.name || 'there'}! I'm interested in purchasing your ${data.product.title}. Is it still available?`);
        } else {
          toast.error('Product not found');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        toast.error('Error loading product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-warm-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-8 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-[450px] bg-gray-200 rounded-3xl" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-forest mb-4">
          <Lock className="w-8 h-8 text-mint" />
        </div>
        <h1 className="text-2xl font-bold text-forest mb-2">Login Required</h1>
        <p className="text-sm text-charcoal-500 mb-6 max-w-sm">
          Please log in or create an account to view product details, share with friends, or contact the seller.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/products/${id}`)}`}
          className="px-6 py-2.5 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light shadow-xs"
        >
          Log In or Create Account
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-forest mb-2">Item Not Found</h1>
        <p className="text-sm text-charcoal-500 mb-6">
          This product might have already been rehomed or removed by the seller.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const images: ProductImage[] = product.images && product.images.length > 0
    ? product.images
    : [{
        fileId: 'default',
        url: product.primaryImageUrl || '/placeholder-product.png',
        filename: 'product.jpg',
        mimeType: 'image/jpeg',
        size: 0,
        isPrimary: true,
        position: 0,
      }];

  const currentActiveImage = images[activeImageIndex] || images[0];

  const handleWishlistToggle = () => {
    if (!user) {
      toast.info('Please log in or sign up to save items to your wishlist.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product._id}`)}`);
      return;
    }
    const isAdded = toggle(product._id);
    if (isAdded) {
      toast.success('Saved to wishlist');
    } else {
      toast.info('Removed from wishlist');
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.info('Please log in or create an account to share products.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product._id}`)}`);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this pre-loved ${product.title} on ReCircle!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleOpenPurchaseModal = (initialPrice?: number) => {
    if (!user) {
      toast.info('Please log in or create an account to purchase or make an offer.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product._id}`)}`);
      return;
    }
    if (initialPrice) {
      setOfferPrice(initialPrice.toString());
    } else {
      setOfferPrice(product.price.toString());
    }
    setIsOfferModalOpen(true);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit an offer.');
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product._id}`)}`);
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productTitle: product.title,
          productImage: product.primaryImageUrl,
          productPrice: product.price,
          sellerId: product.seller.id,
          buyerId: user._id,
          buyerName: user.username,
          buyerEmail: user.email,
          buyerAvatar: user.avatarUrl,
          offeredPrice: parseFloat(offerPrice),
          message: buyerMessage,
          deliveryType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Purchase request submitted to seller! You can monitor status in your inbox.');
        setIsOfferModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Submit offer error:', err);
      toast.error('Network error submitting request');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-100 py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        {/* Breadcrumb row */}
        <nav className="flex items-center space-x-2 text-xs text-charcoal-400 mb-6">
          <Link href="/" className="hover:text-forest transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-forest transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-charcoal-700 truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>

        {/* Main Grid: Gallery on Left, Product Actions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Active Image with Consistent 4:3 Aspect Ratio */}
            <div className="relative w-full pt-[75%] rounded-3xl bg-white border border-gray-200/80 shadow-card overflow-hidden">
              <Image
                src={currentActiveImage.url}
                alt={`${product.title} - Image ${activeImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover w-full h-full"
              />

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest/90 text-white backdrop-blur-md shadow-xs">
                  {product.condition}
                </span>
                {currentActiveImage.isPrimary && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-forest-dark backdrop-blur-md shadow-xs">
                    Primary Photo
                  </span>
                )}
              </div>

              {/* Action Floating Buttons */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share listing"
                  title="Share listing"
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-subtle flex items-center justify-center text-charcoal-700 hover:text-forest hover:scale-105 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label="Save to wishlist"
                  title="Save to wishlist"
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-subtle flex items-center justify-center text-charcoal-700 hover:text-rose-500 hover:scale-105 transition-all"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      wishlisted ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Image counter indicator */}
              <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={img.fileId || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-brand-500 shadow-subtle scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Full Product Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs mt-6">
              <h2 className="text-lg font-bold text-forest mb-4">About This Item</h2>
              <div className="prose prose-sm max-w-none text-charcoal-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>

              {/* Condition Note Callout */}
              {product.conditionNotes && (
                <div className="mt-6 p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs text-forest-dark space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-mint" />
                    Condition Assessment by Seller
                  </div>
                  <p>{product.conditionNotes}</p>
                </div>
              )}
            </div>

            {/* Product Specifications Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-forest mb-4">Item Specifications</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <dt className="text-charcoal-400">Brand</dt>
                  <dd className="font-semibold text-charcoal-900">{product.brand}</dd>
                </div>
                {product.model && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <dt className="text-charcoal-400">Model</dt>
                    <dd className="font-semibold text-charcoal-900">{product.model}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <dt className="text-charcoal-400">Category</dt>
                  <dd className="font-semibold text-charcoal-900">{product.category}</dd>
                </div>
                {product.purchaseYear && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <dt className="text-charcoal-400">Year Purchased</dt>
                    <dd className="font-semibold text-charcoal-900">{product.purchaseYear}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <dt className="text-charcoal-400">Original Invoice</dt>
                  <dd className="font-semibold text-charcoal-900 flex items-center gap-1">
                    {product.hasReceipt ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </span>
                    ) : (
                      <span className="text-charcoal-400">Not included</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <dt className="text-charcoal-400">Active Warranty</dt>
                  <dd className="font-semibold text-charcoal-900 flex items-center gap-1">
                    {product.hasWarranty ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-charcoal-400">Expired / None</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <dt className="text-charcoal-400">Original Packaging</dt>
                  <dd className="font-semibold text-charcoal-900 flex items-center gap-1">
                    {product.hasOriginalBox ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Included
                      </span>
                    ) : (
                      <span className="text-charcoal-400">Repackaged safely</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <dt className="text-charcoal-400">Listed On</dt>
                  <dd className="font-semibold text-charcoal-900">
                    {new Date(product.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Pricing, Primary CTA, Seller Bio, Buyer Protection */}
          <div className="lg:col-span-5 space-y-6">
            {/* Purchase Action Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-card space-y-6">
              {/* Product Title */}
              <div>
                <div className="text-xs font-semibold text-brand-700 tracking-wider uppercase mb-1">
                  {product.category}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-snug">
                  {product.title}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-charcoal-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-mint" />
                  <span>
                    {product.location?.neighborhood ? `${product.location.neighborhood}, ` : ''}
                    {product.location?.city || 'Local Area'}
                  </span>
                  <span>•</span>
                  <span>{product.views || 1} views</span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-warm-100 border border-gray-100">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base text-charcoal-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.savingsPercentage && product.savingsPercentage > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-mint/20 text-forest-dark text-xs font-bold">
                      Save {product.savingsPercentage}%
                    </span>
                  )}
                </div>

                {/* Eco Metric */}
                {product.estimatedCo2Savings && (
                  <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center space-x-2 text-xs text-brand-800 font-medium">
                    <Leaf className="w-4 h-4 text-mint shrink-0" />
                    <span>
                      Reusing this item prevents approximately{' '}
                      <strong>{product.estimatedCo2Savings} kg of CO2e</strong> emissions.
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Call-to-actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleOpenPurchaseModal()}
                  className="w-full py-4 px-6 rounded-full bg-forest text-white font-bold text-sm shadow-card hover:bg-forest-light hover:shadow-card-hover active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-mint" />
                  <span>Buy Now / I&apos;m Interested</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenPurchaseModal(Math.round(product.price * 0.9))}
                    className="py-3 px-4 rounded-full bg-white text-forest font-semibold text-xs border border-gray-200 hover:bg-brand-50 hover:border-brand-300 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-mint" />
                    <span>Make an Offer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="py-3 px-4 rounded-full bg-white text-charcoal-700 font-semibold text-xs border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{wishlisted ? 'Saved' : 'Save Item'}</span>
                  </button>
                </div>
              </div>

              {/* Delivery & Handover Options */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="font-bold text-charcoal-700 mb-1">Handover Options:</div>
                {product.deliveryOptions?.pickup && (
                  <div className="flex items-center space-x-2 text-charcoal-600">
                    <CheckCircle2 className="w-4 h-4 text-mint" />
                    <span>Local Meetup / Self-Pickup in {product.location?.city}</span>
                  </div>
                )}
                {product.deliveryOptions?.delivery && (
                  <div className="flex items-center space-x-2 text-charcoal-600">
                    <CheckCircle2 className="w-4 h-4 text-mint" />
                    <span>Citywide Direct Delivery available</span>
                  </div>
                )}
                {product.deliveryOptions?.shipping && (
                  <div className="flex items-center space-x-2 text-charcoal-600">
                    <Truck className="w-4 h-4 text-mint" />
                    <span>Insured Nationwide Shipping available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Reputation Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-forest">Seller Information</h3>
                {product.seller?.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                    Verified Seller
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3.5">
                <UserAvatar
                  src={product.seller?.avatarUrl}
                  alt={product.seller?.name || 'Seller'}
                  size="lg"
                  className="border-2 border-brand-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-charcoal-900">{product.seller?.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-charcoal-500 mt-0.5">
                    <span className="font-bold text-amber-500">★ {product.seller?.rating || '4.9'}</span>
                    <span>({product.seller?.reviewsCount || 12} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-warm-100 p-2.5 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-charcoal-400">Response Time</div>
                  <div className="font-semibold text-charcoal-800">{product.seller?.responseTime || 'Within 1 hour'}</div>
                </div>
                <div className="bg-warm-100 p-2.5 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-charcoal-400">Community Member</div>
                  <div className="font-semibold text-charcoal-800">{product.seller?.memberSince || 'Since 2024'}</div>
                </div>
              </div>
            </div>

            {/* ReCircle Buyer Protection Assurance */}
            <div className="bg-gradient-to-br from-brand-50/70 to-emerald-50/50 rounded-3xl p-6 border border-brand-200/80 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-forest-dark font-bold text-sm">
                <Award className="w-5 h-5 text-mint" />
                <span>ReCircle Buyer Protection</span>
              </div>
              <ul className="text-xs text-charcoal-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                  <span><strong>48-hour inspection period</strong> upon handover to verify authenticity and working condition.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                  <span>Funds held in escrow until buyer confirms item condition matches listing description.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {related.length > 0 && (
          <section className="pt-16 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-forest">Similar Pre-Loved Items</h2>
                <p className="text-xs text-charcoal-500">More sustainable choices in {product.category}</p>
              </div>
              <Link
                href={`/?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Purchase Request / Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOfferModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-forest">
                  <MessageSquare className="w-4 h-4 text-mint" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-forest">Contact Seller</h3>
                  <p className="text-xs text-charcoal-400">Send an inquiry or purchase offer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4 pt-4">
              {/* Product preview banner */}
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-warm-100 border border-gray-100">
                <div className="w-12 h-12 rounded-xl relative overflow-hidden shrink-0 border border-gray-200">
                  <Image
                    src={product.primaryImageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-charcoal-900 truncate">{product.title}</div>
                  <div className="text-[11px] text-charcoal-400">
                    Listing Price: <strong className="text-forest">₹{product.price.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Offer price input */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Your Offer Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    min="1"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <span className="text-[10px] text-charcoal-400 mt-1 block">
                  You can offer the full listed price or make a polite counter-offer.
                </span>
              </div>

              {/* Handover preference */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Handover Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                      deliveryType === 'pickup'
                        ? 'border-mint bg-brand-50 text-forest-dark font-bold'
                        : 'border-gray-200 text-charcoal-600 hover:bg-gray-50'
                    }`}
                  >
                    Self-Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                      deliveryType === 'delivery'
                        ? 'border-mint bg-brand-50 text-forest-dark font-bold'
                        : 'border-gray-200 text-charcoal-600 hover:bg-gray-50'
                    }`}
                  >
                    Local Courier
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('shipping')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                      deliveryType === 'shipping'
                        ? 'border-mint bg-brand-50 text-forest-dark font-bold'
                        : 'border-gray-200 text-charcoal-600 hover:bg-gray-50'
                    }`}
                  >
                    Shipping
                  </button>
                </div>
              </div>

              {/* Message to seller */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Message to Seller
                </label>
                <textarea
                  rows={3}
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  required
                  placeholder="Introduce yourself and specify when you'd like to pick up..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-charcoal-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="px-6 py-2.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-mint" />
                  <span>{isSubmittingOffer ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
