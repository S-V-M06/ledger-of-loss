import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level')?.trim().toLowerCase();
  const sort = searchParams.get('sort')?.trim().toLowerCase() || 'risk_desc';
  const q = searchParams.get('q')?.trim();

  try {
    // 1. Fetch user_risk_summary
    const summaryRes = await query(
      `SELECT total_exposures, high_count, critical_count, overall_score, updated_at
       FROM user_risk_summary
       WHERE user_id = $1;`,
      [user.userId]
    );

    const summary = summaryRes.rows[0] || {
      total_exposures: 0,
      high_count: 0,
      critical_count: 0,
      overall_score: 0,
      updated_at: new Date().toISOString(),
    };

    // 2. Fetch pending recovery actions count
    const actionsCountRes = await query(
      `SELECT COUNT(*)::int AS pending_actions_count
       FROM recovery_actions ra
       JOIN exposures e ON ra.exposure_id = e.exposure_id
       JOIN identities i ON e.identity_id = i.identity_id
       WHERE i.user_id = $1 AND ra.status = 'pending';`,
      [user.userId]
    );

    const pendingActionsCount = actionsCountRes.rows[0]?.pending_actions_count || 0;

    // 3. Build dynamic query against user_security_dashboard view
    let sql = `
      SELECT 
        user_id,
        identity_id,
        identity_value,
        exposure_id,
        breach_name,
        breach_date,
        severity,
        risk_score,
        risk_level,
        discovered_at,
        exposed_data_types,
        pending_recovery_actions_count
      FROM user_security_dashboard
      WHERE user_id = $1
    `;
    const params: any[] = [user.userId];
    let paramIndex = 2;

    if (level && ['low', 'medium', 'high', 'critical'].includes(level)) {
      sql += ` AND LOWER(risk_level) = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    if (q) {
      sql += ` AND (breach_name ILIKE $${paramIndex} OR identity_value ILIKE $${paramIndex} OR exposed_data_types ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    // Apply sorting
    switch (sort) {
      case 'risk_asc':
        sql += ` ORDER BY risk_score ASC, discovered_at DESC`;
        break;
      case 'date_desc':
        sql += ` ORDER BY breach_date DESC, risk_score DESC`;
        break;
      case 'date_asc':
        sql += ` ORDER BY breach_date ASC, risk_score DESC`;
        break;
      case 'name_asc':
        sql += ` ORDER BY breach_name ASC`;
        break;
      case 'risk_desc':
      default:
        sql += ` ORDER BY risk_score DESC, discovered_at DESC`;
        break;
    }

    const exposuresRes = await query(sql, params);

    return NextResponse.json({
      summary: {
        ...summary,
        pending_actions_count: pendingActionsCount,
      },
      exposures: exposuresRes.rows,
    });
  } catch (err: any) {
    console.error('Error fetching dashboard view:', err);
    return NextResponse.json({ error: 'Failed to retrieve dashboard data' }, { status: 500 });
  }
}
