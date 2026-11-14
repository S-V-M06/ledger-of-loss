-- ============================================================================
-- Q3: HAVING Clause (Users with At Least 2 High/Critical Risk Exposures)
-- Advanced Concept: Aggregation Filter via HAVING (Privacy-preserving aggregate)
-- ============================================================================

-- Privacy Rule: Returns aggregate metrics only, never user personal identifiers.
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
  WHERE e.risk_score >= 51  -- High (51-75) and Critical (76-100)
  GROUP BY i.user_id
  HAVING COUNT(e.exposure_id) >= 2
) user_aggregates;
