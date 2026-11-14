-- ============================================================================
-- Migration 004: User Management Triggers (Creation & Deletion Cascades)
-- Database: PostgreSQL 16
-- Project: Ledger of Loss
-- ============================================================================

-- 1. Trigger T3: Auto-initialize user_risk_summary on user creation
CREATE OR REPLACE FUNCTION fn_init_user_risk_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_risk_summary (
    user_id,
    total_exposures,
    high_count,
    critical_count,
    overall_score,
    updated_at
  )
  VALUES (
    NEW.user_id,
    0,
    0,
    0,
    0,
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_init_summary ON users;
CREATE TRIGGER trg_user_init_summary
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION fn_init_user_risk_summary();

-- 2. Trigger T4: Audit Notice on user deletion
CREATE OR REPLACE FUNCTION fn_log_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE NOTICE 'AUDIT LOG: User [ID: %, Email: %] deleted. Cascading deletion to all identities, scans, exposures, and recovery actions.', OLD.user_id, OLD.email;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_user_deletion ON users;
CREATE TRIGGER trg_log_user_deletion
BEFORE DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_log_user_deletion();
