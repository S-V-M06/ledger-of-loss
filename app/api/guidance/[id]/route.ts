import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid playbook ID' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const playbook = await db
      .collection('guidance_playbooks')
      .findOne({ _id: new ObjectId(params.id) });

    if (!playbook) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }

    return NextResponse.json({ playbook });
  } catch (err: any) {
    console.error('Error fetching playbook:', err);
    return NextResponse.json({ error: 'Failed to retrieve playbook' }, { status: 500 });
  }
}
