import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-forest-dark text-white mt-8">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20">
                <Image src="/logo.jpg" alt="ReCircle Logo" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                Re<span className="text-mint">Circle</span>
              </span>
            </Link>
            <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
              Buy and sell verified pre-loved products. Simple, trusted and good for the planet.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Shop</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link href="/?category=Electronics" className="hover:text-mint">Electronics</Link></li>
              <li><Link href="/?category=Furniture" className="hover:text-mint">Furniture</Link></li>
              <li><Link href="/?category=Fashion" className="hover:text-mint">Fashion</Link></li>
              <li><Link href="/?category=Books%20%26%20Media" className="hover:text-mint">Books</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Account</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link href="/sell" className="hover:text-mint">Sell an item</Link></li>
              <li><Link href="/dashboard" className="hover:text-mint">Dashboard</Link></li>
              <li><Link href="/wishlist" className="hover:text-mint">Wishlist</Link></li>
              <li><Link href="/admin-panel" className="hover:text-mint">Admin panel</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-gray-400">
          © {new Date().getFullYear()} ReCircle Marketplace
        </div>
      </div>
    </footer>
  );
}
