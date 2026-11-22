'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, PlusCircle, ShieldCheck, Leaf, TrendingDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full bg-brand-50/60 border-b border-gray-200/60">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 sm:py-12 lg:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-forest leading-tight">
              Buy and sell pre-loved goods, up to 70% off.
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-charcoal-600 leading-relaxed">
              Verified electronics, furniture and fashion from people near you.
            </p>

            <div className="mt-6 grid grid-cols-1 min-[420px]:grid-cols-2 sm:flex sm:flex-row gap-3">
              <Link
                href="#marketplace-feed"
                className="h-12 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-forest text-white font-semibold text-sm hover:bg-forest-light transition-colors"
              >
                <span>Browse items</span>
                <ArrowRight className="w-4 h-4 text-mint" />
              </Link>
              <Link
                href="/sell"
                className="h-12 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-white text-forest font-semibold text-sm border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-mint" />
                <span>Sell an item</span>
              </Link>
            </div>
          </div>

          <ul className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-6 lg:gap-3 text-sm text-charcoal-600 font-medium">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-mint shrink-0" />
              <span>48h buyer guarantee</span>
            </li>
            <li className="flex items-center gap-2.5">
              <TrendingDown className="w-5 h-5 text-mint shrink-0" />
              <span>No hidden fees</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Leaf className="w-5 h-5 text-mint shrink-0" />
              <span>Less waste, lower CO2</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
