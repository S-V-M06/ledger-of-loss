import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/pg';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const identityId = parseInt(params.id, 10);
  if (isNaN(identityId)) {
    return NextResponse.json({ error: 'Invalid identity ID.' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify existence and ownership
    const checkRes = await client.query(
      `SELECT identity_id FROM identities WHERE identity_id = $1 AND user_id = $2;`,
      [identityId, user.userId]
    );

    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Identity not found or does not belong to you.' },
        { status: 404 }
      );
    }

    // 2. Delete identity (cascades automatically to exposures, scan_requests, recovery_actions)
    await client.query(`DELETE FROM identities WHERE identity_id = $1;`, [identityId]);

    // 3. Recompute and refresh user_risk_summary inside the same transaction
    await client.query(`SELECT refresh_user_risk_summary($1);`, [user.userId]);

    await client.query('COMMIT');

    return NextResponse.json({ success: true, message: 'Identity and related exposures deleted.' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting identity:', err);
    return NextResponse.json({ error: 'Failed to delete identity.' }, { status: 500 });
  } finally {
    client.release();
  }
}
