-- ============================================================================
-- Q1: Complex Multi-Table JOIN & Aggregation (user_security_dashboard view)
-- Advanced Concept: SQL View, string_agg, Subquery Aggregations
-- ============================================================================

SELECT
  i.user_id,
  i.identity_id,
  i.identity_value,
  e.exposure_id,
  b.breach_name,
  b.breach_date,
  b.severity,
  e.risk_score,
  risk_level(e.risk_score) AS risk_level,
  e.discovered_at,
  COALESCE(
    (
      SELECT string_agg(dt.name, ', ' ORDER BY dt.weight DESC)
      FROM exposure_data_types edt
      JOIN data_types dt ON edt.data_type_id = dt.data_type_id
      WHERE edt.exposure_id = e.exposure_id
    ),
    'none'
  ) AS exposed_data_types,
  (
    SELECT COUNT(*)::int
    FROM recovery_actions ra
    WHERE ra.exposure_id = e.exposure_id
      AND ra.status = 'pending'
  ) AS pending_recovery_actions_count
FROM exposures e
JOIN identities i ON e.identity_id = i.identity_id
JOIN breaches b ON e.breach_id = b.breach_id
ORDER BY e.risk_score DESC;
