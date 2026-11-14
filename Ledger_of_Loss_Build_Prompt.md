BUILD PROMPT: LEDGER OF LOSS (PostgreSQL + MongoDB)

SESSION SCOPE: I will tell you which part to build: FOUNDATION, SLICE A, SLICE B, or EVERYTHING. If I have not said, ask me before writing any code.

=== 1. CONTEXT ===
You are helping two students build "Ledger of Loss" for a university DBMS course (Level 3 project). Course rules that shape every decision:
- Not a simple CRUD app. A real-world problem with a clear workflow.
- PostgreSQL (mandatory SQL) plus one NoSQL database (MongoDB). The use of each database must be justified by the shape of the data.
- ER diagram converted to a relational schema; DDL (CREATE, ALTER, DROP, keys, constraints, indexes, views); DML (INSERT, UPDATE, DELETE, SELECT) with JOIN, GROUP BY, HAVING, ORDER BY, aggregates and subqueries.
- At least four advanced database concepts, demonstrated for real.
- Next.js web interface with forms, tables, search, filtering and a dashboard; a backend/API layer; credentials only in environment variables; no plaintext passwords; at least 2 roles; input validation at the database level.
- Git with individual contributions, a README with setup steps, documentation, test cases, and a live demo.
The students must be able to explain every line in a viva. Write simple, readable code. Comment any non-obvious SQL. No clever abstractions.

=== 2. THE PRODUCT ===
Ledger of Loss is a privacy-focused data-exposure and recovery navigator. A user registers identities they own (email or username) and confirms ownership. They run a scan, which looks for that identity in a seeded dataset of known breaches. Each match becomes an exposure with a transparent, rule-based risk score. The system then recommends recovery playbooks matched to what was exposed, and the user ticks off recovery actions. An admin maintains the breach data and the playbooks and sees aggregate analytics.
It never looks up identities the user has not verified, and the admin sees aggregates only, never a user's identity values.

=== 3. HARD RULES FOR YOU ===
1. Build the minimal correct version of what is listed. Do not add tables, collections, features, roles or dependencies that are not listed. If you think something is missing, ask me first.
2. No ORM. Use raw SQL migrations (numbered files in /db/migrations) and the "pg" package with parameterized queries only. Use the official "mongodb" driver, not Mongoose.
3. Next.js (App Router) with TypeScript. Route Handlers are the backend/API layer.
4. Secrets only in .env. Provide .env.example. .env must be in .gitignore. Never hard-code credentials.
5. Passwords hashed with bcrypt (bcryptjs, cost 10 or higher). Sessions are a JWT (use "jose") in an httpOnly, sameSite=lax cookie. Next.js middleware enforces login and role on every protected route. Never log secrets or hashes.
6. All data is synthetic. Do not call any real breach API and do not include real people's data.
7. Do NOT run git commit or git push. Leave changes uncommitted; the students commit under their own names so contributions are visible. At each checkpoint, suggest a commit message.
8. Work in checkpoints (section 10). After each checkpoint stop, list the files you created or changed, how to run it, and how I can verify it. Wait for me to say "continue".
9. Before finishing, re-read this whole spec and report any place where the code differs from it.

=== 4. ENVIRONMENT ===
- docker-compose.yml with postgres:16 and mongo:7, named volumes, ports 5432 and 27017, credentials read from .env.
- Env vars: DATABASE_URL, MONGODB_URI, MONGODB_DB, JWT_SECRET, SEED_ADMIN_PASSWORD, SEED_USER_PASSWORD.
- npm scripts: db:migrate, db:seed, db:reset (drops and recreates everything), dev, test.
- README with exact setup and run steps for a fresh machine.

=== 5. POSTGRESQL SCHEMA (SOURCE OF TRUTH) ===
users
  user_id serial PK; name text NOT NULL; email text NOT NULL UNIQUE with a simple format CHECK; password_hash text NOT NULL; role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')); created_at timestamptz NOT NULL DEFAULT now().
identities
  identity_id serial PK; user_id FK to users ON DELETE CASCADE NOT NULL; identity_value text NOT NULL; identity_type text NOT NULL CHECK (identity_type IN ('email','username')); verified boolean NOT NULL DEFAULT false; verified_at timestamptz; created_at timestamptz DEFAULT now(); UNIQUE (user_id, identity_value); CHECK (NOT verified OR verified_at IS NOT NULL).
breaches
  breach_id serial PK; breach_name text NOT NULL UNIQUE; source_name text NOT NULL; breach_date date NOT NULL CHECK (breach_date <= current_date); severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')); description text.
data_types
  data_type_id serial PK; name text NOT NULL UNIQUE; weight integer NOT NULL CHECK (weight BETWEEN 0 AND 40).
scan_requests
  scan_id serial PK; identity_id FK to identities ON DELETE CASCADE NOT NULL; started_at timestamptz NOT NULL DEFAULT now(); completed_at timestamptz; status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')); exposures_found integer NOT NULL DEFAULT 0; CHECK (completed_at IS NULL OR completed_at >= started_at).
exposures
  exposure_id serial PK; identity_id FK to identities ON DELETE CASCADE NOT NULL; breach_id FK to breaches NOT NULL; scan_id FK to scan_requests ON DELETE SET NULL (nullable); discovered_at timestamptz NOT NULL DEFAULT now(); risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100); UNIQUE (identity_id, breach_id).
exposure_data_types
  exposure_id FK to exposures ON DELETE CASCADE; data_type_id FK to data_types; PRIMARY KEY (exposure_id, data_type_id).
recovery_actions
  action_id serial PK; exposure_id FK to exposures ON DELETE CASCADE NOT NULL; playbook_ref text NOT NULL (a MongoDB ObjectId stored as a string; this is a cross-database reference so it cannot be a foreign key, document this); title text NOT NULL; priority integer NOT NULL CHECK (priority BETWEEN 1 AND 5); status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','dismissed')); created_at timestamptz DEFAULT now(); completed_at timestamptz; CHECK (status <> 'completed' OR completed_at IS NOT NULL); UNIQUE (exposure_id, playbook_ref).
user_risk_summary
  user_id PK and FK to users ON DELETE CASCADE; total_exposures integer; high_count integer; critical_count integer; overall_score integer; updated_at timestamptz. Maintained only by a trigger and a refresh function.

Indexes: identities(user_id); scan_requests(identity_id); exposures(identity_id); exposures(breach_id); exposures(risk_score); a partial index on recovery_actions(exposure_id) WHERE status = 'pending'.
DDL showcase: use ALTER TABLE in at least one later migration for a real schema change (for example adding the role column and its CHECK in a later migration, or adding a constraint after creation). Provide db/teardown.sql with the DROP statements.

=== 6. RISK RULE (KEEP EXACTLY THIS SIMPLE) ===
score = LEAST(100, severity_base + SUM(weight of each exposed data type) + recency_bonus)
severity_base: low 10, medium 20, high 30, critical 40.
recency_bonus: 10 if the breach_date is within the last 24 months, else 0.
Levels: 0-25 low, 26-50 medium, 51-75 high, 76-100 critical.
Seed data_types and weights: password 30, financial 25, government_id 25, security_questions 15, phone 10, address 10, date_of_birth 10, email 10, username 5, ip_address 5.

=== 7. ADVANCED SQL FEATURES (ALL REQUIRED) ===
1. Function calculate_exposure_risk(p_exposure_id int) RETURNS int, implementing section 6. Also risk_level(p_score int) RETURNS text.
2. Function refresh_user_risk_summary(p_user_id int), which recomputes and upserts that user's row in user_risk_summary.
3. Trigger T1: BEFORE INSERT ON scan_requests. If the identity is not verified, RAISE EXCEPTION. This enforces "no scans on unverified identities" inside the database.
4. Trigger T2: AFTER UPDATE OF risk_score ON exposures. It calls refresh_user_risk_summary for the identity's owner. IMPORTANT: it fires on the risk_score UPDATE, not on INSERT, because the score can only be computed after the exposure_data_types rows exist. When an identity is deleted, the application calls refresh_user_risk_summary inside the same transaction.
5. View user_security_dashboard: one row per exposure with user_id, identity_id, identity_value, exposure_id, breach_name, breach_date, severity, risk_score, risk_level(risk_score), discovered_at, the exposed data types as a comma-separated string (string_agg), and the count of pending recovery actions. Built from JOINs across identities, exposures, breaches, exposure_data_types, data_types and recovery_actions.
6. The scan is one TRANSACTION (section 9).
7. Indexes as listed in section 5. In the tests, show one EXPLAIN for an indexed query.

=== 8. MONGODB COLLECTIONS ===
Create each with a $jsonSchema validator (validationLevel strict, validationAction error).
breach_records (one document per identity found in a breach)
  { breach_id: int (matches SQL breaches.breach_id), identity_hash: string (sha256 hex of the lower-cased identity value; must match ^[a-f0-9]{64}$), identity_type: "email" | "username", exposed_fields: [strings, each one of the seeded data_types names, at least 1], extra: object (free-form, differs per source, for example { password_hash_type, ip_logged, notes }) }
  Indexes: { identity_hash: 1, identity_type: 1 } and { breach_id: 1 }.
guidance_playbooks
  { title, summary, applies_to: { data_types: [strings], min_severity_rank: int 1-4 (1 low to 4 critical) }, priority: int 1-5, steps: [ { order: int, text: string, estimated_minutes: int } ] (at least 1), tags: [strings], updated_at: date }
  Indexes: a text index on title, summary, tags and steps.text (title weighted highest), and a multikey index on applies_to.data_types.
audit_logs (append-only)
  { ts: date, event_type: one of signup, login, identity_added, identity_verified, scan_completed, scan_failed, recommendations_issued, action_completed, admin_breach_added, admin_playbook_changed; user_id: int; role: "user" | "admin"; details: object }
  Indexes: { ts: -1 } and { event_type: 1, ts: -1 }.
Cross-database rule to document: SQL and MongoDB have no cross-database foreign keys. breach_records.breach_id and recovery_actions.playbook_ref are application-level references. When an admin adds a breach, write the SQL breaches row first, then the Mongo records; if the Mongo write fails, delete the SQL row (a compensating action).

=== 9. THE SCAN TRANSACTION (POST /api/scans) ===
1. Authenticate the user. Load the identity WHERE identity_id = $1 AND user_id = (current user). Return 403 or 404 if it is not theirs. Return 400 with a friendly message if it is not verified (trigger T1 is the real guard behind this).
2. Do all reads BEFORE the SQL transaction: compute sha256(lower(identity_value)); query Mongo breach_records for that hash and type; load the matching rows from SQL breaches and data_types; for each record query Mongo guidance_playbooks with { "applies_to.data_types": { $in: exposed_fields }, "applies_to.min_severity_rank": { $lte: severity_rank } } sorted by priority descending, limit 3.
3. BEGIN. INSERT the scan_requests row (T1 fires). For each record: INSERT the exposure with ON CONFLICT (identity_id, breach_id) DO NOTHING (skip existing exposures; they are not new); INSERT exposure_data_types by mapping each exposed field to data_types.name (an unknown field must abort the whole transaction with a clear error); UPDATE exposures SET risk_score = calculate_exposure_risk(exposure_id) (T2 fires); INSERT recovery_actions for the matched playbooks with ON CONFLICT DO NOTHING. UPDATE the scan_requests row to status 'completed' with completed_at and exposures_found. COMMIT.
4. On any error: ROLLBACK and return a clear error. After the transaction, write a scan_completed or scan_failed event (and recommendations_issued) to audit_logs.
Reason for the order: MongoDB reads happen first so the SQL transaction stays short and atomic; the SQL transaction is the only thing that needs ACID guarantees.

=== 10. ROLES AND PERMISSIONS ===
user: sign up and log in; add, verify and delete their own identities; scan their own verified identities; see their own dashboard, exposures and recovery actions; update their own recovery actions; search guidance (read-only).
admin: everything a user can do for their own account, plus: add and edit breaches (SQL breaches row and Mongo breach_records); create, edit and delete guidance playbooks; view analytics (aggregates only); view audit logs. An admin never sees any user's identity_value.
Verification of an identity is a mocked button ("Confirm I own this") that sets verified = true and verified_at = now(). Real email OTP is out of scope.

=== 11. API AND PAGES (SUGGESTED) ===
API: POST /api/auth/signup, /login, /logout; GET /api/auth/me. GET and POST /api/identities; POST /api/identities/[id]/verify; DELETE /api/identities/[id]. POST /api/scans; GET /api/scans. GET /api/dashboard (reads the view, supports ?level=&sort=&q=). GET /api/recovery-actions; PATCH /api/recovery-actions/[id]. GET /api/guidance?q= (Mongo text search) and GET /api/guidance/[id]. Admin: GET and POST /api/admin/breaches; GET, POST, PUT, DELETE /api/admin/playbooks; GET /api/admin/analytics; GET /api/admin/audit.
Pages: /signup, /login, /dashboard (summary cards, exposure table with risk-level filter, sort and search), /identities (add, verify, delete, scan button), /exposures/[id] (data types, risk breakdown, recovery actions), /actions (checklist), /guidance (search), /admin/breaches, /admin/playbooks, /admin/analytics, /admin/audit. Keep the UI plain and clear (Tailwind is fine). No chart library needed; tables are enough.

=== 12. IMPORTANT QUERIES (IMPLEMENT AS NAMED FILES IN /db/queries AND SHOW THEM IN THE ADMIN ANALYTICS PAGE OR DOCS) ===
Q1 JOIN: the user_security_dashboard view.
Q2 GROUP BY + ORDER BY: number of exposures and average risk per breach.
Q3 HAVING: users who have at least 2 exposures at high or critical level (aggregates only, return counts not identities).
Q4 Subquery: exposures whose risk_score is above the average risk_score of all exposures.
Q5 Aggregate with JOIN: average risk and count per data type through exposure_data_types.
Q6 NOT EXISTS: verified identities that have never been scanned.
Q7 Mongo aggregation pipeline on audit_logs: events per event_type per day ($match, $group, $sort), plus the most recommended playbooks ($match recommendations_issued, $unwind, $group, $lookup to guidance_playbooks, $sort, $limit).
Q8 Mongo text search on guidance_playbooks with textScore sorting.
DML coverage: INSERT (signup, scan), UPDATE (verify, risk_score, action status), DELETE (delete an identity, which cascades), SELECT (everything).

=== 13. SEED DATA (SYNTHETIC) ===
1 admin and 2 demo users (passwords from env vars, printed once at the end of the seed script). About 10 fictional breaches with different severities and dates (include some within the last 24 months). The 10 data_types. About 250 breach_records: some for the demo users' identities (so scans find things) and the rest hashed decoys; vary the "extra" field. About 20 original guidance playbooks (3 to 6 steps each) covering passwords, MFA, financial data, phone/SIM, government ID, phishing, credential reuse, account recovery settings. Write original text, do not copy from any website.

=== 14. CHECKPOINTS ===
CP0  Repo, docker-compose, .env.example, migration runner, db:reset script, README skeleton. (FOUNDATION)
CP1  SQL migrations (all tables, constraints, indexes, an ALTER migration), teardown.sql, SQL seed, and a /tests/db SQL script proving that each CHECK, UNIQUE and FK rejects bad data. (FOUNDATION)
CP2  Mongo setup script: collections, validators, indexes; Mongo seed; a test script proving the validators reject bad documents. (FOUNDATION)
CP3  Auth, roles, JWT cookie, middleware, signup and login pages, role-protected route example. (SLICE B)
CP4  Identities and verification; calculate_exposure_risk; risk_level; triggers T1 and T2; the scan transaction route; identities, scan and exposure-detail pages; DB tests for the function, both triggers and a forced rollback. (SLICE A)
CP5  Recovery actions API and checklist page; playbook matching; the dashboard view and dashboard page with filter, sort and search. (SLICE B)
CP6  Guidance text-search page; admin pages for breaches and playbooks; audit_logs writing; analytics page with Q2 to Q8; audit page. (SLICE B)
CP7  Q1 to Q8 as files; generate docs/data_dictionary.md from information_schema and the Mongo validators; TESTING.md table (test id, description, expected, actual, pass/fail); README finished. (A does the DB tests, queries and data dictionary; B does the UI checks, README and screenshots list.)

Start by confirming which SESSION SCOPE I want, then begin at the first checkpoint in that scope.
