import { getDb, getMongoClient } from '../lib/mongo';
import dotenv from 'dotenv';

dotenv.config();

export async function setupMongoCollections() {
  console.log('🍃 Initializing MongoDB collections with strict $jsonSchema validators and indexes...');
  const db = await getDb();

  // --------------------------------------------------------------------------
  // 1. Collection: breach_records
  // --------------------------------------------------------------------------
  const collections = await db.listCollections().toArray();
  const existingNames = collections.map((c) => c.name);

  const breachRecordsSchema = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['breach_id', 'identity_hash', 'identity_type', 'exposed_fields', 'extra'],
      additionalProperties: false,
      properties: {
        _id: { bsonType: 'objectId' },
        breach_id: {
          bsonType: ['int', 'long', 'double'],
          description: 'SQL breaches.breach_id reference',
        },
        identity_hash: {
          bsonType: 'string',
          pattern: '^[a-f0-9]{64}$',
          description: 'sha256 hex string of lower-cased identity value',
        },
        identity_type: {
          enum: ['email', 'username'],
          description: 'Type of identity: email or username',
        },
        exposed_fields: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'string',
          },
          description: 'List of exposed field names matching seeded data_types',
        },
        extra: {
          bsonType: 'object',
          description: 'Free-form metadata specific to the breach source',
        },
      },
    },
  };

  if (!existingNames.includes('breach_records')) {
    await db.createCollection('breach_records', {
      validator: breachRecordsSchema,
      validationLevel: 'strict',
      validationAction: 'error',
    });
    console.log('✅ Created collection: breach_records with strict validator');
  } else {
    await db.command({
      collMod: 'breach_records',
      validator: breachRecordsSchema,
      validationLevel: 'strict',
      validationAction: 'error',
    });
    console.log('✅ Updated validator on breach_records');
  }

  // breach_records Indexes
  await db.collection('breach_records').createIndex(
    { identity_hash: 1, identity_type: 1 },
    { name: 'idx_identity_hash_type' }
  );
  await db.collection('breach_records').createIndex(
    { breach_id: 1 },
    { name: 'idx_breach_id' }
  );
  console.log('✅ Created indexes on breach_records');

  // --------------------------------------------------------------------------
  // 2. Collection: guidance_playbooks
  // --------------------------------------------------------------------------
  const playbooksSchema = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'summary', 'applies_to', 'priority', 'steps', 'tags', 'updated_at'],
      additionalProperties: false,
      properties: {
        _id: { bsonType: 'objectId' },
        title: { bsonType: 'string', minLength: 1 },
        summary: { bsonType: 'string', minLength: 1 },
        applies_to: {
          bsonType: 'object',
          required: ['data_types', 'min_severity_rank'],
          additionalProperties: false,
          properties: {
            data_types: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            min_severity_rank: {
              bsonType: ['int', 'long', 'double'],
              minimum: 1,
              maximum: 4,
            },
          },
        },
        priority: {
          bsonType: ['int', 'long', 'double'],
          minimum: 1,
          maximum: 5,
        },
        steps: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'object',
            required: ['order', 'text', 'estimated_minutes'],
            additionalProperties: false,
            properties: {
              order: { bsonType: ['int', 'long', 'double'], minimum: 1 },
              text: { bsonType: 'string', minLength: 1 },
              estimated_minutes: { bsonType: ['int', 'long', 'double'], minimum: 1 },
            },
          },
        },
        tags: {
          bsonType: 'array',
          items: { bsonType: 'string' },
        },
        updated_at: { bsonType: 'date' },
      },
    },
  };

  if (!existingNames.includes('guidance_playbooks')) {
    await db.createCollection('guidance_playbooks', {
      validator: playbooksSchema,
      validationLevel: 'strict',
      validationAction: 'error',
    });
    console.log('✅ Created collection: guidance_playbooks with strict validator');
  } else {
    await db.command({
      collMod: 'guidance_playbooks',
      validator: playbooksSchema,
      validationLevel: 'strict',
      validationAction: 'error',
    });
    console.log('✅ Updated validator on guidance_playbooks');
  }

  // guidance_playbooks Indexes
  // Full-text index on title, summary, tags, and steps.text (title weighted highest)
  await db.collection('guidance_playbooks').createIndex(
    {
      title: 'text',
      summary: 'text',
      tags: 'text',
      'steps.text': 'text',
    },
    {
      weights: {
        title: 10,
        summary: 5,
        tags: 5,
        'steps.text': 1,
      },
      name: 'idx_playbooks_text_search',
    }
  );

  // Multikey index on applies_to.data_types
  await db.collection('guidance_playbooks').createIndex(
    { 'applies_to.data_types': 1 },
    { name: 'idx_playbooks_multikey_data_types' }
  );

  // Composite index for fast severity rank and priority matching during scans
  await db.collection('guidance_playbooks').createIndex(
    { 'applies_to.min_severity_rank': 1, priority: -1 },
    { name: 'idx_playbooks_matching' }
  );
  console.log('✅ Created indexes on guidance_playbooks');

  // --------------------------------------------------------------------------
  // 3. Collection: audit_logs (append-only)
  // --------------------------------------------------------------------------
  const auditLogsSchema = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['ts', 'event_type', 'user_id', 'role', 'details'],
      additionalProperties: false,
      properties: {
        _id: { bsonType: 'objectId' },
        ts: { bsonType: 'date' },
        event_type: {
          enum: [
            'signup',
            'login',
            'identity_added',
            'identity_verified',
            'scan_completed',
            'scan_failed',
            'recommendations_issued',
            'action_completed',
            'admin_breach_added',
            'admin_playbook_changed',
          ],
        },
        user_id: { bsonType: ['int', 'long', 'double'] },
        role: { enum: ['user', 'admin'] },
        details: { bsonType: 'object' },
      },
    },
  };

  if (!existingNames.includes('audit_logs')) {
    await db.createCollection('audit_logs', {
      validator: auditLogsSchema,
      validationLevel: 'strict',
      validationAction: 'error',
    });
    console.log('✅ Created collection: audit_logs with strict validator');
  } else {
    await db.command({
      collMod: 'audit_logs',
      validator: auditLogsSchema,
      validationLevel: 'strict',
      validationAction: 'error',
    });
    console.log('✅ Updated validator on audit_logs');
  }

  // audit_logs Indexes
  await db.collection('audit_logs').createIndex(
    { ts: -1 },
    { name: 'idx_audit_ts_desc' }
  );
  await db.collection('audit_logs').createIndex(
    { event_type: 1, ts: -1 },
    { name: 'idx_audit_event_ts' }
  );
  console.log('✅ Created indexes on audit_logs');

  console.log('🎉 MongoDB setup complete!');
}

if (require.main === module) {
  setupMongoCollections()
    .then(async () => {
      const client = await getMongoClient();
      await client.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal Mongo setup error:', err);
      const client = await getMongoClient();
      await client.close();
      process.exit(1);
    });
}
