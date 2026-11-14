-- ============================================================================
-- Teardown Script: Complete Removal of Ledger of Loss Relational Schema
-- Database: PostgreSQL 16
-- ============================================================================

-- 1. Drop Views
DROP VIEW IF EXISTS user_security_dashboard CASCADE;

-- 2. Drop Triggers
DROP TRIGGER IF EXISTS trg_scan_requests_verified ON scan_requests;
DROP TRIGGER IF EXISTS trg_exposures_risk_score_update ON exposures;

-- 3. Drop Trigger Functions and Stored Procedures
DROP FUNCTION IF EXISTS fn_check_identity_verified_before_scan() CASCADE;
DROP FUNCTION IF EXISTS fn_refresh_risk_summary_on_exposure_update() CASCADE;
DROP FUNCTION IF EXISTS refresh_user_risk_summary(integer) CASCADE;
DROP FUNCTION IF EXISTS calculate_exposure_risk(integer) CASCADE;
DROP FUNCTION IF EXISTS risk_level(integer) CASCADE;

-- 4. Drop Tables in Reverse Dependency Order
DROP TABLE IF EXISTS recovery_actions CASCADE;
DROP TABLE IF EXISTS exposure_data_types CASCADE;
DROP TABLE IF EXISTS exposures CASCADE;
DROP TABLE IF EXISTS scan_requests CASCADE;
DROP TABLE IF EXISTS user_risk_summary CASCADE;
DROP TABLE IF EXISTS identities CASCADE;
DROP TABLE IF EXISTS breaches CASCADE;
DROP TABLE IF EXISTS data_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;
