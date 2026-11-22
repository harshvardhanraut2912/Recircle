'use client';

import React from 'react';
import { Laptop, Armchair, Shirt, Bike, BookOpen, Dumbbell, LayoutGrid, Tv } from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'All', name: 'All', icon: LayoutGrid },
  { id: 'Electronics', name: 'Electronics', icon: Laptop },
  { id: 'Furniture', name: 'Furniture', icon: Armchair },
  { id: 'Fashion', name: 'Fashion', icon: Shirt },
  { id: 'Bicycles & Mobility', name: 'Mobility', icon: Bike },
  { id: 'Books & Media', name: 'Books', icon: BookOpen },
  { id: 'Sports & Outdoors', name: 'Sports', icon: Dumbbell },
  { id: 'Appliances', name: 'Appliances', icon: Tv },
];

export default function CategoryBar({ selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full py-4 sm:py-5">
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 h-10 inline-flex items-center gap-2 px-4 rounded-full border text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-charcoal-700 border-gray-200 hover:border-brand-300 hover:bg-brand-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-mint' : 'text-charcoal-400'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
