import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      email: session.email,
      role: session.role,
    });
  } catch (error: unknown) {
    console.error('Admin check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
