'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import CategoryBar from '@/components/home/CategoryBar';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/home/FilterSidebar';
import FilterDrawer from '@/components/home/FilterDrawer';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  PackageOpen,
  RotateCcw,
  PlusCircle,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';

const ALL_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Fashion',
  'Bicycles & Mobility',
  'Books & Media',
  'Sports & Outdoors',
  'Appliances',
];

const ALL_CONDITIONS = ['Brand New', 'Like New', 'Very Good', 'Good', 'Fair'];

const SORT_OPTIONS = [
  { label: 'Recently Listed', value: 'recent' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Biggest Savings %', value: 'savings' },
  { label: 'Most Popular', value: 'popular' },
];

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // URL States
  const urlCategory = searchParams?.get('category') || 'All';
  const urlSearch = searchParams?.get('search') || '';
  const urlCity = searchParams?.get('city') || '';
  const urlSort = searchParams?.get('sort') || 'recent';

  // Local Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSort, setSelectedSort] = useState(urlSort);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // UI state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Synchronize category from URL if changed
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      if (selectedConditions.length > 0) {
        params.set('condition', selectedConditions.join(','));
      }
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (selectedSort) params.set('sort', selectedSort);
      if (urlSearch) params.set('search', urlSearch);
      if (urlCity && urlCity !== 'All Cities') params.set('city', urlCity);
      if (user?._id) params.set('excludeSellerId', user._id);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let items: Product[] = data.products || [];
        // Exclude current logged in user's own products from homepage feed
        if (user?._id) {
          items = items.filter((p) => {
            const pid = p.seller?.id;
            if (pid === user._id) return false;
            if (user._id === '6aef65d4676b6547b4dbb657' && pid === 'seller-recircle-user') return false;
            return true;
          });
        }
        if (verifiedOnly) {
          items = items.filter((p) => p.seller?.verified);
        }
        setProducts(items);
        setTotalCount(items.length);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    selectedConditions,
    minPrice,
    maxPrice,
    selectedSort,
    urlSearch,
    urlCity,
    verifiedOnly,
    user,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedSort('recent');
    setVerifiedOnly(false);
    router.push('/', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-warm-100">
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Carousel / Grid */}
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Marketplace Section Anchor */}
        <section id="marketplace-feed" className="py-6 sm:py-8">
          {/* Controls Bar: Search label, Filter Trigger, Product Count, Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-gray-200/80">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-forest tracking-tight">
                  {selectedCategory === 'All' ? 'Marketplace Feed' : selectedCategory}
                </h2>
                {urlSearch && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-forest-dark font-medium">
                    Matching &ldquo;{urlSearch}&rdquo;
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {loading ? 'Scanning verified items...' : `Showing ${totalCount} verified pre-loved products`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 shadow-xs text-xs font-semibold text-charcoal-700 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-mint" />
                <span>Filters</span>
                {(selectedConditions.length > 0 || minPrice || maxPrice || verifiedOnly) && (
                  <span className="w-2 h-2 rounded-full bg-mint" />
                )}
              </button>

              {/* Sort Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 shadow-xs text-xs font-semibold text-charcoal-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-charcoal-400 font-normal">Sort by:</span>
                  <span>
                    {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Recently Listed'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                </button>

                {isSortDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-gray-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setIsSortDropdownOpen(false)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedSort(opt.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-brand-50 transition-colors ${
                          selectedSort === opt.value
                            ? 'font-bold text-forest bg-brand-50/60'
                            : 'text-charcoal-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedSort === opt.value && <Check className="w-3.5 h-3.5 text-mint" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Grid Layout with Desktop Filter Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28">
                <FilterSidebar
                  categories={ALL_CATEGORIES}
                  conditions={ALL_CONDITIONS}
                  selectedCategory={selectedCategory}
                  selectedConditions={selectedConditions}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  verifiedOnly={verifiedOnly}
                  onCategoryChange={handleCategorySelect}
                  onConditionToggle={handleConditionToggle}
                  onPriceChange={handlePriceChange}
                  onVerifiedToggle={() => setVerifiedOnly(!verifiedOnly)}
                  onReset={handleResetFilters}
                />
              </div>
            </div>

            {/* Product Feed Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden animate-pulse"
                    >
                      <div className="w-full pt-[75%] bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2 pt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                /* Sophisticated Empty State */
                <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 border border-brand-200">
                    <PackageOpen className="w-8 h-8 text-mint" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-forest mb-2">
                    No verified items found
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto mb-6 leading-relaxed">
                    We couldn&apos;t find any items matching your current filters or search term. Try resetting your filters or list the first one yourself!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-gray-100 text-charcoal-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </button>
                    <Link
                      href="/sell"
                      className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-mint" />
                      <span>Sell an Item in This Category</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={ALL_CATEGORIES}
        conditions={ALL_CONDITIONS}
        selectedCategory={selectedCategory}
        selectedConditions={selectedConditions}
        minPrice={minPrice}
        maxPrice={maxPrice}
        verifiedOnly={verifiedOnly}
        onCategoryChange={handleCategorySelect}
        onConditionToggle={handleConditionToggle}
        onPriceChange={handlePriceChange}
        onVerifiedToggle={() => setVerifiedOnly(!verifiedOnly)}
        onReset={handleResetFilters}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-100 flex items-center justify-center text-xs text-charcoal-500">Loading marketplace...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
