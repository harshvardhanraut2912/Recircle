import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { seed } = require('../../../../scripts/seed');

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await seed();
    return NextResponse.json({ success: true, message: 'Database and GridFS seeded successfully' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error during seeding';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
