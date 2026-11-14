import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { logAuditEvent } from '@/lib/audit';

// GET /api/admin/playbooks - List all playbooks
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const playbooks = await db
      .collection('guidance_playbooks')
      .find({})
      .sort({ priority: -1, updated_at: -1 })
      .toArray();

    return NextResponse.json({ playbooks });
  } catch (err: any) {
    console.error('Error fetching admin playbooks:', err);
    return NextResponse.json({ error: 'Failed to retrieve playbooks' }, { status: 500 });
  }
}

// POST /api/admin/playbooks - Create a new guidance playbook
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, summary, applies_to, priority, steps, tags } = body;

    if (!title || !summary || !applies_to || !priority || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Missing required playbook fields.' }, { status: 400 });
    }

    const doc = {
      title: title.trim(),
      summary: summary.trim(),
      applies_to: {
        data_types: applies_to.data_types || ['password'],
        min_severity_rank: Number(applies_to.min_severity_rank) || 1,
      },
      priority: Number(priority),
      steps: steps.map((s: any, idx: number) => ({
        order: s.order || idx + 1,
        text: s.text.trim(),
        estimated_minutes: Number(s.estimated_minutes) || 5,
      })),
      tags: tags || ['general'],
      updated_at: new Date(),
    };

    const db = await getDb();
    const result = await db.collection('guidance_playbooks').insertOne(doc);

    await logAuditEvent({
      event_type: 'admin_playbook_changed',
      user_id: user.userId,
      role: 'admin',
      details: { action: 'create', playbook_id: result.insertedId.toString(), title: doc.title },
    });

    return NextResponse.json({ message: 'Playbook created successfully', id: result.insertedId }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating playbook:', err);
    return NextResponse.json({ error: `Validation failure or database error: ${err.message}` }, { status: 400 });
  }
}
