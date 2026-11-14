-- ============================================================================
-- Q2: GROUP BY + ORDER BY (Exposures & Average Risk Per Breach)
-- Advanced Concept: Aggregation Functions (COUNT, AVG, ROUND), GROUP BY, ORDER BY
-- ============================================================================

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
