import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
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

  try {
    // Verify ownership and update
    const res = await query(
      `UPDATE identities
       SET verified = true, verified_at = now()
       WHERE identity_id = $1 AND user_id = $2
       RETURNING identity_id, identity_value, identity_type, verified, verified_at;`,
      [identityId, user.userId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'Identity not found or you do not have permission to verify it.' },
        { status: 404 }
      );
    }

    const updated = res.rows[0];

    // Log to MongoDB audit_logs
    await logAuditEvent({
      event_type: 'identity_verified',
      user_id: user.userId,
      role: user.role,
      details: {
        identity_id: updated.identity_id,
        identity_value: updated.identity_value,
        verified_at: updated.verified_at,
      },
    });

    return NextResponse.json({
      message: 'Identity ownership confirmed successfully.',
      identity: updated,
    });
  } catch (err: any) {
    console.error('Error verifying identity:', err);
    return NextResponse.json({ error: 'Failed to verify identity.' }, { status: 500 });
  }
}
