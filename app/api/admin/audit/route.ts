import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongo';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const eventType = searchParams.get('event_type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  try {
    const db = await getDb();
    const filter: any = {};
    if (eventType) {
      filter.event_type = eventType;
    }

    const logs = await db
      .collection('audit_logs')
      .find(filter)
      .sort({ ts: -1 })
      .limit(limit)
      .toArray();

    const totalCount = await db.collection('audit_logs').countDocuments(filter);

    return NextResponse.json({ logs, total_count: totalCount });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
