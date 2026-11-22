'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Compass, ArrowRight, PackageOpen, Lock } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { wishlist, count } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Please log in or create an account to view your saved wishlist.');
      router.push('/login?redirect=/wishlist');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/products?limit=100');
        const data = await res.json();
        if (data.success && data.products) {
          const matched = data.products.filter((p: Product) => wishlist.includes(p._id));
          setProducts(matched);
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchWishlistProducts();
    } else {
      setLoading(false);
    }
  }, [wishlist, user]);

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-forest mb-4">
          <Lock className="w-8 h-8 text-mint" />
        </div>
        <h1 className="text-2xl font-bold text-forest mb-2">Login Required</h1>
        <p className="text-sm text-charcoal-500 mb-6 max-w-sm">
          Please log in or create an account to view and manage your saved wishlist.
        </p>
        <Link
          href="/login?redirect=/wishlist"
          className="px-6 py-2.5 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light shadow-xs"
        >
          Log In or Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-100 py-8 sm:py-12">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="pb-6 border-b border-gray-200/80 mb-8">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Saved Wishlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              {count} items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Pre-loved items you are watching. Compare pricing or contact sellers when you&apos;re ready.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden animate-pulse"
              >
                <div className="w-full pt-[75%] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-forest mb-2">Your wishlist is currently empty</h2>
            <p className="text-xs text-charcoal-500 leading-relaxed mb-6">
              Found something you love? Tap the heart icon on any product card or details page to save it for later.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light shadow-xs"
            >
              <Compass className="w-4 h-4 text-mint" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
