import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getSupabase, isUuid } from './supabase';
import { mapUser, USER_PUBLIC_COLUMNS } from './mappers';
import { UserProfile } from '@/types';
import { getAdminSession } from './admin-auth';

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production.');
  }
  return 'dev-only-insecure-jwt-secret';
}

const TOKEN_NAME = 'recircle_auth_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { _id: string; phone: string; email: string; username: string }): string {
  return jwt.sign(
    { userId: user._id, phone: user.phone, email: user.email, username: user.username },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
}

export function verifyAuthToken(
  token: string
): { userId: string; phone: string; email: string; username: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as {
      userId: string;
      phone: string;
      email: string;
      username: string;
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(req: NextRequest): Promise<UserProfile | null> {
  const cookieToken = req.cookies.get(TOKEN_NAME)?.value;
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;
  if (!token) return null;

  const decoded = verifyAuthToken(token);
  if (!decoded || !isUuid(decoded.userId)) return null;

  try {
    const { data, error } = await getSupabase()
      .from('users')
      .select(USER_PUBLIC_COLUMNS)
      .eq('id', decoded.userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapUser(data);
  } catch (err) {
    console.error('Error fetching session user:', err);
    return null;
  }
}

/** Who is making this request: a logged-in user and/or the superadmin. */
export async function getActor(req: NextRequest) {
  const [user, admin] = await Promise.all([getSessionUser(req), Promise.resolve(getAdminSession(req))]);
  return { user, isAdmin: Boolean(admin) };
}

export { TOKEN_NAME };
