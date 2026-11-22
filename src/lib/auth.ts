import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';
import { UserProfile } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'recircle_secure_jwt_secret_key_2026_sustainability';
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
    {
      userId: user._id,
      phone: user.phone,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyAuthToken(token: string): { userId: string; phone: string; email: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
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
  if (!decoded || !decoded.userId) return null;

  try {
    const db = await getDatabase();
    const userDoc = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!userDoc) return null;

    return {
      _id: userDoc._id.toString(),
      username: userDoc.username,
      email: userDoc.email,
      phone: userDoc.phone,
      avatarUrl: userDoc.avatarUrl || undefined,
      rating: userDoc.rating || 5.0,
      reviewsCount: userDoc.reviewsCount || 0,
      verified: Boolean(userDoc.verified),
      memberSince: userDoc.memberSince || '2024',
      city: userDoc.city || 'Bangalore',
    };
  } catch (err) {
    console.error('Error fetching session user:', err);
    return null;
  }
}

export { TOKEN_NAME };
