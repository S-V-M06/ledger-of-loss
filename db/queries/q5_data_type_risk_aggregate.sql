-- ============================================================================
-- Q5: Aggregate with Multi-Table JOIN (Risk Profile Per Data Type)
-- Advanced Concept: Multi-Table Aggregation across Bridge Table
-- ============================================================================

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
