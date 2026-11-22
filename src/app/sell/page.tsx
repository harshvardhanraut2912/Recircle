'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  Star,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  Package,
  DollarSign,
  MapPin,
  Eye,
  Check,
  Loader2,
} from 'lucide-react';
import { ProductCondition, ProductImage } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Basic Info', desc: 'Title & category' },
  { id: 2, title: 'Upload Photos', desc: 'GridFS storage' },
  { id: 3, title: 'Price & Condition', desc: 'Condition grading' },
  { id: 4, title: 'Item History', desc: 'Receipts & warranty' },
  { id: 5, title: 'Handover & Location', desc: 'Pickup & shipping' },
  { id: 6, title: 'Preview & Publish', desc: 'Review listing' },
];

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Fashion',
  'Bicycles & Mobility',
  'Books & Media',
  'Sports & Outdoors',
  'Appliances',
];

const CONDITIONS: { label: ProductCondition; desc: string }[] = [
  {
    label: 'Brand New',
    desc: 'Unopened, sealed in original factory box with all manuals and tags intact.',
  },
  {
    label: 'Like New',
    desc: 'Appears unblemished, fully functional, minimal to no visible signs of handling.',
  },
  {
    label: 'Very Good',
    desc: 'Minor cosmetic marks that do not affect functionality, well maintained.',
  },
  {
    label: 'Good',
    desc: 'Moderate signs of regular use or minor scratches, fully operational.',
  },
  {
    label: 'Fair',
    desc: 'Significant aesthetic wear, fully functional, priced accordingly.',
  },
];

export default function SellWizardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Require auth to access Sell Wizard
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Please log in or create an account to list an item on ReCircle.');
      router.push('/login?redirect=/sell');
    }
  }, [user, authLoading, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  // Step 2: Uploaded GridFS Images
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);

  // Step 3: Pricing & Condition
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('Like New');
  const [conditionNotes, setConditionNotes] = useState('');

  // Step 4: Purchase Information
  const [purchaseYear, setPurchaseYear] = useState('2023');
  const [hasReceipt, setHasReceipt] = useState(true);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [hasOriginalBox, setHasOriginalBox] = useState(true);

  // Step 5: Location & Delivery
  const [city, setCity] = useState('Bangalore');
  const [neighborhood, setNeighborhood] = useState('Indiranagar');
  const [pickup, setPickup] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [shipping, setShipping] = useState(true);

  // Draft Preservation via localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recircle_sell_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.description) setDescription(draft.description);
        if (draft.category) setCategory(draft.category);
        if (draft.brand) setBrand(draft.brand);
        if (draft.model) setModel(draft.model);
        if (draft.price) setPrice(draft.price);
        if (draft.originalPrice) setOriginalPrice(draft.originalPrice);
        if (draft.condition) setCondition(draft.condition);
        if (draft.uploadedImages && draft.uploadedImages.length > 0) {
          setUploadedImages(draft.uploadedImages);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(
        'recircle_sell_draft',
        JSON.stringify({
          title,
          description,
          category,
          brand,
          model,
          price,
          originalPrice,
          condition,
          uploadedImages,
        })
      );
    } catch {
      // ignore
    }
  };

  // Upload handler via backend GridFS endpoint
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 8) {
      toast.error('Maximum 8 photos allowed per product');
      return;
    }

    setIsUploadingImages(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    formData.append('sellerId', user?._id || 'seller-recircle-user');

    try {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.images) {
        const newImages: ProductImage[] = data.images.map((img: ProductImage, idx: number) => ({
          ...img,
          isPrimary: uploadedImages.length === 0 && idx === 0,
          position: uploadedImages.length + idx,
        }));

        setUploadedImages((prev) => {
          const updated = [...prev, ...newImages];
          // Ensure first image is marked primary if none is
          if (!updated.some((im) => im.isPrimary) && updated.length > 0) {
            updated[0].isPrimary = true;
          }
          return updated;
        });

        toast.success(`Successfully uploaded ${data.images.length} photo(s) to MongoDB GridFS!`);
      } else {
        toast.error(data.error || 'Failed to upload photos');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Network error during photo upload');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimary = (index: number) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
    toast.success('Updated primary listing photo');
  };

  const handleDeleteImage = async (fileId: string, index: number) => {
    try {
      await fetch(`/api/images/${fileId}`, { method: 'DELETE' });
      setUploadedImages((prev) => {
        const remaining = prev.filter((_, i) => i !== index);
        if (remaining.length > 0 && !remaining.some((im) => im.isPrimary)) {
          remaining[0].isPrimary = true;
        }
        return remaining;
      });
      toast.info('Removed photo from listing');
    } catch {
      toast.error('Failed to remove photo');
    }
  };

  // Step Navigation Validation
  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 5) {
        toast.error('Please enter a descriptive product title (at least 5 characters)');
        return false;
      }
      if (!description.trim() || description.trim().length < 15) {
        toast.error('Please provide a helpful item description (at least 15 characters)');
        return false;
      }
      if (!brand.trim()) {
        toast.error('Please specify the brand or maker');
        return false;
      }
    } else if (currentStep === 2) {
      if (uploadedImages.length === 0) {
        toast.error('Please upload at least 1 photo of your item stored in MongoDB GridFS');
        return false;
      }
    } else if (currentStep === 3) {
      if (!price || parseFloat(price) <= 0) {
        toast.error('Please enter a valid selling price');
        return false;
      }
    } else if (currentStep === 5) {
      if (!city.trim()) {
        toast.error('Please specify the pickup city');
        return false;
      }
      if (!pickup && !delivery && !shipping) {
        toast.error('Please select at least one handover option');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      saveDraft();
      setCurrentStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Publish Listing
  const handlePublishListing = async () => {
    setIsPublishing(true);
    try {
      const payload = {
        title,
        description,
        category,
        subcategory,
        brand,
        model,
        condition,
        conditionNotes,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        purchaseYear: purchaseYear ? parseInt(purchaseYear, 10) : undefined,
        hasReceipt,
        hasWarranty,
        hasOriginalBox,
        location: {
          city,
          neighborhood,
        },
        deliveryOptions: {
          pickup,
          delivery,
          shipping,
        },
        images: uploadedImages,
        seller: {
          id: user?._id || 'seller-recircle-user',
          name: user?.username || 'ReCircle Seller',
          email: user?.email || 'member@recircle.org',
          phone: user?.phone || '',
          avatarUrl: user?.avatarUrl,
          verified: Boolean(user?.verified ?? true),
          rating: user?.rating || 5.0,
          reviewsCount: user?.reviewsCount || 0,
          memberSince: user?.memberSince || '2024',
        },
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.product) {
        localStorage.removeItem('recircle_sell_draft');
        toast.success('Your listing is live on ReCircle!');
        router.push(`/products/${data.product._id}`);
      } else {
        toast.error(data.error || 'Failed to publish listing');
      }
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('Error connecting to database');
    } finally {
      setIsPublishing(false);
    }
  };

  const primaryImage = uploadedImages.find((img) => img.isPrimary) || uploadedImages[0];

  return (
    <div className="min-h-screen bg-warm-100 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span>Circular Economy Listing Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-forest tracking-tight">
            List a Pre-Loved Item
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-lg mx-auto">
            Give your quality items a new home. Fast, secure, and powered by MongoDB GridFS storage.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs mb-8">
          <div className="grid grid-cols-6 gap-2">
            {STEPS.map((step) => {
              const isPassed = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-mint text-forest-dark'
                        : isCurrent
                        ? 'bg-forest text-white ring-4 ring-brand-100 scale-105'
                        : 'bg-warm-200 text-charcoal-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-forest' : 'text-charcoal-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-card">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-forest">Step 1: Basic Product Information</h2>
                <p className="text-xs text-charcoal-500">Provide an accurate title, category, and brand name.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apple MacBook Pro 14 M2 Pro (16GB, 512GB) Space Gray"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-[10px] text-charcoal-400 mt-1 block">
                  Include key specs like brand, model, size, or color for maximum discoverability.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Primary Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Laptops, Office Chairs, Outerwear"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Brand / Manufacturer <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple, Sony, Herman Miller, Trek"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Model Number or Edition
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. WH-1000XM5, Aeron Size B"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Full Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe its condition, usage history, what accessories are included, reason for selling..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Upload Product Images (MongoDB GridFS) */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-forest">Step 2: Upload Product Images</h2>
                <p className="text-xs text-charcoal-500">
                  Photos are compressed and stored directly into MongoDB GridFS. Select your primary image with the star icon.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-300 rounded-3xl p-8 text-center cursor-pointer hover:bg-brand-50/40 hover:border-brand-500 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesSelected}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7 text-forest" />
                </div>
                <h3 className="text-sm font-bold text-forest mb-1">
                  {isUploadingImages ? 'Processing and uploading to GridFS...' : 'Click or Drag Photos Here'}
                </h3>
                <p className="text-xs text-charcoal-400">
                  Supports JPEG, PNG, WebP up to 10MB each. Max 8 photos.
                </p>
                {isUploadingImages && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-brand-700 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-mint" />
                    <span>Resizing & storing binaries in MongoDB GridFS...</span>
                  </div>
                )}
              </div>

              {/* Uploaded Gallery Thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-charcoal-500 font-semibold">
                    <span>Uploaded Photos ({uploadedImages.length} / 8)</span>
                    <span className="text-[11px] text-brand-700">Star = Primary Photo</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={img.fileId || idx}
                        className={`relative rounded-2xl overflow-hidden border-2 shadow-xs group ${
                          img.isPrimary ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200'
                        }`}
                      >
                        <div className="relative w-full pt-[75%] bg-warm-200">
                          <Image
                            src={img.url}
                            alt={img.filename}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Star Primary Button */}
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          title="Set as primary image"
                          className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md shadow-xs transition-all ${
                            img.isPrimary
                              ? 'bg-amber-400 text-white'
                              : 'bg-white/80 text-charcoal-400 hover:text-amber-500'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-white' : ''}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.fileId, idx)}
                          title="Delete image from GridFS"
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-charcoal-400 hover:text-rose-600 hover:bg-white backdrop-blur-md shadow-xs transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Primary Label */}
                        {img.isPrimary && (
                          <div className="absolute bottom-0 inset-x-0 bg-brand-700/90 text-white text-[10px] font-bold text-center py-0.5">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Pricing & Condition */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-forest">Step 3: Pricing & Condition</h2>
                <p className="text-xs text-charcoal-500">
                  Set a fair price and grade the cosmetic and functional condition honestly.
                </p>
              </div>

              {/* Price inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Your Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 2999"
                      min="1"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Original Retail Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 4999"
                      min="1"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <span className="text-[10px] text-charcoal-400 mt-1 block">
                    Helps show buyers how much they save by shopping circular.
                  </span>
                </div>
              </div>

              {/* Condition Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-charcoal-700">
                  Select Item Condition <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONDITIONS.map((c) => {
                    const isSelected = condition === c.label;
                    return (
                      <div
                        key={c.label}
                        onClick={() => setCondition(c.label)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-forest">{c.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-mint" />}
                        </div>
                        <p className="text-[11px] text-charcoal-500 leading-snug">{c.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Condition Notes (Any micro-scratches, repairs, or battery health)
                </label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="e.g. Battery health at 96%, always kept in a protective sleeve"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Purchase Information & Proof */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-forest">Step 4: Purchase History & Proof</h2>
                <p className="text-xs text-charcoal-500">
                  Items with receipts and warranties sell 3x faster on ReCircle.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Original Purchase Year
                </label>
                <select
                  value={purchaseYear}
                  onChange={(e) => setPurchaseYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                >
                  {['2024', '2023', '2022', '2021', '2020', 'Earlier / Vintage'].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReceipt}
                    onChange={(e) => setHasReceipt(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Original Invoice / Receipt Available</div>
                    <div className="text-[11px] text-charcoal-400">Digital PDF or physical receipt proof</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWarranty}
                    onChange={(e) => setHasWarranty(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Active Manufacturer Warranty</div>
                    <div className="text-[11px] text-charcoal-400">Transferable warranty still active</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOriginalBox}
                    onChange={(e) => setHasOriginalBox(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Original Packaging & Box Included</div>
                    <div className="text-[11px] text-charcoal-400">With original inserts, manuals or foam</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Location & Handover Options */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-forest">Step 5: Handover & Location</h2>
                <p className="text-xs text-charcoal-500">
                  Select how buyers can receive your item safely.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Neighborhood / Area
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Indiranagar, Bandra West"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-charcoal-700">
                  Handover Methods (Select all that apply)
                </label>

                <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickup}
                    onChange={(e) => setPickup(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Direct In-Person Pickup</div>
                    <div className="text-[11px] text-charcoal-400">Buyer meets you at your designated safe spot</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={(e) => setDelivery(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Citywide Courier / Same-day Delivery</div>
                    <div className="text-[11px] text-charcoal-400">Via Dunzo / Porter / local bike delivery</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shipping}
                    onChange={(e) => setShipping(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Domestic Parcel Shipping</div>
                    <div className="text-[11px] text-charcoal-400">Tracked and insured delivery anywhere in country</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Live High-Fidelity Preview & Publish */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-forest">Step 6: Live Preview & Publish</h2>
                    <p className="text-xs text-charcoal-500">
                      This is exactly how buyers will see your listing on ReCircle.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-mint text-forest-dark font-extrabold text-xs">
                    Ready to Publish
                  </span>
                </div>
              </div>

              {/* Render High-Fidelity Preview Card */}
              <div className="border border-gray-200 rounded-3xl p-6 bg-warm-100 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-5 relative w-full pt-[75%] rounded-2xl overflow-hidden bg-white shadow-xs">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-charcoal-400">
                        No Photo
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-forest text-white text-[10px] font-bold">
                      {condition}
                    </span>
                  </div>

                  <div className="sm:col-span-7 space-y-2">
                    <div className="text-[11px] text-charcoal-400 uppercase font-semibold">
                      {category} • {brand}
                    </div>
                    <h3 className="text-lg font-extrabold text-charcoal-900 leading-snug">
                      {title}
                    </h3>
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-2xl font-extrabold text-forest">
                        ₹{price ? Number(price).toLocaleString() : '0'}
                      </span>
                      {originalPrice && parseFloat(originalPrice) > parseFloat(price) && (
                        <span className="text-xs text-charcoal-400 line-through">
                          ₹{Number(originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-charcoal-500">
                      <MapPin className="w-3.5 h-3.5 text-mint" />
                      <span>{city}</span>
                      <span>•</span>
                      <span>Seller: {user?.username || 'You'} ({user?.rating || 5.0} ★)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 text-xs text-charcoal-700">
                  <div className="font-bold text-forest mb-1">Description:</div>
                  <p className="line-clamp-3 leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-charcoal-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light shadow-xs transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-mint" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishListing}
                disabled={isPublishing}
                className="flex items-center space-x-2 px-8 py-3 rounded-full bg-gradient-to-r from-forest to-forest-light text-white text-sm font-extrabold shadow-card hover:shadow-card-hover disabled:opacity-50 transition-all"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-mint" />
                    <span>Publishing to Marketplace...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-mint stroke-[3]" />
                    <span>Publish Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
