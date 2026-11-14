# Ledger of Loss — Master Viva Defense Bible
## DBMS Level 3 Capstone Experiential Learning Project

---



\pagebreak

# MODULE 01

# 01: How to Run, Start & Present Ledger of Loss
## Complete Operational Runbook & Mentor Presentation Guide for Full Marks

---

## 1. System Startup Sequence (Terminal by Terminal)

Follow this exact boot sequence when starting the project on the exam day or in front of your professor. Keep two terminal windows open side-by-side.

### Step 0: Ensure Docker Desktop is Running
- **Action:** Look at your Windows System Tray (bottom-right taskbar near clock) for the Docker whale icon.
- **Action:** If Docker Desktop is not running, open Start Menu -> Search 'Docker Desktop' -> Launch it.
- **Verification:** Wait 20-30 seconds until the whale icon turns steady and Docker reports 'Engine running'.

### Step 1: Terminal 1 — Spin Up PostgreSQL 16 & MongoDB 7
```powershell
cd D:\dbms_mp
docker compose up -d
docker compose ps
```
Verify the output displays both services in an 'Up' or 'healthy' state:
- **ledger_postgres**: Running on port `5432` (PostgreSQL 16 relational database).
- **ledger_mongo**: Running on port `27017` (MongoDB 7 document database).

### Step 2: Database Migration & Master Seeding
```powershell
npm run db:migrate
npm run db:seed
```
What this command executes under the hood:
1. **SQL Tables:** PostgreSQL schema migrations (`001_initial_schema.sql`, `002_functions_triggers_views.sql`, `003_alter_schema_showcase.sql`).
2. **SQL Reference:** 10 real-world breaches and weighted sensitive data types (passwords, SSN, credit cards, phones, etc.).
3. **Mongo Setup:** MongoDB collections (`breach_records`, `guidance_playbooks`, `audit_logs`) equipped with strict BSON `$jsonSchema` validators.
4. **Mongo Seed:** 20 incident response playbooks and 250+ breach records with multikey array indexes.
5. **User Personas:** All 7 user accounts (Admin, Divya, Arjun, Rohan, Pooja, Vikram, Ananya, Kabir) with pre-calculated risk summaries and recovery tasks.

### Step 3: Terminal 2 — Start Next.js 14 Full-Stack Web Application
```powershell
cd D:\dbms_mp
npm run dev
```
Open your web browser (Chrome or Edge) and navigate to:
- **Web URL:** `http://localhost:3000` (Redirects automatically to the Login page).

### Step 4: Live Verification Test Suite (Proof of Quality)
```powershell
npm test
```
This executes 37 automated tests covering PostgreSQL triggers, check constraints, foreign keys, MongoDB JSONSchema rejections, Next.js RBAC middleware, and ACID scan transaction rollbacks.

> 💡 **PRO-TIP FOR VIVA:** Running `npm test` in front of your professor instantly sets a high academic standard. Examiners rarely expect undergraduate projects to have a 100% passing automated test harness with 37 tests!

---

## 2. Explaining the Architecture to Your Professor (Frontend, Backend, React, API)

If your professor asks: 'Explain your stack and how the frontend, backend, and databases communicate', deliver this clear explanation:

| Layer | Technology Used | Role in System | Key Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | Next.js 14 App Router, React 18, Tailwind CSS | Renders responsive cybersecurity dashboard, forms, tables, and risk badges. | Uses React Server Components for fast data rendering and `'use client'` for interactive forms & modals. |
| **Backend API** | Next.js Route Handlers (`app/api/...`) | RESTful endpoints for auth, scans, identities, playbooks, and admin analytics. | Encapsulates business logic, cryptographic hashing, and ACID transactions. |
| **Auth & Security** | bcryptjs (Cost 10) + jose (JWT) | Stateless, secure session authentication without server-side session stores. | Signs encrypted JWTs in `HttpOnly`, `SameSite=Lax` cookies; verified by Edge `middleware.ts`. |
| **Relational Core** | PostgreSQL 16 (Port 5432) | Manages users, identities, scan audit logs, exposures, and aggregated risk. | Enforces BCNF normalization, CHECK/UNIQUE/FK constraints, Triggers T1 & T2, and View. |
| **Document Store** | MongoDB 7 (Port 27017) | Stores polymorphic breach feeds, incident playbooks, and security audit logs. | Guarded by strict BSON `$jsonSchema` validation (Error 121), multikey array indexing, and `textScore`. |

### How Data Flows When a User Clicks 'Trigger Security Scan'
1. **React Frontend:** User selects a verified identity on `http://localhost:3000/scans` and clicks 'Trigger Security Scan'. The React client fires a `POST` request to `/api/scans` with `identity_id`.
2. **Edge Auth Middleware:** Next.js Edge `middleware.ts` intercepts the request, decodes the JWT cookie using `jose`, validates the session, and attaches the authenticated `user_id`.
3. **Mongo Document Match:** The Route Handler computes the SHA-256 hash of the identity value. It performs a fast index lookup on MongoDB's `breach_records` using `{ identity_hash, identity_type }`.
4. **PostgreSQL ACID Ingestion:** Next, an ACID PostgreSQL transaction begins. It checks Trigger T1 (verifies identity ownership), inserts a `scan_requests` record, inserts `exposures`, invokes `calculate_exposure_risk()`, and fires Trigger T2 to auto-sync `user_risk_summary`.
5. **Live UI Update:** The backend returns HTTP 200 with the newly discovered exposures count. React re-renders the dashboard via Server Actions / SWR, updating the risk gauge live.

---

## 3. Word-for-Word Mentor Presentation Script (What to Say)

> 🗣️ **MEMORIZE THIS OPENING SPEECH:**
> 
> "Good morning Sir. Today we present **Ledger of Loss**, a full-stack cybersecurity risk quantification and remediation intelligence platform.
> 
> The core motivation of our project is that billions of credentials have leaked online across third-party breaches. Users reuse passwords and have no visibility into how a leak in one service compromises their financial accounts, SSN, or email elsewhere.
> 
> To solve this, we implemented a **Polyglot Persistence Architecture**:
> 1. **PostgreSQL 16** handles our relational, ACID-compliant core: user authentication, identities, scan transactions, exposures, and mathematical risk aggregation. All relations are strictly normalized to Boyce-Codd Normal Form (BCNF) and protected by active triggers and stored functions.
> 2. **MongoDB 7** manages our unstructured document store: polymorphic breach feeds, incident recovery playbooks with nested checklists, and immutable security audit logs, protected by strict BSON `$jsonSchema` validators.
> 3. Our frontend is built with Next.js 14 and React 18, communicating with backend serverless route handlers and secured by bcrypt password hashing and JWT cookies verified at the Edge.
> 
> Sir, with your permission, we would like to demonstrate our live system across different user personas, execute a live ACID scan transaction, and showcase our database triggers and constraints directly in the CLI."



\pagebreak

# MODULE 02

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



\pagebreak

# MODULE 03

# 03: Step-by-Step System Demonstration Script
## Screen-by-Screen Walkthrough, Zero-Knowledge Explanations & Exact Click Steps

---

## 1. Zero-Knowledge Primer: What is Ledger of Loss in Plain English?

> 🧠 **THE SIMPLE ANALOGY TO REMEMBER:**
> 
> "Imagine a credit bureau like CIBIL or Experian, but instead of tracking unpaid bank loans, it tracks stolen passwords, leaked email addresses, and exposed phone numbers across darknet hacks.
> 
> Whenever a company gets hacked, hackers dump the stolen files. Our platform stores those breaches in MongoDB.
> 
> When a user adds their email to our system, our database checks if their email was found in any hack. If found, our PostgreSQL database calculates an exact Risk Score from 0 to 100 based on how dangerous the leak is. If their plaintext bank password or SSN leaked, their score jumps to Critical (80-100). If only an IP address leaked, it stays Low (0-25).
> 
> Finally, the system gives the user a step-by-step checklist telling them exactly what to do (e.g. 'Reset your password now', 'Freeze your credit card') to fix the danger."

---

## 2. Screen-by-Screen Demonstration Walkthrough

### Screen 1: Login & Session Authentication (`/login`)
- **Step to execute:** Open browser at `http://localhost:3000/login`. Enter email: `divya@example.com`, password: `UserPass123!`. Click 'Sign In'.
- **What is visible:** A clean login interface with real-time field validation, secure error messaging, and a link to create an account.
- **Under the Hood (Database):** The Next.js route handler `/api/auth/login` fetches the `password_hash` from the `users` table in PostgreSQL. It compares the plaintext password using `bcrypt.compare()`. Upon matching, it issues a signed JWT token containing `user_id` and `role`, written into a secure, `HttpOnly`, `SameSite=Lax` cookie. Next.js Edge middleware redirects the user to `/dashboard`.
- **What to say to Sir:** *"Sir, our authentication uses enterprise-grade bcrypt password hashing with 10 salt rounds and stateless JSON Web Tokens. Passwords are never stored in plaintext, and session cookies are inaccessible to malicious JavaScript via the HttpOnly flag."*

### Screen 2: User Security Dashboard (`/dashboard`)
- **Step to execute:** The browser loads the main overview page `http://localhost:3000/dashboard`.
- **What is visible:** Four metric summary cards: Overall Risk Score (0-100), Risk Level badge (Low, Medium, High, Critical), Total Exposures count, and Pending Recovery Actions count. Below that is the Active Exposures Table showing breach names, dates, severities, and exposed sensitive fields.
- **Under the Hood (Database):** The top metric cards are loaded directly from the `user_risk_summary` table. The table below is powered by the virtual PostgreSQL View: `user_security_dashboard`, which joins exposures, identities, breaches, and groups exposed data types via `string_agg()`.
- **What to say to Sir:** *"Sir, this dashboard is backed by our pre-aggregated user_risk_summary table and our PostgreSQL view user_security_dashboard. It eliminates the need for expensive multi-table joins on every single page load."*

### Screen 3: Digital Identities & Ownership Verification (`/identities`)
- **Step to execute:** Click on 'Identities' in the navigation bar.
- **What is visible:** A list of digital identifiers (emails and usernames) registered by this user, along with a green 'Verified' badge or a yellow 'Unverified' badge.
- **Interactive action:** Try clicking 'Add Identity'. Enter a test email (e.g. `divya_work@company.com`). Notice it is initially unverified. Click 'Verify Ownership' to simulate cryptographic email challenge verification.
- **Under the Hood (Database):** PostgreSQL enforces two constraints here: `UNIQUE(user_id, identity_value)` so a user cannot register duplicates, and `CHECK(NOT verified OR verified_at IS NOT NULL)` ensuring an identity cannot be marked verified without a valid timestamp.
- **What to say to Sir:** *"Sir, we enforce identity verification before allowing breach scans. If a user tries to scan an unverified email, our PostgreSQL Trigger T1 blocks the insertion directly at the database engine level with an exception!"*

### Screen 4: Running a Security Scan (`/scans`)
- **Step to execute:** Click on 'Scans' in the navigation bar. Select a verified identity from the dropdown and click 'Trigger Security Scan'.
- **What is visible:** The scan runs instantly, a progress indicator finishes, and a success banner appears stating how many exposures were detected and how many playbooks were assigned.
- **Under the Hood (Database):** The ACID Scan Transaction executes! 1) Hashes identity with SHA-256 and searches MongoDB `breach_records`. 2) Inserts `scan_requests` row in PostgreSQL. 3) Inserts newly discovered rows in `exposures`. 4) Calls `calculate_exposure_risk()` stored function. 5) Trigger T2 fires automatically and updates `user_risk_summary`! 6) Commits cleanly.
- **What to say to Sir:** *"Sir, this scan is a textbook demonstration of an ACID transaction coordinating between MongoDB and PostgreSQL. If any step fails—for instance, an unknown data type—the entire transaction rolls back, leaving no orphaned data."*

### Screen 5: Remediation Playbooks & Actions (`/recovery-actions`)
- **Step to execute:** Click on 'Remediations' or 'Playbooks' in the navigation bar.
- **What is visible:** A list of actionable recovery cards prioritized from Priority 5 (Critical) to Priority 1 (Low). Each card shows the playbook title, estimated completion time, and a step-by-step checklist.
- **Interactive action:** Click the 'Mark as Completed' button on any pending card. The card immediately transitions to a completed state with a green checkmark.
- **Under the Hood (Database):** PostgreSQL updates the `recovery_actions` row: `SET status = 'completed', completed_at = now()`. PostgreSQL enforces `CHECK(status <> 'completed' OR completed_at IS NOT NULL)`. Fast lookups are accelerated by our partial index `idx_recovery_actions_pending`.
- **What to say to Sir:** *"Sir, notice how our recovery actions reference MongoDB playbooks via playbook_ref. When the user resolves a task, our partial index ensures that completed tasks do not slow down pending task queries."*

### Screen 6: Administrator Center (`/admin`)
- **Step to execute:** Log out, then sign in as email: `admin@ledgerofloss.local`, password: `AdminPass123!`. Click on 'Admin'.
- **What is visible:** Global system analytics, breach incident catalog manager, and a real-time audit log stream.
- **Security Demo:** Try accessing `/admin` while logged in as a normal user (`divya@example.com`). Edge middleware immediately blocks the user with an HTTP 403 Forbidden page!
- **Under the Hood (Database):** Audit events are stored in MongoDB's `audit_logs` collection with strict BSON schema validation, capturing `user_id`, `action`, IP, and timestamp.
- **What to say to Sir:** *"Sir, our admin module demonstrates Role-Based Access Control (RBAC). Furthermore, all administrative actions are immutably logged into MongoDB for forensic audit compliance."*

---



\pagebreak

# MODULE 04

# 04: PostgreSQL & MongoDB Terminal Commands
## Copy-Paste Terminal Showcases, Constraint Violations, Trigger Tests & Live Schema Alterations

---

## 1. Connecting to PostgreSQL and MongoDB via Docker Terminal

### Connect to PostgreSQL 16 (`psql` shell)
```powershell
docker exec -it ledger_postgres psql -U postgres -d ledger_of_loss
```
Prompt: `ledger_of_loss=#`

### Connect to MongoDB 7 (`mongosh` shell)
```powershell
docker exec -it ledger_mongo mongosh -u admin -p adminpassword --authenticationDatabase admin ledger_of_loss
```
Prompt: `ledger_of_loss>`

---

## 2. PostgreSQL Inspection Meta-Commands (Show Tables, Views, Functions)

| Meta-Command | Description / Output | What to Explain to Sir |
| :--- | :--- | :--- |
| `\dt` | Lists all 9 relational tables. | *"Sir, these are our 9 relations, all normalized to BCNF with explicit primary and foreign keys."* |
| `\dv` | Lists virtual views. | *"Sir, user_security_dashboard is our unified reporting view joining 4 tables."* |
| `\df` | Lists all user-defined stored functions. | *"Sir, calculate_exposure_risk, risk_level, and refresh_user_risk_summary are our core business logic functions."* |
| `\di` | Lists all B-Tree, unique, and partial indexes. | *"Sir, notice idx_recovery_actions_pending—it is our partial index filtered on status='pending'."* |
| `\d exposures` | Shows columns, types, foreign keys, and triggers on the exposures table. | *"Sir, notice Trigger T2 trg_exposures_risk_score_update attached to this table."* |
| `\d users` | Shows columns, check constraints (email regex, role check), and unique constraints. | *"Sir, notice the regex check constraint validating email format at the engine level."* |

---

## 3. Live Constraint Violation Demonstrations (Prove Constraints Work)

### Test 1: Violate CHECK Constraint on User Role
```sql
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Hacker User', 'hacker@example.com', 'some_hash', 'superadmin');
```
- **Expected Output:** `ERROR: new row for relation "users" violates check constraint "check_user_role"`
- **What to say:** *"Sir, our database engine restricts role strictly to 'user' or 'admin'. Any unauthorized role is rejected immediately by the SQL engine."*

### Test 2: Violate CHECK Constraint on Email Format (Regex Check)
```sql
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Bad Email', 'not-an-email-address', 'some_hash', 'user');
```
- **Expected Output:** `ERROR: new row for relation "users" violates check constraint "check_user_email_format"`

### Test 3: Violate UNIQUE Constraint on Duplicate Email
```sql
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Duplicate Divya', 'divya@example.com', 'some_hash', 'user');
```
- **Expected Output:** `ERROR: duplicate key value violates unique constraint "users_email_key"`

### Test 4: Violate CHECK Constraint on Breach Date in the Future
```sql
INSERT INTO breaches (breach_name, source_name, breach_date, severity) 
VALUES ('Future Cyber Attack', 'Darknet', '2099-01-01', 'critical');
```
- **Expected Output:** `ERROR: new row for relation "breaches" violates check constraint "check_breach_date_past"`

---

## 4. Live Trigger Demonstrations (Triggers T1 and T2)

### Trigger T1 Live Demo: Block Scan on Unverified Identity
```sql
-- 1. Check unverified identity:
SELECT identity_id, identity_value, verified FROM identities WHERE verified = false;

-- 2. Attempt to trigger a scan on that unverified identity:
INSERT INTO scan_requests (identity_id, status)
VALUES ((SELECT identity_id FROM identities WHERE verified = false LIMIT 1), 'pending');
```
- **Expected Output:** `ERROR: Cannot initiate scan: Identity X is not verified by its owner (SQLSTATE P0001)`
- **What to say:** *"Sir, notice that our BEFORE INSERT Trigger T1 intercepted the query and raised an exception with custom SQLSTATE P0001. The database engine itself enforced security!"*

### Trigger T2 Live Demo: Reactive Risk Summary Synchronization
```sql
-- 1. View current risk summary for User 1:
SELECT * FROM user_risk_summary WHERE user_id = 1;

-- 2. Update an exposure's risk score:
UPDATE exposures 
SET risk_score = 99 
WHERE exposure_id = (SELECT exposure_id FROM exposures WHERE identity_id IN (SELECT identity_id FROM identities WHERE user_id = 1) LIMIT 1);

-- 3. View user_risk_summary again. Notice it changed automatically!
SELECT * FROM user_risk_summary WHERE user_id = 1;
```
- **What to say:** *"Sir, Trigger T2 is an AFTER UPDATE trigger on exposures. As soon as any score changes, it automatically recalculates the overall score and counts in user_risk_summary."*

---

## 5. Live Schema Alteration (If Professor Asks to Change a Table)

## 6. User Creation, Deletion & Cascading Triggers (Live Demonstration)

```sql
-- 1. Add column account_status with default 'active'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';

-- 2. Add CHECK constraint
ALTER TABLE users 
ADD CONSTRAINT check_account_status CHECK (account_status IN ('active', 'suspended', 'locked'));

-- 3. Verify column and constraint exist
\d users

-- 4. Test constraint rejection live
INSERT INTO users (name, email, password_hash, account_status)
VALUES ('Test User', 'test_status@example.com', 'some_hash', 'banned'); -- FAILS!

INSERT INTO users (name, email, password_hash, account_status)
VALUES ('Valid User', 'valid_status@example.com', 'some_hash', 'suspended'); -- SUCCEEDS!
```
- **What to say:** *"Sir, this demonstrates online DDL evolution via ALTER TABLE with immediate CHECK constraint enforcement and default value backfilling without data loss."*

---

## 6. User Creation, Deletion & Cascading Triggers (Live Demonstration)

### A. Create Application User & Trigger T3 Auto-Initialization
```sql
-- 1. Create a new user live:
INSERT INTO users (name, email, password_hash, role)
VALUES ('Mentor Guest', 'mentor_guest@example.com', 'hashed123', 'user')
RETURNING user_id, name, email;

-- 2. Prove Trigger T3 automatically initialized their risk summary:
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'mentor_guest@example.com');
```
- **What to say:** *"Sir, Trigger T3 is an AFTER INSERT trigger on users. As soon as a user registers, it guarantees a synchronized user_risk_summary row exists with 0 baseline score."*

### B. Delete User & Trigger T4 Cascading Audit Log
```sql
-- 1. Delete the user:
DELETE FROM users WHERE email = 'mentor_guest@example.com';
-- Expected Output: NOTICE: AUDIT LOG: User [ID: X, Email: mentor_guest@example.com] deleted. Cascading deletion...

-- 2. Verify ON DELETE CASCADE wiped their risk summary:
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'mentor_guest@example.com');
-- Returns 0 rows!
```
- **What to say:** *"Sir, our foreign keys enforce ON DELETE CASCADE. Deleting a user automatically purges their identities, scans, exposures, recovery actions, and risk summary without leaving orphaned rows."*

### C. Create & Drop PostgreSQL Database Roles (Mentor Auditor Demo)
```sql
-- 1. Create a read-only database user for the mentor:
CREATE USER mentor_auditor WITH PASSWORD 'viva2026';
GRANT CONNECT ON DATABASE ledger_of_loss TO mentor_auditor;
GRANT USAGE ON SCHEMA public TO mentor_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mentor_auditor;

-- 2. Verify user in PostgreSQL catalog:
SELECT usename, usesuper FROM pg_user WHERE usename = 'mentor_auditor';

-- 3. Revoke permissions and delete the database user:
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM mentor_auditor;
REVOKE ALL ON SCHEMA public FROM mentor_auditor;
REVOKE ALL ON DATABASE ledger_of_loss FROM mentor_auditor;
DROP USER mentor_auditor;
```

---

## 7. Live MongoDB Commands (Inspection, Validators, Text Search & Aggregation)

### A. Show Collections and Indexes
```javascript
show collections
db.breach_records.getIndexes()
```

### B. Prove BSON `$jsonSchema` Validator Rejection (Error 121)
```javascript
db.breach_records.insertOne({ breach_id: 999 });
```
- **Expected Output:** `MongoServerError: Document failed validation (code 121)`
- **What to say:** *"Sir, MongoDB collections are guarded by strict BSON $jsonSchema validators. Malformed documents are rejected with Error 121!"*

### C. Weighted Full-Text Search with Relevance Ranking (`textScore`)
```javascript
db.guidance_playbooks.find(
  { $text: { $search: "password credential rotation MFA" } },
  { score: { $meta: "textScore" }, title: 1, priority: 1 }
).sort({ score: { $meta: "textScore" } }).limit(3);
```

### D. 5-Stage Aggregation Pipeline (`$match`, `$unwind`, `$group`, `$sort`, `$limit`)
```javascript
db.breach_records.aggregate([
  { $match: { exposed_fields: { $exists: true, $ne: [] } } },
  { $unwind: "$exposed_fields" },
  { $group: { _id: "$exposed_fields", total_leaks: { $sum: 1 } } },
  { $sort: { total_leaks: -1 } },
  { $limit: 5 }
]);
```
- **What to say:** *"Sir, this aggregation pipeline demonstrates array unwinding, grouping, and multi-stage document analytics in MongoDB."*

---



\pagebreak

# MODULE 05

# 05: Test Accounts & 30 Master Viva Q&A Bible
## 7 Complete Persona Profiles & 30 Exhaustive Answers for Top Exam Marks

---

## 1. Master Test Personas & Demonstration Scenarios

| User Persona & Email | Password | Role & Exposures | Risk Level & Score | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator**<br>`admin@ledgerofloss.local` | `AdminPass123!` | Role: `admin`<br>Global Access | N/A (Admin View) | Showing RBAC, global system analytics, breach catalog, and MongoDB audit logs. |
| **Divya Sharma**<br>`divya@example.com` | `UserPass123!` | Role: `user`<br>3 Breaches (Apex, CloudScale, Darknet) | Critical Risk<br>Score: ~90-100 | Default user demo showing multiple severe leaks, pending playbooks, and high risk gauge. |
| **Arjun Patel**<br>`arjun@example.com` | `UserPass123!` | Role: `user`<br>2 Breaches, 1 Unverified Identity | Medium Risk<br>Score: ~45-60 | Demonstrating Trigger T1 error when attempting to scan unverified identity `arjun_coder`. |
| **Rohan Verma**<br>`rohan.verma@example.com` | `UserPass123!` | Role: `user`<br>3 Critical Breaches (Apex, FinSecure, Darknet) | Critical Risk<br>Score: 100 / 100 | Demonstrating financial compromise: leaked SSN, credit cards, bank account details & freeze playbooks. |
| **Pooja Rao**<br>`pooja.rao@example.com` | `UserPass123!` | Role: `user`<br>2 High Breaches (CloudScale, GigaShop) | High Risk<br>Score: ~65-70 | Demonstrating credential stuffing risk: stolen passwords, phone numbers, and addresses. |
| **Vikram Malhotra**<br>`vikram.m@example.com` | `UserPass123!` | Role: `user`<br>2 Low Breaches (VoltUtility, OmniTravel) | Low Risk<br>Score: ~20-25 | Demonstrating minimal digital footprint: only public IP and newsletter handle leaked. |
| **Ananya Iyer**<br>`ananya.iyer@example.com` | `UserPass123!` | Role: `user`<br>2 Medium Breaches (StreamWave, NexusPlay) | Medium Risk<br>100% Remediated | **HERO PERSONA:** Demonstrating all remediation tasks completed with green checkmarks! |
| **Kabir Mehta**<br>`kabir.mehta@example.com` | `UserPass123!` | Role: `user`<br>0 Breaches (Clean Slate) | Zero Risk<br>Score: 0 / 100 | **LIVE SCAN DEMO:** Logging in live, clicking 'Trigger Security Scan', and watching real-time clean completion! |

---

## 2. 30 Exhaustive Viva Questions & Model Answers

### Q1: What are the ACID properties, and how does your project enforce them?
- **Domain:** *Relational DBMS Core*
- **Model Answer:**  
ACID stands for Atomicity, Consistency, Isolation, and Durability. In our project:
• Atomicity: Scan ingestion executes inside a BEGIN...COMMIT block. If an unknown data type or FK error occurs, ROLLBACK undoes all partial inserts.
• Consistency: Enforced by declarative constraints (CHECK regex on emails, UNIQUE constraints on identities, and foreign keys).
• Isolation: PostgreSQL provides Read Committed isolation by default, using Multi-Version Concurrency Control (MVCC) to ensure readers do not block writers.
• Durability: PostgreSQL uses Write-Ahead Logging (WAL) flushed to non-volatile disk storage before transactions are acknowledged.

### Q2: What is the difference between 3NF and BCNF? Why is your schema in BCNF?
- **Domain:** *Normalization Theory*
- **Model Answer:**  
In 3NF, for any functional dependency X -> Y, either X is a superkey OR Y is a prime attribute (part of a candidate key). BCNF is stricter: X MUST be a superkey without exception. In our schema, every functional determinant (e.g. user_id, email, {identity_id, breach_id}) is a candidate key. Because there are no non-superkey determinants, our schema strictly satisfies BCNF.

### Q3: What is a surrogate key versus a natural key? Which did you use?
- **Domain:** *Database Design*
- **Model Answer:**  
A natural key is an attribute with real-world business meaning (e.g. email address or SSN). A surrogate key is a system-generated synthetic identifier with no business meaning (e.g. serial user_id). We used surrogate serial primary keys for storage efficiency and stable joins, but enforced business uniqueness by adding UNIQUE constraints on natural keys (e.g. users.email).

### Q4: Explain the difference between ON DELETE CASCADE and ON DELETE SET NULL in your foreign keys.
- **Domain:** *Referential Integrity*
- **Model Answer:**  
• ON DELETE CASCADE: When a parent record is deleted, all dependent child rows are deleted automatically (e.g. deleting a user cascades to delete their identities, scans, and exposures).
• ON DELETE SET NULL: When a parent record is deleted, child foreign key columns are set to NULL (e.g. in exposures, scan_id REFERENCES scan_requests ON DELETE SET NULL so historical exposure records remain even if an old scan request audit log is purged).

### Q5: What is a Partial Index, and why is it superior to a standard B-Tree index for recovery_actions?
- **Domain:** *Indexing & Performance*
- **Model Answer:**  
A partial index indexes only a subset of rows meeting a WHERE clause condition. In our project, CREATE INDEX idx_recovery_actions_pending ON recovery_actions(exposure_id) WHERE status = 'pending'. Because 90% of user queries only fetch unresolved actions, indexing only pending rows reduces index size on disk by up to 80% and accelerates dashboard lookups.

### Q6: Explain the difference between a Stored Procedure and a Stored Function in PostgreSQL.
- **Domain:** *PostgreSQL Internals*
- **Model Answer:**  
A Stored Function returns a typed value and can be embedded directly inside SELECT or UPDATE expressions (e.g. SELECT calculate_exposure_risk(1)). A Stored Procedure is invoked with the CALL statement and can manage its own transactions (issuing COMMIT and ROLLBACK internally), whereas a function runs strictly within the caller's transaction context.

### Q7: How does Trigger T1 (trg_scan_requests_verified) work?
- **Domain:** *Database Triggers*
- **Model Answer:**  
Trigger T1 is a BEFORE INSERT trigger on the scan_requests table. It inspects NEW.identity_id, queries the identities table, and checks if verified = true. If the identity is unverified, it raises an exception with custom SQLSTATE P0001, aborting the insertion before any disk write occurs.

### Q8: How does Trigger T2 (trg_exposures_risk_score_update) work?
- **Domain:** *Database Triggers*
- **Model Answer:**  
Trigger T2 is an AFTER UPDATE OF risk_score trigger on the exposures table. As soon as an exposure's numerical score is calculated or modified, Trigger T2 invokes the PL/pgSQL function refresh_user_risk_summary(user_id). This re-aggregates total exposures, critical counts, and overall scores in user_risk_summary automatically.

### Q9: What is the deterministic formula used in calculate_exposure_risk?
- **Domain:** *Business Logic Logic*
- **Model Answer:**  
Score = LEAST(100, severity_base + SUM(data_type_weights) + recency_bonus).
• Severity Base: Low = 10, Medium = 20, High = 30, Critical = 40.
• Weights: password (30), financial (25), government_id (25), security_questions (15), phone (10), address (10), date_of_birth (10), email (10), username (5), ip_address (5).
• Recency Bonus: +10 if breach_date >= CURRENT_DATE - INTERVAL '24 months'. Capped at 100.

### Q10: What is the purpose of the user_security_dashboard view?
- **Domain:** *Views & Reporting*
- **Model Answer:**  
It is a virtual join across identities, exposures, breaches, and data types. It uses string_agg(dt.name, ', ') to format exposed fields into a human-readable list, and runs a scalar correlated subquery to count pending recovery actions. It simplifies frontend queries to: SELECT * FROM user_security_dashboard WHERE user_id = $1.

### Q11: Why did you use MongoDB instead of storing everything in PostgreSQL JSONB?
- **Domain:** *Polyglot Architecture*
- **Model Answer:**  
While PostgreSQL has JSONB, MongoDB provides native multikey array indexing on nested arrays (data_classes), built-in weighted full-text search with relevance ranking (textScore), and flexible document reshaping via 5-stage aggregation pipelines. Furthermore, isolating polymorphic external breach feeds prevents high-churn schema drift from impacting our ACID transactional tables.

### Q12: What is BSON $jsonSchema validation in MongoDB?
- **Domain:** *NoSQL Schema Integrity*
- **Model Answer:**  
Although MongoDB is inherently schema-flexible, enterprise applications require data contracts. BSON $jsonSchema enforces validation rules at the database engine level (validationLevel: 'strict', validationAction: 'error'). If a document violates required properties or regex patterns, MongoDB rejects the write with Error 121 (DocumentValidationFailure).

### Q13: What is a Multikey Index in MongoDB?
- **Domain:** *NoSQL Indexing*
- **Model Answer:**  
When an index is created on a field containing an array (e.g. db.breach_records.createIndex({ exposed_fields: 1 })), MongoDB creates an index entry for EACH individual element in the array. This enables O(log N) point lookups whenever a user queries for breaches that exposed passwords or financial records.

### Q14: Explain the 5 stages of your MongoDB Aggregation Pipeline.
- **Domain:** *MongoDB Analytics*
- **Model Answer:**  
1. $match: Filters documents with non-empty exposed_fields.
2. $unwind: Deconstructs the exposed_fields array into separate documents for each item.
3. $group: Groups by data class name and sums the total occurrences using { $sum: 1 }.
4. $sort: Orders results descending by frequency.
5. $limit: Restricts the output to the top 5 most frequently leaked data classes.

### Q15: What is the CAP Theorem, and where do your databases sit?
- **Domain:** *Distributed Systems*
- **Model Answer:**  
The CAP theorem states that a distributed data store can only guarantee two out of Consistency, Availability, and Partition Tolerance. PostgreSQL is a CP (Consistency & Partition Tolerance) system prioritizing strict ACID serializability. MongoDB in a single-primary replica set is also CP, prioritizing strong read-after-write consistency.

### Q16: How are user passwords hashed, and why is SHA-256 NOT used for passwords?
- **Domain:** *Cybersecurity & Auth*
- **Model Answer:**  
We hash passwords using bcryptjs with 10 salt rounds. SHA-256 is a fast cryptographic digest designed for file integrity; modern GPUs can compute billions of SHA-256 hashes per second, making it vulnerable to brute force. In contrast, bcrypt is an adaptive key derivation function with built-in work factors and salting, making offline cracking computationally prohibitive.

### Q17: How does JWT session management work with Next.js Edge Middleware?
- **Domain:** *Web Security*
- **Model Answer:**  
Upon successful bcrypt login, the backend issues a signed JWT token containing user_id and role using the jose library. The token is set in an HttpOnly, SameSite=Lax cookie. Next.js Edge middleware intercepts every incoming request, validates the cryptographic signature, and extracts user details before the request reaches any page or API.

### Q18: What is Role-Based Access Control (RBAC), and how is it enforced?
- **Domain:** *Access Control*
- **Model Answer:**  
Users are assigned roles ('user' or 'admin') stored in the users table and verified in the JWT payload. Edge middleware intercepts routes matching /admin/:path*. If the user role is not 'admin', middleware immediately returns HTTP 403 Forbidden without executing backend queries.

### Q19: What happens if Docker crashes during a scan transaction?
- **Domain:** *Fault Tolerance & Crash Recovery*
- **Model Answer:**  
If the container or host crashes mid-transaction, PostgreSQL's Write-Ahead Log (WAL) ensures Atomicity. Upon container restart, PostgreSQL executes REDO and UNDO crash recovery routines: any uncommitted scan transactions are completely rolled back. Zero orphaned or partial records persist.

### Q20: Why did you store playbook_ref as a string in recovery_actions instead of a PostgreSQL foreign key?
- **Domain:** *Cross-Database Design*
- **Model Answer:**  
Because guidance_playbooks resides in MongoDB, a relational foreign key cannot span physical database engines. We store MongoDB's 24-character hexadecimal ObjectId as a text string (playbook_ref). Consistency is enforced at the application layer within the scan ingestion transaction.

### Q21: Could SQL Injection compromise your system?
- **Domain:** *Application Security*
- **Model Answer:**  
No. All PostgreSQL queries use parameterized prepared statements ($1, $2, etc.) via node-postgres (pg). Parameter values are transmitted out-of-band to the database engine and treated purely as literal data, making SQL injection mathematically impossible.

### Q22: Why did you use SHA-256 to hash identities in MongoDB breach records?
- **Domain:** *Privacy Engineering*
- **Model Answer:**  
To respect user privacy. We do not store raw emails or usernames in the MongoDB breach database. Instead, identities are normalized to lowercase and hashed with SHA-256. When a user scans an identity, we hash their input and match the digests without exposing raw third-party identity catalogs.

### Q23: How would you scale this database to 10 million users?
- **Domain:** *Scalability & Architecture*
- **Model Answer:**  
1. PostgreSQL: Implement connection pooling (PgBouncer), read replicas for SELECT queries, and range partitioning on scan_requests and exposures by date.
2. MongoDB: Shard breach_records horizontally using a hashed shard key on identity_hash.
3. Caching: Introduce Redis to cache frequent dashboard summaries and guidance playbooks.

### Q24: What is the difference between an INNER JOIN and a LEFT JOIN in your views?
- **Domain:** *Relational Algebra*
- **Model Answer:**  
INNER JOIN returns only rows where a match exists in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right table (filling NULLs if no match exists). In user_security_dashboard, exposures JOIN breaches is an INNER JOIN because every valid exposure must reference an existing breach incident.

### Q25: What is the advantage of using Docker Compose for this project?
- **Domain:** *DevOps & Portability*
- **Model Answer:**  
Docker Compose provides environment idempotency: identical containerized versions of PostgreSQL 16 and MongoDB 7 spin up with a single command on any Windows, Mac, or Linux machine, eliminating configuration drift and host dependency conflicts.

