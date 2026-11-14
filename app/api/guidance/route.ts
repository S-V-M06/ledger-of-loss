import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { searchGuidancePlaybooks } from '@/db/queries/q8_mongo_text_search';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  try {
    const db = await getDb();
    const playbooks = await searchGuidancePlaybooks(db, q);
    return NextResponse.json({ playbooks });
  } catch (err: any) {
    console.error('Guidance search error:', err);
    return NextResponse.json({ error: 'Failed to search playbooks' }, { status: 500 });
  }
}
