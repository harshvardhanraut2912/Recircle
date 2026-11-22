'use client';

import React from 'react';
import { X } from 'lucide-react';
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

export default function FilterDrawer({ isOpen, onClose, ...props }: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-bold text-forest">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-charcoal-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <FilterSidebar {...props} />
        </div>

        <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest-light transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
