'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    phone: string;
    email: string;
    password: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  updateUser: (updated: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  requireAuth: (callback: () => void, redirectUrl?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'recircle_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from server session & localStorage fallback
  const checkSession = useCallback(async () => {
    try {
      // Check localStorage first for instant UX
      const cached = localStorage.getItem(USER_STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }

      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // offline / network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.username}!`);
        return true;
      } else {
        toast.error(data.error || 'Invalid credentials');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Network error during login');
      return false;
    }
  };

  const register = async (formData: {
    username: string;
    phone: string;
    email: string;
    password: string;
    avatarUrl?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        toast.success(`Welcome to ReCircle, ${data.user.username}!`);
        return true;
      } else {
        toast.error(data.error || 'Registration failed');
        return false;
      }
    } catch (err) {
      console.error('Register error:', err);
      toast.error('Network error during registration');
      return false;
    }
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      toast.info('You have logged out.');
      router.push('/');
    } catch {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      router.push('/');
    }
  };

  const requireAuth = (callback: () => void, redirectUrl?: string) => {
    if (user) {
      callback();
    } else {
      const target = redirectUrl ? encodeURIComponent(redirectUrl) : '';
      router.push(`/login${target ? `?redirect=${target}` : ''}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateUser,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
