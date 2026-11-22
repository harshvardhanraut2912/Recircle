'use client';

import React from 'react';
import { Filter, X, RotateCcw, Check, Sparkles } from 'lucide-react';

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
  categories,
  conditions,
  selectedCategory,
  selectedConditions,
  minPrice,
  maxPrice,
  verifiedOnly,
  onCategoryChange,
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
    <aside className="w-full bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2 text-forest font-bold text-sm">
          <Filter className="w-4 h-4 text-mint" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Verified Sellers Only Toggle */}
      <div className="bg-brand-50/60 p-3.5 rounded-xl border border-brand-100 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-forest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            Verified Sellers Only
          </div>
          <div className="text-[11px] text-charcoal-500">Highest rated community members</div>
        </div>
        <button
          type="button"
          onClick={onVerifiedToggle}
          className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
            verifiedOnly ? 'bg-mint' : 'bg-gray-200'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              verifiedOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          Category
        </h3>
        <div className="space-y-1">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-50 text-brand-800 font-semibold'
                  : 'text-charcoal-600 hover:bg-gray-50'
              }`}
            >
              <span>{cat === 'All' ? 'All Categories' : cat}</span>
              {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-mint" />}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          Condition
        </h3>
        <div className="space-y-1.5">
          {conditions.map((cond) => {
            const isChecked = selectedConditions.includes(cond);
            return (
              <label
                key={cond}
                className="flex items-center space-x-2.5 text-xs text-charcoal-700 cursor-pointer select-none hover:text-charcoal-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onConditionToggle(cond)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span className={isChecked ? 'font-medium text-forest' : ''}>{cond}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          Price Range (₹)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-charcoal-400 block mb-1">Min (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-charcoal-400 block mb-1">Max (₹)</label>
            <input
              type="number"
              placeholder="50000"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
