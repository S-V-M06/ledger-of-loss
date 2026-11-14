import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { pool, query } from '@/lib/pg';
import { getDb } from '@/lib/mongo';
import { logAuditEvent } from '@/lib/audit';

function sha256(val: string): string {
  return crypto.createHash('sha256').update(val.toLowerCase().trim()).digest('hex');
}

// GET /api/admin/breaches - List all breaches with stats
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const res = await query(
      `SELECT 
         b.breach_id,
         b.breach_name,
         b.source_name,
         b.breach_date,
         b.severity,
         b.description,
         COUNT(e.exposure_id)::int AS exposure_count
       FROM breaches b
       LEFT JOIN exposures e ON b.breach_id = e.breach_id
       GROUP BY b.breach_id
       ORDER BY b.breach_date DESC;`
    );

    return NextResponse.json({ breaches: res.rows });
  } catch (err: any) {
    console.error('Error fetching admin breaches:', err);
    return NextResponse.json({ error: 'Failed to retrieve breaches' }, { status: 500 });
  }
}

// POST /api/admin/breaches - Add breach with cross-database compensating transaction
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { breach_name, source_name, breach_date, severity, description, records } = body;

  if (!breach_name || !source_name || !breach_date || !severity) {
    return NextResponse.json(
      { error: 'Breach name, source name, breach date, and severity are required.' },
      { status: 400 }
    );
  }

  // 1. Step 1: Write SQL breaches row first
  let createdBreachId: number | null = null;
  const pgClient = await pool.connect();

  try {
    const insertRes = await pgClient.query(
      `INSERT INTO breaches (breach_name, source_name, breach_date, severity, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING breach_id, breach_name, severity, breach_date;`,
      [breach_name.trim(), source_name.trim(), breach_date, severity, description || '']
    );
    createdBreachId = insertRes.rows[0].breach_id;
  } catch (err: any) {
    pgClient.release();
    if (err.code === '23505') {
      return NextResponse.json({ error: 'A breach with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: `SQL breach creation failed: ${err.message}` }, { status: 500 });
  }

  // 2. Step 2: Write MongoDB breach_records with compensating transaction on failure
  try {
    const mongoDb = await getDb();
    const documentsToInsert = (records || []).map((r: any) => ({
      breach_id: createdBreachId,
      identity_hash: r.identity_hash || sha256(r.identity_value || ''),
      identity_type: r.identity_type || 'email',
      exposed_fields: r.exposed_fields || ['password', 'email'],
      extra: r.extra || { notes: 'Admin registered manual ingestion' },
    }));

    if (documentsToInsert.length > 0) {
      await mongoDb.collection('breach_records').insertMany(documentsToInsert);
    }

    pgClient.release();

    // 3. Step 3: Write audit log
    await logAuditEvent({
      event_type: 'admin_breach_added',
      user_id: user.userId,
      role: 'admin',
      details: {
        breach_id: createdBreachId,
        breach_name,
        records_count: documentsToInsert.length,
      },
    });

    return NextResponse.json(
      {
        message: 'Breach and associated breach records successfully registered.',
        breach_id: createdBreachId,
        records_inserted: documentsToInsert.length,
      },
      { status: 201 }
    );
  } catch (mongoErr: any) {
    // COMPENSATING ACTION: MongoDB write failed, rollback the SQL row!
    console.error('MongoDB breach_records write failed. Executing compensating rollback in PostgreSQL...');
    try {
      await pgClient.query(`DELETE FROM breaches WHERE breach_id = $1;`, [createdBreachId]);
    } catch (cleanupErr) {
      console.error('Compensating rollback failed:', cleanupErr);
    } finally {
      pgClient.release();
    }

    return NextResponse.json(
      {
        error: `Cross-database failure: MongoDB insert failed (${mongoErr.message}). PostgreSQL breach was rolled back as compensating action.`,
      },
      { status: 500 }
    );
  }
}
