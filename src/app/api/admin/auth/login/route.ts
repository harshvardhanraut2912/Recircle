import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  generateAdminToken,
  ADMIN_TOKEN_COOKIE,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Admin email and password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials. Access denied.' },
        { status: 401 }
      );
    }

    const token = generateAdminToken(email);

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      email: email.trim().toLowerCase(),
    });

    response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: unknown) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Server authentication error' }, { status: 500 });
  }
}
