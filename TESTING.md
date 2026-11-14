# Ledger of Loss: Comprehensive Test Suite & Results Specification

This document details the test scenarios, expected database behaviors, actual outcomes, and verification results across all layers of the **Ledger of Loss** system.

---

## 1. Automated Test Summary Matrix

| Category | Suite File | Total Tests | Pass | Fail | Execution Command |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **PostgreSQL Integrity** | `tests/db/run_db_tests.ts` | 15 | 15 | 0 | `npx tsx tests/db/run_db_tests.ts` |
| **MongoDB Validators** | `tests/db/test_mongo_validators.ts` | 13 | 13 | 0 | `npx tsx tests/db/test_mongo_validators.ts` |
| **Auth & Cryptography** | `tests/auth/test_auth_rbac.ts` | 5 | 5 | 0 | `npx tsx tests/auth/test_auth_rbac.ts` |
| **ACID Scan & Rollback**| `tests/scans/test_scan_transaction.ts` | 4 | 4 | 0 | `npx tsx tests/scans/test_scan_transaction.ts` |
| **All Test Suites** | `tests/run-all-tests.ts` | **37** | **37** | **0** | `npm test` |

---

## 2. PostgreSQL Relational Integrity & Advanced Features (15 Test Cases)

| Test ID | Component / Rule | Description & Test Action | Expected Database Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | `check_user_email_format` | Insert user with malformed email (`'invalid-email'`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-02** | `users(email)` UNIQUE | Insert user with an already registered email | Database aborts with `unique_violation` (23505) | Rejection verified with code `23505` | ✅ PASS |
| **TC-03** | `check_user_role` | Insert user with unauthorized role (`'superadmin'`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-04** | `check_identity_type` | Insert identity with illegal type (`'phone'`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-05** | `check_verified_consistency` | Set `verified = true` with `verified_at = NULL` | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-06** | `identities(user_id)` FK | Insert identity pointing to non-existent `user_id` | Database aborts with `foreign_key_violation` (23503) | Rejection verified with code `23503` | ✅ PASS |
| **TC-07** | `check_breach_date_past` | Insert breach with date in the future (`CURRENT_DATE + 5 days`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-08** | `check_breach_severity` | Insert breach with invalid severity (`'disastrous'`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-09** | `check_data_type_weight` | Insert data type with weight > 40 (`weight: 65`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-10** | `check_exposure_risk_bounds` | Insert exposure with risk score > 100 (`risk_score: 105`) | Database aborts with `check_violation` (23514) | Rejection verified with code `23514` | ✅ PASS |
| **TC-11** | `unique_identity_breach` | Insert duplicate exposure for same identity and breach | Database aborts with `unique_violation` (23505) | Rejection verified with code `23505` | ✅ PASS |
| **TC-12** | **Trigger T1** | Attempt to insert scan request on unverified identity | Trigger raises exception (`P0001`) preventing insert | Exception raised and insert aborted | ✅ PASS |
| **TC-13** | **Stored Function** | Execute `calculate_exposure_risk` on high-risk breach | Score calculated = Severity (30) + Recency (10) + Fields (40) = 80 | Computed exact score 80 & critical tier | ✅ PASS |
| **TC-14** | **Trigger T2** | Update `risk_score` on exposure | Auto-updates `user_risk_summary` counts & overall score | Synchronized in `user_risk_summary` | ✅ PASS |
| **TC-15** | **Index Optimization** | Run `EXPLAIN` query on `idx_exposures_risk_score` | Index execution plan produced without seq scan errors | Valid index scan plan verified | ✅ PASS |

---

## 3. MongoDB `$jsonSchema` Validation & Index Tests (13 Test Cases)

| Test ID | Collection | Description & Malformed Document | Expected NoSQL Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-M01** | `breach_records` | Insert record with non-64 hex hash (`'invalid-hash'`) | MongoDB strictly rejects with DocumentValidationFailure (121) | Rejected with error code `121` | ✅ PASS |
| **TC-M02** | `breach_records` | Insert record with unsupported type (`'telephone'`) | Rejection due to enum violation | Rejected with error code `121` | ✅ PASS |
| **TC-M03** | `breach_records` | Insert record with empty `exposed_fields` array | Rejection due to `minItems: 1` violation | Rejected with error code `121` | ✅ PASS |
| **TC-M04** | `breach_records` | Inject unpermitted root field | Rejection due to `additionalProperties: false` | Rejected with error code `121` | ✅ PASS |
| **TC-M05** | `guidance_playbooks` | Insert playbook with `priority = 6` | Rejection due to `maximum: 5` violation | Rejected with error code `121` | ✅ PASS |
| **TC-M06** | `guidance_playbooks` | Insert playbook with `min_severity_rank = 5` | Rejection due to `maximum: 4` violation | Rejected with error code `121` | ✅ PASS |
| **TC-M07** | `guidance_playbooks` | Insert playbook with empty `steps` array | Rejection due to `minItems: 1` violation | Rejected with error code `121` | ✅ PASS |
| **TC-M08** | `guidance_playbooks` | Insert playbook missing required `title` | Rejection due to missing required property | Rejected with error code `121` | ✅ PASS |
| **TC-M09** | `audit_logs` | Insert audit log with illegal `event_type` | Rejection due to event enum restriction | Rejected with error code `121` | ✅ PASS |
| **TC-M10** | `audit_logs` | Insert audit log with invalid `role` (`'root'`) | Rejection due to role enum restriction | Rejected with error code `121` | ✅ PASS |
| **TC-M11** | `audit_logs` | Insert audit log missing timestamp `ts` | Rejection due to missing required field | Rejected with error code `121` | ✅ PASS |
| **TC-M12** | `guidance_playbooks` | Text search with `$text: { $search: "password" }` | Returns ranked matches sorted by `textScore` | Relevance-weighted matches returned | ✅ PASS |
| **TC-M13** | `guidance_playbooks` | Multikey query on `applies_to.data_types` | Returns documents matching array elements | Matched playbooks returned | ✅ PASS |

---

## 4. Authentication, Sessions & RBAC Tests (5 Test Cases)

| Test ID | Target Component | Description & Test Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-A01** | `bcryptjs` | Hash password with salt rounds 10 | Valid bcrypt hash starting with `$2`, matches plaintext | Salt cost confirmed; matches verified | ✅ PASS |
| **TC-A02** | `jose` (JWT) | Sign session payload with HS256 | Valid three-segment cryptographically signed token | Structured JWT generated | ✅ PASS |
| **TC-A03** | `jose` (JWT) | Verify token and decode user claims | Decodes `userId`, `email`, `role` without tampering | Decoded payload matched exactly | ✅ PASS |
| **TC-A04** | `jose` (JWT) | Attempt verification of tampered token signature | Returns `null` / strictly rejects verification | Tampered token rejected cleanly | ✅ PASS |
| **TC-A05** | RBAC Claims | Verify admin claim encoding | Token securely distinguishes admin role claims | Admin claim verified | ✅ PASS |

---

## 5. ACID Scan Transaction & Forced Rollback Tests (4 Test Cases)

| Test ID | Transaction Stage | Description & Test Action | Expected Database Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-S01** | Risk Formula | High severity breach with multiple heavy data types | Calculated score capped at upper limit of 100 | Bounded at exact 100 | ✅ PASS |
| **TC-S02** | Trigger T1 | Attempt scan insert on unverified identity | Blocked before write by Trigger T1 (`P0001`) | Trigger blocked insert | ✅ PASS |
| **TC-S03** | Trigger T2 | Update exposure risk score | Automatically updates `user_risk_summary` | Summary row refreshed | ✅ PASS |
| **TC-S04** | **Forced Rollback** | Injected failure mid-transaction (invalid data type) | SQL transaction issues `ROLLBACK`; 0 orphan rows persist | 0 scan rows and 0 exposures persisted | ✅ PASS |

---

## 6. Manual Verification & User Interface Testing Matrix

| Page Route | Test Action | Expected User Experience | Result |
| :--- | :--- | :--- | :---: |
| `/login` | Click "Fill Demo Admin" & Submit | Logs in and redirects to `/admin/analytics` with admin navbar | PASS |
| `/login` | Click "Fill Demo User" & Submit | Logs in and redirects to `/dashboard` with user navbar | PASS |
| `/admin/*` | Log in as regular user (`divya@example.com`) and visit `/admin/analytics` | `middleware.ts` intercepts and redirects back to `/dashboard` | PASS |
| `/identities` | Add identity `test@example.com` | Adds row with "Unverified" status; "Scan Now" button is guarded | PASS |
| `/identities` | Click "Confirm I own this" | Status updates to "Verified"; "Scan Now" button becomes active | PASS |
| `/identities` | Click "Scan Now" | Executes ACID scan, matches breaches, and creates exposures | PASS |
| `/dashboard` | Filter by "Critical" and search "password" | Table updates dynamically via `user_security_dashboard` view | PASS |
| `/actions` | Tick recovery action checkbox | Updates status to "completed" and logs `action_completed` audit event | PASS |
| `/guidance` | Search "phishing" or click `#mfa` tag | Ranks matching playbooks via MongoDB text index with steps | PASS |
| `/admin/breaches` | Add new breach | Demonstrates cross-database compensating transaction | PASS |
| `/admin/audit` | View audit trail and inspect JSON payload | Shows chronological tamper-evident logs | PASS |
