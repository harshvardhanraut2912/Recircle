'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Leaf, TrendingDown, PlusCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-warm-100 to-warm-100 pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-gray-100">
      {/* Background eco decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-r from-mint/10 via-brand-200/20 to-mint/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white shadow-xs border border-brand-200/60 text-xs text-forest-dark font-medium">
              <span className="flex h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span>Verified Circular Economy Marketplace</span>
              <Sparkles className="w-3.5 h-3.5 text-mint" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-forest leading-[1.12]">
              Give Great Goods a <span className="text-mint underline decoration-mint/40 decoration-wavy decoration-2">Second Life.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Buy verified pre-loved tech, designer furniture, and timeless pieces up to 70% off retail.
              Save money, support circular living, and reduce e-waste with every transaction.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                href="#marketplace-feed"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-forest text-white font-semibold text-sm shadow-card hover:bg-forest-light hover:shadow-card-hover transition-all duration-200"
              >
                <span>Explore Verified Items</span>
                <ArrowRight className="w-4 h-4 text-mint" />
              </Link>

              <Link
                href="/sell"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-white text-forest font-semibold text-sm border border-gray-200 shadow-xs hover:bg-brand-50/50 hover:border-brand-300 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 text-mint" />
                <span>List an Item to Sell</span>
              </Link>
            </div>

            {/* Mini Trust Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-charcoal-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-mint" />
                <span>48h Buyer Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <TrendingDown className="w-4 h-4 text-mint" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Leaf className="w-4 h-4 text-mint" />
                <span>Carbon Neutral Pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Circular Impact Hero Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-emerald-100/80 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-forest font-bold text-xs">
                    RC
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-forest">Community Impact Meter</h3>
                    <p className="text-[11px] text-charcoal-400">Live verified marketplace stats</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-brand-50 text-[10px] font-semibold text-forest-dark border border-brand-200">
                  Real-time
                </span>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-2 gap-4 py-5">
                <div className="bg-warm-100 p-4 rounded-2xl border border-gray-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                    14,280+
                  </div>
                  <div className="text-xs text-charcoal-500 font-medium mt-1 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-mint" />
                    Items Rehomed
                  </div>
                </div>

                <div className="bg-warm-100 p-4 rounded-2xl border border-gray-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 tracking-tight">
                    48.5 T
                  </div>
                  <div className="text-xs text-charcoal-500 font-medium mt-1">
                    CO2e Avoided
                  </div>
                </div>

                <div className="bg-warm-100 p-4 rounded-2xl border border-gray-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                    54%
                  </div>
                  <div className="text-xs text-charcoal-500 font-medium mt-1">
                    Avg. Savings vs Retail
                  </div>
                </div>

                <div className="bg-warm-100 p-4 rounded-2xl border border-gray-100">
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 tracking-tight">
                    4.9 / 5
                  </div>
                  <div className="text-xs text-charcoal-500 font-medium mt-1">
                    Verified Seller Rating
                  </div>
                </div>
              </div>

              {/* Verified Circular Assurance */}
              <div className="bg-brand-50/70 border border-brand-200/70 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-forest-dark">
                <Sparkles className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Every product listed on ReCircle includes condition documentation, real photos, and seller ratings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
