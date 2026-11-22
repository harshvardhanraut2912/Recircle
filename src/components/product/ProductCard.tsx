'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Sparkles, ShieldCheck, Leaf, Lock } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const productDestination = `/products/${product._id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please log in or create an account to view product details & purchase.');
      router.push(`/login?redirect=${encodeURIComponent(productDestination)}`);
    } else {
      router.push(productDestination);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in or create an account to save items.');
      router.push(`/login?redirect=${encodeURIComponent(productDestination)}`);
      return;
    }

    const isAdded = toggle(product._id);
    if (isAdded) {
      toast.success(`Saved "${product.title.slice(0, 24)}..." to your wishlist!`);
    } else {
      toast.info(`Removed from your wishlist.`);
    }
  };

  // Condition Badge Styling
  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Brand New':
        return 'bg-forest text-white border-forest';
      case 'Like New':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Very Good':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Good':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const displayImage = imageError || !product.primaryImageUrl
    ? '/placeholder-product.png'
    : product.primaryImageUrl;

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-card-hover hover:border-brand-300 transition-all duration-300 overflow-hidden relative cursor-pointer"
    >
      {/* Image Container with Consistent 4:3 Aspect Ratio */}
      <div className="relative block w-full pt-[75%] bg-warm-200 overflow-hidden">
        {displayImage === '/placeholder-product.png' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-50/50 p-4 text-center">
            <Leaf className="w-10 h-10 text-mint mb-1" />
            <span className="text-xs font-semibold text-forest">ReCircle Verified</span>
            <span className="text-[10px] text-charcoal-400">{product.category}</span>
          </div>
        ) : (
          <Image
            src={displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImageError(true)}
          />
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Condition Pill */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border shadow-xs pointer-events-auto backdrop-blur-xs ${getConditionBadge(
              product.condition
            )}`}
          >
            {product.condition}
          </span>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-subtle flex items-center justify-center text-charcoal-500 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Eco Savings Badge (bottom left of image) */}
        {product.savingsPercentage && product.savingsPercentage > 0 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-md bg-forest/90 text-mint text-[10px] font-bold tracking-wide backdrop-blur-sm shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Save {product.savingsPercentage}%
            </span>
          </div>
        )}

        {/* Unauthenticated subtle lock badge when hovered */}
        {!user && isHovered && (
          <div className="absolute inset-0 bg-forest-dark/40 backdrop-blur-xs flex items-center justify-center transition-all animate-in fade-in duration-150">
            <div className="px-3.5 py-1.5 rounded-full bg-white/95 text-forest text-xs font-bold shadow-card flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-mint" />
              <span>Log in to View</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Brand row */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-400 mb-1.5 font-medium">
            <span className="uppercase tracking-wider">{product.category}</span>
            <span className="truncate max-w-[120px]">{product.brand}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-charcoal-900 group-hover:text-forest line-clamp-2 leading-snug transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="pt-3 border-t border-gray-100/80 mt-3">
          {/* Price & Original Price */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-extrabold text-forest tracking-tight">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-charcoal-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.estimatedCo2Savings && (
              <span className="text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5" title="Estimated Carbon Footprint Reduced">
                <Leaf className="w-2.5 h-2.5 text-mint" />
                -{product.estimatedCo2Savings}kg CO2
              </span>
            )}
          </div>

          {/* Seller & Location Footer */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1">
            <div className="flex items-center space-x-1 truncate max-w-[140px]">
              <MapPin className="w-3 h-3 text-mint shrink-0" />
              <span className="truncate">{product.location?.city || 'Local Pickup'}</span>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              <span className="font-medium text-charcoal-700">{product.seller?.name?.split(' ')[0]}</span>
              {product.seller?.verified && (
                <span title="Verified Seller" className="inline-flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint shrink-0" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
