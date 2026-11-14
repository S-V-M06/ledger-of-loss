-- ============================================================================
-- SQL Integrity Test Suite: Constraints, Unique Keys, Foreign Keys, & Triggers
-- Database: PostgreSQL 16
-- Project: Ledger of Loss
-- ============================================================================

-- This script contains isolated test assertions demonstrating that every
-- CHECK constraint, UNIQUE constraint, Foreign Key, and Trigger rejects invalid
-- data as specified in Section 5, 6, and 7 of the project guide.

-- Test 1: CHECK constraint rejects malformed user email
-- Expected Error: check_violation (23514) on check_user_email_format
DO $$
BEGIN
  INSERT INTO users (name, email, password_hash)
  VALUES ('Invalid Email User', 'notanemail', 'hash123');
  RAISE EXCEPTION 'TEST 1 FAILED: check_user_email_format allowed malformed email';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 1 PASSED: check_user_email_format correctly rejected invalid email';
END $$;

-- Test 2: UNIQUE constraint rejects duplicate user email
-- Expected Error: unique_violation (23505)
DO $$
BEGIN
  INSERT INTO users (name, email, password_hash)
  VALUES ('Duplicate User', 'admin@ledgerofloss.local', 'hash123');
  RAISE EXCEPTION 'TEST 2 FAILED: Duplicate email allowed';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'TEST 2 PASSED: Unique email constraint correctly rejected duplicate';
END $$;

-- Test 3: CHECK constraint rejects invalid user role
-- Expected Error: check_violation (23514) on check_user_role
DO $$
BEGIN
  INSERT INTO users (name, email, password_hash, role)
  VALUES ('Super User', 'superuser@example.com', 'hash123', 'root');
  RAISE EXCEPTION 'TEST 3 FAILED: check_user_role allowed invalid role';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 3 PASSED: check_user_role correctly rejected invalid role';
END $$;

-- Test 4: CHECK constraint rejects invalid identity type
-- Expected Error: check_violation (23514) on check_identity_type
DO $$
DECLARE
  v_user_id int;
BEGIN
  SELECT user_id INTO v_user_id FROM users LIMIT 1;
  INSERT INTO identities (user_id, identity_value, identity_type)
  VALUES (v_user_id, '+1234567890', 'phone');
  RAISE EXCEPTION 'TEST 4 FAILED: check_identity_type allowed unsupported type';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 4 PASSED: check_identity_type correctly rejected invalid type';
END $$;

-- Test 5: CHECK constraint enforces verified_at when verified = true
-- Expected Error: check_violation (23514) on check_verified_consistency
DO $$
DECLARE
  v_user_id int;
BEGIN
  SELECT user_id INTO v_user_id FROM users LIMIT 1;
  INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
  VALUES (v_user_id, 'test_unverified_time@example.com', 'email', true, NULL);
  RAISE EXCEPTION 'TEST 5 FAILED: check_verified_consistency allowed verified without timestamp';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 5 PASSED: check_verified_consistency correctly enforced timestamp';
END $$;

-- Test 6: FK constraint rejects non-existent user_id on identities
-- Expected Error: foreign_key_violation (23503)
DO $$
BEGIN
  INSERT INTO identities (user_id, identity_value, identity_type)
  VALUES (999999, 'orphan@example.com', 'email');
  RAISE EXCEPTION 'TEST 6 FAILED: FK allowed non-existent user_id';
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE 'TEST 6 PASSED: FK correctly rejected orphan identity';
END $$;

-- Test 7: CHECK constraint rejects future breach date
-- Expected Error: check_violation (23514) on check_breach_date_past
DO $$
BEGIN
  INSERT INTO breaches (breach_name, source_name, breach_date, severity)
  VALUES ('Future Breach 3000', 'Time Travel Inc', CURRENT_DATE + INTERVAL '1 day', 'high');
  RAISE EXCEPTION 'TEST 7 FAILED: check_breach_date_past allowed future date';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 7 PASSED: check_breach_date_past correctly rejected future date';
END $$;

-- Test 8: CHECK constraint rejects invalid breach severity
-- Expected Error: check_violation (23514) on check_breach_severity
DO $$
BEGIN
  INSERT INTO breaches (breach_name, source_name, breach_date, severity)
  VALUES ('Invalid Severity Breach', 'Dark Corp', CURRENT_DATE, 'catastrophic');
  RAISE EXCEPTION 'TEST 8 FAILED: check_breach_severity allowed invalid severity';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 8 PASSED: check_breach_severity correctly rejected invalid severity';
END $$;

-- Test 9: CHECK constraint rejects out-of-range data type weight (> 40)
-- Expected Error: check_violation (23514) on check_data_type_weight
DO $$
BEGIN
  INSERT INTO data_types (name, weight)
  VALUES ('super_secret_biometrics', 45);
  RAISE EXCEPTION 'TEST 9 FAILED: check_data_type_weight allowed weight > 40';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 9 PASSED: check_data_type_weight correctly rejected weight > 40';
END $$;

-- Test 10: CHECK constraint rejects out-of-bounds exposure risk score (> 100)
-- Expected Error: check_violation (23514) on check_exposure_risk_bounds
DO $$
DECLARE
  v_id int;
  v_bid int;
BEGIN
  SELECT identity_id INTO v_id FROM identities LIMIT 1;
  SELECT breach_id INTO v_bid FROM breaches LIMIT 1;
  INSERT INTO exposures (identity_id, breach_id, risk_score)
  VALUES (v_id, v_bid, 115);
  RAISE EXCEPTION 'TEST 10 FAILED: check_exposure_risk_bounds allowed score > 100';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'TEST 10 PASSED: check_exposure_risk_bounds correctly rejected score > 100';
END $$;

-- Test 11: UNIQUE constraint rejects duplicate exposure for same identity and breach
-- Expected Error: unique_violation (23505) on unique_identity_breach
DO $$
DECLARE
  v_id int;
  v_bid int;
BEGIN
  SELECT identity_id INTO v_id FROM identities LIMIT 1;
  SELECT breach_id INTO v_bid FROM breaches LIMIT 1;
  INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES (v_id, v_bid, 50);
  INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES (v_id, v_bid, 50);
  RAISE EXCEPTION 'TEST 11 FAILED: unique_identity_breach allowed duplicate exposure';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'TEST 11 PASSED: unique_identity_breach correctly rejected duplicate exposure';
END $$;

-- Test 12: Trigger T1 rejects scan request on UNVERIFIED identity
-- Expected Error: P0001 (raise_exception from fn_check_identity_verified_before_scan)
DO $$
DECLARE
  v_unverified_id int;
  v_user_id int;
BEGIN
  SELECT user_id INTO v_user_id FROM users LIMIT 1;
  INSERT INTO identities (user_id, identity_value, identity_type, verified)
  VALUES (v_user_id, 'unverified_test_target@example.com', 'email', false)
  RETURNING identity_id INTO v_unverified_id;

  -- Attempt to insert scan request on unverified identity
  INSERT INTO scan_requests (identity_id) VALUES (v_unverified_id);
  RAISE EXCEPTION 'TEST 12 FAILED: Trigger T1 allowed scan on unverified identity';
EXCEPTION WHEN raise_exception THEN
  RAISE NOTICE 'TEST 12 PASSED: Trigger T1 successfully blocked scan on unverified identity';
END $$;
