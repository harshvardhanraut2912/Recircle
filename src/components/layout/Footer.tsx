import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, RefreshCw, Leaf, Award, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-white pt-14 pb-12 border-t border-forest-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shrink-0 border border-mint/20">
              <ShieldCheck className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Verified Listings</div>
              <div className="text-xs text-gray-300">Detailed condition checks</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shrink-0 border border-mint/20">
              <RefreshCw className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">48h Buyer Protection</div>
              <div className="text-xs text-gray-300">Peace of mind guaranteed</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shrink-0 border border-mint/20">
              <Leaf className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Circular Impact</div>
              <div className="text-xs text-gray-300">Reduce waste & CO2e</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shrink-0 border border-mint/20">
              <Award className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Trusted Community</div>
              <div className="text-xs text-gray-300">Real verified sellers</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          {/* Brand info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-mint/30 shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt="ReCircle Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Re<span className="text-mint">Circle</span>
              </span>
            </Link>
            <p className="text-sm text-gray-300 max-w-sm mb-4 leading-relaxed">
              The premier circular marketplace for verified pre-loved products. Designed to make
              sustainable shopping transparent, trustworthy, and delightful.
            </p>
            <div className="flex items-center space-x-2 text-xs text-mint font-medium">
              <Leaf className="w-4 h-4" />
              <span>Over 14,000+ items kept in circulation</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link href="/?category=Electronics" className="hover:text-mint transition-colors">
                  Electronics & Laptops
                </Link>
              </li>
              <li>
                <Link href="/?category=Furniture" className="hover:text-mint transition-colors">
                  Furniture & Chairs
                </Link>
              </li>
              <li>
                <Link href="/?category=Fashion" className="hover:text-mint transition-colors">
                  Sustainable Fashion
                </Link>
              </li>
              <li>
                <Link href="/?category=Bicycles%20%26%20Mobility" className="hover:text-mint transition-colors">
                  Bicycles & Mobility
                </Link>
              </li>
              <li>
                <Link href="/?category=Books%20%26%20Media" className="hover:text-mint transition-colors">
                  Books & E-Readers
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link href="/sell" className="hover:text-mint transition-colors">
                  List an Item for Sale
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-mint transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=inquiries" className="hover:text-mint transition-colors">
                  Incoming Purchase Requests
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-mint transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=settings" className="hover:text-mint transition-colors">
                  Profile & Verification
                </Link>
              </li>
              <li>
                <Link href="/admin-panel" className="text-mint font-semibold hover:underline transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Panel</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="text-gray-300">Buyer Protection Standard</li>
              <li className="text-gray-300">Condition Grading Guide</li>
              <li className="text-gray-300">Safe Meet-up Tips</li>
              <li className="text-gray-300">Sustainability Metrics</li>
              <li className="text-gray-300">GridFS Binary Storage</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center space-x-1">
            <span>© {new Date().getFullYear()} ReCircle Marketplace Inc. Powered by MongoDB & GridFS.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-mint">
              <Heart className="w-3.5 h-3.5 fill-mint" /> Built for a sustainable future
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
