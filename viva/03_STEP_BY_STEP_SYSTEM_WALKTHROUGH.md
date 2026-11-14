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

