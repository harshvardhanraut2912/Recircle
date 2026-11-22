import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken, TOKEN_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, phone, email, password, avatarUrl } = body;

    if (!username || !phone || !email || !password) {
      return NextResponse.json(
        { error: 'Username, phone number, email ID, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(phone);
    const cleanEmail = email.trim().toLowerCase();

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Check if phone or email already registered
    const existingUser = await usersCollection.findOne({
      $or: [{ phone: cleanPhone }, { email: cleanEmail }],
    });

    if (existingUser) {
      if (existingUser.phone === cleanPhone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists. Please log in.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = new ObjectId();
    const memberSince = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const newUserDoc = {
      _id: userId,
      username: username.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash,
      avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
      rating: 5.0,
      reviewsCount: 0,
      verified: true,
      memberSince,
      city: 'Bangalore',
      createdAt: new Date().toISOString(),
    };

    await usersCollection.insertOne(newUserDoc);

    const token = generateToken({
      _id: userId.toString(),
      phone: cleanPhone,
      email: cleanEmail,
      username: username.trim(),
    });

    const userProfile = {
      _id: userId.toString(),
      username: newUserDoc.username,
      phone: newUserDoc.phone,
      email: newUserDoc.email,
      avatarUrl: newUserDoc.avatarUrl || undefined,
      rating: newUserDoc.rating,
      reviewsCount: newUserDoc.reviewsCount,
      verified: newUserDoc.verified,
      memberSince: newUserDoc.memberSince,
      city: newUserDoc.city,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: userProfile,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const msg = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
