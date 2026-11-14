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

