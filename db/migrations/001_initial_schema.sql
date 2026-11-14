-- ============================================================================
-- Migration 001: Initial Relational Schema
-- Database: PostgreSQL 16
-- Project: Ledger of Loss (DBMS Level 3 Experiential Learning)
-- ============================================================================

-- 1. Users Table (Core entity)
-- Note: 'role' column is intentionally added via ALTER TABLE in migration 003
-- to showcase real-world schema migration as required by project criteria.
CREATE TABLE IF NOT EXISTS users (
  user_id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE CONSTRAINT check_user_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Identities Table (User-owned digital identifiers: email or username)
CREATE TABLE IF NOT EXISTS identities (
  identity_id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  identity_value text NOT NULL,
  identity_type text NOT NULL CONSTRAINT check_identity_type CHECK (
    identity_type IN ('email', 'username')
  ),
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_identity UNIQUE (user_id, identity_value),
  CONSTRAINT check_verified_consistency CHECK (
    NOT verified OR verified_at IS NOT NULL
  )
);

-- 3. Breaches Table (Curated catalog of security incidents)
CREATE TABLE IF NOT EXISTS breaches (
  breach_id serial PRIMARY KEY,
  breach_name text NOT NULL UNIQUE,
  source_name text NOT NULL,
  breach_date date NOT NULL CONSTRAINT check_breach_date_past CHECK (
    breach_date <= CURRENT_DATE
  ),
  severity text NOT NULL CONSTRAINT check_breach_severity CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  description text
);

-- 4. Data Types Table (Seeded weights for sensitive exposed attributes)
CREATE TABLE IF NOT EXISTS data_types (
  data_type_id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  weight integer NOT NULL CONSTRAINT check_data_type_weight CHECK (
    weight BETWEEN 0 AND 40
  )
);

-- 5. Scan Requests Table (Audit trail of execution requests)
CREATE TABLE IF NOT EXISTS scan_requests (
  scan_id serial PRIMARY KEY,
  identity_id integer NOT NULL REFERENCES identities(identity_id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CONSTRAINT check_scan_status CHECK (
    status IN ('pending', 'completed', 'failed')
  ),
  exposures_found integer NOT NULL DEFAULT 0,
  CONSTRAINT check_scan_completion_chronology CHECK (
    completed_at IS NULL OR completed_at >= started_at
  )
);

-- 6. Exposures Table (Identities found in specific breaches)
CREATE TABLE IF NOT EXISTS exposures (
  exposure_id serial PRIMARY KEY,
  identity_id integer NOT NULL REFERENCES identities(identity_id) ON DELETE CASCADE,
  breach_id integer NOT NULL REFERENCES breaches(breach_id),
  scan_id integer REFERENCES scan_requests(scan_id) ON DELETE SET NULL,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  risk_score integer NOT NULL DEFAULT 0 CONSTRAINT check_exposure_risk_bounds CHECK (
    risk_score BETWEEN 0 AND 100
  ),
  CONSTRAINT unique_identity_breach UNIQUE (identity_id, breach_id)
);

-- 7. Exposure Data Types Table (Many-to-many bridge: exposure to sensitive fields)
CREATE TABLE IF NOT EXISTS exposure_data_types (
  exposure_id integer NOT NULL REFERENCES exposures(exposure_id) ON DELETE CASCADE,
  data_type_id integer NOT NULL REFERENCES data_types(data_type_id),
  PRIMARY KEY (exposure_id, data_type_id)
);

-- 8. Recovery Actions Table (Interactive remediation checklist)
-- Note: playbook_ref is a MongoDB ObjectId stored as text (cross-database reference)
CREATE TABLE IF NOT EXISTS recovery_actions (
  action_id serial PRIMARY KEY,
  exposure_id integer NOT NULL REFERENCES exposures(exposure_id) ON DELETE CASCADE,
  playbook_ref text NOT NULL,
  title text NOT NULL,
  priority integer NOT NULL CONSTRAINT check_action_priority CHECK (
    priority BETWEEN 1 AND 5
  ),
  status text NOT NULL DEFAULT 'pending' CONSTRAINT check_action_status CHECK (
    status IN ('pending', 'completed', 'dismissed')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT check_action_completion_status CHECK (
    status <> 'completed' OR completed_at IS NOT NULL
  ),
  CONSTRAINT unique_exposure_playbook UNIQUE (exposure_id, playbook_ref)
);

-- 9. User Risk Summary Table (Maintained exclusively via function and trigger T2)
CREATE TABLE IF NOT EXISTS user_risk_summary (
  user_id integer PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  total_exposures integer NOT NULL DEFAULT 0,
  high_count integer NOT NULL DEFAULT 0,
  critical_count integer NOT NULL DEFAULT 0,
  overall_score integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
