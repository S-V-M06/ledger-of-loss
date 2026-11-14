import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/pg';
import { getDb } from '@/lib/mongo';
import { getEventsPerTypePerDay, getMostRecommendedPlaybooks } from '@/db/queries/q7_mongo_audit_pipeline';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const mongoDb = await getDb();

    // ------------------------------------------------------------------------
    // Q2: GROUP BY + ORDER BY (Exposures & Average Risk Per Breach)
    // ------------------------------------------------------------------------
    const q2Res = await query(`
      SELECT
        b.breach_id,
        b.breach_name,
        b.severity,
        b.breach_date,
        COUNT(e.exposure_id)::int AS total_exposures,
        COALESCE(ROUND(AVG(e.risk_score), 1), 0.0) AS average_risk_score
      FROM breaches b
      LEFT JOIN exposures e ON b.breach_id = e.breach_id
      GROUP BY b.breach_id, b.breach_name, b.severity, b.breach_date
      ORDER BY total_exposures DESC, average_risk_score DESC;
    `);

    // ------------------------------------------------------------------------
    // Q3: HAVING Clause (Users with At Least 2 High/Critical Risk Exposures)
    // ------------------------------------------------------------------------
    const q3Res = await query(`
      SELECT
        COUNT(*)::int AS users_count_with_multiple_high_critical_exposures,
        COALESCE(AVG(high_crit_exposures), 0.0)::numeric(10, 1) AS avg_high_crit_exposures_per_user,
        COALESCE(MAX(high_crit_exposures), 0)::int AS max_high_crit_exposures_single_user
      FROM (
        SELECT
          i.user_id,
          COUNT(e.exposure_id) AS high_crit_exposures
        FROM identities i
        JOIN exposures e ON i.identity_id = e.identity_id
        WHERE e.risk_score >= 51
        GROUP BY i.user_id
        HAVING COUNT(e.exposure_id) >= 2
      ) user_aggregates;
    `);

    // ------------------------------------------------------------------------
    // Q4: Correlated / Non-Correlated Subquery (Exposures Above Global Average Risk)
    // ------------------------------------------------------------------------
    const q4Res = await query(`
      SELECT
        e.exposure_id,
        b.breach_name,
        b.severity,
        e.risk_score,
        (SELECT ROUND(AVG(risk_score), 1) FROM exposures) AS global_average_risk,
        ROUND(e.risk_score - (SELECT AVG(risk_score) FROM exposures), 1) AS points_above_average
      FROM exposures e
      JOIN breaches b ON e.breach_id = b.breach_id
      WHERE e.risk_score > (
        SELECT AVG(risk_score) FROM exposures
      )
      ORDER BY e.risk_score DESC
      LIMIT 10;
    `);

    // ------------------------------------------------------------------------
    // Q5: Aggregate with Multi-Table JOIN (Risk Profile Per Data Type)
    // ------------------------------------------------------------------------
    const q5Res = await query(`
      SELECT
        dt.data_type_id,
        dt.name AS data_type_name,
        dt.weight AS assigned_weight,
        COUNT(edt.exposure_id)::int AS occurrences_in_exposures,
        COALESCE(ROUND(AVG(e.risk_score), 1), 0.0) AS average_exposure_risk
      FROM data_types dt
      LEFT JOIN exposure_data_types edt ON dt.data_type_id = edt.data_type_id
      LEFT JOIN exposures e ON edt.exposure_id = e.exposure_id
      GROUP BY dt.data_type_id, dt.name, dt.weight
      ORDER BY occurrences_in_exposures DESC, dt.weight DESC;
    `);

    // ------------------------------------------------------------------------
    // Q6: NOT EXISTS Clause (Verified Identities Never Scanned)
    // ------------------------------------------------------------------------
    const q6Res = await query(`
      SELECT
        i.identity_id,
        i.identity_type,
        i.verified_at,
        i.created_at
      FROM identities i
      WHERE i.verified = true
        AND NOT EXISTS (
          SELECT 1
          FROM scan_requests sr
          WHERE sr.identity_id = i.identity_id
        )
      ORDER BY i.created_at ASC;
    `);

    // ------------------------------------------------------------------------
    // Q7: MongoDB Aggregation Pipeline on audit_logs
    // ------------------------------------------------------------------------
    const q7EventsPerDay = await getEventsPerTypePerDay(mongoDb);
    const q7TopPlaybooks = await getMostRecommendedPlaybooks(mongoDb, 5);

    return NextResponse.json({
      q2_breach_summary: q2Res.rows,
      q3_having_high_critical: q3Res.rows[0],
      q4_above_average: q4Res.rows,
      q5_data_types: q5Res.rows,
      q6_unscanned_verified: q6Res.rows,
      q7_mongo_pipeline: {
        events_per_day: q7EventsPerDay,
        top_recommended_playbooks: q7TopPlaybooks,
      },
    });
  } catch (err: any) {
    console.error('Error generating analytics:', err);
    return NextResponse.json({ error: 'Failed to generate system analytics' }, { status: 500 });
  }
}
