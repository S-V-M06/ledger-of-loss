import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exposureId = parseInt(params.id, 10);
  if (isNaN(exposureId)) {
    return NextResponse.json({ error: 'Invalid exposure ID.' }, { status: 400 });
  }

  try {
    // 1. Fetch exposure details from PostgreSQL, ensuring identity belongs to current user
    const expRes = await query(
      `SELECT 
         e.exposure_id,
         e.identity_id,
         i.user_id,
         i.identity_value,
         i.identity_type,
         b.breach_id,
         b.breach_name,
         b.source_name,
         b.breach_date,
         b.severity,
         b.description AS breach_description,
         e.risk_score,
         risk_level(e.risk_score) AS risk_level,
         e.discovered_at,
         (b.breach_date >= CURRENT_DATE - INTERVAL '24 months') AS is_recent
       FROM exposures e
       JOIN identities i ON e.identity_id = i.identity_id
       JOIN breaches b ON e.breach_id = b.breach_id
       WHERE e.exposure_id = $1 AND i.user_id = $2;`,
      [exposureId, user.userId]
    );

    if (expRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exposure not found or does not belong to your account.' },
        { status: 404 }
      );
    }

    const exposure = expRes.rows[0];

    // 2. Fetch associated data types
    const dtRes = await query(
      `SELECT dt.data_type_id, dt.name, dt.weight
       FROM exposure_data_types edt
       JOIN data_types dt ON edt.data_type_id = dt.data_type_id
       WHERE edt.exposure_id = $1
       ORDER BY dt.weight DESC;`,
      [exposureId]
    );

    // 3. Fetch recovery actions from PostgreSQL
    const actRes = await query(
      `SELECT 
         action_id,
         playbook_ref,
         title,
         priority,
         status,
         created_at,
         completed_at
       FROM recovery_actions
       WHERE exposure_id = $1
       ORDER BY priority DESC, created_at ASC;`,
      [exposureId]
    );

    // 4. Fetch rich steps from MongoDB for each playbook_ref
    const playbookRefs = actRes.rows
      .map((a) => a.playbook_ref)
      .filter((ref) => ObjectId.isValid(ref))
      .map((ref) => new ObjectId(ref));

    const mongoDb = await getDb();
    const playbooks = await mongoDb
      .collection('guidance_playbooks')
      .find({ _id: { $in: playbookRefs } })
      .toArray();

    const playbookMap = new Map<string, any>();
    playbooks.forEach((p) => playbookMap.set(p._id.toString(), p));

    const recoveryActions = actRes.rows.map((act) => {
      const pb = playbookMap.get(act.playbook_ref);
      return {
        ...act,
        playbook: pb || null,
      };
    });

    return NextResponse.json({
      exposure,
      data_types: dtRes.rows,
      recovery_actions: recoveryActions,
    });
  } catch (err: any) {
    console.error('Error fetching exposure details:', err);
    return NextResponse.json({ error: 'Failed to retrieve exposure detail.' }, { status: 500 });
  }
}
