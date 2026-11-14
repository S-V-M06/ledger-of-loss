import os
import sys
import subprocess

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

VIVA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "viva")
os.makedirs(VIVA_DIR, exist_ok=True)
PDF_PATH = os.path.join(VIVA_DIR, "VIVA_COMMANDS_AND_DEMO_REPORT.pdf")
HTML_PATH = os.path.join(VIVA_DIR, "VIVA_COMMANDS_AND_DEMO_REPORT.html")

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Ledger of Loss - Examiner Terminal Commands & Demo Report</title>
<style>
  @page {
    size: A4;
    margin: 14mm 12mm 14mm 12mm;
    @bottom-right {
      content: counter(page);
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.5;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  .page-break { page-break-after: always; }
  .avoid-break { page-break-inside: avoid; }
  
  .header-box {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    padding: 18px 20px;
    border-radius: 8px;
    margin-bottom: 18px;
    border-left: 6px solid #0284c7;
  }
  .header-box h1 {
    font-size: 20pt;
    margin: 0 0 4px 0;
    color: #f8fafc;
    font-weight: 800;
  }
  .header-box p {
    margin: 0;
    font-size: 10pt;
    color: #94a3b8;
  }
  .badge {
    display: inline-block;
    padding: 3px 8px;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    background: #0284c7;
    color: #ffffff;
    border-radius: 4px;
    margin-bottom: 6px;
  }

  h2 {
    color: #0f172a;
    font-size: 13pt;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 14px;
    margin-bottom: 8px;
    font-weight: 700;
  }
  h3 {
    color: #0369a1;
    font-size: 10.5pt;
    margin-top: 10px;
    margin-bottom: 4px;
    font-weight: 700;
  }
  p { margin: 0 0 6px 0; }
  
  .callout {
    padding: 10px 14px;
    border-radius: 6px;
    margin: 8px 0;
    font-size: 9pt;
  }
  .callout-info {
    background-color: #f0f9ff;
    border-left: 4px solid #0284c7;
    color: #0c4a6e;
  }
  .callout-say {
    background-color: #f8fafc;
    border-left: 4px solid #10b981;
    color: #064e3b;
    font-weight: 500;
  }

  pre {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #0f172a;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 8.5pt;
    color: #0f172a;
    overflow-x: auto;
    margin: 6px 0 10px 0;
    line-height: 1.35;
  }
  code {
    font-family: "Consolas", monospace;
    color: #0284c7;
    font-weight: 600;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 8.5pt;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 600;
  }
  tr:nth-child(even) { background-color: #f8fafc; }
</style>
</head>
<body>

<div class="header-box">
  <div class="badge">DBMS Capstone Viva Defense Guide</div>
  <h1>Ledger of Loss: Live Terminal Commands & Demonstration Guide</h1>
  <p>Ready-to-run PostgreSQL 16 & MongoDB 7 commands, trigger demonstrations, user management, and live scan walkthrough for examiners.</p>
</div>

<!-- SECTION 1: ARCHITECTURE & CONNECT -->
<div class="avoid-break">
  <h2>1. Connecting to the Database Containers (PowerShell / CMD)</h2>
  <p>Make sure Docker Desktop is running, then use these exact commands to enter each interactive shell:</p>
  
  <h3>PostgreSQL 16 CLI (psql shell)</h3>
  <pre><code>docker exec -it ledger_postgres psql -U postgres -d ledger_of_loss</code></pre>
  <p><em>Prompt will display: <code>ledger_of_loss=#</code> (Runs SQL commands, views, functions, triggers).</em></p>

  <h3>MongoDB 7 CLI (mongosh shell)</h3>
  <pre><code>docker exec -it ledger_mongo mongosh -u admin -p adminpassword --authenticationDatabase admin ledger_of_loss</code></pre>
  <p><em>Prompt will display: <code>ledger_of_loss&gt;</code> (Runs JavaScript queries, collections, aggregations).</em></p>

  <div class="callout callout-info">
    <strong>💡 Shell Distinction:</strong> Never type Mongo commands (like <code>show collections</code>) inside PostgreSQL! In PostgreSQL, use <code>\dt</code> to list tables. Inside MongoDB, use <code>show collections</code>. Type <code>\q</code> to exit psql; type <code>exit</code> to exit mongosh.
  </div>
</div>

<!-- SECTION 2: POSTGRESQL ESSENTIALS -->
<div class="avoid-break">
  <h2>2. PostgreSQL Core Commands (Schema, Tables, Views, Functions)</h2>
  
  <table>
    <tr>
      <th style="width: 25%;">Task</th>
      <th style="width: 45%;">Command (Run inside psql)</th>
      <th style="width: 30%;">What to Say to Sir</th>
    </tr>
    <tr>
      <td><strong>List All Tables</strong></td>
      <td><code>\dt</code></td>
      <td><em>"Sir, all 10 tables are normalized to BCNF with explicit primary and foreign keys."</em></td>
    </tr>
    <tr>
      <td><strong>List Virtual Views</strong></td>
      <td><code>\dv</code></td>
      <td><em>"user_security_dashboard is our view joining 4 tables without repeated query cost."</em></td>
    </tr>
    <tr>
      <td><strong>List Stored Functions</strong></td>
      <td><code>\df</code></td>
      <td><em>"calculate_exposure_risk, risk_level, and refresh_user_risk_summary are our core logic."</em></td>
    </tr>
    <tr>
      <td><strong>Inspect Table & Triggers</strong></td>
      <td><code>\d exposures</code></td>
      <td><em>"Shows check constraints (score 0-100) and Trigger T2 attached to the table."</em></td>
    </tr>
    <tr>
      <td><strong>View Users Table</strong></td>
      <td><code>SELECT user_id, name, email, role FROM users;</code></td>
      <td><em>"Lists all pre-seeded accounts and their role-based permissions."</em></td>
    </tr>
  </table>
</div>

<!-- SECTION 3: USER CREATION, DELETION & TRIGGERS -->
<div class="avoid-break">
  <h2>3. User Creation, Deletion & Live Triggers (Examiner Showcase)</h2>

  <h3>A. Create User in SQL (With Working Web Login Password UserPass123!)</h3>
  <p>Borrow Divya's valid bcrypt hash so you can log into the website immediately:</p>
  <pre><code>-- 1. Insert user:
INSERT INTO users (name, email, password_hash, role)
VALUES ('Dr. Examiner', 'examiner@viva.com', (SELECT password_hash FROM users WHERE email = 'divya@example.com'), 'user')
RETURNING user_id, name, email;

-- 2. Prove Trigger T3 auto-initialized their risk summary row:
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'examiner@viva.com');</code></pre>
  <div class="callout callout-say">
    🗣️ <strong>Say:</strong> <em>"Sir, Trigger T3 is an AFTER INSERT trigger on users. As soon as a user registers, it automatically initializes their row in user_risk_summary with 0 score. And because we used bcrypt hashing, I can log into the web UI with this user right now using password UserPass123!."</em>
  </div>

  <h3>B. Delete User (Proves Trigger T4 & ON DELETE CASCADE)</h3>
  <pre><code>-- Delete user:
DELETE FROM users WHERE email = 'examiner@viva.com';

-- Check user_risk_summary (returns 0 rows!):
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'examiner@viva.com');</code></pre>
  <div class="callout callout-say">
    🗣️ <strong>Say:</strong> <em>"Sir, notice that PostgreSQL printed an audit notice from Trigger T4, and ON DELETE CASCADE automatically purged their risk summary, identities, and exposures without leaving orphaned rows."</em>
  </div>

  <h3>C. Create Table & Drop Table Live</h3>
  <pre><code>-- 1. Create dummy table:
CREATE TABLE student_grades (
  student_id serial PRIMARY KEY,
  student_name text NOT NULL,
  mark_scored integer CHECK (mark_scored BETWEEN 0 AND 100)
);

-- 2. Verify: \dt student_grades
-- 3. Drop (delete) table:
DROP TABLE student_grades;</code></pre>
</div>

<div class="page-break"></div>

<!-- SECTION 4: THE 4 POSTGRESQL TRIGGERS -->
<div class="avoid-break">
  <h2>4. The 4 Active Triggers in PostgreSQL</h2>
  <table>
    <tr>
      <th style="width: 20%;">Trigger Name</th>
      <th style="width: 25%;">Timing & Table</th>
      <th style="width: 55%;">Function & Live Test Command</th>
    </tr>
    <tr>
      <td><strong>Trigger T1</strong><br><code>trg_scan_requests_verified</code></td>
      <td><code>BEFORE INSERT</code><br>on <code>scan_requests</code></td>
      <td><strong>Blocks scans on unverified identities:</strong><br>
      <code>INSERT INTO scan_requests (identity_id, status) VALUES ((SELECT identity_id FROM identities WHERE verified = false LIMIT 1), 'pending');</code><br>
      <em>Output: ERROR: Cannot initiate scan: Identity is not verified (SQLSTATE P0001)</em></td>
    </tr>
    <tr>
      <td><strong>Trigger T2</strong><br><code>trg_exposures_risk_score_update</code></td>
      <td><code>AFTER UPDATE OF risk_score</code><br>on <code>exposures</code></td>
      <td><strong>Auto-recalculates user_risk_summary metrics:</strong><br>
      <code>UPDATE exposures SET risk_score = 99 WHERE exposure_id = 1;</code><br>
      <em>Check: <code>SELECT * FROM user_risk_summary WHERE user_id = 1;</code> (Updated automatically!)</em></td>
    </tr>
    <tr>
      <td><strong>Trigger T3</strong><br><code>trg_user_init_summary</code></td>
      <td><code>AFTER INSERT</code><br>on <code>users</code></td>
      <td><strong>Auto-creates baseline row in user_risk_summary:</strong><br>
      Fires whenever a user signs up, setting default score = 0 and exposures = 0.</td>
    </tr>
    <tr>
      <td><strong>Trigger T4</strong><br><code>trg_log_user_deletion</code></td>
      <td><code>BEFORE DELETE</code><br>on <code>users</code></td>
      <td><strong>Logs audit console notice and cascades deletion:</strong><br>
      Prints audit notice before an account is deleted and lets foreign keys cascade.</td>
    </tr>
  </table>
</div>

<!-- SECTION 5: LIVE MONGODB DEMONSTRATION -->
<div class="avoid-break">
  <h2>5. MongoDB 7 Commands (Validators, Search & Aggregation)</h2>
  <p>Inside <code>mongosh</code> (<code>ledger_of_loss&gt;</code>):</p>

  <h3>A. Prove Strict BSON $jsonSchema Validator (Error 121)</h3>
  <pre><code>// Attempt to insert an invalid document missing required fields:
db.breach_records.insertOne({ breach_id: 999 });</code></pre>
  <p>🔴 <strong>Expected Output:</strong> <code>MongoServerError: Document failed validation (code 121)</code></p>
  <div class="callout callout-say">
    🗣️ <strong>Say:</strong> <em>"Sir, MongoDB collections are usually schemaless, but we enforce strict BSON $jsonSchema validation rules. Any document missing required fields or violating enum constraints is rejected with Error 121."</em>
  </div>

  <h3>B. Insert, Find & Delete a Valid Document</h3>
  <pre><code>// 1. Insert valid audit log:
db.audit_logs.insertOne({
  ts: new Date(),
  event_type: "login",
  user_id: 1,
  role: "admin",
  details: { note: "Examiner live demo test" }
});

// 2. Find it:
db.audit_logs.find({ "details.note": "Examiner live demo test" })

// 3. Delete it:
db.audit_logs.deleteOne({ "details.note": "Examiner live demo test" })</code></pre>

  <h3>C. 5-Stage Aggregation Pipeline (Top Compromised Data Classes)</h3>
  <pre><code>db.breach_records.aggregate([
  { $match: { exposed_fields: { $exists: true, $ne: [] } } },
  { $unwind: "$exposed_fields" },
  { $group: { _id: "$exposed_fields", total_leaks: { $sum: 1 } } },
  { $sort: { total_leaks: -1 } },
  { $limit: 5 }
]);</code></pre>
  <div class="callout callout-say">
    🗣️ <strong>Say:</strong> <em>"Sir, this aggregation pipeline uses $unwind and $group to break down arrays of exposed data types and rank the top 5 most frequently breached fields across the database."</em>
  </div>
</div>

<div class="page-break"></div>

<!-- SECTION 6: THE LIVE SCAN DEMO -->
<div class="avoid-break">
  <h2>6. The Live Scan Demo: live_demo@example.com (Full End-to-End Walkthrough)</h2>
  <p>Use this special account to show the examiner an end-to-end security scan in real time:</p>

  <div class="callout callout-info">
    <strong>Login Credentials:</strong><br>
    Email: <code>live_demo@example.com</code> | Password: <code>UserPass123!</code>
  </div>

  <ol>
    <li><strong>Sign in to http://localhost:3000/login</strong> with <code>live_demo@example.com</code> / <code>UserPass123!</code>.</li>
    <li><strong>Show Sir the baseline:</strong> The dashboard opens with <strong>Risk Score: 0 / 100 (Safe)</strong> and 0 exposures. Explain that this is a clean user.</li>
    <li><strong>Click "Scans"</strong> in the top navigation bar.</li>
    <li>Select <code>live_demo@example.com</code> and click <strong>"Trigger Security Scan"</strong>.</li>
    <li><strong>The scan executes in under 1 second:</strong> It computes the SHA-256 hash of the email, queries MongoDB <code>breach_records</code>, starts an ACID transaction in PostgreSQL, calls <code>calculate_exposure_risk()</code>, and fires Trigger T2!</li>
    <li>A success notification appears: <em>"Discovered 2 new exposures across 2 breaches!"</em></li>
    <li><strong>Click back to "Dashboard":</strong> The risk gauge immediately jumps to <strong>Score: 100 / Critical Risk</strong>, displaying Apex Health Portal (Critical) and CloudScale Nexus (High) with passwords, banking data, SSN, and recovery playbooks!</li>
  </ol>
</div>

<!-- SECTION 7: TEST ACCOUNTS CHEAT SHEET -->
<div class="avoid-break">
  <h2>7. Master Test Accounts Cheat Sheet</h2>
  <p>All passwords are <strong><code>UserPass123!</code></strong> (Admin password is <strong><code>AdminPass123!</code></strong>):</p>
  
  <table>
    <tr>
      <th style="width: 25%;">Email</th>
      <th style="width: 20%;">Password</th>
      <th style="width: 20%;">Risk Profile</th>
      <th style="width: 35%;">What It Demonstrates</th>
    </tr>
    <tr>
      <td><code>live_demo@example.com</code></td>
      <td><code>UserPass123!</code></td>
      <td>Score: 0 &rarr; 100</td>
      <td><strong>Live Scan Demo:</strong> Starts at 0 score, triggers scan live to reveal 2 critical breaches!</td>
    </tr>
    <tr>
      <td><code>divya@example.com</code></td>
      <td><code>UserPass123!</code></td>
      <td>Score: 100 (Critical)</td>
      <td><strong>Active Breach State:</strong> Pre-loaded with 3 major breaches, high risk score & pending playbooks.</td>
    </tr>
    <tr>
      <td><code>ananya.iyer@example.com</code></td>
      <td><code>UserPass123!</code></td>
      <td>Score: 55 (Remediated)</td>
      <td><strong>Hero Persona:</strong> All recovery tasks completed with green checkmarks!</td>
    </tr>
    <tr>
      <td><code>admin@ledgerofloss.local</code></td>
      <td><code>AdminPass123!</code></td>
      <td>Admin Access</td>
      <td><strong>RBAC & Telemetry:</strong> Global metrics, breach catalog, and MongoDB audit logs.</td>
    </tr>
    <tr>
      <td><code>arjun@example.com</code></td>
      <td><code>UserPass123!</code></td>
      <td>Score: ~60 (Medium)</td>
      <td><strong>Trigger T1 Test:</strong> Has unverified handle <code>arjun_coder</code> to show scan blocking.</td>
    </tr>
    <tr>
      <td><code>rohan.verma@example.com</code></td>
      <td><code>UserPass123!</code></td>
      <td>Score: 100 (Critical)</td>
      <td><strong>Financial Compromise:</strong> Leaked SSN, credit cards & banking freeze playbooks.</td>
    </tr>
    <tr>
      <td><code>vikram.m@example.com</code></td>
      <td><code>UserPass123!</code></td>
      <td>Score: 25 (Low)</td>
      <td><strong>Minimal Footprint:</strong> Only public IP and newsletter leaked; clean low-risk score.</td>
    </tr>
  </table>
</div>

<!-- SECTION 8: 5 TOP VIVA QUESTIONS -->
<div class="avoid-break">
  <h2>8. Top 5 Viva Questions & High-Scoring Answers</h2>
  
  <p><strong>Q1: Why did you use BOTH PostgreSQL and MongoDB?</strong><br>
  <em>Answer: "Sir, we used a Polyglot Persistence Architecture. User authentication, exposure state tracking, and mathematical risk calculations require ACID serializability, foreign keys, and triggers (PostgreSQL). Hacker breach dumps and incident playbooks are semi-structured, nested documents requiring weighted text search and multikey array indexing (MongoDB)."</em></p>

  <p><strong>Q2: How does the system calculate the Risk Score?</strong><br>
  <em>Answer: "Via the PostgreSQL stored function calculate_exposure_risk(). Formula: Score = LEAST(100, Base Severity + Sum of Data Weights + Recency Bonus). Plaintext passwords add 30 points, credit cards add 25, SSN adds 25, and breaches within 24 months add a 10-point recency bonus."</em></p>

  <p><strong>Q3: Is your database in BCNF?</strong><br>
  <em>Answer: "Yes Sir. In all 10 tables, for every non-trivial functional dependency X -> Y, X is a superkey enforced by PRIMARY KEY or UNIQUE constraints. There are zero non-superkey determinants."</em></p>

  <p><strong>Q4: Why use bcrypt instead of SHA-256 for user passwords?</strong><br>
  <em>Answer: "SHA-256 is designed to be fast for file verification; modern GPUs can compute billions of SHA-256 hashes per second, making brute-force easy. bcrypt is an adaptive slow hash with salt cost 10, making offline dictionary attacks computationally prohibitive."</em></p>

  <p><strong>Q5: What happens if the server crashes during a scan transaction?</strong><br>
  <em>Answer: "PostgreSQL Write-Ahead Logging (WAL) guarantees Atomicity. Uncommitted transactions are automatically rolled back during restart recovery; zero orphaned or corrupted records are ever saved."</em></p>
</div>

</body>
</html>
"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"[+] Written HTML report: {HTML_PATH}")

# Compile HTML to PDF via Microsoft Edge headless
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if os.path.exists(edge_path):
    print(f"[*] Compiling to PDF via Edge: {PDF_PATH}...")
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        "--allow-file-access-from-files",
        f"--print-to-pdf={PDF_PATH}",
        HTML_PATH
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"🎉 SUCCESS! PDF compiled: {PDF_PATH}")
    else:
        print(f"[!] Error compiling PDF: {res.stderr}")
else:
    print(f"[!] Edge not found at {edge_path}")
