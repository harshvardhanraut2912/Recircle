'use client';

import { uploadImages } from '@/lib/upload-client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ShoppingBag,
  Heart,
  Settings,
  Sparkles,
  TrendingUp,
  Eye,
  DollarSign,
  PlusCircle,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  Check,
  Camera,
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { Product, PurchaseRequest, DashboardStats } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, updateUser } = useAuth();
  const activeTab = searchParams?.get('tab') || 'overview';

  const avatarUploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const handleDashboardAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be under 5MB.');
      return;
    }

    setUpdatingAvatar(true);
    const toastId = toast.loading('Uploading profile photo...');
    try {
      const uploadData = await uploadImages([file], 'avatar');

      if (uploadData.success && uploadData.images?.[0]?.url) {
        const newUrl = uploadData.images[0].url;

        const patchRes = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: newUrl }),
        });

        if (patchRes.ok) {
          updateUser({ avatarUrl: newUrl });
          toast.success('Profile photo updated!', { id: toastId });
        } else {
          toast.error('Failed to save profile photo', { id: toastId });
        }
      } else {
        toast.error('Failed to upload image file', { id: toastId });
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
      toast.error('Network error updating photo', { id: toastId });
    } finally {
      setUpdatingAvatar(false);
      if (avatarUploadInputRef.current) {
        avatarUploadInputRef.current.value = '';
      }
    }
  };

  // Require auth to view dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Please log in or create an account to view your dashboard.');
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    totalViews: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    itemsSold: 0,
  });

  // Data lists
  const [myListings, setMyListings] = useState<Product[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filter for Requests Tab
  const [requestFilter, setRequestFilter] = useState<'all' | 'new' | 'accepted' | 'rejected' | 'completed'>('all');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const sellerId = user?._id;
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`/api/stats?sellerId=${sellerId}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 2. Fetch User Listings
      const listingsRes = await fetch(`/api/products?sellerId=${sellerId}&status=all`);
      const listingsData = await listingsRes.json();
      if (listingsData.success) {
        setMyListings(listingsData.products || []);
      }

      // 3. Fetch Inquiries / Requests
      const reqRes = await fetch(`/api/requests?sellerId=${sellerId}`);
      const reqData = await reqRes.json();
      if (reqData.success) {
        setRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Error fetching dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Request Action Handler (Accept, Reject, Mark Completed)
  const handleUpdateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status } : r))
        );
        toast.success(`Request marked as ${status}`);
        fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to update request');
      }
    } catch {
      toast.error('Network error updating request');
    }
  };

  // Delete Request / Enquiry Handler
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this purchase enquiry?')) {
      return;
    }
    try {
      const res = await fetch(`/api/requests?id=${requestId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
        toast.success('Purchase enquiry deleted');
        fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to delete purchase enquiry');
      }
    } catch {
      toast.error('Network error deleting purchase enquiry');
    }
  };

  // Delete Listing Handler
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this listing? All its photos will be removed too.')) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMyListings((prev) => prev.filter((p) => p._id !== productId));
        toast.success('Listing and its images deleted');
        fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to delete listing');
      }
    } catch {
      toast.error('Error deleting listing');
    }
  };

  // Mark Product as Sold
  const handleMarkAsSold = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' }),
      });
      const data = await res.json();
      if (data.success) {
        setMyListings((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, status: 'sold' } : p))
        );
        toast.success('Listing marked as Sold! Great job rehoming an item.');
        fetchDashboardData();
      }
    } catch {
      toast.error('Error updating status');
    }
  };

  const filteredRequests = requestFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === requestFilter);

  return (
    <div className="min-h-screen bg-warm-100 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                Seller Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-forest-dark text-xs font-bold border border-brand-200">
                Verified Community
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Manage your circular marketplace listings, incoming buyer offers, and circular earnings.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-forest text-white font-semibold text-xs shadow-card hover:bg-forest-light hover:shadow-card-hover transition-all w-fit"
          >
            <PlusCircle className="w-4 h-4 text-mint" />
            <span>List Another Item</span>
          </Link>
        </div>

        {/* Dashboard SaaS Layout: Sidebar + Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="bg-white rounded-3xl p-3 border border-gray-200/80 shadow-xs space-y-1">
              <Link
                href="/dashboard?tab=overview"
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-charcoal-600 hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview & Analytics</span>
              </Link>

              <Link
                href="/dashboard?tab=listings"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                  activeTab === 'listings'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-charcoal-600 hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4" />
                  <span>My Listings</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'listings' ? 'bg-mint text-forest-dark' : 'bg-warm-200 text-charcoal-600'
                  }`}
                >
                  {myListings.length}
                </span>
              </Link>

              <Link
                href="/dashboard?tab=inquiries"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                  activeTab === 'inquiries'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-charcoal-600 hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Purchase Inquiries</span>
                </div>
                {requests.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTab === 'inquiries' ? 'bg-mint text-forest-dark' : 'bg-mint/20 text-forest-dark'
                    }`}
                  >
                    {requests.length}
                  </span>
                )}
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-brand-50 hover:text-brand-800 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist</span>
              </Link>

              <Link
                href="/dashboard?tab=settings"
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-charcoal-600 hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Profile & Settings</span>
              </Link>
            </nav>

            {/* Quick Profile Summary Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs mt-4">
              <div className="flex items-center space-x-3">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => avatarUploadInputRef.current?.click()}
                  title="Click to upload/change profile photo"
                >
                  <UserAvatar
                    src={user?.avatarUrl}
                    alt={user?.username || 'You'}
                    size="md"
                    className="border border-brand-200"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  {updatingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-forest/70 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-mint animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={avatarUploadInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleDashboardAvatarUpload}
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-charcoal-900 truncate">{user?.username || 'You'}</div>
                  <div className="text-[11px] text-brand-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                    <span>Verified Seller</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-charcoal-500 space-y-1">
                <div className="flex justify-between">
                  <span>Rating:</span>
                  <strong className="text-amber-500">★ {user?.rating || '5.0'} ({user?.reviewsCount || 0} reviews)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <strong>{user?.city || 'Bangalore, IN'}</strong>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-8">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* 4 Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-forest mb-3">
                      <Package className="w-4 h-4 text-forest" />
                    </div>
                    <div className="text-2xl font-extrabold text-forest tracking-tight">
                      {stats.activeListings}
                    </div>
                    <div className="text-xs text-charcoal-400 font-medium mt-0.5">
                      Active Listings
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-forest mb-3">
                      <Eye className="w-4 h-4 text-forest" />
                    </div>
                    <div className="text-2xl font-extrabold text-forest tracking-tight">
                      {stats.totalViews}
                    </div>
                    <div className="text-xs text-charcoal-400 font-medium mt-0.5">
                      Total Views
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-forest mb-3">
                      <MessageSquare className="w-4 h-4 text-forest" />
                    </div>
                    <div className="text-2xl font-extrabold text-forest tracking-tight">
                      {stats.pendingRequests}
                    </div>
                    <div className="text-xs text-charcoal-400 font-medium mt-0.5">
                      Pending Inquiries
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-forest mb-3">
                      <DollarSign className="w-4 h-4 text-forest" />
                    </div>
                    <div className="text-2xl font-extrabold text-brand-700 tracking-tight">
                      ₹{stats.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-charcoal-400 font-medium mt-0.5">
                      Rehomed Value
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries Quick Look */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h2 className="text-base font-bold text-forest">Recent Purchase Requests</h2>
                    <Link
                      href="/dashboard?tab=inquiries"
                      className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      View All ({requests.length})
                    </Link>
                  </div>

                  {requests.length === 0 ? (
                    <div className="py-8 text-center">
                      <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-charcoal-500">No buyer inquiries yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.slice(0, 3).map((req) => (
                        <div
                          key={req._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-warm-100 border border-gray-100 gap-3"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl relative overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={req.productImage}
                                alt={req.productTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-charcoal-900 line-clamp-1">
                                {req.productTitle}
                              </div>
                              <div className="text-[11px] text-charcoal-500">
                                Offer from <strong>{req.buyerName}</strong>: <span className="font-bold text-forest">₹{req.offeredPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                              req.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : req.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MY LISTINGS */}
            {activeTab === 'listings' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-forest">
                    My Listings ({myListings.length})
                  </h2>
                  <Link
                    href="/sell"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-mint" />
                    <span>Add New Listing</span>
                  </Link>
                </div>

                {myListings.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-forest mb-1">You haven&apos;t listed any items yet</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-5">
                      Ready to declutter and participate in circular commerce? List your first pre-loved item in minutes.
                    </p>
                    <Link
                      href="/sell"
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light"
                    >
                      <PlusCircle className="w-4 h-4 text-mint" />
                      <span>Start Listing Wizard</span>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {myListings.map((product) => (
                        <div
                          key={product._id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-100/60 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl relative overflow-hidden shrink-0 border border-gray-200 bg-warm-200">
                              <Image
                                src={product.primaryImageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                  {product.category}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    product.status === 'sold'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {product.status.toUpperCase()}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-charcoal-900 line-clamp-1 mt-1">
                                {product.title}
                              </h3>
                              <div className="flex items-center space-x-3 text-xs text-charcoal-500 mt-0.5">
                                <span className="font-extrabold text-forest">₹{product.price.toLocaleString()}</span>
                                <span>•</span>
                                <span>{product.views || 0} views</span>
                                <span>•</span>
                                <span>{product.condition}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <Link
                              href={`/products/${product._id}`}
                              className="p-2 rounded-xl border border-gray-200 text-charcoal-600 hover:bg-gray-100 hover:text-forest"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {product.status !== 'sold' && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsSold(product._id)}
                                className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                              >
                                Mark Sold
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                              title="Delete listing and images"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INQUIRIES & INBOX */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-forest">Purchase Inquiries & Offers</h2>
                    <p className="text-xs text-charcoal-500">
                      Manage buyer requests, negotiate offers, and arrange secure circular handovers.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex space-x-1.5 bg-white p-1 rounded-2xl border border-gray-200 text-xs font-semibold">
                    {(['all', 'new', 'accepted', 'completed', 'rejected'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRequestFilter(st)}
                        className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                          requestFilter === st
                            ? 'bg-forest text-white'
                            : 'text-charcoal-600 hover:bg-gray-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-forest mb-1">No inquiries in this tab</h3>
                    <p className="text-xs text-charcoal-500">
                      When buyers send purchase requests or make offers, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4"
                      >
                        {/* Request Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                          <div className="flex items-center space-x-3">
                            <UserAvatar
                              src={req.buyerAvatar}
                              alt={req.buyerName}
                              size="sm"
                              className="border border-brand-200"
                            />
                            <div>
                              <div className="text-xs font-bold text-charcoal-900">{req.buyerName}</div>
                              <div className="text-[11px] text-charcoal-400">{req.buyerEmail}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] text-charcoal-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                req.status === 'new'
                                  ? 'bg-amber-100 text-amber-800'
                                  : req.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {/* Product and Offer Info */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-warm-100 border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl relative overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={req.productImage}
                                alt={req.productTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-charcoal-900 line-clamp-1">
                                {req.productTitle}
                              </div>
                              <div className="text-[11px] text-charcoal-500">
                                Listing Price: ₹{req.productPrice.toLocaleString()} • Handover: {req.deliveryType}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-charcoal-400">Offered Price</div>
                            <div className="text-lg font-extrabold text-forest">
                              ₹{req.offeredPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Buyer Message */}
                        <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs text-charcoal-700">
                          <div className="font-bold text-forest mb-1">Buyer Message:</div>
                          <p>{req.message}</p>
                        </div>

                        {/* Actions based on current status */}
                        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(req._id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-charcoal-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs transition-colors"
                            title="Delete this purchase enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Enquiry</span>
                          </button>

                          <div className="flex items-center space-x-3">
                            {req.status === 'new' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRequestStatus(req._id, 'rejected')}
                                  className="px-4 py-2 rounded-full border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                                >
                                  Decline Offer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRequestStatus(req._id, 'accepted')}
                                  className="px-5 py-2 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light shadow-xs"
                                >
                                  Accept Offer
                                </button>
                              </>
                            )}

                            {req.status === 'accepted' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateRequestStatus(req._id, 'completed')}
                                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark Transaction Completed</span>
                              </button>
                            )}

                            {req.status === 'completed' && (
                              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-mint" />
                                <span>Transaction successfully concluded!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-forest">Seller Profile & Preferences</h2>
                  <p className="text-xs text-charcoal-500">
                    Your verified profile builds confidence with buyers across ReCircle.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Aarav Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="aarav.sharma@recircle.org"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Primary City
                    </label>
                    <input
                      type="text"
                      defaultValue="Bangalore"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Phone Number (For pickup notifications)
                    </label>
                    <input
                      type="text"
                      defaultValue="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toast.success('Profile settings updated')}
                    className="px-6 py-2.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-100 flex items-center justify-center text-xs text-charcoal-500">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
