'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, ShieldCheck, Leaf } from 'lucide-react';
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

  const displayImage = imageError || !product.primaryImageUrl
    ? '/placeholder-product.png'
    : product.primaryImageUrl;

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 hover:border-brand-300 hover:shadow-card transition-all duration-200 overflow-hidden relative cursor-pointer"
    >
      {/* Image */}
      <div className="relative block w-full pt-[80%] bg-warm-200 overflow-hidden">
        {displayImage === '/placeholder-product.png' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-50/50 p-4 text-center">
            <Leaf className="w-9 h-9 text-mint mb-1" />
            <span className="text-xs text-charcoal-500">{product.category}</span>
          </div>
        ) : (
          <Image
            src={displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImageError(true)}
          />
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 shadow-subtle flex items-center justify-center text-charcoal-500 hover:text-rose-500 active:scale-95 transition-all"
        >
          <Heart className={`w-[18px] h-[18px] ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {product.savingsPercentage && product.savingsPercentage > 0 ? (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-forest text-white text-[11px] font-bold">
            {product.savingsPercentage}% off
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-charcoal-900 group-hover:text-forest line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.title}
        </h3>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-extrabold text-forest">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-charcoal-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-charcoal-500">
          <span className="truncate">{product.condition}</span>
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 text-mint shrink-0" />
            <span className="truncate">{product.location?.city || 'Local'}</span>
            {product.seller?.verified && (
              <ShieldCheck className="w-3.5 h-3.5 text-mint shrink-0" aria-label="Verified seller" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
