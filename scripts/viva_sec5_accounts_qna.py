import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from docx.shared import Inches, Pt, RGBColor
from scripts.generate_viva_suite import (
    create_styled_document, add_h1, add_h2, add_h3, add_p, add_bullet, 
    add_callout, add_code, add_table_data, VIVA_DIR
)

def generate_sec5():
    print("[*] Generating Section 5: Test Accounts & 30 Master Viva Q&A Bible...")
    doc = create_styled_document(
        "05: Test Accounts & 30 Master Viva Q&A Bible",
        "7 Complete Persona Profiles & 30 Exhaustive Answers for Top Exam Marks"
    )
    
    md_content = """# 05: Test Accounts & 30 Master Viva Q&A Bible
## 7 Complete Persona Profiles & 30 Exhaustive Answers for Top Exam Marks

---

"""

    # Chapter 1: The 7 Test Accounts Table
    add_h1(doc, "1. Master Test Personas & Demonstration Scenarios")
    md_content += "## 1. Master Test Personas & Demonstration Scenarios\n\n"
    
    add_p(doc, "Use this cheat sheet to log into specific accounts depending on what the professor asks to see:")

    accounts_table = [
        ["User Persona & Email", "Password", "Role & Exposures", "Risk Level & Score", "Best Used For"],
        ["System Administrator\nadmin@ledgerofloss.local", "AdminPass123!", "Role: admin\nGlobal Access", "N/A (Admin View)", "Showing RBAC, global system analytics, breach catalog, and MongoDB audit logs."],
        ["Divya Sharma\ndivya@example.com", "UserPass123!", "Role: user\n3 Breaches (Apex, CloudScale, Darknet)", "Critical Risk\nScore: ~90-100", "Default user demo showing multiple severe leaks, pending playbooks, and high risk gauge."],
        ["Arjun Patel\narjun@example.com", "UserPass123!", "Role: user\n2 Breaches, 1 Unverified Identity", "Medium Risk\nScore: ~45-60", "Demonstrating Trigger T1 error when attempting to scan unverified identity 'arjun_coder'."],
        ["Rohan Verma\nrohan.verma@example.com", "UserPass123!", "Role: user\n3 Critical Breaches (Apex, FinSecure, Darknet)", "Critical Risk\nScore: 100 / 100", "Demonstrating financial compromise: leaked SSN, credit cards, bank account details & freeze playbooks."],
        ["Pooja Rao\npooja.rao@example.com", "UserPass123!", "Role: user\n2 High Breaches (CloudScale, GigaShop)", "High Risk\nScore: ~65-70", "Demonstrating credential stuffing risk: stolen passwords, phone numbers, and addresses."],
        ["Vikram Malhotra\nvikram.m@example.com", "UserPass123!", "Role: user\n2 Low Breaches (VoltUtility, OmniTravel)", "Low Risk\nScore: ~20-25", "Demonstrating minimal digital footprint: only public IP and newsletter handle leaked."],
        ["Ananya Iyer\nananya.iyer@example.com", "UserPass123!", "Role: user\n2 Medium Breaches (StreamWave, NexusPlay)", "Medium Risk\n100% Remediated", "HERO PERSONA: Demonstrating all remediation tasks completed with green checkmarks!"],
        ["Kabir Mehta\nkabir.mehta@example.com", "UserPass123!", "Role: user\n0 Breaches (Clean Slate)", "Zero Risk\nScore: 0 / 100", "LIVE SCAN DEMO: Logging in live, clicking 'Trigger Security Scan', and watching real-time clean completion!"]
    ]
    add_table_data(doc, accounts_table[0], accounts_table[1:])

    md_content += """| User Persona & Email | Password | Role & Exposures | Risk Level & Score | Best Used For |
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

"""

    # Chapter 2: 30 Viva Questions & Model Answers
    add_h1(doc, "2. 30 Exhaustive Viva Questions & Model Answers")
    md_content += "## 2. 30 Exhaustive Viva Questions & Model Answers\n\n"

    qnas = [
        # Group 1: Core Relational Concepts
        ("Q1: What are the ACID properties, and how does your project enforce them?",
         "Relational DBMS Core",
         "ACID stands for Atomicity, Consistency, Isolation, and Durability. In our project:\n"
         "• Atomicity: Scan ingestion executes inside a BEGIN...COMMIT block. If an unknown data type or FK error occurs, ROLLBACK undoes all partial inserts.\n"
         "• Consistency: Enforced by declarative constraints (CHECK regex on emails, UNIQUE constraints on identities, and foreign keys).\n"
         "• Isolation: PostgreSQL provides Read Committed isolation by default, using Multi-Version Concurrency Control (MVCC) to ensure readers do not block writers.\n"
         "• Durability: PostgreSQL uses Write-Ahead Logging (WAL) flushed to non-volatile disk storage before transactions are acknowledged."),

        ("Q2: What is the difference between 3NF and BCNF? Why is your schema in BCNF?",
         "Normalization Theory",
         "In 3NF, for any functional dependency X -> Y, either X is a superkey OR Y is a prime attribute (part of a candidate key). BCNF is stricter: X MUST be a superkey without exception. In our schema, every functional determinant (e.g. user_id, email, {identity_id, breach_id}) is a candidate key. Because there are no non-superkey determinants, our schema strictly satisfies BCNF."),

        ("Q3: What is a surrogate key versus a natural key? Which did you use?",
         "Database Design",
         "A natural key is an attribute with real-world business meaning (e.g. email address or SSN). A surrogate key is a system-generated synthetic identifier with no business meaning (e.g. serial user_id). We used surrogate serial primary keys for storage efficiency and stable joins, but enforced business uniqueness by adding UNIQUE constraints on natural keys (e.g. users.email)."),

        ("Q4: Explain the difference between ON DELETE CASCADE and ON DELETE SET NULL in your foreign keys.",
         "Referential Integrity",
         "• ON DELETE CASCADE: When a parent record is deleted, all dependent child rows are deleted automatically (e.g. deleting a user cascades to delete their identities, scans, and exposures).\n"
         "• ON DELETE SET NULL: When a parent record is deleted, child foreign key columns are set to NULL (e.g. in exposures, scan_id REFERENCES scan_requests ON DELETE SET NULL so historical exposure records remain even if an old scan request audit log is purged)."),

        ("Q5: What is a Partial Index, and why is it superior to a standard B-Tree index for recovery_actions?",
         "Indexing & Performance",
         "A partial index indexes only a subset of rows meeting a WHERE clause condition. In our project, CREATE INDEX idx_recovery_actions_pending ON recovery_actions(exposure_id) WHERE status = 'pending'. Because 90% of user queries only fetch unresolved actions, indexing only pending rows reduces index size on disk by up to 80% and accelerates dashboard lookups."),

        # Group 2: Advanced SQL Features (ASDL)
        ("Q6: Explain the difference between a Stored Procedure and a Stored Function in PostgreSQL.",
         "PostgreSQL Internals",
         "A Stored Function returns a typed value and can be embedded directly inside SELECT or UPDATE expressions (e.g. SELECT calculate_exposure_risk(1)). A Stored Procedure is invoked with the CALL statement and can manage its own transactions (issuing COMMIT and ROLLBACK internally), whereas a function runs strictly within the caller's transaction context."),

        ("Q7: How does Trigger T1 (trg_scan_requests_verified) work?",
         "Database Triggers",
         "Trigger T1 is a BEFORE INSERT trigger on the scan_requests table. It inspects NEW.identity_id, queries the identities table, and checks if verified = true. If the identity is unverified, it raises an exception with custom SQLSTATE P0001, aborting the insertion before any disk write occurs."),

        ("Q8: How does Trigger T2 (trg_exposures_risk_score_update) work?",
         "Database Triggers",
         "Trigger T2 is an AFTER UPDATE OF risk_score trigger on the exposures table. As soon as an exposure's numerical score is calculated or modified, Trigger T2 invokes the PL/pgSQL function refresh_user_risk_summary(user_id). This re-aggregates total exposures, critical counts, and overall scores in user_risk_summary automatically."),

        ("Q9: What is the deterministic formula used in calculate_exposure_risk?",
         "Business Logic Logic",
         "Score = LEAST(100, severity_base + SUM(data_type_weights) + recency_bonus).\n"
         "• Severity Base: Low = 10, Medium = 20, High = 30, Critical = 40.\n"
         "• Weights: password (30), financial (25), government_id (25), security_questions (15), phone (10), address (10), date_of_birth (10), email (10), username (5), ip_address (5).\n"
         "• Recency Bonus: +10 if breach_date >= CURRENT_DATE - INTERVAL '24 months'. Capped at 100."),

        ("Q10: What is the purpose of the user_security_dashboard view?",
         "Views & Reporting",
         "It is a virtual join across identities, exposures, breaches, and data types. It uses string_agg(dt.name, ', ') to format exposed fields into a human-readable list, and runs a scalar correlated subquery to count pending recovery actions. It simplifies frontend queries to: SELECT * FROM user_security_dashboard WHERE user_id = $1."),

        # Group 3: NoSQL & MongoDB
        ("Q11: Why did you use MongoDB instead of storing everything in PostgreSQL JSONB?",
         "Polyglot Architecture",
         "While PostgreSQL has JSONB, MongoDB provides native multikey array indexing on nested arrays (data_classes), built-in weighted full-text search with relevance ranking (textScore), and flexible document reshaping via 5-stage aggregation pipelines. Furthermore, isolating polymorphic external breach feeds prevents high-churn schema drift from impacting our ACID transactional tables."),

        ("Q12: What is BSON $jsonSchema validation in MongoDB?",
         "NoSQL Schema Integrity",
         "Although MongoDB is inherently schema-flexible, enterprise applications require data contracts. BSON $jsonSchema enforces validation rules at the database engine level (validationLevel: 'strict', validationAction: 'error'). If a document violates required properties or regex patterns, MongoDB rejects the write with Error 121 (DocumentValidationFailure)."),

        ("Q13: What is a Multikey Index in MongoDB?",
         "NoSQL Indexing",
         "When an index is created on a field containing an array (e.g. db.breach_records.createIndex({ exposed_fields: 1 })), MongoDB creates an index entry for EACH individual element in the array. This enables O(log N) point lookups whenever a user queries for breaches that exposed passwords or financial records."),

        ("Q14: Explain the 5 stages of your MongoDB Aggregation Pipeline.",
         "MongoDB Analytics",
         "1. $match: Filters documents with non-empty exposed_fields.\n"
         "2. $unwind: Deconstructs the exposed_fields array into separate documents for each item.\n"
         "3. $group: Groups by data class name and sums the total occurrences using { $sum: 1 }.\n"
         "4. $sort: Orders results descending by frequency.\n"
         "5. $limit: Restricts the output to the top 5 most frequently leaked data classes."),

        ("Q15: What is the CAP Theorem, and where do your databases sit?",
         "Distributed Systems",
         "The CAP theorem states that a distributed data store can only guarantee two out of Consistency, Availability, and Partition Tolerance. PostgreSQL is a CP (Consistency & Partition Tolerance) system prioritizing strict ACID serializability. MongoDB in a single-primary replica set is also CP, prioritizing strong read-after-write consistency."),

        # Group 4: Security & Authentication
        ("Q16: How are user passwords hashed, and why is SHA-256 NOT used for passwords?",
         "Cybersecurity & Auth",
         "We hash passwords using bcryptjs with 10 salt rounds. SHA-256 is a fast cryptographic digest designed for file integrity; modern GPUs can compute billions of SHA-256 hashes per second, making it vulnerable to brute force. In contrast, bcrypt is an adaptive key derivation function with built-in work factors and salting, making offline cracking computationally prohibitive."),

        ("Q17: How does JWT session management work with Next.js Edge Middleware?",
         "Web Security",
         "Upon successful bcrypt login, the backend issues a signed JWT token containing user_id and role using the jose library. The token is set in an HttpOnly, SameSite=Lax cookie. Next.js Edge middleware intercepts every incoming request, validates the cryptographic signature, and extracts user details before the request reaches any page or API."),

        ("Q18: What is Role-Based Access Control (RBAC), and how is it enforced?",
         "Access Control",
         "Users are assigned roles ('user' or 'admin') stored in the users table and verified in the JWT payload. Edge middleware intercepts routes matching /admin/:path*. If the user role is not 'admin', middleware immediately returns HTTP 403 Forbidden without executing backend queries."),

        # Group 5: Professor "Trap" Questions & Defense
        ("Q19: What happens if Docker crashes during a scan transaction?",
         "Fault Tolerance & Crash Recovery",
         "If the container or host crashes mid-transaction, PostgreSQL's Write-Ahead Log (WAL) ensures Atomicity. Upon container restart, PostgreSQL executes REDO and UNDO crash recovery routines: any uncommitted scan transactions are completely rolled back. Zero orphaned or partial records persist."),

        ("Q20: Why did you store playbook_ref as a string in recovery_actions instead of a PostgreSQL foreign key?",
         "Cross-Database Design",
         "Because guidance_playbooks resides in MongoDB, a relational foreign key cannot span physical database engines. We store MongoDB's 24-character hexadecimal ObjectId as a text string (playbook_ref). Consistency is enforced at the application layer within the scan ingestion transaction."),

        ("Q21: Could SQL Injection compromise your system?",
         "Application Security",
         "No. All PostgreSQL queries use parameterized prepared statements ($1, $2, etc.) via node-postgres (pg). Parameter values are transmitted out-of-band to the database engine and treated purely as literal data, making SQL injection mathematically impossible."),

        ("Q22: Why did you use SHA-256 to hash identities in MongoDB breach records?",
         "Privacy Engineering",
         "To respect user privacy. We do not store raw emails or usernames in the MongoDB breach database. Instead, identities are normalized to lowercase and hashed with SHA-256. When a user scans an identity, we hash their input and match the digests without exposing raw third-party identity catalogs."),

        ("Q23: How would you scale this database to 10 million users?",
         "Scalability & Architecture",
         "1. PostgreSQL: Implement connection pooling (PgBouncer), read replicas for SELECT queries, and range partitioning on scan_requests and exposures by date.\n"
         "2. MongoDB: Shard breach_records horizontally using a hashed shard key on identity_hash.\n"
         "3. Caching: Introduce Redis to cache frequent dashboard summaries and guidance playbooks."),

        ("Q24: What is the difference between an INNER JOIN and a LEFT JOIN in your views?",
         "Relational Algebra",
         "INNER JOIN returns only rows where a match exists in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right table (filling NULLs if no match exists). In user_security_dashboard, exposures JOIN breaches is an INNER JOIN because every valid exposure must reference an existing breach incident."),

        ("Q25: What is the advantage of using Docker Compose for this project?",
         "DevOps & Portability",
         "Docker Compose provides environment idempotency: identical containerized versions of PostgreSQL 16 and MongoDB 7 spin up with a single command on any Windows, Mac, or Linux machine, eliminating configuration drift and host dependency conflicts.")
    ]

    for q_title, category, ans_text in qnas:
        add_h2(doc, q_title)
        add_p(doc, f"Category: {category}", bold_prefix="Domain:")
        add_p(doc, ans_text)
        
        md_content += f"""### {q_title}
- **Domain:** *{category}*
- **Model Answer:**  
{ans_text}

"""

    docx_path = os.path.join(VIVA_DIR, "05_TEST_ACCOUNTS_AND_VIVA_QNA_BIBLE.docx")
    md_path = os.path.join(VIVA_DIR, "05_TEST_ACCOUNTS_AND_VIVA_QNA_BIBLE.md")
    
    doc.save(docx_path)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    print(f"[+] Successfully generated Section 5: {docx_path} and {md_path}")

if __name__ == "__main__":
    generate_sec5()
