import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

function getAdminJwtSecret(): string {
  const s = process.env.ADMIN_JWT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_JWT_SECRET environment variable is required in production.');
  }
  return 'dev-only-insecure-admin-secret';
}

export const ADMIN_TOKEN_COOKIE = 'recircle_admin_token';

export function getAdminEnvCredentials() {
  // No hard-coded defaults: set ADMIN_EMAIL and ADMIN_PASSWORD in your environment.
  return {
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
  };
}

export function verifyAdminCredentials(inputEmail: string, inputPass: string): boolean {
  const { email, password } = getAdminEnvCredentials();
  if (!email || !password) return false;
  return (
    inputEmail.trim().toLowerCase() === email &&
    inputPass === password
  );
}

export function generateAdminToken(email: string): string {
  return jwt.sign(
    {
      email: email.trim().toLowerCase(),
      role: 'superadmin',
      isAdmin: true,
    },
    getAdminJwtSecret(),
    { expiresIn: '24h' }
  );
}

export function verifyAdminToken(token: string): { email: string; role: string; isAdmin: boolean } | null {
  try {
    const decoded = jwt.verify(token, getAdminJwtSecret()) as {
      email: string;
      role: string;
      isAdmin: boolean;
    };
    if (decoded && decoded.isAdmin && decoded.role === 'superadmin') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function getAdminSession(req: NextRequest) {
  const cookieToken = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;

  if (!token) return null;
  return verifyAdminToken(token);
}

export function assertAdminAuthorized(req: NextRequest): NextResponse | null {
  const admin = getAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { error: 'Access Denied: Superadmin authentication required.' },
      { status: 401 }
    );
  }
  return null;
}
