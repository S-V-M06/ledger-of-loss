-- ============================================================================
-- SQL Seed Data: Master Reference Data (Data Types & Curated Breaches)
-- Database: PostgreSQL 16
-- Project: Ledger of Loss
-- ============================================================================

-- 1. Seed Required Data Types and Weights
INSERT INTO data_types (name, weight) VALUES
  ('password', 30),
  ('financial', 25),
  ('government_id', 25),
  ('security_questions', 15),
  ('phone', 10),
  ('address', 10),
  ('date_of_birth', 10),
  ('email', 10),
  ('username', 5),
  ('ip_address', 5)
ON CONFLICT (name) DO UPDATE SET weight = EXCLUDED.weight;

-- 2. Seed 10 Fictional Breaches (Diverse Severities & Chronology)
-- Note: 'CURRENT_DATE - INTERVAL ...' ensures dynamic relative dates
INSERT INTO breaches (breach_name, source_name, breach_date, severity, description) VALUES
  (
    'Apex Health Portal Incident',
    'HealthNet Labs',
    CURRENT_DATE - INTERVAL '3 months',
    'critical',
    'Exfiltration of patient account profiles, hashed credentials, and insurance government identifiers.'
  ),
  (
    'CloudScale Nexus Dump',
    'CloudScale Tech',
    CURRENT_DATE - INTERVAL '7 months',
    'high',
    'Unauthorized dump of user credentials, API keys, and corporate contact phone numbers.'
  ),
  (
    'Metro Transit Card System',
    'Urban Transit Authority',
    CURRENT_DATE - INTERVAL '11 months',
    'medium',
    'Commuter portal database compromised containing passenger names, emails, and partial payment history.'
  ),
  (
    'VoltUtility Smart Meter Leak',
    'Volt Regional Energy',
    CURRENT_DATE - INTERVAL '14 months',
    'low',
    'Misconfigured diagnostic bucket exposing customer email addresses and public IP logs.'
  ),
  (
    'FinSecure Credit Archive',
    'FinSecure Banking Group',
    CURRENT_DATE - INTERVAL '28 months',
    'critical',
    'Legacy archival server breach involving sensitive financial details, security questions, and usernames.'
  ),
  (
    'GigaShop Global Exposure',
    'GigaShop E-Commerce',
    CURRENT_DATE - INTERVAL '34 months',
    'high',
    'Database snapshot leaked online containing shipping addresses, telephone numbers, and email accounts.'
  ),
  (
    'StreamWave Media Forum',
    'StreamWave Entertainment',
    CURRENT_DATE - INTERVAL '40 months',
    'medium',
    'Discussion forum bulletin board dump leaking legacy MD5 password hashes and forum handles.'
  ),
  (
    'OmniTravel Bookings Archive',
    'OmniTravel Agency',
    CURRENT_DATE - INTERVAL '46 months',
    'low',
    'Historical marketing list containing basic usernames, email records, and travel preference tags.'
  ),
  (
    'CyberForums Darknet Repository',
    'Underground Threat Intel',
    CURRENT_DATE - INTERVAL '2 months',
    'critical',
    'Aggregated credential stuffing compilation containing plaintext passwords, email combos, and personal answers.'
  ),
  (
    'NexusPlay Gaming Network',
    'Nexus Studios',
    CURRENT_DATE - INTERVAL '5 months',
    'medium',
    'Player authentication server unauthorized access affecting gamer usernames, email addresses, and game logs.'
  )
ON CONFLICT (breach_name) DO UPDATE SET
  source_name = EXCLUDED.source_name,
  breach_date = EXCLUDED.breach_date,
  severity = EXCLUDED.severity,
  description = EXCLUDED.description;
