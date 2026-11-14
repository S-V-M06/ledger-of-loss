import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status')?.trim().toLowerCase();

  try {
    let sql = `
      SELECT 
        ra.action_id,
        ra.exposure_id,
        ra.playbook_ref,
        ra.title,
        ra.priority,
        ra.status,
        ra.created_at,
        ra.completed_at,
        e.risk_score,
        b.breach_name,
        b.severity,
        i.identity_value,
        i.identity_type
      FROM recovery_actions ra
      JOIN exposures e ON ra.exposure_id = e.exposure_id
      JOIN identities i ON e.identity_id = i.identity_id
      JOIN breaches b ON e.breach_id = b.breach_id
      WHERE i.user_id = $1
    `;
    const params: any[] = [user.userId];

    if (statusFilter && ['pending', 'completed', 'dismissed'].includes(statusFilter)) {
      sql += ` AND ra.status = $2`;
      params.push(statusFilter);
    }

    sql += ` ORDER BY ra.status ASC, ra.priority DESC, ra.created_at DESC;`;

    const res = await query(sql, params);

    // Fetch playbook steps from MongoDB
    const playbookRefs = res.rows
      .map((r) => r.playbook_ref)
      .filter((ref) => ObjectId.isValid(ref))
      .map((ref) => new ObjectId(ref));

    const mongoDb = await getDb();
    const playbooks = await mongoDb
      .collection('guidance_playbooks')
      .find({ _id: { $in: playbookRefs } })
      .toArray();

    const pbMap = new Map<string, any>();
    playbooks.forEach((p) => pbMap.set(p._id.toString(), p));

    const enrichedActions = res.rows.map((row) => ({
      ...row,
      playbook: pbMap.get(row.playbook_ref) || null,
    }));

    return NextResponse.json({ actions: enrichedActions });
  } catch (err: any) {
    console.error('Error fetching recovery actions:', err);
    return NextResponse.json({ error: 'Failed to retrieve recovery actions' }, { status: 500 });
  }
}
