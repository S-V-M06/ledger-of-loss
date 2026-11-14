import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';
import { logAuditEvent } from '@/lib/audit';

// GET /api/identities - List current user's identities
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(
      `SELECT 
         i.identity_id,
         i.identity_value,
         i.identity_type,
         i.verified,
         i.verified_at,
         i.created_at,
         COUNT(DISTINCT sr.scan_id)::int AS scan_count,
         COUNT(DISTINCT e.exposure_id)::int AS exposure_count
       FROM identities i
       LEFT JOIN scan_requests sr ON i.identity_id = sr.identity_id
       LEFT JOIN exposures e ON i.identity_id = e.identity_id
       WHERE i.user_id = $1
       GROUP BY i.identity_id
       ORDER BY i.created_at DESC;`,
      [user.userId]
    );

    return NextResponse.json({ identities: res.rows });
  } catch (err: any) {
    console.error('Error fetching identities:', err);
    return NextResponse.json({ error: 'Failed to retrieve identities' }, { status: 500 });
  }
}

// POST /api/identities - Register a new identity (email or username)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { identity_value, identity_type } = await req.json();

    if (!identity_value || !identity_type) {
      return NextResponse.json(
        { error: 'Identity value and identity type are required.' },
        { status: 400 }
      );
    }

    if (!['email', 'username'].includes(identity_type)) {
      return NextResponse.json(
        { error: 'Identity type must be either email or username.' },
        { status: 400 }
      );
    }

    const cleanValue = identity_value.trim().toLowerCase();
    if (identity_type === 'email') {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(cleanValue)) {
        return NextResponse.json(
          { error: 'Please enter a valid email format.' },
          { status: 400 }
        );
      }
    } else if (cleanValue.length < 3 || cleanValue.length > 50) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 50 characters long.' },
        { status: 400 }
      );
    }

    // Insert into PostgreSQL identities table (defaults to verified = false)
    const insertRes = await query(
      `INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
       VALUES ($1, $2, $3, false, NULL)
       RETURNING identity_id, user_id, identity_value, identity_type, verified, created_at;`,
      [user.userId, cleanValue, identity_type]
    );

    const newIdentity = insertRes.rows[0];

    // Log event in MongoDB audit_logs
    await logAuditEvent({
      event_type: 'identity_added',
      user_id: user.userId,
      role: user.role,
      details: {
        identity_id: newIdentity.identity_id,
        identity_type: newIdentity.identity_type,
        identity_value: newIdentity.identity_value,
      },
    });

    return NextResponse.json({ identity: newIdentity }, { status: 201 });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'You have already registered this identity value.' },
        { status: 409 }
      );
    }
    console.error('Error adding identity:', err);
    return NextResponse.json({ error: 'Failed to add identity' }, { status: 500 });
  }
}
