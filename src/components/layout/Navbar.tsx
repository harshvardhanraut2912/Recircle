'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  PlusCircle,
  Heart,
  MessageSquare,
  MapPin,
  ChevronDown,
  Package,
  Layers,
  LogOut,
  LogIn,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';
import UserAvatar from '@/components/ui/UserAvatar';

const CITIES = ['All Cities', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams?.get('city') || 'All Cities');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [inquiriesCount] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`);
    setIsMobileSearchOpen(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (city === 'All Cities') {
      params.delete('city');
    } else {
      params.set('city', city);
    }
    router.push(`/?${params.toString()}`);
  };

  const iconBtn =
    'relative w-10 h-10 flex items-center justify-center rounded-full text-charcoal-600 hover:text-forest hover:bg-gray-100 transition-colors';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/70">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-200">
              <Image
                src="/logo.jpg"
                alt="ReCircle Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-forest">
              Re<span className="text-mint">Circle</span>
            </span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, phones, furniture..."
                className="w-full h-10 pl-11 pr-4 rounded-full bg-gray-100 border border-transparent text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* City picker (desktop) */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="h-10 flex items-center gap-1.5 px-3 rounded-full text-sm text-charcoal-700 hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-4 h-4 text-mint" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
              </button>
              {isCityOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-card border border-gray-100 py-1.5 z-50"
                  onMouseLeave={() => setIsCityOpen(false)}
                >
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`w-full text-left px-3.5 py-2 text-sm hover:bg-brand-50 transition-colors ${
                        selectedCity === c ? 'font-semibold text-forest bg-brand-50/60' : 'text-charcoal-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`md:hidden ${iconBtn}`}
              aria-label="Search"
            >
              {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <Link
              href={user ? '/wishlist' : '/login?redirect=/wishlist'}
              className={`hidden sm:flex ${iconBtn}`}
              title="Saved Items"
              aria-label="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href={user ? '/dashboard?tab=inquiries' : '/login?redirect=/dashboard?tab=inquiries'}
              className={`hidden sm:flex ${iconBtn}`}
              title="Purchase Requests"
              aria-label="Purchase requests"
            >
              <MessageSquare className="w-5 h-5" />
              {user && inquiriesCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-mint text-forest-dark text-[10px] font-extrabold flex items-center justify-center">
                  {inquiriesCount}
                </span>
              )}
            </Link>

            <Link
              href={user ? '/sell' : '/login?redirect=/sell'}
              className="hidden sm:inline-flex h-10 items-center gap-1.5 px-4 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest-light transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-mint" />
              <span>Sell</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-10 flex items-center gap-1 pl-1 pr-1 sm:pr-2 rounded-full hover:bg-gray-100 border border-gray-200 transition-colors"
                  aria-label="Account menu"
                >
                  <UserAvatar src={user.avatarUrl} alt={user.username} size="sm" />
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2.5">
                        <UserAvatar src={user.avatarUrl} alt={user.username} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-charcoal-900 truncate">{user.username}</div>
                          <div className="text-xs text-charcoal-400 truncate">{user.phone}</div>
                        </div>
                      </div>

                      <div className="py-1 text-sm">
                        <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-charcoal-700 hover:bg-gray-50">
                          <Layers className="w-4 h-4 text-charcoal-400" />
                          <span>Dashboard</span>
                        </Link>
                        <Link href="/dashboard?tab=listings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-charcoal-700 hover:bg-gray-50">
                          <Package className="w-4 h-4 text-charcoal-400" />
                          <span>My Listings</span>
                        </Link>
                        <Link href="/dashboard?tab=inquiries" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-charcoal-700 hover:bg-gray-50">
                          <MessageSquare className="w-4 h-4 text-charcoal-400" />
                          <span>Purchase Requests</span>
                        </Link>
                        <Link href="/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-charcoal-700 hover:bg-gray-50">
                          <Heart className="w-4 h-4 text-charcoal-400" />
                          <span>Wishlist ({wishlistCount})</span>
                        </Link>
                        <Link href="/admin-panel" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-forest font-semibold hover:bg-brand-50">
                          <ShieldCheck className="w-4 h-4 text-mint" />
                          <span>Admin Panel</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-10 inline-flex items-center gap-1.5 px-4 rounded-full border border-gray-200 text-charcoal-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-mint" />
                  <span>Log In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {isMobileSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pre-loved items..."
                className="w-full h-11 pl-11 pr-20 rounded-full bg-gray-100 text-base text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/30"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full bg-forest text-white text-sm font-semibold"
              >
                Go
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
