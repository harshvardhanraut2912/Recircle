'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, MessageSquare, User, LogIn } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    {
      label: 'Saved',
      href: user ? '/wishlist' : '/login?redirect=/wishlist',
      icon: Compass,
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      label: 'Sell',
      href: user ? '/sell' : '/login?redirect=/sell',
      icon: PlusCircle,
      isPrimary: true,
    },
    {
      label: 'Inbox',
      href: user ? '/dashboard?tab=inquiries' : '/login?redirect=/dashboard?tab=inquiries',
      icon: MessageSquare,
      badge: user ? 2 : null,
    },
    {
      label: user ? 'Account' : 'Log In',
      href: user ? '/dashboard' : '/login',
      icon: user ? User : LogIn,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center -mt-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-forest to-mint flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-forest mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-3 rounded-lg relative transition-colors ${
                isActive ? 'text-forest font-semibold' : 'text-charcoal-400 hover:text-charcoal-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-forest' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-mint text-forest-dark font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
