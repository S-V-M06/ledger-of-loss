import base64
import os
import subprocess
import sys

# Configure UTF-8 for console output
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def generate_pdf():
    print("[*] Generating Master Mentor Defense & Viva Guide PDF...")

    er_img_base64 = ""
    er_path = "Ledger_of_Loss_ER_Diagram.png"
    if os.path.exists(er_path):
        with open(er_path, "rb") as f:
            er_img_base64 = base64.b64encode(f.read()).decode("utf-8")
        print("[+] Loaded ER diagram image as Base64")
    else:
        print("[!] ER diagram image not found!")

    img_tag = f'<img src="data:image/png;base64,{er_img_base64}" alt="Ledger of Loss ER Diagram">' if er_img_base64 else '<p><em>[ER Diagram Image Ledger_of_Loss_ER_Diagram.png]</em></p>'

    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Ledger of Loss: Comprehensive Project & Viva Defense Report</title>
<style>
  @page {
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
  }

  /* Page Break Helpers */
  .page-break {
    page-break-after: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Cover Page */
  .cover-page {
    height: 96vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 26px 20px;
    border: 3px solid #0f172a;
    border-radius: 8px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }

  .cover-header {
    border-bottom: 2px solid #0284c7;
    padding-bottom: 16px;
  }

  .badge-tag {
    display: inline-block;
    padding: 4px 10px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: #0f172a;
    color: #38bdf8;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .cover-title {
    font-size: 24pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px 0;
    line-height: 1.15;
  }

  .cover-subtitle {
    font-size: 12pt;
    color: #0284c7;
    font-weight: 600;
    margin: 0 0 12px 0;
  }

  .cover-desc {
    font-size: 10pt;
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 20px 0;
    background-color: #f1f5f9;
    padding: 14px;
    border-radius: 6px;
    border-left: 4px solid #0284c7;
  }

  .meta-item strong {
    display: block;
    font-size: 8.5pt;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 2px;
  }

  .meta-item span {
    font-size: 10.5pt;
    font-weight: 700;
    color: #0f172a;
  }

  .cover-footer {
    border-top: 1px solid #cbd5e1;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #64748b;
  }

  /* Headings */
  h1 {
    font-size: 16pt;
    color: #0f172a;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-top: 22px;
    margin-bottom: 12px;
    font-weight: 800;
  }

  h2 {
    font-size: 12.5pt;
    color: #0369a1;
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 700;
    border-left: 3px solid #0284c7;
    padding-left: 8px;
  }

  h3 {
    font-size: 10.5pt;
    color: #0f172a;
    margin-top: 12px;
    margin-bottom: 6px;
    font-weight: 700;
  }

  p {
    margin: 0 0 10px 0;
    text-align: justify;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px 0;
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
    font-weight: 700;
    font-size: 8.5pt;
    letter-spacing: 0.02em;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  /* Code Blocks */
  pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 9px 12px;
    border-radius: 5px;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 8pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 8px 0 12px 0;
    border: 1px solid #1e293b;
    page-break-inside: avoid;
  }

  code {
    font-family: "Consolas", "Courier New", monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }

  pre code {
    background-color: transparent;
    color: #f8fafc;
    border: none;
    padding: 0;
    font-size: 8pt;
  }

  /* Callout Boxes */
  .callout {
    padding: 9px 12px;
    margin: 10px 0;
    border-radius: 5px;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  .callout-info {
    background-color: #f0f9ff;
    border-left: 4px solid #0284c7;
    color: #0369a1;
  }

  .callout-tip {
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    color: #15803d;
  }

  .callout-warning {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    color: #b45309;
  }

  .callout strong {
    display: block;
    margin-bottom: 2px;
    font-size: 9pt;
  }

  /* Diagrams */
  .diagram-container {
    text-align: center;
    margin: 12px 0;
    page-break-inside: avoid;
  }

  .diagram-container img {
    max-width: 98%;
    max-height: 480px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .diagram-caption {
    font-size: 8.5pt;
    color: #64748b;
    font-style: italic;
    margin-top: 5px;
  }

  /* Q&A Item */
  .qa-item {
    margin-bottom: 14px;
    page-break-inside: avoid;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 10px;
  }

  .qa-question {
    font-weight: 700;
    color: #0f172a;
    font-size: 10pt;
    margin-bottom: 3px;
  }

  .qa-question span {
    color: #0284c7;
  }

  .qa-answer {
    color: #334155;
    font-size: 9pt;
    line-height: 1.5;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 9.5pt;
    border-bottom: 1px dotted #cbd5e1;
    padding-bottom: 2px;
  }
  .toc-item span:first-child {
    font-weight: 600;
    color: #0f172a;
  }
  .toc-item span:last-child {
    font-weight: 700;
    color: #0284c7;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page page-break">
  <div class="cover-header">
    <span class="badge-tag">DBMS Experiential Learning — Level 3 Project</span>
    <h1 class="cover-title">LEDGER OF LOSS</h1>
    <div class="cover-subtitle">Privacy-Focused Data Exposure & Recovery Navigator</div>
    <p class="cover-desc">
      A comprehensive multi-paradigm database application combining PostgreSQL 16 (Relational Core, Advanced Triggers, Stored Procedures, Views, Strict Constraints) with MongoDB 7 (Document Store, Full-Text Search, Strict $jsonSchema Validation, Multikey Indexing, Aggregation Pipelines), powered by a Next.js 14 TypeScript interface.
    </p>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <strong>Course & Level</strong>
      <span>DBMS Level 3 Experiential Learning</span>
    </div>
    <div class="meta-item">
      <strong>Database Paradigms</strong>
      <span>SQL (PostgreSQL 16) + NoSQL (MongoDB 7)</span>
    </div>
    <div class="meta-item">
      <strong>Application Stack</strong>
      <span>Next.js 14 App Router, TypeScript, Tailwind CSS, Docker</span>
    </div>
    <div class="meta-item">
      <strong>Authentication & Security</strong>
      <span>jose HS256 JWT (httpOnly), bcryptjs (Cost 10), SHA-256 Hashes</span>
    </div>
    <div class="meta-item">
      <strong>Student Contributors</strong>
      <span>2-Member Collaborative Team (Vertical Slices A & B)</span>
    </div>
    <div class="meta-item">
      <strong>Document Scope</strong>
      <span>Full System Architecture, ER/RS, DDL/DML, ASDL, MQL & Viva Defense</span>
    </div>
  </div>

  <div class="callout callout-info">
    <strong>Mentor & Examiner Quick-Guide</strong>
    This document serves as the master technical dossier for project review and oral viva voce examination. It contains verbatim SQL and MongoDB shell commands for live console execution, architectural justifications, normalization proofs, mathematical scoring formulas, and 25 viva questions with model answers.
  </div>

  <div class="cover-footer">
    <span>Ledger of Loss Project Specification Dossier</span>
    <span>PostgreSQL 16 &bull; MongoDB 7 &bull; Next.js 14</span>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="avoid-break page-break">
  <h1>Table of Contents</h1>
  
  <div style="margin-top: 14px;">
    <div class="toc-item"><span>1. Problem Statement (PS), Motivation & System Scope</span><span>Section 1</span></div>
    <div class="toc-item"><span>2. System Architecture & Hybrid Data Flow</span><span>Section 2</span></div>
    <div class="toc-item"><span>3. Entity-Relationship (ER) Diagram & Attribute Dictionary</span><span>Section 3</span></div>
    <div class="toc-item"><span>4. Relational Schema (RS) & Rigorous Normalization Proof (3NF / BCNF)</span><span>Section 4</span></div>
    <div class="toc-item"><span>5. Live PostgreSQL Demonstration Guide (Terminal Commands, DDL, DML)</span><span>Section 5</span></div>
    <div class="toc-item"><span>6. Advanced SQL Database Features (ASDL: Triggers, Functions, Views, Indexes)</span><span>Section 6</span></div>
    <div class="toc-item"><span>7. Live MongoDB / NoSQL Demonstration Guide ($jsonSchema, Indexes, MQL)</span><span>Section 7</span></div>
    <div class="toc-item"><span>8. The 8 Critical Analytical Queries (Q1 through Q8 Showcase)</span><span>Section 8</span></div>
    <div class="toc-item"><span>9. Live Application Walkthrough & Step-by-Step Viva Script</span><span>Section 9</span></div>
    <div class="toc-item"><span>10. 25 Exhaustive Viva Questions, Database Traps & Model Answers</span><span>Section 10</span></div>
    <div class="toc-item"><span>11. Emergency Terminal Cheatsheet ("What If the Mentor Asks...")</span><span>Section 11</span></div>
  </div>

  <div class="callout callout-tip" style="margin-top: 20px;">
    <strong>How to Use This Document During the Evaluation</strong>
    Keep a terminal open with both databases running in Docker. When the mentor asks to see a concept (e.g., <em>"Show me a trigger firing"</em> or <em>"Show me MongoDB rejecting bad data"</em>), turn immediately to Section 5, 6, or 7. Each test includes copy-paste commands and the exact expected console output.
  </div>
</div>

<!-- SECTION 1: PROBLEM STATEMENT & SCOPE -->
<div class="page-break">
  <h1>1. Problem Statement (PS), Motivation & Scope</h1>

  <h2>1.1 Real-World Motivation</h2>
  <p>
    In modern digital society, data breaches occur with alarming regularity. Major institutions—ranging from healthcare providers and credit rating agencies to social networks and utilities—frequently suffer credential leaks. When end users receive notifications that their data has been exposed, they are universally confronted with three systemic failures in existing consumer security tools (such as <em>Have I Been Pwned</em>):
  </p>
  <ul>
    <li><strong>Lack of Contextual Severity:</strong> Current portals announce that an account appeared in a leak, but provide no objective, weighted calculation of danger. A leaked plaintext password alongside government tax IDs from two months ago is an immediate identity theft emergency; a leaked gaming username from 2012 is low priority. Existing systems treat them identically.</li>
    <li><strong>Absence of Actionable Guidance:</strong> Users are left in a state of anxiety without an ordered, step-by-step remediation plan matched to the specific data attributes compromised.</li>
    <li><strong>Zero State Tracking:</strong> There is no personal task manager or checklist allowing the individual to systematically execute and verify their recovery milestones.</li>
  </ul>

  <h2>1.2 The Solution: Ledger of Loss</h2>
  <p>
    <strong>Ledger of Loss</strong> is a privacy-first data exposure and recovery navigator. It shifts the paradigm from passive alarmism to structured, measurable remediation:
  </p>
  <ol>
    <li><strong>Verified Ownership Guard:</strong> Users register digital identities (email or username) and must confirm ownership before scans are permitted. This is enforced not merely in the UI, but by a <strong>database-level trigger (T1)</strong> inside PostgreSQL.</li>
    <li><strong>Zero-Exposure Cryptographic Scanning:</strong> Scans never query plaintext identity values across raw breach dumps. The system hashes the lower-cased identity with <strong>SHA-256</strong> and matches it against pre-hashed documents in MongoDB.</li>
    <li><strong>Deterministic Database Risk Scoring:</strong> Stored procedure <code>calculate_exposure_risk()</code> computes an objective 0–100 risk score based on breach severity base points, recency bonuses (&lt; 24 months), and weights assigned to individual data types.</li>
    <li><strong>Actionable Remediation Playbooks:</strong> The system maps leaked fields to curated MongoDB playbooks, generating an interactive checklist where users mark actions as completed.</li>
    <li><strong>Privacy-Safe Aggregate Analytics:</strong> System administrators manage breaches and playbooks, but can only view high-level aggregates (Queries Q2 through Q8). An administrator can <em>never</em> view a user's plaintext identity or personal exposures.</li>
  </ol>

  <h2>1.3 System Scope & Boundaries</h2>
  <table>
    <thead>
      <tr>
        <th>Functional Capability</th>
        <th>User Role</th>
        <th>Admin Role</th>
        <th>Enforcement Mechanism</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Account Registration & Login</td>
        <td>Yes</td>
        <td>Yes</td>
        <td>bcryptjs (Cost 10) + PostgreSQL <code>users</code> table</td>
      </tr>
      <tr>
        <td>Identity Registration & Verification</td>
        <td>Yes (Own identities)</td>
        <td>Yes (Own identities)</td>
        <td>PostgreSQL <code>identities</code> + Trigger T1</td>
      </tr>
      <tr>
        <td>Execute Breach Scans</td>
        <td>Yes (Verified only)</td>
        <td>Yes (Verified only)</td>
        <td>ACID Transaction (<code>POST /api/scans</code>)</td>
      </tr>
      <tr>
        <td>View Security Dashboard & Exposures</td>
        <td>Yes (Personal view)</td>
        <td>Yes (Personal view)</td>
        <td>SQL View <code>user_security_dashboard</code></td>
      </tr>
      <tr>
        <td>Manage Recovery Actions Checklist</td>
        <td>Yes (Tick off items)</td>
        <td>Yes (Tick off items)</td>
        <td>PostgreSQL <code>recovery_actions</code> (Partial Index)</td>
      </tr>
      <tr>
        <td>Search Guidance Library</td>
        <td>Yes (Read-only)</td>
        <td>Yes (Read & Write)</td>
        <td>MongoDB Weighted Text Search ($textScore)</td>
      </tr>
      <tr>
        <td>Breach Catalog Management</td>
        <td>No (Forbidden)</td>
        <td>Yes (Full Access)</td>
        <td>Compensating Cross-Database Transaction</td>
      </tr>
      <tr>
        <td>Guidance Playbook Authoring (CRUD)</td>
        <td>No (Forbidden)</td>
        <td>Yes (Full Access)</td>
        <td>MongoDB Strict $jsonSchema Validation</td>
      </tr>
      <tr>
        <td>System-Wide Threat Analytics</td>
        <td>No (Forbidden)</td>
        <td>Yes (Aggregates only)</td>
        <td>Edge Middleware + Queries Q2–Q8</td>
      </tr>
      <tr>
        <td>Append-Only Security Audit Trail</td>
        <td>No (Forbidden)</td>
        <td>Yes (Read-only)</td>
        <td>MongoDB <code>audit_logs</code> Collection</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- SECTION 2: SYSTEM ARCHITECTURE & DATA FLOW -->
<div class="page-break">
  <h1>2. System Architecture & Hybrid Data Flow</h1>

  <h2>2.1 Architectural Paradigm & Justification</h2>
  <p>
    The project strictly fulfills <strong>Option 1: SQL + NoSQL</strong> by deploying <strong>PostgreSQL 16</strong> alongside <strong>MongoDB 7</strong>. Each database was chosen based on the mathematical shape and transactional requirements of the data:
  </p>

  <table>
    <thead>
      <tr>
        <th>Architectural Criterion</th>
        <th>PostgreSQL 16 (Relational SQL)</th>
        <th>MongoDB 7 (Document NoSQL)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Primary Role</strong></td>
        <td>Source of truth for core business entities, user accounts, and transactional workflows.</td>
        <td>Storage for polymorphic breach records, rich text playbooks, and high-velocity audit logs.</td>
      </tr>
      <tr>
        <td><strong>Data Characteristics</strong></td>
        <td>Highly structured, fixed schema, strict relational dependencies, mathematical computations.</td>
        <td>Semi-structured, nested arrays, polymorphic key-value metadata, text-heavy guidance.</td>
      </tr>
      <tr>
        <td><strong>Transactional Guarantee</strong></td>
        <td><strong>Full ACID:</strong> Atomic scans, foreign keys with <code>ON DELETE CASCADE</code>, triggers.</td>
        <td>Document-level atomicity, append-only throughput, eventual consistency.</td>
      </tr>
      <tr>
        <td><strong>Advanced Features</strong></td>
        <td>Stored procedures (PL/pgSQL), Triggers T1 & T2, SQL Views, Partial B-Tree Indexes.</td>
        <td>Strict <code>$jsonSchema</code> engine validation, weighted text search, aggregation pipelines.</td>
      </tr>
    </tbody>
  </table>

  <h2>2.2 Cross-Database Reference Rule & Compensating Transactions</h2>
  <div class="callout callout-warning">
    <strong>Crucial Viva Concept: Cross-Database Referential Integrity</strong>
    PostgreSQL and MongoDB cannot share a database-level Foreign Key constraint. Cross-database linkages (such as <code>recovery_actions.playbook_ref</code> storing a MongoDB <code>ObjectId</code> as text, and <code>breach_records.breach_id</code> referencing PostgreSQL <code>breach_id</code>) are managed strictly at the <strong>application layer</strong>.
  </div>
  <p>
    When an administrator adds a new breach (involving a relational row in PostgreSQL and hundreds of raw records in MongoDB), the application utilizes a <strong>Compensating Transaction Pattern</strong>:
  </p>
  <pre><code>// Cross-Database Pattern in app/api/admin/breaches/route.ts
1. Write master breach to PostgreSQL: INSERT INTO breaches (...) RETURNING breach_id;
2. Attempt bulk write to MongoDB: db.collection('breach_records').insertMany(...);
3. IF MongoDB write throws an error:
     Execute compensating rollback: DELETE FROM breaches WHERE breach_id = createdBreachId;
     Return 500 error: "PostgreSQL row deleted to prevent orphan asymmetric state."
4. ELSE:
     Append audit log entry and commit.</code></pre>

  <h2>2.3 The ACID Scan Transaction Workflow</h2>
  <p>
    The core scanning engine (<code>POST /api/scans</code>) demonstrates strict transactional ordering to ensure optimal latency and atomicity:
  </p>
  <pre><code>Step 1 [Auth & Guard]: Authenticate user via JWT session. Fetch identity. If verified=false, reject.
Step 2 [Pre-Transaction NoSQL Read]: Outside SQL transaction, compute sha256(identity_value).
      Query MongoDB breach_records for matching hash. Query guidance_playbooks for relevant steps.
Step 3 [ACID PostgreSQL Transaction]:
      BEGIN;
      a) INSERT INTO scan_requests (...) -> Trigger T1 verifies ownership at DB layer.
      b) INSERT INTO exposures (...) ON CONFLICT (identity_id, breach_id) DO NOTHING;
      c) INSERT INTO exposure_data_types (...) -> Maps leaked fields to data_types.
      d) UPDATE exposures SET risk_score = calculate_exposure_risk(exposure_id);
         -> Trigger T2 fires automatically, refreshing user_risk_summary!
      e) INSERT INTO recovery_actions (...) -> Links matched MongoDB playbooks.
      f) UPDATE scan_requests SET status = 'completed', exposures_found = N;
      COMMIT; (On any error -> ROLLBACK; 0 orphan rows persist).
Step 4 [Post-Commit Audit]: Append scan_completed and recommendations_issued to MongoDB audit_logs.</code></pre>
</div>

<!-- SECTION 3: ER DIAGRAM & ATTRIBUTE DICTIONARY -->
<div class="page-break">
  <h1>3. Entity-Relationship (ER) Diagram & Attribute Dictionary</h1>

  <h2>3.1 Visual Relational ER Diagram</h2>
  <div class="diagram-container">
    INSERT_ER_IMAGE_HERE
    <div class="diagram-caption">Figure 3.1: Complete Relational ER Model for Ledger of Loss (PostgreSQL Core Entities)</div>
  </div>

  <h2>3.2 Entity & Relationship Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Entity Name</th>
        <th>Primary Key</th>
        <th>Foreign Keys</th>
        <th>Cardinality & Relationships</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>users</code></td>
        <td><code>user_id</code> (serial)</td>
        <td>None</td>
        <td>1:N with <code>identities</code>; 1:1 with <code>user_risk_summary</code></td>
      </tr>
      <tr>
        <td><code>identities</code></td>
        <td><code>identity_id</code> (serial)</td>
        <td><code>user_id</code> &rarr; <code>users</code></td>
        <td>N:1 with <code>users</code>; 1:N with <code>scan_requests</code>; 1:N with <code>exposures</code></td>
      </tr>
      <tr>
        <td><code>breaches</code></td>
        <td><code>breach_id</code> (serial)</td>
        <td>None</td>
        <td>1:N with <code>exposures</code></td>
      </tr>
      <tr>
        <td><code>data_types</code></td>
        <td><code>data_type_id</code> (serial)</td>
        <td>None</td>
        <td>M:N with <code>exposures</code> through <code>exposure_data_types</code></td>
      </tr>
      <tr>
        <td><code>scan_requests</code></td>
        <td><code>scan_id</code> (serial)</td>
        <td><code>identity_id</code> &rarr; <code>identities</code></td>
        <td>N:1 with <code>identities</code>; 1:N with <code>exposures</code></td>
      </tr>
      <tr>
        <td><code>exposures</code></td>
        <td><code>exposure_id</code> (serial)</td>
        <td><code>identity_id</code>, <code>breach_id</code>, <code>scan_id</code></td>
        <td>Associative entity linking <code>identities</code> and <code>breaches</code>; 1:N with <code>recovery_actions</code></td>
      </tr>
      <tr>
        <td><code>exposure_data_types</code></td>
        <td><code>(exposure_id, data_type_id)</code></td>
        <td><code>exposure_id</code>, <code>data_type_id</code></td>
        <td>Pure composite bridge table resolving M:N relationship</td>
      </tr>
      <tr>
        <td><code>recovery_actions</code></td>
        <td><code>action_id</code> (serial)</td>
        <td><code>exposure_id</code> &rarr; <code>exposures</code></td>
        <td>N:1 with <code>exposures</code>; references MongoDB <code>guidance_playbooks</code></td>
      </tr>
      <tr>
        <td><code>user_risk_summary</code></td>
        <td><code>user_id</code> (int)</td>
        <td><code>user_id</code> &rarr; <code>users</code></td>
        <td>1:1 summary table maintained exclusively by Trigger T2</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- SECTION 4: RELATIONAL SCHEMA & NORMALIZATION PROOF -->
<div class="page-break">
  <h1>4. Relational Schema (RS) & Normalization Proof</h1>

  <h2>4.1 Formal Relational Schema Representation</h2>
  <pre><code>users (
    user_id [PK], name, email [UQ], password_hash, role, created_at
)

identities (
    identity_id [PK], user_id [FK -> users.user_id ON DELETE CASCADE],
    identity_value, identity_type, verified, verified_at, created_at
    UQ: (user_id, identity_value)
)

breaches (
    breach_id [PK], breach_name [UQ], source_name, breach_date, severity, description
)

data_types (
    data_type_id [PK], name [UQ], weight
)

scan_requests (
    scan_id [PK], identity_id [FK -> identities.identity_id ON DELETE CASCADE],
    started_at, completed_at, status, exposures_found
)

exposures (
    exposure_id [PK], identity_id [FK -> identities.identity_id ON DELETE CASCADE],
    breach_id [FK -> breaches.breach_id],
    scan_id [FK -> scan_requests.scan_id ON DELETE SET NULL],
    discovered_at, risk_score
    UQ: (identity_id, breach_id)
)

exposure_data_types (
    exposure_id [PK, FK -> exposures.exposure_id ON DELETE CASCADE],
    data_type_id [PK, FK -> data_types.data_type_id]
)

recovery_actions (
    action_id [PK], exposure_id [FK -> exposures.exposure_id ON DELETE CASCADE],
    playbook_ref, title, priority, status, created_at, completed_at
    UQ: (exposure_id, playbook_ref)
)

user_risk_summary (
    user_id [PK, FK -> users.user_id ON DELETE CASCADE],
    total_exposures, high_count, critical_count, overall_score, updated_at
)</code></pre>

  <h2>4.2 Normalization Proof (1NF &rarr; 2NF &rarr; 3NF &rarr; BCNF)</h2>
  <div class="avoid-break">
    <h3>First Normal Form (1NF) Compliance</h3>
    <p>A relation is in 1NF if all domain values are atomic and there are no repeating groups.</p>
    <ul>
      <li>Every attribute in the schema holds a single atomic scalar value (integers, dates, bounded text, booleans).</li>
      <li>In earlier unnormalized designs, exposed fields (e.g. <code>"password, financial"</code>) were stored as a comma-separated string inside <code>exposures</code>. In our schema, this is decomposed into the relational bridge table <code>exposure_data_types</code>, eliminating all multi-valued attributes.</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Second Normal Form (2NF) Compliance</h3>
    <p>A relation is in 2NF if it is in 1NF and no non-prime attribute depends on part of a candidate key.</p>
    <ul>
      <li>Tables with single-attribute primary keys (<code>users</code>, <code>identities</code>, <code>breaches</code>, <code>data_types</code>, <code>scan_requests</code>, <code>exposures</code>, <code>recovery_actions</code>, <code>user_risk_summary</code>) are automatically in 2NF because no proper subset of a single-column key exists.</li>
      <li>The only composite primary key table is <code>exposure_data_types(exposure_id, data_type_id)</code>. This table contains zero non-prime attributes; both attributes form the composite key itself. Hence, partial dependency is impossible. <strong>Strictly in 2NF.</strong></li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Third Normal Form (3NF) & BCNF Compliance</h3>
    <p>A relation is in 3NF if it is in 2NF and has no transitive dependencies. It is in BCNF if for every functional dependency X &rarr; Y, X is a superkey.</p>
    <ul>
      <li>In <code>identities</code>: identity_id determines user_id, identity_value, identity_type, verified. No non-prime attribute determines any other non-prime attribute.</li>
      <li>In <code>exposures</code>: exposure_id determines identity_id, breach_id, risk_score. Risk score is computed via function and stored directly on the exposure row.</li>
      <li>In <code>recovery_actions</code>: All non-prime attributes (title, priority, status) are functionally dependent directly on action_id.</li>
      <li><strong>BCNF Conclusion:</strong> In every relation in the relational schema, the left-hand side of every non-trivial functional dependency is a superkey. The database is formally normalized to <strong>Boyce-Codd Normal Form (BCNF)</strong>.</li>
    </ul>
  </div>
</div>

<!-- SECTION 5: LIVE SQL DEMONSTRATION GUIDE -->
<div class="page-break">
  <h1>5. Live PostgreSQL Demonstration Guide (Terminal Commands)</h1>

  <h2>5.1 How to Connect Live Inside Docker</h2>
  <p>To execute SQL queries directly during your viva examination, open PowerShell/Command Prompt and run:</p>
  <pre><code>docker exec -it ledger_postgres psql -U postgres -d ledger_of_loss</code></pre>

  <h2>5.2 Live DDL Showcase: Table Creation & Schema Alteration</h2>
  <p>If the mentor asks: <em>"Show me how you created your tables or alter a schema live:"</em></p>
  <pre><code>-- 1. View all tables in public schema:
\\dt

-- 2. Inspect table structure and constraints:
\\d identities
\\d exposures

-- 3. Live ALTER TABLE demonstration (Migration 003 showcase):
-- If mentor asks to add a column:
ALTER TABLE users ADD COLUMN phone_number text;
ALTER TABLE users ADD CONSTRAINT check_phone_format CHECK (phone_number ~* '^\\+[0-9]{10,15}$');

-- Clean it up live:
ALTER TABLE users DROP CONSTRAINT check_phone_format;
ALTER TABLE users DROP COLUMN phone_number;</code></pre>

  <h2>5.3 Demonstrating Integrity Constraint Violations (Prove They Reject Bad Data)</h2>
  <p>Run these live to prove that data validation is strictly implemented at the database level:</p>

  <div class="avoid-break">
    <h3>Test A: Malformed Email Rejected by CHECK Constraint</h3>
    <pre><code>-- Fails with Check Violation (Error code 23514) on check_user_email_format
INSERT INTO users (name, email, password_hash)
VALUES ('Bad User', 'not-a-valid-email', 'dummyhash');

-- Console Output:
-- ERROR:  new row for relation "users" violates check constraint "check_user_email_format"
-- DETAIL: Failing row contains (4, Bad User, not-a-valid-email, dummyhash, user, ...).</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Test B: Duplicate User Email Rejected by UNIQUE Constraint</h3>
    <pre><code>-- Fails with Unique Violation (Error code 23505)
INSERT INTO users (name, email, password_hash)
VALUES ('Duplicate Admin', 'admin@ledgerofloss.local', 'dummyhash');

-- Console Output:
-- ERROR:  duplicate key value violates unique constraint "users_email_key"
-- DETAIL: Key (email)=(admin@ledgerofloss.local) already exists.</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Test C: Future Breach Date Rejected by CHECK Constraint</h3>
    <pre><code>-- Fails with Check Violation (Error code 23514) on check_breach_date_past
INSERT INTO breaches (breach_name, source_name, breach_date, severity)
VALUES ('Time Travel Incident', 'Futurist Corp', CURRENT_DATE + INTERVAL '5 days', 'critical');

-- Console Output:
-- ERROR:  new row for relation "breaches" violates check constraint "check_breach_date_past"</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Test D: Foreign Key Rejection on Orphan Identity</h3>
    <pre><code>-- Fails with Foreign Key Violation (Error code 23503)
INSERT INTO identities (user_id, identity_value, identity_type)
VALUES (999999, 'orphan@example.com', 'email');

-- Console Output:
-- ERROR:  insert or update on table "identities" violates foreign key constraint "identities_user_id_fkey"
-- DETAIL: Key (user_id)=(999999) is not present in table "users".</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Test E: Verified State Without Timestamp Rejected by CHECK</h3>
    <pre><code>-- Fails with Check Violation (Error code 23514) on check_verified_consistency
INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
VALUES (1, 'inconsistent@example.com', 'email', true, NULL);

-- Console Output:
-- ERROR:  new row for relation "identities" violates check constraint "check_verified_consistency"</code></pre>
  </div>
</div>

<!-- SECTION 6: ADVANCED SQL FEATURES (ASDL) -->
<div class="page-break">
  <h1>6. Advanced SQL Database Features (ASDL)</h1>

  <h2>6.1 Trigger T1: Guard Against Scans on Unverified Identities</h2>
  <div class="callout callout-info">
    <strong>Trigger Timing: BEFORE INSERT ON scan_requests</strong>
    Trigger T1 acts as a gatekeeper. If someone bypasses the web interface and injects a scan request for an identity they do not own or have not confirmed, the database aborts the transaction before any write occurs.
  </div>
  <pre><code>CREATE OR REPLACE FUNCTION fn_check_identity_verified_before_scan()
RETURNS trigger AS $$
DECLARE
  v_verified boolean;
BEGIN
  SELECT verified INTO v_verified FROM identities WHERE identity_id = NEW.identity_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot initiate scan: Identity % does not exist', NEW.identity_id
      USING ERRCODE = '23503';
  END IF;

  IF NOT v_verified THEN
    RAISE EXCEPTION 'Cannot initiate scan: Identity % is not verified by its owner', NEW.identity_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_scan_requests_verified
BEFORE INSERT ON scan_requests
FOR EACH ROW EXECUTE FUNCTION fn_check_identity_verified_before_scan();</code></pre>

  <h3>Live Trigger T1 Demonstration:</h3>
  <pre><code>-- 1. Create an unverified identity:
INSERT INTO identities (user_id, identity_value, identity_type, verified)
VALUES (1, 'unverified_target@example.com', 'email', false) RETURNING identity_id;
-- Suppose it returns identity_id = 99

-- 2. Try to insert scan request:
INSERT INTO scan_requests (identity_id) VALUES (99);

-- Console Output:
-- ERROR:  Cannot initiate scan: Identity 99 is not verified by its owner</code></pre>

  <h2>6.2 Trigger T2: Auto-Synchronizing Risk Summaries</h2>
  <div class="callout callout-warning">
    <strong>Viva Trap: Why does Trigger T2 fire AFTER UPDATE of risk_score?</strong>
    When an exposure row is first inserted, its associated data types do not exist yet in <code>exposure_data_types</code>. Firing on <code>INSERT</code> would calculate risk with zero data types! Therefore, the app inserts the exposure, populates data types, and updates <code>risk_score</code> via <code>calculate_exposure_risk()</code>, which fires Trigger T2 with full data.
  </div>
  <pre><code>CREATE OR REPLACE FUNCTION fn_refresh_risk_summary_on_exposure_update()
RETURNS trigger AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT user_id INTO v_user_id FROM identities WHERE identity_id = NEW.identity_id;
  IF FOUND AND v_user_id IS NOT NULL THEN
    PERFORM refresh_user_risk_summary(v_user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exposures_risk_score_update
AFTER UPDATE OF risk_score ON exposures
FOR EACH ROW EXECUTE FUNCTION fn_refresh_risk_summary_on_exposure_update();</code></pre>

  <h2>6.3 Stored Function: Deterministic Risk Formula</h2>
  <p>
    Implements the mathematical formula:
    Score = min(100, Severity_Base + Sum(Data_Type_Weights) + Recency_Bonus)
  </p>
  <pre><code>CREATE OR REPLACE FUNCTION calculate_exposure_risk(p_exposure_id integer)
RETURNS integer AS $$
DECLARE
  v_severity text;
  v_breach_date date;
  v_severity_base integer := 0;
  v_recency_bonus integer := 0;
  v_data_type_weight_sum integer := 0;
BEGIN
  -- 1. Fetch breach severity and date
  SELECT b.severity, b.breach_date INTO v_severity, v_breach_date
  FROM exposures e JOIN breaches b ON e.breach_id = b.breach_id
  WHERE e.exposure_id = p_exposure_id;

  -- 2. Severity Base: Low 10, Medium 20, High 30, Critical 40
  CASE v_severity
    WHEN 'low' THEN v_severity_base := 10;
    WHEN 'medium' THEN v_severity_base := 20;
    WHEN 'high' THEN v_severity_base := 30;
    WHEN 'critical' THEN v_severity_base := 40;
    ELSE v_severity_base := 10;
  END CASE;

  -- 3. Recency Bonus: +10 if within past 24 months
  IF v_breach_date >= CURRENT_DATE - INTERVAL '24 months' THEN
    v_recency_bonus := 10;
  END IF;

  -- 4. Sum of exposed data type weights
  SELECT COALESCE(SUM(dt.weight), 0) INTO v_data_type_weight_sum
  FROM exposure_data_types edt JOIN data_types dt ON edt.data_type_id = dt.data_type_id
  WHERE edt.exposure_id = p_exposure_id;

  -- 5. Return bounded score capped at 100
  RETURN LEAST(100, v_severity_base + v_data_type_weight_sum + v_recency_bonus);
END;
$$ LANGUAGE plpgsql STABLE;</code></pre>

  <h2>6.4 The Consolidated View: user_security_dashboard</h2>
  <pre><code>CREATE OR REPLACE VIEW user_security_dashboard AS
SELECT
  i.user_id, i.identity_id, i.identity_value, e.exposure_id,
  b.breach_name, b.breach_date, b.severity, e.risk_score,
  risk_level(e.risk_score) AS risk_level, e.discovered_at,
  COALESCE(
    (
      SELECT string_agg(dt.name, ', ' ORDER BY dt.weight DESC)
      FROM exposure_data_types edt JOIN data_types dt ON edt.data_type_id = dt.data_type_id
      WHERE edt.exposure_id = e.exposure_id
    ), 'none'
  ) AS exposed_data_types,
  (
    SELECT COUNT(*)::int FROM recovery_actions ra
    WHERE ra.exposure_id = e.exposure_id AND ra.status = 'pending'
  ) AS pending_recovery_actions_count
FROM exposures e
JOIN identities i ON e.identity_id = i.identity_id
JOIN breaches b ON e.breach_id = b.breach_id;</code></pre>

  <h2>6.5 Indexing Strategy & Partial Index Showcase</h2>
  <p>To optimize performance for open to-do items, the schema implements a <strong>Partial Index</strong>:</p>
  <pre><code>-- Partial index indexing only unresolved tasks:
CREATE INDEX idx_recovery_actions_pending ON recovery_actions(exposure_id)
WHERE status = 'pending';

-- Live EXPLAIN execution to show index scan to the mentor:
EXPLAIN ANALYZE
SELECT * FROM recovery_actions
WHERE exposure_id = 1 AND status = 'pending';</code></pre>

  <h2>6.6 Trigger T3: Auto-Initialize Risk Summary on User Creation</h2>
  <div class="callout callout-info">
    <strong>Trigger Timing: AFTER INSERT ON users</strong>
    Whenever a new user registration occurs, Trigger T3 automatically inserts a baseline row with 0 exposures and 0 score into user_risk_summary, guaranteeing atomic state initialization.
  </div>
  <pre><code>-- Create new user:
INSERT INTO users (name, email, password_hash, role)
VALUES ('Mentor Guest', 'mentor_guest@example.com', 'hashed123', 'user')
RETURNING user_id, name, email;

-- Verify Trigger T3 auto-created their user_risk_summary record:
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'mentor_guest@example.com');</code></pre>

  <h2>6.7 Trigger T4: Audit Notice & ON DELETE CASCADE on User Deletion</h2>
  <div class="callout callout-info">
    <strong>Trigger Timing: BEFORE DELETE ON users</strong>
    Trigger T4 logs an audit notice to the PostgreSQL console before a user deletion. Referential foreign keys with ON DELETE CASCADE automatically purge all associated identities, scans, exposures, recovery tasks, and risk summaries.
  </div>
  <pre><code>-- Delete user:
DELETE FROM users WHERE email = 'mentor_guest@example.com';
-- Output: NOTICE: AUDIT LOG: User deleted. Cascading deletion to all identities and exposures.

-- Verify ON DELETE CASCADE wiped their risk summary (returns 0 rows):
SELECT * FROM user_risk_summary 
WHERE user_id = (SELECT user_id FROM users WHERE email = 'mentor_guest@example.com');</code></pre>

  <h2>6.8 Database User & Role Administration (CREATE / DROP USER)</h2>
  <pre><code>-- Create a read-only database user for the mentor:
CREATE USER mentor_auditor WITH PASSWORD 'viva2026';
GRANT CONNECT ON DATABASE ledger_of_loss TO mentor_auditor;
GRANT USAGE ON SCHEMA public TO mentor_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mentor_auditor;

-- Verify in PostgreSQL user catalog:
SELECT usename, usesuper FROM pg_user WHERE usename = 'mentor_auditor';

-- Revoke permissions and drop the user:
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM mentor_auditor;
REVOKE ALL ON SCHEMA public FROM mentor_auditor;
REVOKE ALL ON DATABASE ledger_of_loss FROM mentor_auditor;
DROP USER mentor_auditor;</code></pre>
</div>

<!-- SECTION 7: LIVE MONGODB / NOSQL DEMONSTRATION GUIDE -->
<div class="page-break">
  <h1>7. Live MongoDB / NoSQL Demonstration Guide</h1>

  <h2>7.1 How to Connect Live Inside Docker</h2>
  <p>To execute MongoDB commands in front of your mentor, open a terminal and run:</p>
  <pre><code>docker exec -it ledger_mongo mongosh -u admin -p adminpassword --authenticationDatabase admin</code></pre>

  <h2>7.2 Basic Navigation Commands</h2>
  <pre><code>-- Switch to project database:
use ledger_of_loss

-- Show all collections:
show collections
-- Output: audit_logs, breach_records, guidance_playbooks

-- Count documents:
db.breach_records.countDocuments()     -- ~250 documents
db.guidance_playbooks.countDocuments()  -- 20 documents
db.audit_logs.countDocuments()          -- Chronological event log</code></pre>

  <h2>7.3 Proving Strict $jsonSchema Validation (Engine-Level Rejection)</h2>
  <p>
    MongoDB collections are configured with <code>validationLevel: 'strict'</code> and <code>validationAction: 'error'</code>.
    Show your mentor that MongoDB rejects illegal documents at the database engine level (Error code 121):
  </p>

  <div class="avoid-break">
    <h3>Test 1: Rejecting Invalid SHA-256 Hash Format</h3>
    <pre><code>-- Fails because identity_hash must match regex pattern: '^[a-f0-9]{{64}}$'
db.breach_records.insertOne({
  breach_id: 1,
  identity_hash: "invalid-hash-string-too-short",
  identity_type: "email",
  exposed_fields: ["password"],
  extra: {}
})

-- Output:
-- MongoServerError: Document failed validation
-- Error Code: 121 (DocumentValidationFailure)</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Test 2: Rejecting Unsupported Identity Type (Enum Violation)</h3>
    <pre><code>-- Fails because identity_type is restricted to ['email', 'username']
db.breach_records.insertOne({
  breach_id: 1,
  identity_hash: "a".repeat(64),
  identity_type: "phone_number",
  exposed_fields: ["phone"],
  extra: {}
})

-- Output:
-- MongoServerError: Document failed validation (Error Code: 121)</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Test 3: Rejecting Out-of-Bounds Playbook Priority</h3>
    <pre><code>-- Fails because priority has minimum: 1 and maximum: 5
db.guidance_playbooks.insertOne({
  title: "Illegal Priority Playbook",
  summary: "Testing bounds",
  applies_to: { data_types: ["password"], min_severity_rank: 2 },
  priority: 8,
  steps: [{ order: 1, text: "Step 1", estimated_minutes: 5 }],
  tags: ["test"],
  updated_at: new Date()
})

-- Output:
-- MongoServerError: Document failed validation (Error Code: 121)</code></pre>
  </div>

  <h2>7.4 Demonstrating Weighted Full-Text Search ($text & $textScore)</h2>
  <p>
    <code>guidance_playbooks</code> features a weighted text index on <code>title (10)</code>, <code>summary (5)</code>, <code>tags (5)</code>, and <code>steps.text (1)</code>:
  </p>
  <pre><code>-- Run full-text search and project textScore:
db.guidance_playbooks.find(
  { $text: { $search: "password credentials rotation" } },
  { title: 1, priority: 1, score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } }).limit(3)</code></pre>

  <h2>7.5 Demonstrating Multikey Indexing on Arrays</h2>
  <pre><code>-- Uses the multikey index on applies_to.data_types to find playbooks handling financial data:
db.guidance_playbooks.find({ "applies_to.data_types": "financial" }).explain("executionStats")
-- Notice: "stage": "IXSCAN", "indexName": "idx_playbooks_multikey_data_types"</code></pre>
</div>

<!-- SECTION 8: THE 8 CRITICAL ANALYTICAL QUERIES (Q1 - Q8) -->
<div class="page-break">
  <h1>8. The 8 Critical Analytical Queries (Q1 through Q8)</h1>
  <p>
    Each query was authored to demonstrate a specific advanced database paradigm required by course rubrics:
  </p>

  <div class="avoid-break">
    <h3>Q1: Complex Multi-Table JOIN & Subquery View</h3>
    <p><strong>Concept:</strong> 6-table join, <code>string_agg</code> aggregate, scalar correlated subquery count.</p>
    <pre><code>-- File: db/queries/q1_user_security_dashboard.sql
SELECT * FROM user_security_dashboard WHERE user_id = 2 ORDER BY risk_score DESC;</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q2: GROUP BY + ORDER BY with Aggregates</h3>
    <p><strong>Concept:</strong> Breach exposure density, <code>COUNT()</code>, <code>AVG()</code>, <code>ROUND()</code>, <code>LEFT JOIN</code>.</p>
    <pre><code>-- File: db/queries/q2_breach_exposure_summary.sql
SELECT
  b.breach_id, b.breach_name, b.severity, b.breach_date,
  COUNT(e.exposure_id)::int AS total_exposures,
  COALESCE(ROUND(AVG(e.risk_score), 1), 0.0) AS average_risk_score
FROM breaches b LEFT JOIN exposures e ON b.breach_id = e.breach_id
GROUP BY b.breach_id, b.breach_name, b.severity, b.breach_date
ORDER BY total_exposures DESC, average_risk_score DESC;</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q3: HAVING Clause (Privacy-Preserving User Aggregates)</h3>
    <p><strong>Concept:</strong> Filter aggregate groups via <code>HAVING</code>; strictly returns counts, never user PII.</p>
    <pre><code>-- File: db/queries/q3_users_high_critical_having.sql
SELECT
  COUNT(*)::int AS users_count_with_multiple_high_critical_exposures,
  COALESCE(AVG(high_crit_exposures), 0.0)::numeric(10, 1) AS avg_high_crit_exposures_per_user
FROM (
  SELECT i.user_id, COUNT(e.exposure_id) AS high_crit_exposures
  FROM identities i JOIN exposures e ON i.identity_id = e.identity_id
  WHERE e.risk_score >= 51
  GROUP BY i.user_id
  HAVING COUNT(e.exposure_id) >= 2
) user_aggregates;</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q4: Non-Correlated Subquery in WHERE Clause</h3>
    <p><strong>Concept:</strong> Dynamic threshold comparison using a scalar subquery.</p>
    <pre><code>-- File: db/queries/q4_above_average_risk_subquery.sql
SELECT e.exposure_id, b.breach_name, b.severity, e.risk_score,
  (SELECT ROUND(AVG(risk_score), 1) FROM exposures) AS global_average_risk
FROM exposures e JOIN breaches b ON e.breach_id = b.breach_id
WHERE e.risk_score > (SELECT AVG(risk_score) FROM exposures)
ORDER BY e.risk_score DESC;</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q5: Aggregate Across Many-to-Many Bridge Table</h3>
    <p><strong>Concept:</strong> Evaluating risk exposure distribution per sensitive data type.</p>
    <pre><code>-- File: db/queries/q5_data_type_risk_aggregate.sql
SELECT dt.name, dt.weight, COUNT(edt.exposure_id)::int AS occurrences,
  COALESCE(ROUND(AVG(e.risk_score), 1), 0.0) AS average_exposure_risk
FROM data_types dt
LEFT JOIN exposure_data_types edt ON dt.data_type_id = edt.data_type_id
LEFT JOIN exposures e ON edt.exposure_id = e.exposure_id
GROUP BY dt.data_type_id, dt.name, dt.weight
ORDER BY occurrences DESC, dt.weight DESC;</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q6: NOT EXISTS Clause (Unscanned Verified Identities)</h3>
    <p><strong>Concept:</strong> Correlated anti-join subquery identifying verified identities lacking scans.</p>
    <pre><code>-- File: db/queries/q6_unscanned_verified_not_exists.sql
SELECT i.identity_id, i.identity_type, i.verified_at
FROM identities i
WHERE i.verified = true
  AND NOT EXISTS (SELECT 1 FROM scan_requests sr WHERE sr.identity_id = i.identity_id);</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q7: MongoDB Multi-Stage Aggregation Pipeline ($lookup across collections)</h3>
    <p><strong>Concept:</strong> Unwinding arrays, grouping, and joining with <code>$lookup</code> in MongoDB.</p>
    <pre><code>-- In mongosh:
db.audit_logs.aggregate([
  { $match: { event_type: "recommendations_issued" } },
  { $unwind: "$details.playbook_ids" },
  { $group: { _id: "$details.playbook_ids", times_recommended: { $sum: 1 } } },
  { $sort: { times_recommended: -1 } },
  { $limit: 5 }
])</code></pre>
  </div>

  <div class="avoid-break">
    <h3>Q8: MongoDB Weighted Text Search with textScore Sorting</h3>
    <p><strong>Concept:</strong> Relevance ranking across four text fields with weighted factors.</p>
    <pre><code>-- In mongosh:
db.guidance_playbooks.find(
  { $text: { $search: "phishing credentials" } },
  { title: 1, score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })</code></pre>
  </div>
</div>

<!-- SECTION 9: LIVE DEMO SCRIPT -->
<div class="page-break">
  <h1>9. Live Application Walkthrough & Step-by-Step Viva Script</h1>
  <p>Follow this exact narrative when presenting the system to your mentor:</p>

  <div class="avoid-break">
    <h3>Step 1: Sign in with Seeded Demo Account</h3>
    <ul>
      <li>Navigate to <code>http://localhost:3000/login</code>.</li>
      <li>Click the quick-fill button for <strong>Divya Sharma</strong> (<code>divya@example.com</code>).</li>
      <li><em>Explain:</em> "Passwords are never plaintext; they are hashed with bcryptjs using salt cost 10. The session is an httpOnly, sameSite=lax signed JWT cookie via 'jose'."</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Step 2: Demonstrate Identity Verification & Trigger T1</h3>
    <ul>
      <li>Navigate to <code>/identities</code>. Show the registered email and username.</li>
      <li>Add a brand-new identity: <code>newtest@example.com</code>.</li>
      <li><em>Point out:</em> "It immediately appears as 'Unverified'. The 'Scan Now' button is disabled."</li>
      <li><em>Explain Trigger T1:</em> "If someone bypassed the UI and fired a raw HTTP POST or SQL query, PostgreSQL Trigger T1 would intercept the transaction BEFORE INSERT on scan_requests and throw error P0001."</li>
      <li>Click <strong>"Confirm I own this"</strong>. The status flips to "Verified".</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Step 3: Execute the Live ACID Scan Transaction</h3>
    <ul>
      <li>Click <strong>"Scan Now"</strong> on <code>divya@example.com</code>.</li>
      <li><em>Explain what just happened:</em> "The server converted the email to a SHA-256 hash, queried MongoDB breach records, opened a single atomic PostgreSQL transaction, inserted scan_requests, inserted exposures with ON CONFLICT DO NOTHING, mapped data types, fired Trigger T2 on risk_score update to refresh user_risk_summary, and mapped MongoDB playbooks into recovery_actions."</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Step 4: Inspect the Mathematical Risk Breakdown</h3>
    <ul>
      <li>Navigate to <code>/dashboard</code>. Show the exposures loaded via the <code>user_security_dashboard</code> view.</li>
      <li>Click on <strong>Apex Health Portal Incident</strong> to open <code>/exposures/1</code>.</li>
      <li><em>Show the mentor the Risk Score Engine Card:</em> "The score of 95/100 is calculated deterministically by our stored function: Severity Base (+40 for critical) + Leaked Data Types (+25 for financial, +25 for government ID, +30 for password) + Recency Bonus (+10 for &lt; 24 months) = 130, bounded to 100 via LEAST(100, ...)."</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Step 5: Review the Recovery Action Checklist</h3>
    <ul>
      <li>Scroll down or visit <code>/actions</code>.</li>
      <li>Show the step-by-step checklist matched from MongoDB playbooks. Tick a box to mark an action completed.</li>
      <li><em>Explain:</em> "This updates the PostgreSQL row, populates completed_at timestamp, and writes an action_completed event to MongoDB audit_logs."</li>
    </ul>
  </div>

  <div class="avoid-break">
    <h3>Step 6: Show Administrator Portal & Threat Intelligence</h3>
    <ul>
      <li>Log out and log in as <strong>Administrator</strong> (<code>admin@ledgerofloss.local</code>).</li>
      <li>Visit <code>/admin/analytics</code> to demonstrate queries Q2 through Q8 running live.</li>
      <li><em>Emphasize Privacy:</em> "Notice that the administrator sees only aggregate data (e.g. Q3 HAVING shows the count of high-risk users), protecting user privacy while enabling system-wide threat intelligence."</li>
    </ul>
  </div>
</div>

<!-- SECTION 10: 25 VIVA QUESTIONS & MODEL ANSWERS -->
<div class="page-break">
  <h1>10. 25 Exhaustive Viva Questions & High-Scoring Answers</h1>

  <div class="qa-item">
    <div class="qa-question"><span>Q1:</span> Why did you use both PostgreSQL and MongoDB? Why not store everything in PostgreSQL?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> PostgreSQL is the relational source of truth for accounts, identities, scans, and exposures where strict referential integrity (<code>ON DELETE CASCADE</code>), transactional ACID guarantees, triggers, and mathematical stored procedures are required. MongoDB is used for data that is inherently non-relational: 1) <code>breach_records</code> have polymorphic schemas where the <code>extra</code> JSON payload varies per breach source; 2) <code>guidance_playbooks</code> feature nested ordered step arrays and require weighted full-text search ($textScore); and 3) <code>audit_logs</code> represent high-velocity append-only events analyzed using multi-stage aggregation pipelines.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q2:</span> Why didn't you use an ORM like Prisma or Mongoose?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> An ORM abstracts away the underlying database engine. To demonstrate mastery of database concepts for this course, we used raw SQL migrations in numbered files with the native <code>pg</code> driver using parameterized queries ($1, $2) to prevent SQL injection. In MongoDB, we used the official native driver with database-level <code>$jsonSchema</code> validators rather than Mongoose application schemas.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q3:</span> How do you maintain foreign keys between PostgreSQL and MongoDB?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> There are no distributed cross-database foreign keys. The databases are loosely coupled at the application layer. For example, <code>recovery_actions.playbook_ref</code> stores a MongoDB ObjectId as a string. When an admin registers a breach across both databases, we implement a <strong>Compensating Transaction</strong>: PostgreSQL is written first; if the MongoDB write fails, the application deletes the PostgreSQL row to prevent orphan data.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q4:</span> Explain why Trigger T2 fires on UPDATE OF risk_score rather than on INSERT ON exposures.</div>
    <div class="qa-answer">
      <strong>Answer:</strong> This was a critical timing design decision. When an exposure row is first inserted, its associated data types in the bridge table <code>exposure_data_types</code> have not yet been inserted. If Trigger T2 fired on <code>INSERT</code>, the risk score calculation would see zero data types and calculate an inaccurate score. By firing on <code>AFTER UPDATE OF risk_score</code>, the application first inserts the exposure, populates the data types, and updates the risk score via <code>calculate_exposure_risk()</code>, allowing Trigger T2 to refresh <code>user_risk_summary</code> with complete, accurate data.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q5:</span> How does Trigger T1 prevent unauthorized scanning?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Trigger T1 is a <code>BEFORE INSERT</code> trigger on <code>scan_requests</code>. It inspects the target identity row. If <code>verified = false</code>, it raises exception <code>P0001</code>. Because this is executed inside the database engine, even if an attacker bypasses the frontend and sends raw HTTP POST requests or direct SQL inserts, the database strictly refuses to execute the scan.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q6:</span> How is zero-knowledge / privacy-preserving scanning implemented?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> We never search for plaintext emails or usernames inside MongoDB breach records. The application hashes the lower-cased identity value using <code>crypto.createHash('sha256')</code> and queries MongoDB for matching 64-character hexadecimal digests. The MongoDB collection validator strictly enforces this with the regex <code>'^[a-f0-9]{{64}}$'</code>.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q7:</span> What is the purpose of the table user_risk_summary if the data can be calculated on the fly?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> It serves as a materialized summary cache for high-frequency dashboard queries. Calculating overall score and counts across multiple joins on every page load causes unnecessary I/O overhead. Trigger T2 and stored function <code>refresh_user_risk_summary()</code> ensure this table is kept 100% synchronized with zero stale data.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q8:</span> What is a Partial Index and where did you use it?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> A Partial Index indexes only a subset of rows defined by a <code>WHERE</code> predicate. We created <code>CREATE INDEX idx_recovery_actions_pending ON recovery_actions(exposure_id) WHERE status = 'pending'</code>. Since users quickly complete or dismiss tasks, the vast majority of historical actions are completed. The partial index stays compact in memory and accelerates open task lookups.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q9:</span> What happens when an identity is deleted? How is data consistency maintained?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> The foreign key constraint on <code>exposures.identity_id</code> and <code>scan_requests.identity_id</code> specifies <code>ON DELETE CASCADE</code>. Deleting an identity automatically cascades and deletes all associated exposures, data type links, and recovery actions. Within the same transaction, the application executes <code>SELECT refresh_user_risk_summary(user_id)</code> to recalculate the user's score to reflect the deletion.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q10:</span> Why did you use ON CONFLICT DO NOTHING in exposures?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> To ensure idempotency during re-scans. The table enforces <code>UNIQUE (identity_id, breach_id)</code>. If a user scans their identity multiple times, <code>ON CONFLICT DO NOTHING</code> ignores already discovered breaches, preventing duplicate exposure rows while recording the new scan in <code>scan_requests</code>.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q11:</span> How does MongoDB enforce schema validation?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Using the <code>$jsonSchema</code> operator passed to <code>db.createCollection()</code> with <code>validationLevel: "strict"</code> and <code>validationAction: "error"</code>. It validates BSON data types, required fields, regular expressions, and sets <code>additionalProperties: false</code> to prevent unauthorized fields from being injected.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q12:</span> Explain Query Q3 and why it uses the HAVING clause.</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Query Q3 identifies high-risk users who have at least 2 exposures with a risk score &ge; 51. Because the condition <code>COUNT(e.exposure_id) >= 2</code> applies to an aggregate grouping (per user), it cannot be evaluated in a <code>WHERE</code> clause and must be placed in <code>HAVING</code>. Furthermore, the query wraps this in an outer count, returning strictly aggregate numbers to preserve user privacy.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q13:</span> What is the difference between a function and a stored procedure in PostgreSQL?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> A stored function returns a value and can be called directly inside <code>SELECT</code> statements or triggers (e.g. <code>calculate_exposure_risk()</code> returns <code>integer</code>). A procedure (created with <code>CREATE PROCEDURE</code>) does not return a value and is invoked using <code>CALL</code>, allowing transaction control (<code>COMMIT/ROLLBACK</code>) inside the procedure body.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q14:</span> How is password security implemented?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Passwords are never stored in plaintext. They are hashed using <code>bcryptjs</code> with a salt work factor of 10 rounds. Bcrypt incorporates a cryptographic salt and is resistant to rainbow table attacks and brute force.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q15:</span> Explain the mathematical risk calculation formula.</div>
    <div class="qa-answer">
      <strong>Answer:</strong> <code>Score = LEAST(100, severity_base + SUM(weights) + recency_bonus)</code>. Base points: Low = 10, Medium = 20, High = 30, Critical = 40. Recency bonus is +10 if the breach occurred within the last 24 months. Sensitive data types contribute weighted points (password = 30, financial = 25, government ID = 25, phone = 10, etc.). The final sum is capped at 100.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q16:</span> What is the purpose of string_agg in view user_security_dashboard?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> <code>string_agg(dt.name, ', ' ORDER BY dt.weight DESC)</code> is an aggregate function that collapses the multiple data types linked to an exposure into a single comma-separated string, ordered by priority, allowing the frontend to render the exposure row without a nested query loop.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q17:</span> How does Next.js middleware protect admin routes?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> The file <code>middleware.ts</code> intercepts all requests matching <code>/admin/:path*</code> and <code>/api/admin/:path*</code>. It reads the session cookie, verifies the cryptographic signature with <code>jose</code>, and inspects the <code>role</code> claim. If the role is not <code>'admin'</code>, it immediately bounces the user to <code>/dashboard</code> or returns HTTP 403 Forbidden.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q18:</span> What does the term "idempotent" mean in the context of your scan transaction?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Idempotency means that running the operation multiple times produces the same result without unintended side effects. Because we use <code>ON CONFLICT (identity_id, breach_id) DO NOTHING</code>, repeatedly scanning an identity will not create duplicate exposures or duplicate recovery actions.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q19:</span> What is the difference between 2NF and 3NF?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> 2NF eliminates partial functional dependencies (where a non-key attribute depends on only part of a composite key). 3NF eliminates transitive functional dependencies (where a non-key attribute depends on another non-key attribute). Our schema satisfies both.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q20:</span> How does MongoDB full-text search work with textScore?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> MongoDB indexes words from designated fields and removes language stop words. In our compound text index, we assigned weights: title (10), summary (5), tags (5), steps (1). When querying with <code>$text: {{ $search: "query" }}</code>, MongoDB calculates a relevance score (<code>textScore</code>), allowing results to be sorted so the most relevant playbooks appear first.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q21:</span> What is a multikey index in MongoDB?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> When an index is created on a field that holds an array (such as <code>applies_to.data_types</code>), MongoDB creates index keys for every single element in the array. This allows instant lookups when checking whether a breach's exposed fields match a playbook's applicable categories.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q22:</span> How do you prove that an ACID transaction rolled back cleanly?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> In our automated test <code>tests/scans/test_scan_transaction.ts</code>, we inject an intentional foreign key violation during the scan transaction after <code>scan_requests</code> and <code>exposures</code> have been written. We catch the exception, execute <code>ROLLBACK</code>, and query the database to verify that exactly 0 scan rows and 0 exposure rows persist.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q23:</span> What is the difference between authentication and authorization in your app?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Authentication verifies identity (e.g. logging in with email and password via <code>/api/auth/login</code> and issuing a signed JWT). Authorization determines permissions (e.g. checking whether <code>user.role === 'admin'</code> before allowing access to breach catalogs or audit trails).
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q24:</span> Why are credentials kept only in environment variables?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Hardcoding database connection strings, passwords, or JWT secrets in source code creates severe security vulnerabilities and violates 12-factor application guidelines. All credentials reside in <code>.env</code>, which is excluded from version control via <code>.gitignore</code>, with a template provided in <code>.env.example</code>.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span>Q25:</span> How did you divide the work between both teammates?</div>
    <div class="qa-answer">
      <strong>Answer:</strong> Rather than a superficial split where one member only does UI and one only does database, we divided the work into two full vertical slices: Teammate A handled Slice A (the relational PostgreSQL schema, DDL migrations, Triggers T1 & T2, stored functions, the ACID scan transaction route, and the exposure detail UI). Teammate B handled Slice B (the MongoDB NoSQL schemas, $jsonSchema validators, JWT/bcryptjs authentication, middleware, dashboard views, admin analytics Q2–Q8, and documentation). Both members contributed to database design and application code.
    </div>
  </div>
</div>

<!-- SECTION 11: EMERGENCY TERMINAL CHEATSHEET -->
<div class="avoid-break">
  <h1>11. Emergency Terminal Cheatsheet ("What If Mentor Asks...")</h1>

  <div class="callout callout-warning">
    <strong>Mentor Prompt: "Add a column to a table right now in front of me!"</strong>
    <pre><code>docker exec -it ledger_postgres psql -U postgres -d ledger_of_loss
-- Run:
ALTER TABLE users ADD COLUMN department text DEFAULT 'Engineering';
-- Verify:
SELECT user_id, name, department FROM users LIMIT 3;
-- Clean up if needed:
ALTER TABLE users DROP COLUMN department;</code></pre>
  </div>

  <div class="callout callout-warning">
    <strong>Mentor Prompt: "Show me a trigger firing right now!"</strong>
    <pre><code>-- Prove Trigger T1 blocks unverified scan:
INSERT INTO identities (user_id, identity_value, identity_type, verified)
VALUES (1, 'live_test@example.com', 'email', false) RETURNING identity_id;

-- Attempt scan on returned ID (e.g. 50):
INSERT INTO scan_requests (identity_id) VALUES (50);
-- Boom: ERROR: Cannot initiate scan: Identity 50 is not verified by its owner!</code></pre>
  </div>

  <div class="callout callout-warning">
    <strong>Mentor Prompt: "Show me MongoDB rejecting an illegal document right now!"</strong>
    <pre><code>docker exec -it ledger_mongo mongosh -u admin -p adminpassword --authenticationDatabase admin
use ledger_of_loss
-- Try to insert a breach record without required identity_hash:
db.breach_records.insertOne({ breach_id: 1, identity_type: "email", exposed_fields: ["password"] })
-- Boom: MongoServerError: Document failed validation (Error code 121)!</code></pre>
  </div>

  <div class="callout callout-tip">
    <strong>Emergency Restart Commands</strong>
    <pre><code># Restart containers:
docker compose restart

# Wipe clean & re-seed in 10 seconds:
npm run db:reset
npm run db:migrate
npm run db:seed

# Run all 37 automated tests:
npm test</code></pre>
  </div>
</div>

</body>
</html>
"""

    final_html = html_template.replace("INSERT_ER_IMAGE_HERE", img_tag)

    html_file = os.path.abspath("mentor_defense_report.html")
    pdf_file = os.path.abspath("Ledger_of_Loss_Complete_Project_Report.pdf")

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(final_html)
    print(f"✅ Generated comprehensive HTML at: {html_file}")

    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_path):
        edge_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

    print(f"⏳ Compiling HTML to PDF via {edge_path}...")
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file}",
        html_file
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_file) and os.path.getsize(pdf_file) > 1000:
        size_kb = os.path.getsize(pdf_file) / 1024
        print(f"🎉 SUCCESS! PDF generated: {pdf_file} ({size_kb:.1f} KB)")
    else:
        print(f"❌ Failed to generate PDF. Edge exit code: {res.returncode}")
        print("Stderr:", res.stderr)

if __name__ == "__main__":
    generate_pdf()
