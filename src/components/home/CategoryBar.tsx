'use client';

import React from 'react';
import {
  Laptop,
  Armchair,
  Shirt,
  Bike,
  BookOpen,
  Dumbbell,
  Sparkles,
  Tv,
} from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'All', name: 'All Categories', icon: Sparkles, count: 'All' },
  { id: 'Electronics', name: 'Electronics & Tech', icon: Laptop, count: '3.2k+' },
  { id: 'Furniture', name: 'Furniture & Living', icon: Armchair, count: '1.8k+' },
  { id: 'Fashion', name: 'Sustainable Fashion', icon: Shirt, count: '2.5k+' },
  { id: 'Bicycles & Mobility', name: 'Bicycles & Mobility', icon: Bike, count: '840+' },
  { id: 'Books & Media', name: 'Books & Media', icon: BookOpen, count: '4.1k+' },
  { id: 'Sports & Outdoors', name: 'Sports & Fitness', icon: Dumbbell, count: '920+' },
  { id: 'Appliances', name: 'Home Appliances', icon: Tv, count: '630+' },
];

export default function CategoryBar({
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-forest">Browse by Category</h2>
          <p className="text-xs text-charcoal-500">Discover pre-loved treasures in every department</p>
        </div>
      </div>

      {/* Horizontal scroll on mobile, responsive grid on desktop */}
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:gap-3 sm:space-x-0">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 shrink-0 w-28 sm:w-auto ${
                isSelected
                  ? 'bg-forest text-white border-forest shadow-card scale-102'
                  : 'bg-white text-charcoal-700 border-gray-200/80 hover:border-brand-300 hover:bg-brand-50/40 shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                  isSelected ? 'bg-forest-light text-mint' : 'bg-warm-200 text-forest'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold leading-tight line-clamp-1">{cat.name}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isSelected ? 'text-gray-300' : 'text-charcoal-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
