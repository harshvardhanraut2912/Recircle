'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, PlusCircle, MessageSquare, User, LogIn } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, badge: null as number | null },
    {
      label: 'Saved',
      href: user ? '/wishlist' : '/login?redirect=/wishlist',
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    { label: 'Sell', href: user ? '/sell' : '/login?redirect=/sell', icon: PlusCircle, badge: null as number | null },
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
      badge: null as number | null,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-forest' : 'text-charcoal-400 active:text-charcoal-700'
              }`}
            >
              <span className="relative">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.4 : 1.8} />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-mint text-forest-dark font-extrabold text-[10px] flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
