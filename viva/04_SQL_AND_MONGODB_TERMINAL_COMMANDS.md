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

