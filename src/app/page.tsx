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

  const hasFilters = selectedConditions.length > 0 || minPrice || maxPrice || verifiedOnly;

  return (
    <div className="min-h-screen bg-warm-100">
      <HeroSection />

      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <CategoryBar selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />

        <section id="marketplace-feed" className="pt-2 pb-10 scroll-mt-20">
          {/* Title + controls */}
          <div className="flex items-center justify-between gap-3 pb-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-forest truncate">
                {selectedCategory === 'All' ? 'Latest items' : selectedCategory}
              </h2>
              <p className="text-sm text-charcoal-500 truncate">
                {loading ? 'Loading...' : `${totalCount} items`}
                {urlSearch ? ` for “${urlSearch}”` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden h-10 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-charcoal-700 active:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4 text-mint" />
                <span>Filters</span>
                {hasFilters && <span className="w-2 h-2 rounded-full bg-mint" />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="h-10 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-charcoal-700 hover:bg-gray-50"
                >
                  <span className="max-w-[110px] sm:max-w-none truncate">
                    {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Recently Listed'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-charcoal-400 shrink-0" />
                </button>

                {isSortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsSortDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-gray-100 py-1.5 z-30">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedSort(opt.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 min-h-[44px] text-sm flex items-center justify-between hover:bg-brand-50 ${
                            selectedSort === opt.value ? 'font-semibold text-forest bg-brand-50/60' : 'text-charcoal-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedSort === opt.value && <Check className="w-4 h-4 text-mint" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-6 lg:gap-8 items-start">
            {/* Desktop filters */}
            <div className="hidden lg:block w-64 xl:w-72 shrink-0">
              <div className="sticky top-24">
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

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-[1700px]:grid-cols-5 gap-3 sm:gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="w-full pt-[80%] bg-gray-200" />
                      <div className="p-3 sm:p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-5 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                    <PackageOpen className="w-7 h-7 text-mint" />
                  </div>
                  <h3 className="text-lg font-bold text-forest mb-1.5">No items found</h3>
                  <p className="text-sm text-charcoal-500 max-w-md mx-auto mb-6">
                    Try changing your filters, or list the first item yourself.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="h-12 inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 text-charcoal-700 text-sm font-semibold hover:bg-gray-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset filters</span>
                    </button>
                    <Link
                      href="/sell"
                      className="h-12 inline-flex items-center justify-center gap-2 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest-light"
                    >
                      <PlusCircle className="w-4 h-4 text-mint" />
                      <span>Sell an item</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-[1700px]:grid-cols-5 gap-3 sm:gap-5">
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
