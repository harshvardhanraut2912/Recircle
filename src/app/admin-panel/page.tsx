'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  Package,
  ShoppingCart,
  ShieldCheck,
  TrendingUp,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  X,
  Save,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Layers,
  Lock,
  KeyRound,
  ShieldAlert,
  LogOut,
  Flame,
} from 'lucide-react';
import { Product, PurchaseRequest, ProductCategory, ProductCondition } from '@/types';
import UserAvatar from '@/components/ui/UserAvatar';
import { toast } from 'sonner';

interface AdminUser {
  _id: string;
  username: string;
  phone: string;
  email: string;
  avatarUrl?: string | null;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  city: string;
  memberSince: string;
  createdAt: string;
  listingsCount: number;
  activeCount: number;
  inquiriesReceived: number;
  ordersPlaced: number;
  totalListedValue: number;
}

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  totalRequests: number;
  acceptedRequests: number;
  completedOrders: number;
  totalCatalogValue: number;
}

const CATEGORIES: ProductCategory[] = [
  'Electronics',
  'Furniture',
  'Fashion',
  'Bicycles & Mobility',
  'Books & Media',
  'Sports & Outdoors',
  'Collectibles & Art',
  'Appliances',
];

const CONDITIONS: ProductCondition[] = [
  'Brand New',
  'Like New',
  'Very Good',
  'Good',
  'Fair',
];

// =====================================================================
// 1. SECURE ADMIN LOGIN WALL (Blocks access until authenticated)
// =====================================================================
function AdminLoginWall({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both admin email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Admin authentication verified! Welcome.');
        onAuthenticated();
      } else {
        setErrorMsg(data.error || 'Invalid admin credentials. Access denied.');
        toast.error('Access Denied');
      }
    } catch {
      setErrorMsg('Network error connecting to security gateway');
      toast.error('Network authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.15),transparent_60%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-mint mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50 mb-3">
              <ShieldAlert className="w-7 h-7 text-mint" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ReCircle Superadmin Portal
            </h2>
            <p className="text-xs text-emerald-200/60 mt-1.5 max-w-xs mx-auto">
              This area is strictly restricted to authorized platform administrators. Access is validated server-side.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-emerald-200/80 mb-1.5">
                Admin Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@recircle.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-200/80 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Unlock Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-emerald-400/80 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 2. ACTUAL ADMIN DASHBOARD (Only loaded after authentication)
// =====================================================================
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  // Stats
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalRequests: 0,
    acceptedRequests: 0,
    completedOrders: 0,
    totalCatalogValue: 0,
  });

  // Data lists
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Users Accordion state
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [userSearch, setUserSearch] = useState('');

  // Items search & filters
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('All');
  const [itemStatusFilter, setItemStatusFilter] = useState('all');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Electronics',
    condition: 'Like New',
    price: '',
    originalPrice: '',
    status: 'active',
    city: '',
    description: '',
  });

  // Purchase Requests Filter
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearch, setRequestSearch] = useState('');

  // Red Wipe Entire DB Modal State
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [wipingDb, setWipingDb] = useState(false);

  const setTab = (tabName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabName);
    router.push(`/admin-panel?${params.toString()}`);
  };

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statsRes, usersRes, prodsRes, reqRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/products?status=all&limit=100'),
        fetch('/api/requests'),
      ]);

      const [statsData, usersData, prodsData, reqData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        prodsRes.json(),
        reqRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setUsers(usersData.users || []);
      if (prodsData.success) setProducts(prodsData.products || []);
      if (reqData.success) setRequests(reqData.requests || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Toggle User Accordion
  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Toggle User Verified Badge
  const handleToggleVerifyUser = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verified: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, verified: !currentStatus } : u))
        );
        toast.success(`User verification status updated!`);
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch {
      toast.error('Network error updating user');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        toast.success(`User "${username}" deleted`);
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Network error deleting user');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${productTitle}"? This will clean up its MongoDB GridFS images.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        toast.success(`Product "${productTitle}" deleted from marketplace & GridFS`);
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch {
      toast.error('Network error deleting product');
    }
  };

  // Open Edit Modal for a Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditFormData({
      title: prod.title || '',
      category: prod.category || 'Electronics',
      condition: prod.condition || 'Like New',
      price: prod.price?.toString() || '0',
      originalPrice: prod.originalPrice?.toString() || '',
      status: prod.status || 'active',
      city: prod.location?.city || 'Bangalore',
      description: prod.description || '',
    });
  };

  // Save Product Edit Admin Sided
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSavingEdit(true);
    try {
      const payload = {
        title: editFormData.title.trim(),
        category: editFormData.category,
        condition: editFormData.condition,
        price: parseFloat(editFormData.price) || 0,
        originalPrice: editFormData.originalPrice ? parseFloat(editFormData.originalPrice) : undefined,
        status: editFormData.status,
        description: editFormData.description.trim(),
        location: {
          ...editingProduct.location,
          city: editFormData.city.trim() || 'Bangalore',
        },
      };

      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, ...data.product } : p))
        );
        toast.success(`Product "${editFormData.title}" updated successfully!`);
        setEditingProduct(null);
      } else {
        toast.error(data.error || 'Failed to save product edits');
      }
    } catch {
      toast.error('Network error updating product');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Purchase Enquiry / Request
  const handleDeleteRequest = async (requestId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete the enquiry for "${productTitle}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/requests?id=${requestId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
        toast.success('Purchase enquiry deleted');
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to delete purchase enquiry');
      }
    } catch {
      toast.error('Network error deleting purchase enquiry');
    }
  };

  // Update Request Status Admin Sided
  const handleUpdateRequestStatus = async (
    requestId: string,
    status: 'new' | 'accepted' | 'rejected' | 'completed'
  ) => {
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
        toast.success(`Request status updated to ${status}`);
        fetchAllData();
      } else {
        toast.error(data.error || 'Failed to update request');
      }
    } catch {
      toast.error('Network error updating request');
    }
  };

  // Red Option: Wipe Entire DB
  const handleExecuteWipeDb = async () => {
    if (wipeConfirmText !== 'DELETE ALL DATA') {
      toast.error('Please type exactly "DELETE ALL DATA" to proceed.');
      return;
    }

    setWipingDb(true);
    try {
      const res = await fetch('/api/admin/wipe-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE ALL DATA' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('CRITICAL: Entire database and GridFS files have been wiped out!');
        setIsWipeModalOpen(false);
        setWipeConfirmText('');
        // Reset local states to empty
        setUsers([]);
        setProducts([]);
        setRequests([]);
        setStats({
          totalUsers: 0,
          totalProducts: 0,
          activeProducts: 0,
          soldProducts: 0,
          totalRequests: 0,
          acceptedRequests: 0,
          completedOrders: 0,
          totalCatalogValue: 0,
        });
      } else {
        toast.error(data.error || 'Failed to wipe database');
      }
    } catch {
      toast.error('Network error executing database wipe');
    } finally {
      setWipingDb(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.city.toLowerCase().includes(term)
    );
  });

  const filteredProducts = products.filter((p) => {
    const term = itemSearch.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.seller?.name?.toLowerCase().includes(term);

    const matchCategory =
      itemCategoryFilter === 'All' || p.category.toLowerCase() === itemCategoryFilter.toLowerCase();
    const matchStatus = itemStatusFilter === 'all' || p.status === itemStatusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const filteredRequests = requests.filter((r) => {
    const matchStatus =
      requestStatusFilter === 'all' || r.status === requestStatusFilter;
    const term = requestSearch.toLowerCase();
    const matchSearch =
      r.productTitle.toLowerCase().includes(term) ||
      r.buyerName.toLowerCase().includes(term) ||
      r.buyerEmail?.toLowerCase().includes(term);

    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-warm-100 pb-20">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-forest text-white border-b border-emerald-950 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-forest-light hover:bg-forest-light/80 transition-colors flex items-center justify-center text-mint"
              title="Return to Marketplace"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight">ReCircle Admin Panel</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-mint text-forest-dark">
                  Superadmin Authenticated
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Logged in as harshvardhanraut2912@gmail.com
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* RED OPTION: Wipe Entire DB Button */}
            <button
              type="button"
              onClick={() => setIsWipeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm border border-rose-400/40"
              title="Delete Entire Database (Dangerous)"
            >
              <Flame className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
              <span>Wipe Entire DB</span>
            </button>

            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-xl bg-forest-light/90 hover:bg-forest-light text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-rose-200 hover:text-white transition-colors flex items-center space-x-1"
              title="Lock Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock / Logout</span>
            </button>
          </div>
        </div>

        {/* Global Platform Metric Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 border-t border-emerald-900/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200">Registered Users</div>
              <div className="text-xl sm:text-2xl font-black mt-1 flex items-center justify-between">
                <span>{stats.totalUsers}</span>
                <Users className="w-5 h-5 text-mint/80" />
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200">Total Products</div>
              <div className="text-xl sm:text-2xl font-black mt-1 flex items-center justify-between">
                <span>{stats.totalProducts}</span>
                <Package className="w-5 h-5 text-mint/80" />
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">
                {stats.activeProducts} active • {stats.soldProducts} sold
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200">Purchase Inquiries</div>
              <div className="text-xl sm:text-2xl font-black mt-1 flex items-center justify-between">
                <span>{stats.totalRequests}</span>
                <ShoppingCart className="w-5 h-5 text-mint/80" />
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">
                {stats.completedOrders} completed transactions
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-emerald-200">Catalog Volume (₹)</div>
              <div className="text-xl sm:text-2xl font-black mt-1 text-mint">
                ₹{stats.totalCatalogValue.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">Total listed value</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTab('users')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center space-x-2 shrink-0 ${
              activeTab === 'users'
                ? 'border-mint text-mint bg-white/5'
                : 'border-transparent text-emerald-100/70 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Section ({users.length})</span>
          </button>

          <button
            onClick={() => setTab('items')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center space-x-2 shrink-0 ${
              activeTab === 'items'
                ? 'border-mint text-mint bg-white/5'
                : 'border-transparent text-emerald-100/70 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Items & Products ({products.length})</span>
          </button>

          <button
            onClick={() => setTab('orders')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center space-x-2 shrink-0 ${
              activeTab === 'orders'
                ? 'border-mint text-mint bg-white/5'
                : 'border-transparent text-emerald-100/70 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders ({requests.length})</span>
          </button>
        </div>
      </header>

      {/* Main Admin Section Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-200">
            <RefreshCw className="w-8 h-8 text-mint animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-charcoal-700">Loading admin data...</p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 1. USERS SECTION (Accordion: Name only, full details inside) */}
            {/* ========================================================= */}
            {activeTab === 'users' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h3 className="font-extrabold text-base text-charcoal-900">Registered Community Users</h3>
                    <p className="text-xs text-charcoal-500">
                      Click any user card to reveal their full profile, contact info, ratings, and marketplace stats.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by name, phone, email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                    <Users className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-charcoal-800">No users found</h4>
                    <p className="text-xs text-charcoal-500 mt-1">Try refining your search keyword.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => {
                      const isExpanded = Boolean(expandedUsers[u._id]);

                      return (
                        <div
                          key={u._id}
                          className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all duration-200 hover:border-emerald-300"
                        >
                          {/* Closed Accordion Header: Just the User Name & Quick Badges */}
                          <div
                            onClick={() => toggleUserExpand(u._id)}
                            className="p-4 cursor-pointer flex items-center justify-between hover:bg-emerald-50/20 transition-colors select-none"
                          >
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <UserAvatar src={u.avatarUrl} alt={u.username} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sm text-charcoal-900 truncate">
                                    {u.username}
                                  </span>
                                  {u.verified && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                      <ShieldCheck className="w-3 h-3 text-mint" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-charcoal-400 mt-0.5">
                                  {u.listingsCount} {u.listingsCount === 1 ? 'listing' : 'listings'} • Member since {u.memberSince}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-semibold text-charcoal-500 hidden sm:block">
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </span>
                              <div
                                className={`w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-charcoal-600 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 bg-emerald-100 text-forest' : ''
                                }`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          {/* Expanded Dropdown Details Card */}
                          {isExpanded && (
                            <div className="p-5 bg-warm-100/60 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Contact & Account info */}
                                <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                                  <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-400">
                                    Contact & Identity
                                  </div>
                                  <div className="text-xs space-y-1.5">
                                    <div className="flex items-center space-x-2 text-charcoal-700">
                                      <Phone className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                                      <span className="font-semibold">{u.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-charcoal-700">
                                      <Mail className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                                      <span className="truncate">{u.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-charcoal-700">
                                      <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                                      <span>{u.city}</span>
                                    </div>
                                    <div className="pt-1 text-[11px] text-charcoal-400 font-mono">
                                      ID: {u._id}
                                    </div>
                                  </div>
                                </div>

                                {/* Marketplace Statistics */}
                                <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                                  <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-400">
                                    Marketplace Activity
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <div className="text-[10px] text-charcoal-400">Active Listings</div>
                                      <div className="font-extrabold text-charcoal-800 text-sm">{u.activeCount}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-charcoal-400">Total Items Listed</div>
                                      <div className="font-extrabold text-charcoal-800 text-sm">{u.listingsCount}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-charcoal-400">Inquiries Received</div>
                                      <div className="font-extrabold text-charcoal-800 text-sm">{u.inquiriesReceived}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-charcoal-400">Orders Placed</div>
                                      <div className="font-extrabold text-charcoal-800 text-sm">{u.ordersPlaced}</div>
                                    </div>
                                  </div>
                                  <div className="pt-1 border-t border-gray-100 flex justify-between text-xs font-semibold">
                                    <span className="text-charcoal-500">Inventory Value:</span>
                                    <span className="text-forest font-bold">₹{u.totalListedValue.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Community Trust & Actions */}
                                <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
                                  <div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-400 mb-1.5">
                                      Trust & Reputation
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <span className="text-amber-500 font-bold">★ {u.rating.toFixed(1)}</span>
                                      <span className="text-charcoal-400">({u.reviewsCount} reviews)</span>
                                    </div>
                                    <div className="text-[11px] text-charcoal-500 mt-1">
                                      Status: {u.verified ? 'Verified Member' : 'Standard Member'}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVerifyUser(u._id, u.verified)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex-1 flex items-center justify-center gap-1 ${
                                        u.verified
                                          ? 'bg-gray-100 text-charcoal-700 hover:bg-gray-200'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      }`}
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>{u.verified ? 'Revoke Badge' : 'Verify User'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u._id, u.username)}
                                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                      title="Delete user account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. ITEMS SECTION (Admin can delete or edit any product)   */}
            {/* ========================================================= */}
            {activeTab === 'items' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h3 className="font-extrabold text-base text-charcoal-900">Marketplace Products & Inventory</h3>
                    <p className="text-xs text-charcoal-500">
                      Admin-sided control to edit product details, adjust prices, or delete listings.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-60">
                      <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search title, seller..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20"
                      />
                    </div>

                    <select
                      value={itemCategoryFilter}
                      onChange={(e) => setItemCategoryFilter(e.target.value)}
                      className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <select
                      value={itemStatusFilter}
                      onChange={(e) => setItemStatusFilter(e.target.value)}
                      className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                    <Package className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-charcoal-800">No products match your filters</h4>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                            <th className="py-3 px-4">Item Details</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Price (₹)</th>
                            <th className="py-3 px-4">Seller</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-charcoal-700">
                          {filteredProducts.map((p) => {
                            const mainImg = p.images?.[0]?.url || p.primaryImageUrl || '/logo.jpg';

                            return (
                              <tr key={p._id} className="hover:bg-emerald-50/20 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-xl relative overflow-hidden shrink-0 border border-gray-200 bg-warm-100">
                                      <Image
                                        src={mainImg}
                                        alt={p.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 max-w-xs">
                                      <Link
                                        href={`/products/${p._id}`}
                                        target="_blank"
                                        className="font-bold text-charcoal-900 hover:text-forest transition-colors line-clamp-1 inline-flex items-center gap-1"
                                      >
                                        <span>{p.title}</span>
                                        <ArrowUpRight className="w-3 h-3 text-charcoal-400" />
                                      </Link>
                                      <div className="text-[11px] text-charcoal-400 mt-0.5">
                                        Condition: <span className="font-semibold text-charcoal-600">{p.condition}</span> • ID: {p._id.slice(-6)}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 font-medium text-charcoal-600">
                                  {p.category}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-extrabold text-forest text-sm">
                                    ₹{p.price.toLocaleString()}
                                  </div>
                                  {p.originalPrice && (
                                    <div className="text-[11px] text-charcoal-400 line-through">
                                      ₹{p.originalPrice.toLocaleString()}
                                    </div>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-charcoal-800">{p.seller?.name || 'ReCircle User'}</div>
                                  <div className="text-[11px] text-charcoal-400">{p.location?.city || 'Bangalore'}</div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      p.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : p.status === 'sold'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditProduct(p)}
                                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-charcoal-700 hover:text-forest hover:border-forest/40 hover:bg-emerald-50 text-xs font-bold transition-colors inline-flex items-center gap-1"
                                      title="Edit product data admin sided"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(p._id, p.title)}
                                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                      title="Delete product and remove from GridFS"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. PURCHASE ORDERS & REQUESTS SECTION                     */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
                  <div>
                    <h3 className="font-extrabold text-base text-charcoal-900">Purchase Orders & Inquiries</h3>
                    <p className="text-xs text-charcoal-500">
                      All purchase enquiries across the platform. You can change statuses or delete any enquiry.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search item or buyer..."
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20"
                      />
                    </div>

                    <select
                      value={requestStatusFilter}
                      onChange={(e) => setRequestStatusFilter(e.target.value)}
                      className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none font-semibold text-charcoal-700"
                    >
                      <option value="all">All Statuses ({requests.length})</option>
                      <option value="new">New / Pending</option>
                      <option value="accepted">Accepted Offers</option>
                      <option value="completed">Completed Sales</option>
                      <option value="rejected">Rejected Offers</option>
                    </select>
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                    <ShoppingCart className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-charcoal-800">No purchase requests found</h4>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRequests.map((req) => (
                      <div
                        key={req._id}
                        className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4 hover:border-emerald-300 transition-colors"
                      >
                        {/* Header: Buyer, Date, and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                          <div className="flex items-center space-x-3">
                            <UserAvatar src={req.buyerAvatar} alt={req.buyerName} size="sm" />
                            <div>
                              <div className="text-xs font-bold text-charcoal-900">
                                Buyer: {req.buyerName}
                              </div>
                              <div className="text-[11px] text-charcoal-400">
                                {req.buyerEmail} {req.buyerPhone ? `• ${req.buyerPhone}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] text-charcoal-400">
                              {new Date(req.createdAt).toLocaleString()}
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

                        {/* Middle: Product & Pricing Information */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-warm-100 border border-gray-100 gap-3">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-12 h-12 rounded-xl relative overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={req.productImage || '/logo.jpg'}
                                alt={req.productTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-charcoal-900">
                                {req.productTitle}
                              </div>
                              <div className="text-[11px] text-charcoal-500 mt-0.5">
                                Listed at: ₹{req.productPrice.toLocaleString()} • Handover: {req.deliveryType}
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
                            <div className="text-[10px] text-charcoal-400">Offered Price</div>
                            <div className="text-base sm:text-lg font-black text-forest">
                              ₹{req.offeredPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        {req.message && (
                          <div className="p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100 text-xs text-charcoal-700">
                            <span className="font-bold text-forest">Buyer Message: </span>
                            <span>{req.message}</span>
                          </div>
                        )}

                        {/* Admin Action Controls: Change Status & Delete Enquiry */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(req._id, req.productTitle)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                            title="Delete this purchase enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Enquiry</span>
                          </button>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-charcoal-500 hidden sm:inline">
                              Change Status:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRequestStatus(req._id, 'accepted')}
                              disabled={req.status === 'accepted'}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-40"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateRequestStatus(req._id, 'completed')}
                              disabled={req.status === 'completed'}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-40"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateRequestStatus(req._id, 'rejected')}
                              disabled={req.status === 'rejected'}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-40"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================= */}
      {/* EDIT PRODUCT MODAL (Admin Sided)                          */}
      {/* ========================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-lg text-charcoal-900">Admin Edit Product</h3>
                <p className="text-xs text-charcoal-500">Edit listing specifications, pricing, and status</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white text-charcoal-900 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Condition</label>
                  <select
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white text-charcoal-900 focus:outline-none"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editFormData.originalPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, originalPrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Marketplace Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white text-charcoal-900 focus:outline-none font-semibold"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-charcoal-600 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light flex items-center space-x-1.5 shadow-card disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-mint" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RED OPTION MODAL: WIPE ENTIRE DATABASE                    */}
      {/* ========================================================= */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-white my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-4 text-rose-500">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/50 flex items-center justify-center shrink-0">
                <Flame className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-white tracking-tight">
                  DANGER: Wipe Entire Database
                </h3>
                <p className="text-xs text-rose-400 font-semibold">Irreversible Platform Wipeout</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-900 text-xs text-rose-200 space-y-2 mb-4 leading-relaxed">
              <p className="font-bold text-rose-300">
                ⚠️ WARNING: You are about to permanently delete all data across the platform:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11.5px]">
                <li>All registered community users and credentials.</li>
                <li>All marketplace listings and products.</li>
                <li>All product images & binary chunks in MongoDB GridFS.</li>
                <li>All purchase requests, messages, and order history.</li>
              </ul>
              <p className="font-extrabold text-rose-400 pt-1">
                This action is immediate and CANNOT be undone.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-slate-300">
                To confirm, type <span className="font-mono text-rose-400 select-all font-black">DELETE ALL DATA</span> below:
              </label>
              <input
                type="text"
                value={wipeConfirmText}
                onChange={(e) => setWipeConfirmText(e.target.value)}
                placeholder="DELETE ALL DATA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-rose-700/60 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsWipeModalOpen(false);
                  setWipeConfirmText('');
                }}
                disabled={wipingDb}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel & Abort
              </button>

              <button
                type="button"
                onClick={handleExecuteWipeDb}
                disabled={wipeConfirmText !== 'DELETE ALL DATA' || wipingDb}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {wipingDb ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Wiping Database...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-white" />
                    <span>Confirm & Permanently Wipe Entire DB</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 3. MAIN EXPORT: Gated by Server-side Auth Check
// =====================================================================
function AdminPanelContainer() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);

  // Check existing session on load
  const verifyAdminSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        setIsAdminAuthenticated(true);
      } else {
        setIsAdminAuthenticated(false);
      }
    } catch {
      setIsAdminAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    verifyAdminSession();
  }, [verifyAdminSession]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsAdminAuthenticated(false);
    toast.info('Admin session logged out.');
  };

  // While checking session cookie
  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-xs text-emerald-400/80 space-y-3">
        <RefreshCw className="w-7 h-7 text-mint animate-spin" />
        <span>Verifying Security Clearance...</span>
      </div>
    );
  }

  // Not authenticated: Render ONLY the Security Wall.
  // The actual Admin Dashboard code and data are NOT loaded!
  if (!isAdminAuthenticated) {
    return <AdminLoginWall onAuthenticated={() => setIsAdminAuthenticated(true)} />;
  }

  // Authenticated: Render the full Admin Dashboard
  return <AdminDashboard onLogout={handleLogout} />;
}

export default function AdminPanelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-emerald-400">
          Loading Security Gate...
        </div>
      }
    >
      <AdminPanelContainer />
    </Suspense>
  );
}
