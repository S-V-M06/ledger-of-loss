# 🛡️ Ledger of Loss: Privacy-Focused Data Exposure & Recovery Navigator

> **DBMS Experiential Learning — Level 3 Project**  
> **Paradigm**: Option 1: SQL + NoSQL (PostgreSQL 16 + MongoDB 7)  
> **Frontend & API**: Next.js (App Router, TypeScript, Tailwind CSS)  
> **Team Structure**: 2-Member Collaborative Team (Individual Git Contributions)

---

## 1. Executive Summary & Problem Statement

People regularly hear the alarming notice: *"Your personal data was compromised in a third-party breach."* However, current public breach search tools (e.g. *Have I Been Pwned*) leave individuals stranded:
- They state that an account was found in a breach, but provide **no contextual risk rating** (a leaked password is significantly more dangerous than a leaked username; a breach from 2 months ago is vastly more hazardous than one from 2014).
- They provide **no guided remediation roadmap** tailored to the specific combinations of leaked data.
- They lack a personal **task manager** to track whether the user actually remediated the threat.

**Ledger of Loss** transforms passive breach panic into structured, measurable recovery:
1. **Verified Ownership**: Users register personal identities (email or username) and confirm ownership before any scan can occur (strictly guarded at the database level via PostgreSQL Trigger `T1`).
2. **Privacy-Preserving Scanning**: Scans are performed by searching MongoDB collections using **SHA-256 cryptographic hashes** of lower-cased identity strings. Plaintext identities are never queried across raw breach records.
3. **Deterministic Database-Level Risk Engine**: Stored procedure `calculate_exposure_risk()` calculates an objective 0–100 score based on severity baselines, 24-month recency bonuses, and individual data type weights.
4. **Actionable Remediation Playbooks**: MongoDB guidance playbooks are dynamically linked to exposures, generating a trackable recovery checklist.
5. **Privacy-Safe Admin Intelligence**: Administrators manage breaches and playbooks, viewing aggregate statistics only (never personal user identities).

---

## 2. Technology Stack & Database Choices

| Component | Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Relational Database (SQL)** | **PostgreSQL 16** | Serves as the **source of truth** for structured entities requiring ACID guarantees, referential integrity (`ON DELETE CASCADE`), database-level constraints (CHECK, UNIQUE), stored procedures, triggers, and views. |
| **Document Database (NoSQL)**| **MongoDB 7** | Houses semi-structured, heterogeneous breach records with varying schemas (`extra` fields vary per breach dump), multi-step remediation playbooks requiring full-text search, and high-velocity append-only audit logs. |
| **Application Layer** | **Next.js (App Router)** | Full-stack TypeScript framework utilizing server components and Route Handlers for the backend API layer. |
| **Authentication & RBAC** | **jose + bcryptjs** | Signed HS256 JWT tokens stored in `httpOnly`, `sameSite=lax` secure cookies. Role-based access control enforced via Edge `middleware.ts`. |
| **Containerization** | **Docker Compose** | Orchestrates PostgreSQL 16 and MongoDB 7 with named volumes and healthchecks. |

---

## 3. Advanced Database Features Demonstrated

The course specification requires at least four advanced database concepts. Ledger of Loss implements and demonstrates **nine**:

### 1. ACID Transactions with Compensating Action
- **The Scan Transaction (`POST /api/scans`)**: Executes as a short, atomic PostgreSQL transaction after external MongoDB reads are completed. Guarantees that scan logs, exposures, data types, and action mappings either all succeed or cleanly roll back with zero orphan records.
- **Cross-Database Compensating Action (`POST /api/admin/breaches`)**: When adding a breach, PostgreSQL `breaches` is written first. If the subsequent MongoDB `breach_records` bulk write fails, the application automatically deletes the PostgreSQL row as a compensating action.

### 2. Database Triggers
- **Trigger `T1` (`trg_scan_requests_verified`)**: `BEFORE INSERT ON scan_requests`. Enforces the critical rule that unverified identities cannot be scanned. If `verified = false`, it aborts the write (`RAISE EXCEPTION 'P0001'`).
- **Trigger `T2` (`trg_exposures_risk_score_update`)**: `AFTER UPDATE OF risk_score ON exposures`. Automatically triggers stored procedure `refresh_user_risk_summary()` to recompute user-level risk statistics.

### 3. Stored Functions / Procedures
- `calculate_exposure_risk(p_exposure_id int) RETURNS int`: Computes bounded risk scores based on severity baselines, recency bonuses (< 24 months), and data type weights.
- `risk_level(p_score int) RETURNS text`: Classifies scores into `low`, `medium`, `high`, and `critical`.
- `refresh_user_risk_summary(p_user_id int) RETURNS void`: Aggregates active exposures and upserts `user_risk_summary`.

### 4. Database Views
- `user_security_dashboard`: Multi-table view consolidating `identities`, `exposures`, `breaches`, `string_agg(data_types.name)` and pending recovery action counts into an analytical query.

### 5. Multi-Column & Partial Indexes
- Multi-column index: `identities(user_id, identity_value)`.
- Partial index: `recovery_actions(exposure_id) WHERE status = 'pending'` for lightning-fast queries of unresolved user tasks.

### 6. Evolutionary DDL (`ALTER TABLE`)
- Migration `003_alter_schema_showcase.sql` demonstrates real-world zero-downtime schema alteration by adding `role` with `CHECK (role IN ('user', 'admin'))` after table creation.

### 7. MongoDB Strict `$jsonSchema` Validation
- `breach_records`, `guidance_playbooks`, and `audit_logs` enforce strict schema validators (`validationLevel: 'strict'`, `validationAction: 'error'`), rejecting malformed documents at the database engine level.

### 8. MongoDB Weighted Full-Text Search
- Text index on `guidance_playbooks` with relevance weighting: `title` (10), `summary` (5), `tags` (5), and `steps.text` (1), sorted by `$meta: "textScore"`.

### 9. MongoDB Aggregation Pipelines
- Multi-stage pipelines on `audit_logs`: `$match` &rarr; `$unwind` &rarr; `$group` &rarr; `$lookup` &rarr; `$sort` &rarr; `$limit` to calculate event frequencies and identify the most recommended playbooks.

---

## 4. Important Queries Reference (Q1 – Q8)

All 8 queries are stored as named files in `/db/queries`:

| Query ID | Advanced Concept | File Location | Used In |
| :---: | :--- | :--- | :--- |
| **Q1** | Multi-table JOIN & Subquery View | [`db/queries/q1_user_security_dashboard.sql`](file:///D:/dbms_mp/db/queries/q1_user_security_dashboard.sql) | User Security Dashboard (`/dashboard`) |
| **Q2** | `GROUP BY` + `ORDER BY` + Aggregates | [`db/queries/q2_breach_exposure_summary.sql`](file:///D:/dbms_mp/db/queries/q2_breach_exposure_summary.sql) | Admin Analytics (`/admin/analytics`) |
| **Q3** | `HAVING` Clause (Privacy Aggregate) | [`db/queries/q3_users_high_critical_having.sql`](file:///D:/dbms_mp/db/queries/q3_users_high_critical_having.sql) | Admin Threat Concentration KPI |
| **Q4** | Subquery (Above Global Average Risk) | [`db/queries/q4_above_average_risk_subquery.sql`](file:///D:/dbms_mp/db/queries/q4_above_average_risk_subquery.sql) | Admin High-Severity Triage Table |
| **Q5** | Aggregate with Many-to-Many JOIN | [`db/queries/q5_data_type_risk_aggregate.sql`](file:///D:/dbms_mp/db/queries/q5_data_type_risk_aggregate.sql) | Data Type Risk Profiling Table |
| **Q6** | `NOT EXISTS` Subquery | [`db/queries/q6_unscanned_verified_not_exists.sql`](file:///D:/dbms_mp/db/queries/q6_unscanned_verified_not_exists.sql) | Unscanned Identity Detection KPI |
| **Q7** | MongoDB Aggregation Pipeline | [`db/queries/q7_mongo_audit_pipeline.ts`](file:///D:/dbms_mp/db/queries/q7_mongo_audit_pipeline.ts) | Daily Activity & Most Recommended Playbooks |
| **Q8** | MongoDB Full-Text Search | [`db/queries/q8_mongo_text_search.ts`](file:///D:/dbms_mp/db/queries/q8_mongo_text_search.ts) | Guidance Library Search (`/guidance`) |

---

## 5. Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20+ LTS
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Spin Up Databases
```powershell
docker compose up -d
```

### 4. Install Dependencies
```powershell
npm install
```

### 5. Run Migrations & Seeds
```powershell
npm run db:migrate
npm run db:seed
```
*(Runs numbered SQL migrations 001, 002, 003, sets up MongoDB validators/indexes, and seeds 10 breaches, 10 data types, 3 users, 20 playbooks, and 250 breach records)*.

### 6. Start Web Application
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Run Test Suite
```powershell
npm test
```

---

## 6. Seed Accounts for Viva Demonstration

| Role | Email | Password | Pre-seeded State & Demo Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ledgerofloss.local` | `AdminPass123!` | Access to `/admin/analytics`, `/admin/breaches`, `/admin/playbooks`, and `/admin/audit`. |
| **Demo User 1** | `divya@example.com` | `UserPass123!` | Pre-seeded with verified identities that match known breaches (Apex Health, CloudScale Nexus, CyberForums) for live demonstration. |
| **Demo User 2** | `arjun@example.com` | `UserPass123!` | Demo account with financial and transit breach matches. |

---

## 7. Team Work Split (Vertical Slices)

To fulfill course criteria requiring both members to contribute to database design, implementation, and application code:

### Teammate ksa (Slice A): Relational Core & Scanning Engine
- **Database Responsibilities**:
  - PostgreSQL schema design (`users`, `identities`, `breaches`, `data_types`, `scan_requests`, `exposures`, `exposure_data_types`, `recovery_actions`, `user_risk_summary`).
  - DDL migrations (`001`, `002`, `003`), constraints, and partial indexes.
  - Stored procedure `calculate_exposure_risk()`, `risk_level()`, and Triggers `T1` & `T2`.
  - Database integrity test suite (`tests/db/run_db_tests.ts`).
- **Application Responsibilities**:
  - Identities management UI (`/identities`) and verification flow.
  - The ACID Scan Transaction route handler (`POST /api/scans`).
  - Exposure drilldown interface (`/exposures/[id]`) and risk breakdown card.
  - Scan rollback verification tests (`tests/scans/test_scan_transaction.ts`).

### Teammate svm (Slice B): Document NoSQL, Auth & Analytics
- **Database Responsibilities**:
  - MongoDB collection modeling and `$jsonSchema` validators (`breach_records`, `guidance_playbooks`, `audit_logs`).
  - Text indexes, multikey indexes, and compound index configuration.
  - MongoDB validation test suite (`tests/db/test_mongo_validators.ts`).
  - Analytical queries Q2 through Q8 and aggregation pipelines.
- **Application Responsibilities**:
  - Authentication system with `jose` HS256 JWT cookies, `bcryptjs` hashing, and Edge `middleware.ts`.
  - Authentication UI (`/login`, `/signup`) and demo credential helpers.
  - User Security Dashboard (`/dashboard`) reading view `user_security_dashboard`.
  - Recovery Actions checklist page (`/actions`) with PATCH status toggles.
  - Admin Portal pages (`/admin/analytics`, `/admin/breaches`, `/admin/playbooks`, `/admin/audit`).

---

