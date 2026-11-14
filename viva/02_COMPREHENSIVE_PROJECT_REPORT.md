# 02: Comprehensive Project Report & Schemas
## Problem Statement, Hybrid Architecture, ER Diagram, Relational Schema & BCNF Normalization

---

## 1. Problem Statement & Motivation

In the modern digital economy, over 15 billion credentials and sensitive personal identifiers have been compromised across corporate data breaches. Despite the severity of these exposures, existing breach lookup tools (such as HaveIBeenPwned) suffer from three critical architectural limitations:

- **1. Absence of Dynamic Risk Quantification:** Traditional tools treat all breaches equally, reporting a binary 'You were pwned' status without quantifying whether the breach leaked harmless usernames or catastrophic plaintext banking passwords and government identifiers.
- **2. Lack of Actionable Remediation Guidance:** Users receive alarmist breach notifications with zero actionable mitigation checklists tailored to the specific data classes compromised.
- **3. Single-Vector Analysis:** Systems fail to connect cross-domain risks (e.g. how a stolen phone number enables SIM-swapping to bypass bank SMS two-factor authentication).

Ledger of Loss addresses these challenges by delivering a unified, polyglot-persisted platform that quantifies exposure risk through a deterministic scoring formula, tracks interactive remediation lifecycles, and maintains an unalterable security audit log.

---

## 2. System Architecture: Why Polyglot Persistence?

| Architectural Dimension | PostgreSQL 16 (Relational Core) | MongoDB 7 (Document Store) |
| :--- | :--- | :--- |
| **Primary Workload** | Transactional, highly structured, ACID-critical data. | Polymorphic, semi-structured, document-centric data. |
| **Managed Entities** | Users, Identities, Scan Requests, Exposures, Remediation status, Aggregated Risk Summaries. | Breach Incident Catalog, Unstructured Forensics, Remediation Playbooks, Immutable Audit Logs. |
| **Consistency Model** | Strict ACID (Serializability, Row-level locking, foreign key integrity). | Document-level atomicity, BASE eventual consistency for telemetry. |
| **Schema Enforcement** | Declarative DDL, strict data types, CHECK, UNIQUE, and FOREIGN KEY constraints. | BSON `$jsonSchema` validation rules rejecting malformed documents with Error 121. |
| **Advanced Capabilities** | PL/pgSQL Functions, BEFORE/AFTER Triggers, Materialized/Virtual Views, Partial Indexes. | Multikey Array Indexing, Weighted Full-Text Search with `textScore`, 5-stage Aggregation Pipelines. |

---

## 3. Entity-Relationship (ER) Diagram & Attribute Dictionary

![Ledger of Loss ER Diagram](file:///d:/dbms_mp/Ledger_of_Loss_ER_Diagram.png)

*Figure 2.1: Ledger of Loss Complete Entity-Relationship (ER) Diagram*

| Relation / Table | Primary Key | Foreign Keys | Key Attributes & Constraints |
| :--- | :--- | :--- | :--- |
| **users** | `user_id` (serial) | None | `name` (text), `email` (text, UNIQUE, CHECK regex), `password_hash` (text, bcrypt), `role` (CHECK 'user'/'admin'), `created_at` (timestamptz) |
| **identities** | `identity_id` (serial) | `user_id` &rarr; `users(user_id)` ON DELETE CASCADE | `identity_value` (text), `identity_type` (CHECK 'email'/'username'), `verified` (bool), `verified_at` (timestamptz), UNIQUE(user_id, identity_value), CHECK(NOT verified OR verified_at IS NOT NULL) |
| **breaches** | `breach_id` (serial) | None | `breach_name` (text, UNIQUE), `source_name` (text), `breach_date` (date, CHECK <= CURRENT_DATE), `severity` (CHECK 'low'/'medium'/'high'/'critical'), `description` (text) |
| **data_types** | `data_type_id` (serial) | None | `name` (text, UNIQUE), `weight` (integer, CHECK BETWEEN 0 AND 40) |
| **scan_requests** | `scan_id` (serial) | `identity_id` &rarr; `identities(identity_id)` ON DELETE CASCADE | `started_at` (timestamptz), `completed_at` (timestamptz), `status` (CHECK 'pending'/'completed'/'failed'), `exposures_found` (integer) |
| **exposures** | `exposure_id` (serial) | `identity_id`, `breach_id`, `scan_id` | `discovered_at` (timestamptz), `risk_score` (integer, CHECK BETWEEN 0 AND 100), UNIQUE(identity_id, breach_id) |
| **exposure_data_types** | `(exposure_id, data_type_id)` | `exposure_id`, `data_type_id` | Composite PK, Bridge table for M:N relationship between exposures and sensitive data types. |
| **recovery_actions** | `action_id` (serial) | `exposure_id` &rarr; `exposures(exposure_id)` ON DELETE CASCADE | `playbook_ref` (text, Mongo ObjectId), `title` (text), `priority` (CHECK 1..5), `status` (CHECK 'pending'/'completed'/'dismissed'), `created_at`, `completed_at`, UNIQUE(exposure_id, playbook_ref) |
| **user_risk_summary** | `user_id` (integer) | `user_id` &rarr; `users(user_id)` ON DELETE CASCADE | `total_exposures` (int), `high_count` (int), `critical_count` (int), `overall_score` (int, 0..100), `updated_at` (timestamptz). Maintained via Trigger T2. |

---

## 4. Mathematical Normalization Proof (1NF to BCNF)

### 1. First Normal Form (1NF)
- **Atomicity:** All attributes store atomic scalar primitives (text, integer, date, boolean, timestamptz).
- **Decomposition:** In the un-normalized schema, an exposure could have contained multiple leaked data types as a comma-separated list ('password, financial, ssn'). We eliminated this repeating group by decomposing the M:N relationship into a distinct bridge relation: `exposure_data_types(exposure_id, data_type_id)`.
- **Conclusion:** Hence, the entire schema strictly satisfies 1NF.

### 2. Second Normal Form (2NF)
- **Single-Key Relations:** For single-attribute primary key relations (`users`, `identities`, `breaches`, `data_types`, `scan_requests`, `exposures`, `recovery_actions`, `user_risk_summary`), partial key dependencies are mathematically impossible.
- **Composite-Key Relation:** In `exposure_data_types(exposure_id, data_type_id)`, there are NO non-prime attributes; both attributes form the composite primary key.
- **Conclusion:** Hence, the entire schema strictly satisfies 2NF.

### 3. Third Normal Form (3NF)
- For every non-trivial functional dependency $X \to Y$, $X$ is a superkey or $Y$ is a prime attribute. No non-key attribute determines another non-key attribute.
- **Conclusion:** The schema strictly satisfies 3NF.

### 4. Boyce-Codd Normal Form (BCNF)
- A relation $R$ is in BCNF if and only if for every non-trivial functional dependency $X \to Y$, **$X$ is a superkey**.
- In every relation in our database, all determinants are candidate keys (`user_id`, `email`, `identity_id`, `{user_id, identity_value}`, `breach_id`, `breach_name`, `exposure_id`, `{identity_id, breach_id}`).
- **Formal Verdict:** Because the determinant of EVERY functional dependency across all tables is a superkey, the entire database is mathematically proven to be in **strict BCNF**.

---

## 5. Advanced SQL Database Logic (ASDL)

### A. Stored Function: `calculate_exposure_risk(exposure_id)`
Computes a numerical risk score (0-100) using a deterministic formula:
$$\text{Score} = \min(100, \text{SeverityBase} + \sum \text{Weights} + \text{RecencyBonus})$$

### B. Trigger T1: `trg_scan_requests_verified` (Integrity Guard)
- `BEFORE INSERT ON scan_requests`
- Rejects scans on unverified identities with SQLSTATE `P0001`.

### C. Trigger T2: `trg_exposures_risk_score_update` (Reactive Auto-Sync)
- `AFTER UPDATE OF risk_score ON exposures`
- Automatically invokes `refresh_user_risk_summary(user_id)` to keep aggregate metrics in real-time sync.

### D. View: `user_security_dashboard`
- Consolidates identities, exposures, breaches, and pending recovery counts in one query.

### E. Partial Index: `idx_recovery_actions_pending`
- `CREATE INDEX idx_recovery_actions_pending ON recovery_actions(exposure_id) WHERE status = 'pending';`
- Optimizes disk space and speeds up pending task lookups by indexing only unresolved actions.

---

