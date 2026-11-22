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
  User,
  Package,
  Layers,
  Settings,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';
import UserAvatar from '@/components/ui/UserAvatar';

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
  const [inquiriesCount, setInquiriesCount] = useState(2);

  const CITIES = ['All Cities', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`);
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Sustainability Announcement Bar */}
      <div className="bg-gradient-to-r from-forest-dark via-forest to-forest-light text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-mint text-forest-dark">
              Sustainable Commerce
            </span>
            <span className="hidden sm:inline text-gray-200">
              Give quality goods a second life • Free seller pickups in selected cities
            </span>
            <span className="sm:hidden text-gray-200 truncate">
              Pre-loved verified circular marketplace
            </span>
          </div>

          <div className="flex items-center space-x-4 text-gray-200 text-xs">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center space-x-1 hover:text-white transition-colors py-0.5"
              >
                <MapPin className="w-3.5 h-3.5 text-mint" />
                <span className="font-medium">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-gray-300" />
              </button>

              {isCityOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white text-charcoal-900 rounded-xl shadow-card border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select Your City
                  </div>
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-brand-50 hover:text-brand-700 transition-colors ${
                        selectedCity === c ? 'font-semibold text-brand-700 bg-brand-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{c}</span>
                      {selectedCity === c && <span className="w-1.5 h-1.5 rounded-full bg-mint" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-400 hidden md:inline">|</span>
            {user ? (
              <span className="text-gray-300 hidden md:inline text-[11px]">
                Signed in as <strong className="text-white">{user.username}</strong>
              </span>
            ) : (
              <Link href="/login" className="hover:text-white hidden md:inline text-[11px] font-medium">
                Log In / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-subtle border border-emerald-100 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.jpg"
                alt="ReCircle Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-forest flex items-center gap-1">
                Re<span className="text-mint">Circle</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-charcoal-400 font-medium -mt-1 hidden sm:block">
                Buy • Sell • Reuse
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified pre-loved laptops, phones, furniture, designer jackets..."
                className="w-full pl-10 pr-24 py-2.5 rounded-full bg-warm-100 border border-gray-200/80 text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-forest text-white text-xs font-medium hover:bg-forest-light transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action CTAs & Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-charcoal-600 hover:text-charcoal-900 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Saved Wishlist */}
            <Link
              href={user ? "/wishlist" : "/login?redirect=/wishlist"}
              className="relative p-2 text-charcoal-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Inquiries / Messages */}
            <Link
              href={user ? "/dashboard?tab=inquiries" : "/login?redirect=/dashboard?tab=inquiries"}
              className="relative p-2 text-charcoal-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
              title="Purchase Requests"
            >
              <MessageSquare className="w-5 h-5" />
              {user && inquiriesCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-mint text-forest-dark text-[10px] font-extrabold ring-2 ring-white">
                  {inquiriesCount}
                </span>
              )}
            </Link>

            {/* "Sell an Item" Button */}
            <Link
              href={user ? "/sell" : "/login?redirect=/sell"}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-forest to-forest-light text-white font-medium text-sm shadow-subtle hover:shadow-card hover:from-forest-dark hover:to-forest transition-all duration-200 group"
            >
              <PlusCircle className="w-4 h-4 text-mint group-hover:rotate-90 transition-transform duration-300" />
              <span>Sell an Item</span>
            </Link>

            {/* User Profile or Login CTA */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  <UserAvatar src={user.avatarUrl} alt={user.username} size="sm" />
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 hidden sm:block mr-1" />
                </button>

                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center space-x-2.5">
                      <UserAvatar src={user.avatarUrl} alt={user.username} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-charcoal-900 truncate">{user.username}</div>
                        <div className="text-[11px] text-charcoal-400 truncate">{user.phone}</div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-charcoal-400" />
                        <span>Seller Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard?tab=listings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Package className="w-4 h-4 text-charcoal-400" />
                        <span>My Active Listings</span>
                      </Link>
                      <Link
                        href="/dashboard?tab=inquiries"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-charcoal-400" />
                        <span>Purchase Requests</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-charcoal-400" />
                        <span>Saved Wishlist ({wishlistCount})</span>
                      </Link>
                      <Link
                        href="/admin-panel"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-forest font-bold hover:bg-emerald-50 hover:text-forest transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-mint" />
                        <span>Admin Panel</span>
                      </Link>
                      <Link
                        href="/sell"
                        onClick={() => setIsProfileOpen(false)}
                        className="sm:hidden flex items-center space-x-2.5 px-4 py-2 text-xs text-brand-700 font-semibold bg-brand-50/50 hover:bg-brand-50 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-mint" />
                        <span>Sell an Item</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-full border border-gray-200 text-charcoal-700 text-xs font-bold hover:bg-gray-50 hover:text-forest transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-mint" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Input Drawer (Visible when toggled on mobile) */}
        {isMobileSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pre-loved tech, furniture, fashion..."
                className="w-full pl-10 pr-20 py-2 rounded-xl bg-warm-100 border border-gray-200 text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-forest text-white text-xs font-medium"
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
