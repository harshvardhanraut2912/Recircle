'use client';

import { uploadImages } from '@/lib/upload-client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Phone,
  Lock,
  User,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Loader2,
  Camera,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, loading: authLoading } = useAuth();

  const redirectUrl = searchParams?.get('redirect') || '/';

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Optional profile photo state for registration
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be under 5MB.');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginPassword.trim()) {
      toast.error('Please enter your phone number and password');
      return;
    }
    setSubmitting(true);
    const success = await login(loginPhone.trim(), loginPassword);
    setSubmitting(false);
    if (success) {
      router.push(redirectUrl);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername.trim()) {
      toast.error('Please enter your name / username');
      return;
    }
    if (!signupPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    let uploadedAvatarUrl: string | undefined = undefined;

    // Optional avatar upload to Supabase Storage
    if (avatarFile) {
      setAvatarUploading(true);
      try {
        const uploadData = await uploadImages([avatarFile], 'avatar');
        if (uploadData.success && uploadData.images[0]?.url) {
          uploadedAvatarUrl = uploadData.images[0].url;
        } else {
          toast.error('Could not upload avatar image, continuing with default person icon.');
        }
      } catch (err) {
        console.warn('Avatar upload error:', err);
      } finally {
        setAvatarUploading(false);
      }
    }

    const success = await register({
      username: signupUsername.trim(),
      phone: signupPhone.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      avatarUrl: uploadedAvatarUrl,
    });
    setSubmitting(false);
    if (success) {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-warm-100 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2.5 group mb-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-subtle border border-emerald-100 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.jpg"
                alt="ReCircle Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-forest">
              Re<span className="text-mint">Circle</span>
            </span>
          </Link>

          <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Join the Circular Community'}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-xs mx-auto">
            {redirectUrl !== '/'
              ? 'Please log in or create an account to view item details, share, or make a purchase.'
              : 'Sign in to buy, sell, and reuse verified pre-loved products.'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-card">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-warm-200 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-forest shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-forest shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Phone Number (or Email)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="e.g. 9876543210 or your email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-full bg-forest text-white font-bold text-sm shadow-card hover:bg-forest-light hover:shadow-card-hover transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-mint" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to Account</span>
                    <ArrowRight className="w-4 h-4 text-mint" />
                  </>
                )}
              </button>

            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-in fade-in duration-200">
              {/* Optional Profile Photo Selector */}
              <div className="flex flex-col items-center justify-center pt-1 pb-2">
                <div className="relative group">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-20 h-20 rounded-full border-2 cursor-pointer transition-all overflow-hidden flex items-center justify-center relative shadow-xs ${
                      avatarPreview
                        ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10'
                        : 'border-dashed border-gray-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70'
                    }`}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-charcoal-400 group-hover:text-forest transition-colors">
                        <User className="w-8 h-8 stroke-[1.6]" />
                      </div>
                    )}

                    {/* Hover prompt */}
                    <div className="absolute inset-0 bg-forest/40 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>{avatarPreview ? 'Change' : 'Add Photo'}</span>
                    </div>
                  </div>

                  {/* Camera Badge Icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-forest text-white border-2 border-white shadow-xs flex items-center justify-center hover:bg-forest-light transition-transform active:scale-95"
                    title="Upload profile photo"
                  >
                    <Camera className="w-3.5 h-3.5 text-mint" />
                  </button>

                  {/* Clear selection button */}
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white border-2 border-white shadow-xs flex items-center justify-center hover:bg-rose-600 transition-transform active:scale-95"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <div className="mt-2 text-center">
                  <div className="text-xs font-bold text-charcoal-800 flex items-center justify-center gap-1.5">
                    <span>Profile Photo</span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-400 mt-0.5">
                    {avatarPreview
                      ? 'Photo selected • Click to change or remove'
                      : 'Upload a picture or skip to keep the default person icon'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Full Name / Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. Maya Iyer"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="e.g. 9812345678"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. maya@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-full bg-forest text-white font-bold text-sm shadow-card hover:bg-forest-light hover:shadow-card-hover transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-3"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-mint" />
                    <span>{avatarUploading ? 'Uploading Photo...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <span>Create ReCircle Account</span>
                    <ArrowRight className="w-4 h-4 text-mint" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust points */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-around text-[11px] text-charcoal-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-mint" /> Verified Profiles
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-mint" /> Circular Living
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-mint" /> 48h Protection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-100 flex items-center justify-center text-xs text-charcoal-500">Loading sign in...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
