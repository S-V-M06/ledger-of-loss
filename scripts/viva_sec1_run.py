import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from docx.shared import Inches, Pt, RGBColor
from scripts.generate_viva_suite import (
    create_styled_document, add_h1, add_h2, add_h3, add_p, add_bullet, 
    add_callout, add_code, add_table_data, VIVA_DIR
)

def generate_sec1():
    print("[*] Generating Section 1: How to Run, Start, and Present the System...")
    doc = create_styled_document(
        "01: How to Run, Start & Present Ledger of Loss",
        "Complete Operational Runbook & Mentor Presentation Guide for Full Marks"
    )
    
    md_content = """# 01: How to Run, Start & Present Ledger of Loss
## Complete Operational Runbook & Mentor Presentation Guide for Full Marks

---

"""

    # Chapter 1: Startup sequence
    add_h1(doc, "1. System Startup Sequence (Terminal by Terminal)")
    md_content += "## 1. System Startup Sequence (Terminal by Terminal)\n\n"
    
    add_p(doc, "Follow this exact boot sequence when starting the project on the exam day or in front of your professor. Keep two terminal windows open side-by-side.")
    md_content += "Follow this exact boot sequence when starting the project on the exam day or in front of your professor. Keep two terminal windows open side-by-side.\n\n"

    add_h2(doc, "Step 0: Ensure Docker Desktop is Running")
    add_bullet(doc, "Look at your Windows System Tray (bottom-right taskbar near clock) for the Docker whale icon.", "Action:")
    add_bullet(doc, "If Docker Desktop is not running, open Start Menu -> Search 'Docker Desktop' -> Launch it.", "Action:")
    add_bullet(doc, "Wait 20-30 seconds until the whale icon turns steady and Docker reports 'Engine running'.", "Verification:")
    
    md_content += """### Step 0: Ensure Docker Desktop is Running
- **Action:** Look at your Windows System Tray (bottom-right taskbar near clock) for the Docker whale icon.
- **Action:** If Docker Desktop is not running, open Start Menu -> Search 'Docker Desktop' -> Launch it.
- **Verification:** Wait 20-30 seconds until the whale icon turns steady and Docker reports 'Engine running'.

"""

    add_h2(doc, "Step 1: Terminal 1 — Spin Up PostgreSQL 16 & MongoDB 7")
    add_p(doc, "Open PowerShell or Command Prompt in D:\\dbms_mp and execute:")
    add_code(doc, "cd D:\\dbms_mp\ndocker compose up -d\ndocker compose ps", "Start database containers")
    
    add_p(doc, "Verify the output displays both services in an 'Up' or 'healthy' state:")
    add_bullet(doc, "ledger_postgres running on port 5432 (PostgreSQL 16 relational database).", "Container 1:")
    add_bullet(doc, "ledger_mongo running on port 27017 (MongoDB 7 document database).", "Container 2:")
    
    md_content += """### Step 1: Terminal 1 — Spin Up PostgreSQL 16 & MongoDB 7
```powershell
cd D:\\dbms_mp
docker compose up -d
docker compose ps
```
Verify the output displays both services in an 'Up' or 'healthy' state:
- **ledger_postgres**: Running on port `5432` (PostgreSQL 16 relational database).
- **ledger_mongo**: Running on port `27017` (MongoDB 7 document database).

"""

    add_h2(doc, "Step 2: Database Migration & Master Seeding")
    add_p(doc, "Execute the complete migration and seeding pipeline in Terminal 1:")
    add_code(doc, "npm run db:migrate\nnpm run db:seed", "Migrate schemas and seed test data")
    
    add_p(doc, "What this command executes under the hood:")
    add_bullet(doc, "PostgreSQL schema migrations (001_initial_schema.sql, 002_functions_triggers_views.sql, 003_alter_schema_showcase.sql).", "1. SQL Tables:")
    add_bullet(doc, "10 real-world breaches and weighted sensitive data types (passwords, SSN, credit cards, phones, etc.).", "2. SQL Reference:")
    add_bullet(doc, "MongoDB collections (breach_records, guidance_playbooks, audit_logs) equipped with strict BSON $jsonSchema validators.", "3. Mongo Setup:")
    add_bullet(doc, "20 incident response playbooks and 250+ breach records with multikey array indexes.", "4. Mongo Seed:")
    add_bullet(doc, "All 7 user accounts (Admin, Divya, Arjun, Rohan, Pooja, Vikram, Ananya, Kabir) with pre-calculated risk summaries and recovery tasks.", "5. User Personas:")
    
    md_content += """### Step 2: Database Migration & Master Seeding
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

"""

    add_h2(doc, "Step 3: Terminal 2 — Start Next.js 14 Full-Stack Web Application")
    add_p(doc, "Open a SECOND terminal window in D:\\dbms_mp and run:")
    add_code(doc, "cd D:\\dbms_mp\nnpm run dev", "Launch Web Application")
    
    add_p(doc, "Open your web browser (Chrome or Edge) and navigate to:")
    add_bullet(doc, "http://localhost:3000 -> Redirects automatically to the Login page.", "Web URL:")
    
    md_content += """### Step 3: Terminal 2 — Start Next.js 14 Full-Stack Web Application
```powershell
cd D:\\dbms_mp
npm run dev
```
Open your web browser (Chrome or Edge) and navigate to:
- **Web URL:** `http://localhost:3000` (Redirects automatically to the Login page).

"""

    add_h2(doc, "Step 4: Live Verification Test Suite (Proof of Quality)")
    add_p(doc, "If the professor asks: 'How do you know your database constraints and transactions actually work?', run:")
    add_code(doc, "npm test", "Run all 37 automated tests")
    add_p(doc, "This executes 37 automated tests covering PostgreSQL triggers, check constraints, foreign keys, MongoDB JSONSchema rejections, Next.js RBAC middleware, and ACID scan transaction rollbacks.")
    
    add_callout(doc, "Running 'npm test' in front of your professor instantly sets a high academic standard. Examiners rarely expect undergraduate projects to have a 100% passing automated test harness with 37 tests!", "EXAMINER IMPRESSION TIP")

    md_content += """### Step 4: Live Verification Test Suite (Proof of Quality)
```powershell
npm test
```
This executes 37 automated tests covering PostgreSQL triggers, check constraints, foreign keys, MongoDB JSONSchema rejections, Next.js RBAC middleware, and ACID scan transaction rollbacks.

> 💡 **PRO-TIP FOR VIVA:** Running `npm test` in front of your professor instantly sets a high academic standard. Examiners rarely expect undergraduate projects to have a 100% passing automated test harness with 37 tests!

---

"""

    # Chapter 2: Technical Explanation
    add_h1(doc, "2. Explaining the Architecture to Your Professor (Frontend, Backend, React, API)")
    md_content += "## 2. Explaining the Architecture to Your Professor (Frontend, Backend, React, API)\n\n"
    
    add_p(doc, "If your professor asks: 'Explain your stack and how the frontend, backend, and databases communicate', deliver this clear explanation:")
    md_content += "If your professor asks: 'Explain your stack and how the frontend, backend, and databases communicate', deliver this clear explanation:\n\n"

    table_data = [
        ["Layer", "Technology Used", "Role in System", "Key Implementation Detail"],
        ["Frontend UI", "Next.js 14 App Router, React 18, Tailwind CSS", "Renders responsive cybersecurity dashboard, forms, tables, and risk badges.", "Uses React Server Components for fast data rendering and 'use client' for interactive forms & modals."],
        ["Backend API", "Next.js Route Handlers (app/api/...)", "RESTful endpoints for auth, scans, identities, playbooks, and admin analytics.", "Encapsulates business logic, cryptographic hashing, and ACID transactions."],
        ["Auth & Security", "bcryptjs (Cost 10) + jose (JWT)", "Stateless, secure session authentication without server-side session stores.", "Signs encrypted JWTs in HttpOnly, SameSite=Lax cookies; verified by Edge middleware.ts."],
        ["Relational Core", "PostgreSQL 16 (Port 5432)", "Manages users, identities, scan audit logs, exposures, and aggregated risk.", "Enforces BCNF normalization, CHECK/UNIQUE/FK constraints, Triggers T1 & T2, and View."],
        ["Document Store", "MongoDB 7 (Port 27017)", "Stores polymorphic breach feeds, incident playbooks, and security audit logs.", "Guarded by strict BSON $jsonSchema validation (Error 121), multikey array indexing, and textScore."]
    ]
    add_table_data(doc, table_data[0], table_data[1:])

    md_content += """| Layer | Technology Used | Role in System | Key Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | Next.js 14 App Router, React 18, Tailwind CSS | Renders responsive cybersecurity dashboard, forms, tables, and risk badges. | Uses React Server Components for fast data rendering and `'use client'` for interactive forms & modals. |
| **Backend API** | Next.js Route Handlers (`app/api/...`) | RESTful endpoints for auth, scans, identities, playbooks, and admin analytics. | Encapsulates business logic, cryptographic hashing, and ACID transactions. |
| **Auth & Security** | bcryptjs (Cost 10) + jose (JWT) | Stateless, secure session authentication without server-side session stores. | Signs encrypted JWTs in `HttpOnly`, `SameSite=Lax` cookies; verified by Edge `middleware.ts`. |
| **Relational Core** | PostgreSQL 16 (Port 5432) | Manages users, identities, scan audit logs, exposures, and aggregated risk. | Enforces BCNF normalization, CHECK/UNIQUE/FK constraints, Triggers T1 & T2, and View. |
| **Document Store** | MongoDB 7 (Port 27017) | Stores polymorphic breach feeds, incident playbooks, and security audit logs. | Guarded by strict BSON `$jsonSchema` validation (Error 121), multikey array indexing, and `textScore`. |

"""

    add_h2(doc, "How Data Flows When a User Clicks 'Trigger Security Scan'")
    add_p(doc, "Memorize this 5-step lifecycle to explain live data flow seamlessly:")
    add_bullet(doc, "User selects a verified identity on http://localhost:3000/scans and clicks 'Trigger Security Scan'. The React client fires a POST request to /api/scans with identity_id.", "1. React Frontend:")
    add_bullet(doc, "Next.js Edge middleware.ts intercepts the request, decodes the JWT cookie using jose, validates the session, and attaches the authenticated user_id.", "2. Edge Auth Middleware:")
    add_bullet(doc, "The Route Handler computes the SHA-256 hash of the identity value. It performs a fast index lookup on MongoDB's breach_records using { identity_hash, identity_type }.", "3. Mongo Document Match:")
    add_bullet(doc, "Next, an ACID PostgreSQL transaction begins. It checks Trigger T1 (verifies identity ownership), inserts a scan_requests record, inserts exposures, invokes calculate_exposure_risk(), and fires Trigger T2 to auto-sync user_risk_summary.", "4. PostgreSQL ACID Ingestion:")
    add_bullet(doc, "The backend returns HTTP 200 with the newly discovered exposures count. React re-renders the dashboard via Server Actions / SWR, updating the risk gauge live.", "5. Live UI Update:")

    md_content += """### How Data Flows When a User Clicks 'Trigger Security Scan'
1. **React Frontend:** User selects a verified identity on `http://localhost:3000/scans` and clicks 'Trigger Security Scan'. The React client fires a `POST` request to `/api/scans` with `identity_id`.
2. **Edge Auth Middleware:** Next.js Edge `middleware.ts` intercepts the request, decodes the JWT cookie using `jose`, validates the session, and attaches the authenticated `user_id`.
3. **Mongo Document Match:** The Route Handler computes the SHA-256 hash of the identity value. It performs a fast index lookup on MongoDB's `breach_records` using `{ identity_hash, identity_type }`.
4. **PostgreSQL ACID Ingestion:** Next, an ACID PostgreSQL transaction begins. It checks Trigger T1 (verifies identity ownership), inserts a `scan_requests` record, inserts `exposures`, invokes `calculate_exposure_risk()`, and fires Trigger T2 to auto-sync `user_risk_summary`.
5. **Live UI Update:** The backend returns HTTP 200 with the newly discovered exposures count. React re-renders the dashboard via Server Actions / SWR, updating the risk gauge live.

---

"""

    # Chapter 3: Word-for-Word Script
    add_h1(doc, "3. Word-for-Word Mentor Presentation Script (What to Say)")
    md_content += "## 3. Word-for-Word Mentor Presentation Script (What to Say)\n\n"
    
    add_p(doc, "Practice saying these exact words aloud before the exam. It guarantees a confident, articulate opening:")

    add_callout(doc, """\"Good morning Sir. Today we present Ledger of Loss, a full-stack cybersecurity risk quantification and remediation intelligence platform.

The core motivation of our project is that billions of credentials have leaked online across third-party breaches. Users reuse passwords and have no visibility into how a leak in one service compromises their financial accounts, SSN, or email elsewhere.

To solve this, we implemented a Polyglot Persistence Architecture:
1. PostgreSQL 16 handles our relational, ACID-compliant core: user authentication, identities, scan transactions, exposures, and mathematical risk aggregation. All relations are strictly normalized to Boyce-Codd Normal Form (BCNF) and protected by active triggers and stored functions.
2. MongoDB 7 manages our unstructured document store: polymorphic breach feeds, incident recovery playbooks with nested checklists, and immutable security audit logs, protected by strict BSON $jsonSchema validators.
3. Our frontend is built with Next.js 14 and React 18, communicating with backend serverless route handlers and secured by bcrypt password hashing and JWT cookies verified at the Edge.

Sir, with your permission, we would like to demonstrate our live system across different user personas, execute a live ACID scan transaction, and showcase our database triggers and constraints directly in the CLI.\"""", "MEMORIZE THIS OPENING SPEECH")

    md_content += """> 🗣️ **MEMORIZE THIS OPENING SPEECH:**
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

"""

    docx_path = os.path.join(VIVA_DIR, "01_HOW_TO_RUN_AND_PRESENT.docx")
    md_path = os.path.join(VIVA_DIR, "01_HOW_TO_RUN_AND_PRESENT.md")
    
    doc.save(docx_path)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    print(f"[+] Successfully generated Section 1: {docx_path} and {md_path}")

if __name__ == "__main__":
    generate_sec1()
