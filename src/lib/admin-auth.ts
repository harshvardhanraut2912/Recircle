import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || 'recircle_superadmin_secure_key_9921_classified';

export const ADMIN_TOKEN_COOKIE = 'recircle_admin_token';

export function getAdminEnvCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || 'harshvardhanraut2912@gmail.com').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'kitkat19',
  };
}

export function verifyAdminCredentials(inputEmail: string, inputPass: string): boolean {
  const { email, password } = getAdminEnvCredentials();
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
    ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyAdminToken(token: string): { email: string; role: string; isAdmin: boolean } | null {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as {
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
