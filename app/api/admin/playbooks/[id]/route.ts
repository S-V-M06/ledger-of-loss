import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { logAuditEvent } from '@/lib/audit';

// PUT /api/admin/playbooks/[id] - Update playbook
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, summary, applies_to, priority, steps, tags } = body;

    const updateDoc: any = {
      title: title.trim(),
      summary: summary.trim(),
      applies_to: {
        data_types: applies_to.data_types,
        min_severity_rank: Number(applies_to.min_severity_rank),
      },
      priority: Number(priority),
      steps: steps.map((s: any, idx: number) => ({
        order: s.order || idx + 1,
        text: s.text.trim(),
        estimated_minutes: Number(s.estimated_minutes),
      })),
      tags: tags || [],
      updated_at: new Date(),
    };

    const db = await getDb();
    const res = await db
      .collection('guidance_playbooks')
      .updateOne({ _id: new ObjectId(params.id) }, { $set: updateDoc });

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }

    await logAuditEvent({
      event_type: 'admin_playbook_changed',
      user_id: user.userId,
      role: 'admin',
      details: { action: 'update', playbook_id: params.id, title: updateDoc.title },
    });

    return NextResponse.json({ message: 'Playbook updated successfully' });
  } catch (err: any) {
    console.error('Error updating playbook:', err);
    return NextResponse.json({ error: `Update failed: ${err.message}` }, { status: 400 });
  }
}

// DELETE /api/admin/playbooks/[id] - Remove playbook
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const res = await db.collection('guidance_playbooks').deleteOne({ _id: new ObjectId(params.id) });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }

    await logAuditEvent({
      event_type: 'admin_playbook_changed',
      user_id: user.userId,
      role: 'admin',
      details: { action: 'delete', playbook_id: params.id },
    });

    return NextResponse.json({ message: 'Playbook deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting playbook:', err);
    return NextResponse.json({ error: 'Failed to delete playbook' }, { status: 500 });
  }
}
