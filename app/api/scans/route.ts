import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { pool, query } from '@/lib/pg';
import { getDb } from '@/lib/mongo';
import { logAuditEvent } from '@/lib/audit';

function sha256(val: string): string {
  return crypto.createHash('sha256').update(val.toLowerCase().trim()).digest('hex');
}

function getSeverityRank(severity: string): number {
  switch (severity?.toLowerCase()) {
    case 'low':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
    case 'critical':
      return 4;
    default:
      return 1;
  }
}

// GET /api/scans - Returns scan history for the authenticated user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(
      `SELECT 
         sr.scan_id,
         sr.identity_id,
         i.identity_value,
         i.identity_type,
         sr.started_at,
         sr.completed_at,
         sr.status,
         sr.exposures_found
       FROM scan_requests sr
       JOIN identities i ON sr.identity_id = i.identity_id
       WHERE i.user_id = $1
       ORDER BY sr.started_at DESC;`,
      [user.userId]
    );

    return NextResponse.json({ scans: res.rows });
  } catch (err: any) {
    console.error('Error fetching scan history:', err);
    return NextResponse.json({ error: 'Failed to retrieve scan history' }, { status: 500 });
  }
}

// POST /api/scans - ACID Scan Transaction
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const identityId = parseInt(body.identity_id, 10);
  if (isNaN(identityId)) {
    return NextResponse.json({ error: 'A valid identity_id is required.' }, { status: 400 });
  }

  // --------------------------------------------------------------------------
  // Step 1: Validate ownership and verification status
  // --------------------------------------------------------------------------
  const identRes = await query(
    `SELECT identity_id, user_id, identity_value, identity_type, verified
     FROM identities
     WHERE identity_id = $1;`,
    [identityId]
  );

  if (identRes.rows.length === 0) {
    return NextResponse.json({ error: 'Identity not found.' }, { status: 404 });
  }

  const identity = identRes.rows[0];
  if (identity.user_id !== user.userId) {
    return NextResponse.json({ error: 'Forbidden: You do not own this identity.' }, { status: 403 });
  }

  if (!identity.verified) {
    return NextResponse.json(
      { error: 'Cannot scan an unverified identity. Please confirm ownership first.' },
      { status: 400 }
    );
  }

  // --------------------------------------------------------------------------
  // Step 2: Pre-read from MongoDB & PostgreSQL outside the SQL transaction
  // (Ensures SQL transaction remains lean, fast, and atomic)
  // --------------------------------------------------------------------------
  const identityHash = sha256(identity.identity_value);
  const mongoDb = await getDb();

  // Find all breach records matching this identity hash and type
  const matchedRecords = await mongoDb
    .collection('breach_records')
    .find({
      identity_hash: identityHash,
      identity_type: identity.identity_type,
    })
    .toArray();

  // Pre-load all data_types into memory for validation mapping
  const dtRes = await query(`SELECT data_type_id, name FROM data_types;`);
  const dataTypeMap = new Map<string, number>();
  dtRes.rows.forEach((r) => dataTypeMap.set(r.name, r.data_type_id));

  // Pre-load breaches catalog
  const breachRes = await query(`SELECT breach_id, breach_name, severity FROM breaches;`);
  const breachMap = new Map<number, { breach_id: number; breach_name: string; severity: string }>();
  breachRes.rows.forEach((b) => breachMap.set(b.breach_id, b));

  // Find playbooks for each matched breach record
  const recordsWithPlaybooks: {
    record: any;
    breach: any;
    playbooks: any[];
  }[] = [];

  for (const rec of matchedRecords) {
    const breach = breachMap.get(rec.breach_id);
    if (!breach) continue;

    const rank = getSeverityRank(breach.severity);
    const matchedPlaybooks = await mongoDb
      .collection('guidance_playbooks')
      .find({
        'applies_to.data_types': { $in: rec.exposed_fields },
        'applies_to.min_severity_rank': { $lte: rank },
      })
      .sort({ priority: -1 })
      .limit(3)
      .toArray();

    recordsWithPlaybooks.push({
      record: rec,
      breach,
      playbooks: matchedPlaybooks,
    });
  }

  // --------------------------------------------------------------------------
  // Step 3: ACID PostgreSQL Transaction
  // --------------------------------------------------------------------------
  const client = await pool.connect();
  let scanId: number | null = null;
  let newExposuresCount = 0;
  let totalExposuresCount = 0;
  const issuedPlaybookIds: string[] = [];

  try {
    await client.query('BEGIN');

    // 1. Insert scan_requests row (Trigger T1 fires here if unverified)
    const scanInsert = await client.query(
      `INSERT INTO scan_requests (identity_id, status)
       VALUES ($1, 'pending')
       RETURNING scan_id;`,
      [identity.identity_id]
    );
    scanId = scanInsert.rows[0].scan_id;

    // 2. Iterate each matched breach record
    for (const item of recordsWithPlaybooks) {
      const { record, playbooks } = item;

      // Validate all exposed fields exist in data_types; if unknown, abort!
      for (const field of record.exposed_fields) {
        if (!dataTypeMap.has(field)) {
          throw new Error(`Data integrity violation: Unknown exposed field "${field}" in breach record.`);
        }
      }

      // Insert exposure with ON CONFLICT DO NOTHING (skip if already exposed)
      const expInsert = await client.query(
        `INSERT INTO exposures (identity_id, breach_id, scan_id, risk_score)
         VALUES ($1, $2, $3, 0)
         ON CONFLICT (identity_id, breach_id) DO NOTHING
         RETURNING exposure_id;`,
        [identity.identity_id, record.breach_id, scanId]
      );

      let currentExposureId: number;

      if (expInsert.rows.length > 0) {
        // Newly discovered exposure
        currentExposureId = expInsert.rows[0].exposure_id;
        newExposuresCount++;

        // Insert exposure_data_types
        for (const field of record.exposed_fields) {
          const dtId = dataTypeMap.get(field)!;
          await client.query(
            `INSERT INTO exposure_data_types (exposure_id, data_type_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING;`,
            [currentExposureId, dtId]
          );
        }

        // UPDATE risk_score using stored function calculate_exposure_risk()
        // (Trigger T2 fires here upon risk_score UPDATE, refreshing user_risk_summary)
        await client.query(
          `UPDATE exposures
           SET risk_score = calculate_exposure_risk($1)
           WHERE exposure_id = $1;`,
          [currentExposureId]
        );
      } else {
        // Already recorded exposure: obtain existing ID
        const existingExp = await client.query(
          `SELECT exposure_id FROM exposures WHERE identity_id = $1 AND breach_id = $2;`,
          [identity.identity_id, record.breach_id]
        );
        currentExposureId = existingExp.rows[0]?.exposure_id;
      }

      totalExposuresCount++;

      // Insert recovery actions for matched playbooks
      if (currentExposureId) {
        for (const pb of playbooks) {
          const pbIdStr = pb._id.toString();
          issuedPlaybookIds.push(pbIdStr);

          await client.query(
            `INSERT INTO recovery_actions (exposure_id, playbook_ref, title, priority, status)
             VALUES ($1, $2, $3, $4, 'pending')
             ON CONFLICT (exposure_id, playbook_ref) DO NOTHING;`,
            [currentExposureId, pbIdStr, pb.title, pb.priority]
          );
        }
      }
    }

    // 3. Mark scan_requests completed
    await client.query(
      `UPDATE scan_requests
       SET status = 'completed',
           completed_at = now(),
           exposures_found = $1
       WHERE scan_id = $2;`,
      [totalExposuresCount, scanId]
    );

    await client.query('COMMIT');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Scan transaction rolled back due to error:', err);

    // Audit failed scan
    await logAuditEvent({
      event_type: 'scan_failed',
      user_id: user.userId,
      role: user.role,
      details: {
        identity_id: identity.identity_id,
        identity_value: identity.identity_value,
        error: err.message,
      },
    });

    return NextResponse.json(
      { error: `Scan transaction failed and was rolled back: ${err.message}` },
      { status: 500 }
    );
  } finally {
    client.release();
  }

  // --------------------------------------------------------------------------
  // Step 4: Post-commit audit logging
  // --------------------------------------------------------------------------
  await logAuditEvent({
    event_type: 'scan_completed',
    user_id: user.userId,
    role: user.role,
    details: {
      scan_id: scanId,
      identity_id: identity.identity_id,
      identity_value: identity.identity_value,
      total_exposures_found: totalExposuresCount,
      new_exposures: newExposuresCount,
    },
  });

  if (issuedPlaybookIds.length > 0) {
    await logAuditEvent({
      event_type: 'recommendations_issued',
      user_id: user.userId,
      role: user.role,
      details: {
        scan_id: scanId,
        playbook_ids: issuedPlaybookIds,
        recommendation_count: issuedPlaybookIds.length,
      },
    });
  }

  return NextResponse.json({
    message: 'Scan completed successfully.',
    scan_id: scanId,
    exposures_found: totalExposuresCount,
    new_exposures: newExposuresCount,
  });
}
