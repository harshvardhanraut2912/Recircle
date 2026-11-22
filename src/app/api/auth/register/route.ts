import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { hashPassword, generateToken, TOKEN_NAME } from '@/lib/auth';
import { mapUser, USER_PUBLIC_COLUMNS } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

export async function POST(req: NextRequest) {
  try {
    const { username, phone, email, password, avatarUrl } = await req.json();

    if (!username || !phone || !email || !password) {
      return NextResponse.json(
        { error: 'Username, phone number, email ID, and password are required.' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanEmail = String(email).trim().toLowerCase();
    const supabase = getSupabase();

    const [byPhone, byEmail] = await Promise.all([
      supabase.from('users').select('id').eq('phone', cleanPhone).maybeSingle(),
      supabase.from('users').select('id').eq('email', cleanEmail).maybeSingle(),
    ]);
    if (byPhone.data) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please log in.' },
        { status: 409 }
      );
    }
    if (byEmail.data) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const { data: created, error } = await supabase
      .from('users')
      .insert({
        username: String(username).trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password_hash: await hashPassword(password),
        avatar_url: avatarUrl ? String(avatarUrl).trim() : null,
        member_since: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      })
      .select(USER_PUBLIC_COLUMNS)
      .single();

    if (error || !created) {
      if (error?.code === '23505') {
        return NextResponse.json({ error: 'An account with these details already exists.' }, { status: 409 });
      }
      throw new Error(error?.message || 'Could not create account');
    }

    const user = mapUser(created);
    const token = generateToken(user);
    const response = NextResponse.json({ success: true, message: 'Account created successfully!', user });
    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
