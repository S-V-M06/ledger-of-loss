import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from docx.shared import Inches, Pt, RGBColor
from scripts.generate_viva_suite import (
    create_styled_document, add_h1, add_h2, add_h3, add_p, add_bullet, 
    add_callout, add_code, add_table_data, VIVA_DIR
)

def generate_sec4():
    print("[*] Generating Section 4: PostgreSQL & MongoDB Terminal Commands...")
    doc = create_styled_document(
        "04: PostgreSQL & MongoDB Terminal Commands",
        "Copy-Paste Terminal Showcases, Constraint Violations, Trigger Tests & Live Schema Alterations"
    )
    
    md_content = """# 04: PostgreSQL & MongoDB Terminal Commands
## Copy-Paste Terminal Showcases, Constraint Violations, Trigger Tests & Live Schema Alterations

---

"""

    # Chapter 1: Connecting
    add_h1(doc, "1. Connecting to PostgreSQL and MongoDB via Docker Terminal")
    md_content += "## 1. Connecting to PostgreSQL and MongoDB via Docker Terminal\n\n"
    
    add_p(doc, "Open PowerShell or Command Prompt in D:\\dbms_mp. Run these commands to drop directly into the interactive shells:")

    add_h2(doc, "Connect to PostgreSQL 16 (psql shell)")
    add_code(doc, "docker exec -it ledger_postgres psql -U postgres -d ledger_of_loss", "Enter PostgreSQL CLI")
    add_p(doc, "You should immediately see the prompt: ledger_of_loss=#")

    add_h2(doc, "Connect to MongoDB 7 (mongosh shell)")
    add_code(doc, "docker exec -it ledger_mongo mongosh -u admin -p adminpassword --authenticationDatabase admin ledger_of_loss", "Enter MongoDB CLI")
    add_p(doc, "You should immediately see the prompt: ledger_of_loss>")

    md_content += """### Connect to PostgreSQL 16 (`psql` shell)
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

"""

    # Chapter 2: PostgreSQL Meta-Commands
    add_h1(doc, "2. PostgreSQL Inspection Meta-Commands (Show Tables, Views, Functions)")
    md_content += "## 2. PostgreSQL Inspection Meta-Commands (Show Tables, Views, Functions)\n\n"
    
    add_p(doc, "When the professor asks: 'Show me your database schema in the terminal', run these psql meta-commands:")

    meta_table = [
        ["Meta-Command", "Description / Output", "What to Explain to Sir"],
        ["\\dt", "Lists all 9 relational tables.", "\"Sir, these are our 9 relations, all normalized to BCNF with explicit primary and foreign keys.\""],
        ["\\dv", "Lists virtual views.", "\"Sir, user_security_dashboard is our unified reporting view joining 4 tables.\""],
        ["\\df", "Lists all user-defined stored functions.", "\"Sir, calculate_exposure_risk, risk_level, and refresh_user_risk_summary are our core business logic functions.\""],
        ["\\di", "Lists all B-Tree, unique, and partial indexes.", "\"Sir, notice idx_recovery_actions_pending—it is our partial index filtered on status='pending'.\""],
        ["\\d exposures", "Shows columns, types, foreign keys, and triggers on the exposures table.", "\"Sir, notice Trigger T2 trg_exposures_risk_score_update attached to this table.\""],
        ["\\d users", "Shows columns, check constraints (email regex, role check), and unique constraints.", "\"Sir, notice the regex check constraint validating email format at the engine level.\""]
    ]
    add_table_data(doc, meta_table[0], meta_table[1:])

    md_content += """| Meta-Command | Description / Output | What to Explain to Sir |
| :--- | :--- | :--- |
| `\\dt` | Lists all 9 relational tables. | *"Sir, these are our 9 relations, all normalized to BCNF with explicit primary and foreign keys."* |
| `\\dv` | Lists virtual views. | *"Sir, user_security_dashboard is our unified reporting view joining 4 tables."* |
| `\\df` | Lists all user-defined stored functions. | *"Sir, calculate_exposure_risk, risk_level, and refresh_user_risk_summary are our core business logic functions."* |
| `\\di` | Lists all B-Tree, unique, and partial indexes. | *"Sir, notice idx_recovery_actions_pending—it is our partial index filtered on status='pending'."* |
| `\\d exposures` | Shows columns, types, foreign keys, and triggers on the exposures table. | *"Sir, notice Trigger T2 trg_exposures_risk_score_update attached to this table."* |
| `\\d users` | Shows columns, check constraints (email regex, role check), and unique constraints. | *"Sir, notice the regex check constraint validating email format at the engine level."* |

---

"""

    # Chapter 3: Constraint Violations
    add_h1(doc, "3. Live Constraint Violation Demonstrations (Prove Constraints Work)")
    md_content += "## 3. Live Constraint Violation Demonstrations (Prove Constraints Work)\n\n"
    
    add_p(doc, "Run these queries in front of your professor to prove the database engine actively protects data integrity:")

    add_h2(doc, "Test 1: Violate CHECK Constraint on User Role")
    add_code(doc, "INSERT INTO users (name, email, password_hash, role) \nVALUES ('Hacker User', 'hacker@example.com', 'some_hash', 'superadmin');", "CHECK role constraint test")
    add_bullet(doc, "ERROR: new row for relation \"users\" violates check constraint \"check_user_role\"", "Expected Output:")
    add_bullet(doc, "\"Sir, our database engine restricts role strictly to 'user' or 'admin'. Any unauthorized role is rejected immediately by the SQL engine.\"", "What to say:")

    add_h2(doc, "Test 2: Violate CHECK Constraint on Email Format (Regex Check)")
    add_code(doc, "INSERT INTO users (name, email, password_hash, role) \nVALUES ('Bad Email', 'not-an-email-address', 'some_hash', 'user');", "CHECK email regex constraint test")
    add_bullet(doc, "ERROR: new row for relation \"users\" violates check constraint \"check_user_email_format\"", "Expected Output:")

    add_h2(doc, "Test 3: Violate UNIQUE Constraint on Duplicate Email")
    add_code(doc, "INSERT INTO users (name, email, password_hash, role) \nVALUES ('Duplicate Divya', 'divya@example.com', 'some_hash', 'user');", "UNIQUE email constraint test")
    add_bullet(doc, "ERROR: duplicate key value violates unique constraint \"users_email_key\"", "Expected Output:")

    add_h2(doc, "Test 4: Violate CHECK Constraint on Breach Date in the Future")
    add_code(doc, "INSERT INTO breaches (breach_name, source_name, breach_date, severity) \nVALUES ('Future Cyber Attack', 'Darknet', '2099-01-01', 'critical');", "CHECK breach_date constraint test")
    add_bullet(doc, "ERROR: new row for relation \"breaches\" violates check constraint \"check_breach_date_past\"", "Expected Output:")

    md_content += """### Test 1: Violate CHECK Constraint on User Role
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

"""

    # Chapter 4: Live Triggers
    add_h1(doc, "4. Live Trigger Demonstrations (Triggers T1 and T2)")
    md_content += "## 4. Live Trigger Demonstrations (Triggers T1 and T2)\n\n"
    
    add_h2(doc, "Trigger T1 Live Demo: Block Scan on Unverified Identity")
    add_p(doc, "Arjun has an unverified identity: arjun_coder (verified = false). Let's attempt to insert a scan on it directly in SQL:")
    add_code(doc, """-- 1. Check Arjun's unverified identity ID:
SELECT identity_id, identity_value, verified 
FROM identities 
WHERE verified = false;

-- 2. Attempt to trigger a scan on that unverified identity:
INSERT INTO scan_requests (identity_id, status)
VALUES ((SELECT identity_id FROM identities WHERE verified = false LIMIT 1), 'pending');""", "Trigger T1 Test Query")
    
    add_bullet(doc, "ERROR: Cannot initiate scan: Identity X is not verified by its owner\nSQLSTATE: P0001", "Expected Output:")
    add_bullet(doc, "\"Sir, notice that our BEFORE INSERT Trigger T1 intercepted the query and raised an exception with custom SQLSTATE P0001. No application code was involved—the database engine itself enforced security!\"", "What to say to Sir:")

    add_h2(doc, "Trigger T2 Live Demo: Reactive Risk Summary Synchronization")
    add_p(doc, "Show the professor how updating an exposure risk score automatically updates the user_risk_summary table without running any application code:")
    add_code(doc, """-- 1. View current risk summary for User 1 (Divya):
SELECT * FROM user_risk_summary WHERE user_id = 1;

-- 2. Update an exposure's risk score:
UPDATE exposures 
SET risk_score = 99 
WHERE exposure_id = (SELECT exposure_id FROM exposures WHERE identity_id IN (SELECT identity_id FROM identities WHERE user_id = 1) LIMIT 1);

-- 3. View user_risk_summary again. Notice it changed automatically!
SELECT * FROM user_risk_summary WHERE user_id = 1;""", "Trigger T2 Test Queries")
    add_bullet(doc, "\"Sir, Trigger T2 is an AFTER UPDATE OF risk_score trigger on exposures. As soon as any score changes, it automatically recalculates the overall score and critical counts in user_risk_summary.\"", "What to say to Sir:")

    md_content += """### Trigger T1 Live Demo: Block Scan on Unverified Identity
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

"""

    # Chapter 5: Live ALTER TABLE
    add_h1(doc, "5. Live Schema Alteration (If Professor Asks to Change a Table)")
    md_content += "## 5. Live Schema Alteration (If Professor Asks to Change a Table)\n\n"
    
    add_p(doc, "If the professor asks: 'Can you add a column to users right now, add a check constraint, and prove it works?', execute these exact 4 lines:")
    add_code(doc, """-- 1. Add column account_status with default 'active'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';

-- 2. Add CHECK constraint
ALTER TABLE users 
ADD CONSTRAINT check_account_status CHECK (account_status IN ('active', 'suspended', 'locked'));

-- 3. Verify column and constraint exist
\\d users

-- 4. Test constraint rejection live
INSERT INTO users (name, email, password_hash, account_status)
VALUES ('Test User', 'test_status@example.com', 'some_hash', 'banned'); -- FAILS!

INSERT INTO users (name, email, password_hash, account_status)
VALUES ('Valid User', 'valid_status@example.com', 'some_hash', 'suspended'); -- SUCCEEDS!""", "Live Schema Alteration Queries")
    add_bullet(doc, "\"Sir, this demonstrates online DDL evolution via ALTER TABLE with immediate CHECK constraint enforcement and default value backfilling without data loss.\"", "What to say to Sir:")

    # Chapter 6: User Creation, Deletion & Cascading Triggers
    add_h1(doc, "6. User Creation, Deletion & Cascading Triggers (Live Demonstration)")
    md_content += "## 6. User Creation, Deletion & Cascading Triggers (Live Demonstration)\n\n"
    
    add_p(doc, "If your professor asks: 'How do you create a user, delete a user, and what happens to their data?', run these queries:")

    add_h2(doc, "A. Create Application User & Trigger T3 Auto-Initialization")
    add_p(doc, "When a new user is inserted into users, Trigger T3 (trg_user_init_summary) automatically fires to create a default baseline row in user_risk_summary:")
    add_code(doc, """-- 1. Create a new user live:
INSERT INTO users (name, email, password_hash, role)
VALUES ('Mentor Guest', 'mentor_guest@example.com', 'hashed123', 'user')
RETURNING user_id, name, email;

-- 2. Prove Trigger T3 automatically initialized their risk summary:
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'mentor_guest@example.com');""", "Create User & Trigger T3")
    add_bullet(doc, "\"Sir, Trigger T3 is an AFTER INSERT trigger on users. As soon as a user registers, it guarantees a synchronized user_risk_summary row exists with 0 baseline score.\"", "What to say to Sir:")

    add_h2(doc, "B. Delete User & Trigger T4 Cascading Audit Log")
    add_p(doc, "When a user is deleted, Trigger T4 (trg_log_user_deletion) logs an audit notice, and ON DELETE CASCADE automatically purges all child records:")
    add_code(doc, """-- 1. Delete the user:
DELETE FROM users WHERE email = 'mentor_guest@example.com';
-- Expected Output: NOTICE: AUDIT LOG: User [ID: X, Email: mentor_guest@example.com] deleted. Cascading deletion...

-- 2. Verify ON DELETE CASCADE wiped their risk summary:
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'mentor_guest@example.com');
-- Returns 0 rows!""", "Delete User & Cascade Demonstration")
    add_bullet(doc, "\"Sir, our foreign keys enforce ON DELETE CASCADE. Deleting a user automatically purges their identities, scans, exposures, recovery actions, and risk summary without leaving orphaned rows.\"", "What to say to Sir:")

    add_h2(doc, "C. Create & Drop PostgreSQL Database Roles (Mentor Auditor Demo)")
    add_p(doc, "If the professor asks for database engine role administration:")
    add_code(doc, """-- 1. Create a read-only database user for the mentor:
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
DROP USER mentor_auditor;""", "Database User Administration")

    md_content += """```sql
-- 1. Add column account_status with default 'active'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';

-- 2. Add CHECK constraint
ALTER TABLE users 
ADD CONSTRAINT check_account_status CHECK (account_status IN ('active', 'suspended', 'locked'));

-- 3. Verify column and constraint exist
\\d users

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

"""

    # Chapter 7: Live MongoDB Commands
    add_h1(doc, "7. Live MongoDB Commands (Inspection, Validators, Text Search & Aggregation)")
    md_content += "## 7. Live MongoDB Commands (Inspection, Validators, Text Search & Aggregation)\n\n"
    
    add_p(doc, "IMPORTANT: Exit psql first by typing \\q. Then open the mongosh terminal using:\ndocker exec -it ledger_mongo mongosh -u admin -p adminpassword --authenticationDatabase admin ledger_of_loss\nPrompt will change to: ledger_of_loss>")

    add_h2(doc, "A. Show Collections and Indexes")
    add_code(doc, """show collections
// Collections: audit_logs, breach_records, guidance_playbooks

// View multikey and text indexes on breach_records:
db.breach_records.getIndexes()""", "MongoDB Inspection")

    add_h2(doc, "B. Prove BSON $jsonSchema Validator Rejection (Error 121)")
    add_p(doc, "Attempt to insert a breach record missing mandatory fields or violating the schema:")
    add_code(doc, """// Missing required fields (should FAIL with Error 121)
db.breach_records.insertOne({
  breach_id: 999
});""", "MongoDB Validator Test")
    add_bullet(doc, "MongoServerError: Document failed validation (code 121)", "Expected Output:")
    add_bullet(doc, "\"Sir, MongoDB collections are typically schemaless, but we enforce strict BSON $jsonSchema validators at the engine level. Malformed or invalid documents are rejected with Error 121!\"", "What to say to Sir:")

    add_h2(doc, "C. Weighted Full-Text Search with Relevance Ranking (textScore)")
    add_code(doc, """db.guidance_playbooks.find(
  { $text: { $search: "password credential rotation MFA" } },
  { score: { $meta: "textScore" }, title: 1, priority: 1 }
).sort({ score: { $meta: "textScore" } }).limit(3);""", "MongoDB Text Search")
    add_bullet(doc, "\"Sir, this uses MongoDB's inverted text index to calculate mathematical relevance scores based on keyword weights.\"", "What to say to Sir:")

    add_h2(doc, "D. 5-Stage Aggregation Pipeline ($match, $unwind, $group, $sort, $limit)")
    add_p(doc, "Show the professor how MongoDB aggregates compromised data types across all breach records:")
    add_code(doc, """db.breach_records.aggregate([
  // Stage 1: Filter breach records that have exposed fields
  { $match: { exposed_fields: { $exists: true, $ne: [] } } },
  // Stage 2: Unwind the array into individual stream documents
  { $unwind: "$exposed_fields" },
  // Stage 3: Group by exposed data type and count occurrences
  { $group: { _id: "$exposed_fields", total_leaks: { $sum: 1 } } },
  // Stage 4: Sort by most frequently compromised data type
  { $sort: { total_leaks: -1 } },
  // Stage 5: Limit to top 5 most dangerous leaked fields
  { $limit: 5 }
]);""", "5-Stage Aggregation Pipeline")
    add_bullet(doc, "\"Sir, this aggregation pipeline demonstrates how MongoDB handles document reshaping, array unwinding, and multi-stage analytics without requiring relational JOINs.\"", "What to say to Sir:")

    md_content += """### A. Show Collections and Indexes
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

"""

    docx_path = os.path.join(VIVA_DIR, "04_SQL_AND_MONGODB_TERMINAL_COMMANDS.docx")
    md_path = os.path.join(VIVA_DIR, "04_SQL_AND_MONGODB_TERMINAL_COMMANDS.md")
    
    doc.save(docx_path)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    print(f"[+] Successfully generated Section 4: {docx_path} and {md_path}")

if __name__ == "__main__":
    generate_sec4()
