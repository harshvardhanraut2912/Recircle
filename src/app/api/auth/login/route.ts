import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyPassword, generateToken, TOKEN_NAME } from '@/lib/auth';
import { mapUser } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone number and password are required.' }, { status: 400 });
    }

    const input = String(phone).trim();
    const cleanPhone = normalizePhone(input);
    const cleanEmail = input.toLowerCase();

    const supabase = getSupabase();
    let { data: userRow, error } = await supabase
      .from('users').select('*').eq('phone', cleanPhone).maybeSingle();
    if (error) throw new Error(error.message);
    if (!userRow) {
      const byEmail = await supabase.from('users').select('*').eq('email', cleanEmail).maybeSingle();
      if (byEmail.error) throw new Error(byEmail.error.message);
      userRow = byEmail.data;
    }
    if (!userRow) {
      return NextResponse.json({ error: 'No account found with this phone number or email ID.' }, { status: 404 });
    }
    if (!(await verifyPassword(password, userRow.password_hash))) {
      return NextResponse.json({ error: 'Incorrect password. Please verify and try again.' }, { status: 401 });
    }

    const user = mapUser(userRow);
    const token = generateToken(user);
    const response = NextResponse.json({ success: true, message: 'Logged in successfully!', user });
    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login failed' }, { status: 500 });
  }
}
