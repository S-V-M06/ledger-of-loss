-- ============================================================================
-- Migration 002: Advanced SQL Features (Indexes, Functions, Triggers, Views)
-- Database: PostgreSQL 16
-- Project: Ledger of Loss
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Performance Indexes & Partial Index
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_identities_user_id ON identities(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_requests_identity_id ON scan_requests(identity_id);
CREATE INDEX IF NOT EXISTS idx_exposures_identity_id ON exposures(identity_id);
CREATE INDEX IF NOT EXISTS idx_exposures_breach_id ON exposures(breach_id);
CREATE INDEX IF NOT EXISTS idx_exposures_risk_score ON exposures(risk_score);

-- Partial index for fast query of open/pending remediation tasks
CREATE INDEX IF NOT EXISTS idx_recovery_actions_pending ON recovery_actions(exposure_id) 
WHERE status = 'pending';

-- ----------------------------------------------------------------------------
-- 2. Stored Function: risk_level(p_score int)
-- Translates numerical risk score into categorized severity band
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION risk_level(p_score integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_score IS NULL THEN
    RETURN 'low';
  ELSIF p_score <= 25 THEN
    RETURN 'low';
  ELSIF p_score <= 50 THEN
    RETURN 'medium';
  ELSIF p_score <= 75 THEN
    RETURN 'high';
  ELSE
    RETURN 'critical';
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Stored Function: calculate_exposure_risk(p_exposure_id int)
-- Deterministic risk formula:
-- score = LEAST(100, severity_base + SUM(weights) + recency_bonus)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_exposure_risk(p_exposure_id integer)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_severity text;
  v_breach_date date;
  v_severity_base integer := 0;
  v_recency_bonus integer := 0;
  v_data_type_weight_sum integer := 0;
  v_total_score integer := 0;
BEGIN
  -- 1. Retrieve breach severity and breach date
  SELECT b.severity, b.breach_date
  INTO v_severity, v_breach_date
  FROM exposures e
  JOIN breaches b ON e.breach_id = b.breach_id
  WHERE e.exposure_id = p_exposure_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- 2. Compute severity base points
  -- low = 10, medium = 20, high = 30, critical = 40
  CASE v_severity
    WHEN 'low' THEN v_severity_base := 10;
    WHEN 'medium' THEN v_severity_base := 20;
    WHEN 'high' THEN v_severity_base := 30;
    WHEN 'critical' THEN v_severity_base := 40;
    ELSE v_severity_base := 10;
  END CASE;

  -- 3. Compute recency bonus: 10 if breach occurred within the last 24 months
  IF v_breach_date >= CURRENT_DATE - INTERVAL '24 months' THEN
    v_recency_bonus := 10;
  ELSE
    v_recency_bonus := 0;
  END IF;

  -- 4. Compute sum of weights of all associated data types
  SELECT COALESCE(SUM(dt.weight), 0)
  INTO v_data_type_weight_sum
  FROM exposure_data_types edt
  JOIN data_types dt ON edt.data_type_id = dt.data_type_id
  WHERE edt.exposure_id = p_exposure_id;

  -- 5. Calculate bounded score (capped at 100)
  v_total_score := LEAST(100, v_severity_base + v_data_type_weight_sum + v_recency_bonus);

  RETURN v_total_score;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Stored Function: refresh_user_risk_summary(p_user_id int)
-- Recomputes aggregated counts and overall risk score, then upserts user_risk_summary
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_user_risk_summary(p_user_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_exposures integer := 0;
  v_high_count integer := 0;
  v_critical_count integer := 0;
  v_overall_score integer := 0;
BEGIN
  -- Aggregate metrics across all exposures owned by this user
  SELECT
    COUNT(e.exposure_id),
    COUNT(e.exposure_id) FILTER (WHERE e.risk_score BETWEEN 51 AND 75),
    COUNT(e.exposure_id) FILTER (WHERE e.risk_score >= 76),
    COALESCE(MAX(e.risk_score), 0)
  INTO
    v_total_exposures,
    v_high_count,
    v_critical_count,
    v_overall_score
  FROM identities i
  JOIN exposures e ON i.identity_id = e.identity_id
  WHERE i.user_id = p_user_id;

  -- Upsert aggregated summary row
  INSERT INTO user_risk_summary (
    user_id,
    total_exposures,
    high_count,
    critical_count,
    overall_score,
    updated_at
  )
  VALUES (
    p_user_id,
    v_total_exposures,
    v_high_count,
    v_critical_count,
    v_overall_score,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_exposures = EXCLUDED.total_exposures,
    high_count = EXCLUDED.high_count,
    critical_count = EXCLUDED.critical_count,
    overall_score = EXCLUDED.overall_score,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Trigger T1: Guard against scans on unverified identities
-- Enforces integrity at the database layer before any scan row can be created
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_identity_verified_before_scan()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_verified boolean;
BEGIN
  SELECT verified INTO v_verified
  FROM identities
  WHERE identity_id = NEW.identity_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot initiate scan: Identity % does not exist', NEW.identity_id
      USING ERRCODE = '23503';
  END IF;

  IF NOT v_verified THEN
    RAISE EXCEPTION 'Cannot initiate scan: Identity % is not verified by its owner', NEW.identity_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_scan_requests_verified ON scan_requests;
CREATE TRIGGER trg_scan_requests_verified
BEFORE INSERT ON scan_requests
FOR EACH ROW
EXECUTE FUNCTION fn_check_identity_verified_before_scan();

-- ----------------------------------------------------------------------------
-- 6. Trigger T2: Auto-refresh user risk summary upon exposure risk score update
-- Fires AFTER UPDATE OF risk_score because risk depends on exposure_data_types
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_refresh_risk_summary_on_exposure_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id integer;
BEGIN
  -- Obtain the owner of this identity
  SELECT user_id INTO v_user_id
  FROM identities
  WHERE identity_id = NEW.identity_id;

  IF FOUND AND v_user_id IS NOT NULL THEN
    PERFORM refresh_user_risk_summary(v_user_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exposures_risk_score_update ON exposures;
CREATE TRIGGER trg_exposures_risk_score_update
AFTER UPDATE OF risk_score ON exposures
FOR EACH ROW
EXECUTE FUNCTION fn_refresh_risk_summary_on_exposure_update();

-- ----------------------------------------------------------------------------
-- 7. View: user_security_dashboard
-- Consolidates exposures, breach details, aggregated data types, and action count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW user_security_dashboard AS
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
JOIN breaches b ON e.breach_id = b.breach_id;
