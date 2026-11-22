import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { assertAdminAuthorized } from '@/lib/admin-auth';
import { emptyBucket } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const NIL = '00000000-0000-0000-0000-000000000000';

export async function POST(req: NextRequest) {
  try {
    const authError = assertAdminAuthorized(req);
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    if (body.confirmation !== 'DELETE ALL DATA') {
      return NextResponse.json({ error: 'Confirmation phrase "DELETE ALL DATA" required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const filesDeleted = await emptyBucket();

    const results = {
      requestsDeleted: (await supabase.from('requests').delete({ count: 'exact' }).neq('id', NIL)).count ?? 0,
      imagesDeleted: (await supabase.from('product_images').delete({ count: 'exact' }).neq('id', NIL)).count ?? 0,
      productsDeleted: (await supabase.from('products').delete({ count: 'exact' }).neq('id', NIL)).count ?? 0,
      usersDeleted: (await supabase.from('users').delete({ count: 'exact' }).neq('id', NIL)).count ?? 0,
      storageFilesDeleted: filesDeleted,
    };

    return NextResponse.json({ success: true, message: 'Entire database wiped out successfully.', details: results });
  } catch (error) {
    console.error('Wipe database error:', error);
    return NextResponse.json({ error: 'Failed to wipe database' }, { status: 500 });
  }
}
