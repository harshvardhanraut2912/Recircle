import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Suspense } from 'react';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReCircle — Premium Circular Marketplace | Buy, Sell & Reuse Pre-Loved Goods',
  description:
    'ReCircle is a verified circular economy marketplace for premium pre-loved electronics, furniture, fashion, and mobility. Save money, extend product lifecycles, and reduce carbon footprint.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-inter), sans-serif',
            },
          }}
        />
        <AuthProvider>
          <Suspense fallback={<div className="h-16 sm:h-20 bg-white border-b border-gray-100" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
