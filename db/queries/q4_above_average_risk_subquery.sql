-- ============================================================================
-- Q4: Correlated / Non-Correlated Subquery (Exposures Above Global Average Risk)
-- Advanced Concept: Scalar Subquery in WHERE & SELECT Clauses
-- ============================================================================

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
ORDER BY e.risk_score DESC;
