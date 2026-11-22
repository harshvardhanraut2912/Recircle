'use client';

import { useState, useEffect } from 'react';

const WISHLIST_KEY = 'recircle_wishlist_ids';

export function getWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWishlistId(productId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getWishlist();
    const exists = current.includes(productId);
    let updated: string[];
    if (exists) {
      updated = current.filter((id) => id !== productId);
    } else {
      updated = [...current, productId];
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
    return !exists;
  } catch {
    return false;
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());
    const handler = () => {
      setWishlist(getWishlist());
    };
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, []);

  return {
    wishlist,
    count: wishlist.length,
    isWishlisted: (id: string) => wishlist.includes(id),
    toggle: (id: string) => toggleWishlistId(id),
  };
}
