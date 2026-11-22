import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken, TOKEN_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required.' },
        { status: 400 }
      );
    }

    const cleanInput = phone.trim();
    const cleanPhone = normalizePhone(cleanInput);

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user by phone number or email (case-insensitive)
    const userDoc = await usersCollection.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: cleanInput },
        { email: cleanInput.toLowerCase() },
      ],
    });

    if (!userDoc) {
      return NextResponse.json(
        { error: 'No account found with this phone number or email ID.' },
        { status: 404 }
      );
    }

    const isMatch = await verifyPassword(password, userDoc.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify and try again.' },
        { status: 401 }
      );
    }

    const token = generateToken({
      _id: userDoc._id.toString(),
      phone: userDoc.phone,
      email: userDoc.email,
      username: userDoc.username,
    });

    const userProfile = {
      _id: userDoc._id.toString(),
      username: userDoc.username,
      phone: userDoc.phone,
      email: userDoc.email,
      avatarUrl: userDoc.avatarUrl || undefined,
      rating: userDoc.rating || 5.0,
      reviewsCount: userDoc.reviewsCount || 0,
      verified: Boolean(userDoc.verified),
      memberSince: userDoc.memberSince || '2024',
      city: userDoc.city || 'Bangalore',
    };

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: userProfile,
      token,
    });

    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    const msg = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
