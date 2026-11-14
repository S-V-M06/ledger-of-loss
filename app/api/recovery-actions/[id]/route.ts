import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';
import { logAuditEvent } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const actionId = parseInt(params.id, 10);
  if (isNaN(actionId)) {
    return NextResponse.json({ error: 'Invalid action ID.' }, { status: 400 });
  }

  const { status } = await req.json();
  if (!['pending', 'completed', 'dismissed'].includes(status)) {
    return NextResponse.json(
      { error: 'Status must be pending, completed, or dismissed.' },
      { status: 400 }
    );
  }

  try {
    // Ensure the action belongs to an exposure owned by the current user
    const checkRes = await query(
      `SELECT ra.action_id, ra.title, ra.status, ra.exposure_id, i.user_id
       FROM recovery_actions ra
       JOIN exposures e ON ra.exposure_id = e.exposure_id
       JOIN identities i ON e.identity_id = i.identity_id
       WHERE ra.action_id = $1 AND i.user_id = $2;`,
      [actionId, user.userId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Action not found or you do not have permission to update it.' },
        { status: 404 }
      );
    }

    const completedAtExpr = status === 'completed' ? 'now()' : 'NULL';

    const updateRes = await query(
      `UPDATE recovery_actions
       SET status = $1,
           completed_at = ${completedAtExpr}
       WHERE action_id = $2
       RETURNING action_id, exposure_id, title, priority, status, completed_at;`,
      [status, actionId]
    );

    const updatedAction = updateRes.rows[0];

    // Log to MongoDB audit_logs if marked completed
    if (status === 'completed') {
      await logAuditEvent({
        event_type: 'action_completed',
        user_id: user.userId,
        role: user.role,
        details: {
          action_id: updatedAction.action_id,
          exposure_id: updatedAction.exposure_id,
          title: updatedAction.title,
        },
      });
    }

    return NextResponse.json({ action: updatedAction });
  } catch (err: any) {
    console.error('Error updating recovery action:', err);
    return NextResponse.json({ error: 'Failed to update recovery action.' }, { status: 500 });
  }
}
