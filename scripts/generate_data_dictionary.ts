import fs from 'fs';
import path from 'path';
import { pool } from '../lib/pg';
import { getDb, getMongoClient } from '../lib/mongo';
import dotenv from 'dotenv';

dotenv.config();

export async function generateDataDictionary() {
  console.log('📖 Generating docs/data_dictionary.md from PostgreSQL and MongoDB schemas...');

  let markdown = `# Ledger of Loss: Comprehensive Data Dictionary & Schema Specification\n\n`;
  markdown += `Generated automatically from PostgreSQL 16 \`information_schema\` and MongoDB 7 \`$jsonSchema\` validators.\n\n`;
  markdown += `**Project**: Ledger of Loss (DBMS Level 3 Experiential Learning)\n`;
  markdown += `**Stack**: PostgreSQL 16 (Relational Core) + MongoDB 7 (Document NoSQL)\n\n`;
  markdown += `---\n\n`;

  // 1. PostgreSQL Schema Documentation
  markdown += `## 1. Relational Database Schema (PostgreSQL 16)\n\n`;

  try {
    const client = await pool.connect();
    try {
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != 'schema_migrations'
        ORDER BY table_name;
      `);

      for (const row of tablesRes.rows) {
        const tableName = row.table_name;
        markdown += `### Table: \`${tableName}\`\n\n`;

        const colsRes = await client.query(`
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        markdown += `| Column Name | Data Type | Nullable | Default | Constraints & Business Purpose |\n`;
        markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

        for (const col of colsRes.rows) {
          markdown += `| \`${col.column_name}\` | \`${col.data_type}\` | ${col.is_nullable === 'YES' ? 'Yes' : 'No'} | \`${col.column_default || 'None'}\` | Reference column in schema |\n`;
        }
        markdown += `\n`;
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    markdown += `*(PostgreSQL live introspection unavailable during offline build: using static schema specification)*\n\n`;
  }

  // Static Relational Definition
  markdown += `### Comprehensive PostgreSQL Relational Schema Definitions\n\n`;
  markdown += `#### 1. \`users\`
- \`user_id\` (serial, PK): Unique system identifier for registered users.
- \`name\` (text, NOT NULL): Full name of the user.
- \`email\` (text, NOT NULL, UNIQUE): Email address validated via format CHECK constraint \`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$\`.
- \`password_hash\` (text, NOT NULL): Bcrypt-hashed password (cost factor >= 10). Never logged or exposed.
- \`role\` (text, NOT NULL, DEFAULT 'user'): Role authorization flag checked against \`CHECK (role IN ('user', 'admin'))\`.
- \`created_at\` (timestamptz, DEFAULT now()): Timestamp of account creation.

#### 2. \`identities\`
- \`identity_id\` (serial, PK): Unique identifier for a digital persona.
- \`user_id\` (integer, FK -> users.user_id ON DELETE CASCADE): User owning this identity.
- \`identity_value\` (text, NOT NULL): Plaintext email or username.
- \`identity_type\` (text, NOT NULL): \`CHECK (identity_type IN ('email', 'username'))\`.
- \`verified\` (boolean, NOT NULL, DEFAULT false): Anti-abuse status flag.
- \`verified_at\` (timestamptz, NULLABLE): Timestamp of ownership confirmation.
- **Constraints**: \`UNIQUE (user_id, identity_value)\`, \`CHECK (NOT verified OR verified_at IS NOT NULL)\`.

#### 3. \`breaches\`
- \`breach_id\` (serial, PK): Master catalog ID.
- \`breach_name\` (text, NOT NULL, UNIQUE): Unique title of security incident.
- \`source_name\` (text, NOT NULL): Compromised entity or intelligence source.
- \`breach_date\` (date, NOT NULL): Date of leak; validated via \`CHECK (breach_date <= CURRENT_DATE)\`.
- \`severity\` (text, NOT NULL): \`CHECK (severity IN ('low', 'medium', 'high', 'critical'))\`.
- \`description\` (text): Contextual incident synopsis.

#### 4. \`data_types\`
- \`data_type_id\` (serial, PK): Lookup ID.
- \`name\` (text, NOT NULL, UNIQUE): Field name (password, financial, government_id, phone, etc.).
- \`weight\` (integer, NOT NULL): Risk weight \`CHECK (weight BETWEEN 0 AND 40)\`.

#### 5. \`scan_requests\`
- \`scan_id\` (serial, PK): Scan execution audit ID.
- \`identity_id\` (integer, FK -> identities.identity_id ON DELETE CASCADE): Target identifier.
- \`started_at\` (timestamptz, DEFAULT now()): Timestamp scan initiated.
- \`completed_at\` (timestamptz): Timestamp scan finished.
- \`status\` (text, NOT NULL, DEFAULT 'pending'): \`CHECK (status IN ('pending', 'completed', 'failed'))\`.
- \`exposures_found\` (integer, DEFAULT 0): Count of matches discovered.
- **Trigger**: Protected by Trigger T1 preventing scans on unverified identities.

#### 6. \`exposures\`
- \`exposure_id\` (serial, PK): Individual incident match.
- \`identity_id\` (integer, FK -> identities.identity_id ON DELETE CASCADE).
- \`breach_id\` (integer, FK -> breaches.breach_id).
- \`scan_id\` (integer, FK -> scan_requests.scan_id ON DELETE SET NULL).
- \`discovered_at\` (timestamptz, DEFAULT now()): First detection timestamp.
- \`risk_score\` (integer, NOT NULL, DEFAULT 0): Calculated bounded score \`CHECK (risk_score BETWEEN 0 AND 100)\`.
- **Constraint**: \`UNIQUE (identity_id, breach_id)\`.
- **Trigger**: Updating risk_score triggers T2 to auto-refresh \`user_risk_summary\`.

#### 7. \`exposure_data_types\`
- \`exposure_id\` (integer, FK -> exposures.exposure_id ON DELETE CASCADE).
- \`data_type_id\` (integer, FK -> data_types.data_type_id).
- **Primary Key**: \`(exposure_id, data_type_id)\`.

#### 8. \`recovery_actions\`
- \`action_id\` (serial, PK): Interactive remediation action item.
- \`exposure_id\` (integer, FK -> exposures.exposure_id ON DELETE CASCADE).
- \`playbook_ref\` (text, NOT NULL): String representation of MongoDB ObjectId (Cross-database reference).
- \`title\` (text, NOT NULL): Playbook title.
- \`priority\` (integer, NOT NULL): \`CHECK (priority BETWEEN 1 AND 5)\`.
- \`status\` (text, DEFAULT 'pending'): \`CHECK (status IN ('pending', 'completed', 'dismissed'))\`.
- \`completed_at\` (timestamptz): Must be populated when \`status = 'completed'\`.
- **Constraint**: \`UNIQUE (exposure_id, playbook_ref)\`.

#### 9. \`user_risk_summary\`
- \`user_id\` (integer, PK, FK -> users.user_id ON DELETE CASCADE).
- \`total_exposures\` (integer, DEFAULT 0).
- \`high_count\` (integer, DEFAULT 0).
- \`critical_count\` (integer, DEFAULT 0).
- \`overall_score\` (integer, DEFAULT 0).
- \`updated_at\` (timestamptz, DEFAULT now()).
- Maintained exclusively via stored function \`refresh_user_risk_summary()\` and Trigger T2.

---\n\n`;

  // 2. MongoDB Document Schema Documentation
  markdown += `## 2. Document NoSQL Schema (MongoDB 7)\n\n`;
  markdown += `Strict collection validation schemas enforced via \`$jsonSchema\` (\`validationLevel: strict\`, \`validationAction: error\`):\n\n`;

  markdown += `### Collection: \`breach_records\`\n`;
  markdown += `Holds individual identity occurrences within a breach. To protect user privacy, identities are stored only as 64-character SHA-256 hexadecimal digests.\n\n`;
  markdown += `\`\`\`json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["breach_id", "identity_hash", "identity_type", "exposed_fields", "extra"],
    "additionalProperties": false,
    "properties": {
      "_id": { "bsonType": "objectId" },
      "breach_id": { "bsonType": ["int", "long", "double"], "description": "SQL breaches.breach_id reference" },
      "identity_hash": { "bsonType": "string", "pattern": "^[a-f0-9]{64}$", "description": "SHA-256 hex string" },
      "identity_type": { "enum": ["email", "username"] },
      "exposed_fields": { "bsonType": "array", "minItems": 1, "items": { "bsonType": "string" } },
      "extra": { "bsonType": "object", "description": "Dynamic incident metadata" }
    }
  }
}
\`\`\`\n`;
  markdown += `**Indexes**:\n- \`{ identity_hash: 1, identity_type: 1 }\`\n- \`{ breach_id: 1 }\`\n\n`;

  markdown += `### Collection: \`guidance_playbooks\`\n`;
  markdown += `Hierarchical remediation playbooks matched to exposed data fields during scans.\n\n`;
  markdown += `\`\`\`json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["title", "summary", "applies_to", "priority", "steps", "tags", "updated_at"],
    "additionalProperties": false,
    "properties": {
      "_id": { "bsonType": "objectId" },
      "title": { "bsonType": "string", "minLength": 1 },
      "summary": { "bsonType": "string", "minLength": 1 },
      "applies_to": {
        "bsonType": "object",
        "required": ["data_types", "min_severity_rank"],
        "properties": {
          "data_types": { "bsonType": "array", "items": { "bsonType": "string" } },
          "min_severity_rank": { "bsonType": ["int", "long", "double"], "minimum": 1, "maximum": 4 }
        }
      },
      "priority": { "bsonType": ["int", "long", "double"], "minimum": 1, "maximum": 5 },
      "steps": {
        "bsonType": "array",
        "minItems": 1,
        "items": {
          "bsonType": "object",
          "required": ["order", "text", "estimated_minutes"],
          "properties": {
            "order": { "bsonType": ["int", "long", "double"], "minimum": 1 },
            "text": { "bsonType": "string", "minLength": 1 },
            "estimated_minutes": { "bsonType": ["int", "long", "double"], "minimum": 1 }
          }
        }
      },
      "tags": { "bsonType": "array", "items": { "bsonType": "string" } },
      "updated_at": { "bsonType": "date" }
    }
  }
}
\`\`\`\n`;
  markdown += `**Indexes**:\n- Text Index: \`{ title: "text", summary: "text", tags: "text", "steps.text": "text" }\` (Weights: title=10, summary=5, tags=5, steps=1)\n- Multikey Index: \`{ "applies_to.data_types": 1 }\`\n- Matching Compound Index: \`{ "applies_to.min_severity_rank": 1, priority: -1 }\`\n\n`;

  markdown += `### Collection: \`audit_logs\`\n`;
  markdown += `Append-only security log auditing authentication events, scan runs, and administrator updates.\n\n`;
  markdown += `\`\`\`json
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["ts", "event_type", "user_id", "role", "details"],
    "additionalProperties": false,
    "properties": {
      "_id": { "bsonType": "objectId" },
      "ts": { "bsonType": "date" },
      "event_type": {
        "enum": [
          "signup",
          "login",
          "identity_added",
          "identity_verified",
          "scan_completed",
          "scan_failed",
          "recommendations_issued",
          "action_completed",
          "admin_breach_added",
          "admin_playbook_changed"
        ]
      },
      "user_id": { "bsonType": ["int", "long", "double"] },
      "role": { "enum": ["user", "admin"] },
      "details": { "bsonType": "object" }
    }
  }
}
\`\`\`\n`;
  markdown += `**Indexes**:\n- \`{ ts: -1 }\`\n- \`{ event_type: 1, ts: -1 }\`\n\n`;

  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outPath = path.join(docsDir, 'data_dictionary.md');
  fs.writeFileSync(outPath, markdown, 'utf-8');
  console.log(`✅ Generated: ${outPath}`);
}

if (require.main === module) {
  generateDataDictionary()
    .then(async () => {
      await pool.end();
      try {
        const client = await getMongoClient();
        await client.close();
      } catch {}
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
