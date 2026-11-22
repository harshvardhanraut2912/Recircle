'use client';

import React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import FilterSidebar from './FilterSidebar';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  conditions: string[];
  selectedCategory: string;
  selectedConditions: string[];
  minPrice: string;
  maxPrice: string;
  verifiedOnly: boolean;
  onCategoryChange: (cat: string) => void;
  onConditionToggle: (condition: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onVerifiedToggle: () => void;
  onReset: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  ...props
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-forest font-bold text-base">
            <Filter className="w-5 h-5 text-mint" />
            <span>Filter Marketplace</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar {...props} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest-light transition-colors shadow-xs"
          >
            Apply Filters & View Results
          </button>
        </div>
      </div>
    </div>
  );
}
