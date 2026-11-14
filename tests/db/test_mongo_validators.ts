import { getDb, getMongoClient } from '../../lib/mongo';
import dotenv from 'dotenv';

dotenv.config();

interface MongoTestCase {
  id: string;
  collection: string;
  name: string;
  run: (db: any) => Promise<boolean>;
}

async function runMongoValidatorTests() {
  console.log('🍃 =========================================================================');
  console.log('🍃 STARTING MONGODB $jsonSchema VALIDATORS & INDEXES TEST SUITE');
  console.log('🍃 =========================================================================\n');

  const db = await getDb();
  const results: { id: string; collection: string; name: string; passed: boolean; message: string }[] = [];

  const testCases: MongoTestCase[] = [
    // ------------------------------------------------------------------------
    // breach_records validation tests
    // ------------------------------------------------------------------------
    {
      id: 'TC-M01',
      collection: 'breach_records',
      name: 'Rejects invalid identity_hash format (must be 64-char sha256 hex)',
      run: async (d) => {
        try {
          await d.collection('breach_records').insertOne({
            breach_id: 1,
            identity_hash: 'not-a-valid-64-character-sha256-hex-digest',
            identity_type: 'email',
            exposed_fields: ['password'],
            extra: {},
          });
          return false;
        } catch (err: any) {
          return err.code === 121; // DocumentValidationFailure
        }
      },
    },
    {
      id: 'TC-M02',
      collection: 'breach_records',
      name: 'Rejects unsupported identity_type (only email or username allowed)',
      run: async (d) => {
        try {
          await d.collection('breach_records').insertOne({
            breach_id: 1,
            identity_hash: 'a'.repeat(64),
            identity_type: 'telephone',
            exposed_fields: ['phone'],
            extra: {},
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M03',
      collection: 'breach_records',
      name: 'Rejects empty exposed_fields array (minItems: 1)',
      run: async (d) => {
        try {
          await d.collection('breach_records').insertOne({
            breach_id: 1,
            identity_hash: 'b'.repeat(64),
            identity_type: 'email',
            exposed_fields: [],
            extra: {},
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M04',
      collection: 'breach_records',
      name: 'Rejects unpermitted root properties (additionalProperties: false)',
      run: async (d) => {
        try {
          await d.collection('breach_records').insertOne({
            breach_id: 1,
            identity_hash: 'c'.repeat(64),
            identity_type: 'email',
            exposed_fields: ['email'],
            extra: {},
            unauthorized_field: 'illegal_injection',
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },

    // ------------------------------------------------------------------------
    // guidance_playbooks validation tests
    // ------------------------------------------------------------------------
    {
      id: 'TC-M05',
      collection: 'guidance_playbooks',
      name: 'Rejects playbook with priority > 5',
      run: async (d) => {
        try {
          await d.collection('guidance_playbooks').insertOne({
            title: 'Test Playbook',
            summary: 'Summary text',
            applies_to: { data_types: ['password'], min_severity_rank: 2 },
            priority: 6,
            steps: [{ order: 1, text: 'Step 1', estimated_minutes: 5 }],
            tags: ['test'],
            updated_at: new Date(),
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M06',
      collection: 'guidance_playbooks',
      name: 'Rejects playbook with min_severity_rank > 4',
      run: async (d) => {
        try {
          await d.collection('guidance_playbooks').insertOne({
            title: 'Test Playbook 2',
            summary: 'Summary text',
            applies_to: { data_types: ['password'], min_severity_rank: 5 },
            priority: 3,
            steps: [{ order: 1, text: 'Step 1', estimated_minutes: 5 }],
            tags: ['test'],
            updated_at: new Date(),
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M07',
      collection: 'guidance_playbooks',
      name: 'Rejects playbook with empty steps array',
      run: async (d) => {
        try {
          await d.collection('guidance_playbooks').insertOne({
            title: 'Test Playbook 3',
            summary: 'Summary text',
            applies_to: { data_types: ['password'], min_severity_rank: 2 },
            priority: 3,
            steps: [],
            tags: ['test'],
            updated_at: new Date(),
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M08',
      collection: 'guidance_playbooks',
      name: 'Rejects playbook missing required title',
      run: async (d) => {
        try {
          await d.collection('guidance_playbooks').insertOne({
            summary: 'Missing title',
            applies_to: { data_types: ['password'], min_severity_rank: 2 },
            priority: 3,
            steps: [{ order: 1, text: 'Step 1', estimated_minutes: 5 }],
            tags: ['test'],
            updated_at: new Date(),
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },

    // ------------------------------------------------------------------------
    // audit_logs validation tests
    // ------------------------------------------------------------------------
    {
      id: 'TC-M09',
      collection: 'audit_logs',
      name: 'Rejects audit log with invalid event_type',
      run: async (d) => {
        try {
          await d.collection('audit_logs').insertOne({
            ts: new Date(),
            event_type: 'unregistered_hack_event',
            user_id: 1,
            role: 'user',
            details: {},
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M10',
      collection: 'audit_logs',
      name: 'Rejects audit log with invalid role (only user or admin)',
      run: async (d) => {
        try {
          await d.collection('audit_logs').insertOne({
            ts: new Date(),
            event_type: 'login',
            user_id: 1,
            role: 'root_operator',
            details: {},
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },
    {
      id: 'TC-M11',
      collection: 'audit_logs',
      name: 'Rejects audit log missing timestamp ts',
      run: async (d) => {
        try {
          await d.collection('audit_logs').insertOne({
            event_type: 'login',
            user_id: 1,
            role: 'user',
            details: {},
          });
          return false;
        } catch (err: any) {
          return err.code === 121;
        }
      },
    },

    // ------------------------------------------------------------------------
    // Indexes & Search Capabilities
    // ------------------------------------------------------------------------
    {
      id: 'TC-M12',
      collection: 'guidance_playbooks',
      name: 'Executes MongoDB text search with textScore ranking',
      run: async (d) => {
        const matches = await d
          .collection('guidance_playbooks')
          .find(
            { $text: { $search: 'password credentials' } },
            { projection: { score: { $meta: 'textScore' } } }
          )
          .sort({ score: { $meta: 'textScore' } })
          .toArray();
        return matches.length > 0;
      },
    },
    {
      id: 'TC-M13',
      collection: 'guidance_playbooks',
      name: 'Executes multikey query on applies_to.data_types index',
      run: async (d) => {
        const matches = await d
          .collection('guidance_playbooks')
          .find({ 'applies_to.data_types': 'financial' })
          .toArray();
        return matches.length > 0;
      },
    },
  ];

  for (const tc of testCases) {
    try {
      const passed = await tc.run(db);
      results.push({
        id: tc.id,
        collection: tc.collection,
        name: tc.name,
        passed,
        message: passed ? 'PASSED (Rejected bad document / Found index match)' : 'FAILED',
      });
    } catch (err: any) {
      results.push({
        id: tc.id,
        collection: tc.collection,
        name: tc.name,
        passed: false,
        message: `FAILED with error: ${err.message}`,
      });
    }
  }

  // Display results table
  console.table(
    results.map((r) => ({
      ID: r.id,
      Collection: r.collection,
      Test: r.name,
      Status: r.passed ? '✅ PASS' : '❌ FAIL',
    }))
  );

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log(`\n🎉 All ${results.length} MongoDB validator & index tests PASSED successfully!`);
  } else {
    console.error(`\n❌ Some MongoDB validator tests failed.`);
    process.exit(1);
  }
}

if (require.main === module) {
  runMongoValidatorTests()
    .then(async () => {
      const client = await getMongoClient();
      await client.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal Mongo validator test error:', err);
      try {
        const client = await getMongoClient();
        await client.close();
      } catch {}
      process.exit(1);
    });
}
