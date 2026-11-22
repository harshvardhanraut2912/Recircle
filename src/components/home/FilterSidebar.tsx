'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
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

export default function FilterSidebar({
  conditions,
  selectedCategory,
  selectedConditions,
  minPrice,
  maxPrice,
  verifiedOnly,
  onConditionToggle,
  onPriceChange,
  onVerifiedToggle,
  onReset,
}: FilterSidebarProps) {
  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedConditions.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    verifiedOnly;

  return (
    <aside className="w-full bg-white rounded-2xl border border-gray-200/80 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-forest">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-charcoal-800">Verified sellers only</span>
        <button
          type="button"
          role="switch"
          aria-checked={verifiedOnly}
          onClick={onVerifiedToggle}
          className={`w-11 h-6 shrink-0 flex items-center rounded-full p-0.5 transition-colors ${
            verifiedOnly ? 'bg-mint' : 'bg-gray-300'
          }`}
        >
          <span
            className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
              verifiedOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="space-y-3 pt-5 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-charcoal-800">Condition</h4>
        <div className="space-y-1">
          {conditions.map((cond) => {
            const isChecked = selectedConditions.includes(cond);
            return (
              <label
                key={cond}
                className="flex items-center gap-3 min-h-[40px] text-sm text-charcoal-700 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onConditionToggle(cond)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className={isChecked ? 'font-medium text-forest' : ''}>{cond}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pt-5 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-charcoal-800">Price (₹)</h4>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-base sm:text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-base sm:text-sm text-charcoal-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>
    </aside>
  );
}
