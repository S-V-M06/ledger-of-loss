-- ============================================================================
-- Migration 003: DDL Showcase - Evolutionary Schema Alteration
-- Database: PostgreSQL 16
-- Project: Ledger of Loss
-- ============================================================================

-- Project Requirement Showcase:
-- Demonstrates schema evolution via ALTER TABLE without data loss.

-- 1. Add role column to users table with default value 'user'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- 2. Add CHECK constraint on role to restrict allowed values to 'user' and 'admin'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_user_role'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 3. Add index on users(role) to optimize administrative role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
