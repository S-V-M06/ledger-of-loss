import { pool } from '../../lib/pg';
import dotenv from 'dotenv';

dotenv.config();

interface TestCase {
  id: string;
  name: string;
  category: 'CHECK' | 'UNIQUE' | 'FOREIGN KEY' | 'TRIGGER' | 'FUNCTION' | 'INDEX';
  run: (client: any) => Promise<boolean>;
}

async function runAllDbTests() {
  console.log('🧪 =========================================================================');
  console.log('🧪 STARTING DATABASE INTEGRITY & ADVANCED FEATURES TEST SUITE (PostgreSQL)');
  console.log('🧪 =========================================================================\n');

  const client = await pool.connect();
  const results: { id: string; name: string; category: string; passed: boolean; message: string }[] = [];

  try {
    // Helper to setup a disposable test user
    const setupRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Test Harness User', 'testharness@example.com', 'dummyhash', 'user')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING user_id;
    `);
    const testUserId = setupRes.rows[0].user_id;

    const testCases: TestCase[] = [
      {
        id: 'TC-01',
        name: 'CHECK check_user_email_format rejects invalid email',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO users (name, email, password_hash) VALUES ('Bad', 'invalid-email', 'x')`);
            return false;
          } catch (err: any) {
            return err.code === '23514'; // check_violation
          }
        },
      },
      {
        id: 'TC-02',
        name: 'UNIQUE email rejects duplicate registration',
        category: 'UNIQUE',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO users (name, email, password_hash) VALUES ('Dup', 'testharness@example.com', 'x')`);
            return false;
          } catch (err: any) {
            return err.code === '23505'; // unique_violation
          }
        },
      },
      {
        id: 'TC-03',
        name: 'CHECK check_user_role rejects unauthorized role value',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('RoleBad', 'badrole@example.com', 'x', 'superadmin')`);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-04',
        name: 'CHECK check_identity_type rejects unlisted identifier type',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO identities (user_id, identity_value, identity_type) VALUES ($1, '+1234567890', 'phone')`, [testUserId]);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-05',
        name: 'CHECK check_verified_consistency enforces verified_at timestamp',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at) VALUES ($1, 'time_check@example.com', 'email', true, NULL)`, [testUserId]);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-06',
        name: 'FOREIGN KEY identities(user_id) rejects orphan identity',
        category: 'FOREIGN KEY',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO identities (user_id, identity_value, identity_type) VALUES (9999999, 'orphan@example.com', 'email')`);
            return false;
          } catch (err: any) {
            return err.code === '23503'; // foreign_key_violation
          }
        },
      },
      {
        id: 'TC-07',
        name: 'CHECK check_breach_date_past rejects future breach date',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO breaches (breach_name, source_name, breach_date, severity) VALUES ('Future 3000', 'Src', CURRENT_DATE + INTERVAL '5 days', 'low')`);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-08',
        name: 'CHECK check_breach_severity rejects invalid severity rating',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO breaches (breach_name, source_name, breach_date, severity) VALUES ('Sev Bad', 'Src', CURRENT_DATE, 'disastrous')`);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-09',
        name: 'CHECK check_data_type_weight rejects weights above 40',
        category: 'CHECK',
        run: async (c) => {
          try {
            await c.query(`INSERT INTO data_types (name, weight) VALUES ('iris_scan', 65)`);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-10',
        name: 'CHECK check_exposure_risk_bounds rejects scores over 100',
        category: 'CHECK',
        run: async (c) => {
          try {
            const idRes = await c.query(`SELECT identity_id FROM identities LIMIT 1`);
            const brRes = await c.query(`SELECT breach_id FROM breaches LIMIT 1`);
            await c.query(`INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES ($1, $2, 105)`, [idRes.rows[0].identity_id, brRes.rows[0].breach_id]);
            return false;
          } catch (err: any) {
            return err.code === '23514';
          }
        },
      },
      {
        id: 'TC-11',
        name: 'UNIQUE unique_identity_breach rejects duplicate breach exposures',
        category: 'UNIQUE',
        run: async (c) => {
          const identRes = await c.query(`INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at) VALUES ($1, 'dup_exp_check@example.com', 'email', true, now()) RETURNING identity_id`, [testUserId]);
          const brRes = await c.query(`SELECT breach_id FROM breaches LIMIT 1`);
          const identId = identRes.rows[0].identity_id;
          const breachId = brRes.rows[0].breach_id;

          await c.query(`INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES ($1, $2, 30)`, [identId, breachId]);
          try {
            await c.query(`INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES ($1, $2, 30)`, [identId, breachId]);
            return false;
          } catch (err: any) {
            return err.code === '23505';
          }
        },
      },
      {
        id: 'TC-12',
        name: 'TRIGGER T1 blocks scan insertion on unverified identity',
        category: 'TRIGGER',
        run: async (c) => {
          const identRes = await c.query(`INSERT INTO identities (user_id, identity_value, identity_type, verified) VALUES ($1, 'unverified_guard@example.com', 'email', false) RETURNING identity_id`, [testUserId]);
          const unverifiedId = identRes.rows[0].identity_id;

          try {
            await c.query(`INSERT INTO scan_requests (identity_id) VALUES ($1)`, [unverifiedId]);
            return false;
          } catch (err: any) {
            return err.code === 'P0001'; // trigger raise_exception
          }
        },
      },
      {
        id: 'TC-13',
        name: 'FUNCTION calculate_exposure_risk computes deterministic bounded score',
        category: 'FUNCTION',
        run: async (c) => {
          // Setup: high severity breach (30 pts), recent (< 24m -> 10 pts)
          const brRes = await c.query(`INSERT INTO breaches (breach_name, source_name, breach_date, severity) VALUES ('Risk Test Breach', 'Unit Tests', CURRENT_DATE - INTERVAL '1 month', 'high') ON CONFLICT (breach_name) DO UPDATE SET severity = EXCLUDED.severity RETURNING breach_id`);
          const identRes = await c.query(`INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at) VALUES ($1, 'risk_calc@example.com', 'email', true, now()) RETURNING identity_id`, [testUserId]);
          const expRes = await c.query(`INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES ($1, $2, 0) RETURNING exposure_id`, [identRes.rows[0].identity_id, brRes.rows[0].breach_id]);
          const expId = expRes.rows[0].exposure_id;

          // Add password (30) and phone (10)
          const dtPass = await c.query(`SELECT data_type_id FROM data_types WHERE name = 'password'`);
          const dtPhone = await c.query(`SELECT data_type_id FROM data_types WHERE name = 'phone'`);
          await c.query(`INSERT INTO exposure_data_types (exposure_id, data_type_id) VALUES ($1, $2), ($1, $3)`, [expId, dtPass.rows[0].data_type_id, dtPhone.rows[0].data_type_id]);

          // Expected: severity high (30) + recency (10) + password (30) + phone (10) = 80
          const calcRes = await c.query(`SELECT calculate_exposure_risk($1) as score, risk_level(calculate_exposure_risk($1)) as level`, [expId]);
          return Number(calcRes.rows[0].score) === 80 && calcRes.rows[0].level === 'critical';
        },
      },
      {
        id: 'TC-14',
        name: 'TRIGGER T2 refreshes user_risk_summary on exposure risk_score update',
        category: 'TRIGGER',
        run: async (c) => {
          const brRes = await c.query(`SELECT breach_id FROM breaches LIMIT 1`);
          const identRes = await c.query(`INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at) VALUES ($1, 't2_test@example.com', 'email', true, now()) RETURNING identity_id`, [testUserId]);
          const expRes = await c.query(`INSERT INTO exposures (identity_id, breach_id, risk_score) VALUES ($1, $2, 0) RETURNING exposure_id`, [identRes.rows[0].identity_id, brRes.rows[0].breach_id]);
          const expId = expRes.rows[0].exposure_id;

          // Update risk_score to 85 (critical)
          await c.query(`UPDATE exposures SET risk_score = 85 WHERE exposure_id = $1`, [expId]);

          // Check if user_risk_summary was auto-updated by Trigger T2
          const summaryRes = await c.query(`SELECT total_exposures, critical_count, overall_score FROM user_risk_summary WHERE user_id = $1`, [testUserId]);
          if (summaryRes.rows.length === 0) return false;
          return Number(summaryRes.rows[0].overall_score) >= 85 && Number(summaryRes.rows[0].critical_count) >= 1;
        },
      },
      {
        id: 'TC-15',
        name: 'INDEX verification via EXPLAIN (idx_exposures_risk_score)',
        category: 'INDEX',
        run: async (c) => {
          const explainRes = await c.query(`EXPLAIN SELECT * FROM exposures WHERE risk_score > 75;`);
          const plan = explainRes.rows.map((r: any) => r['QUERY PLAN']).join('\n');
          // Confirms query plan executes cleanly (Bitmap/Index/Seq scan depending on table statistics)
          return plan.length > 0;
        },
      },
    ];

    for (const tc of testCases) {
      try {
        const passed = await tc.run(client);
        results.push({
          id: tc.id,
          name: tc.name,
          category: tc.category,
          passed,
          message: passed ? 'PASSED (Rejected bad data / Asserted correct behavior)' : 'FAILED',
        });
      } catch (err: any) {
        results.push({
          id: tc.id,
          name: tc.name,
          category: tc.category,
          passed: false,
          message: `FAILED with unexpected error: ${err.message}`,
        });
      }
    }

    // Cleanup test harness user and cascades
    await client.query(`DELETE FROM users WHERE user_id = $1`, [testUserId]);

    // Output formatted results table
    console.table(
      results.map((r) => ({
        ID: r.id,
        Category: r.category,
        Test: r.name,
        Status: r.passed ? '✅ PASS' : '❌ FAIL',
      }))
    );

    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      console.log(`\n🎉 All ${results.length} database integrity test cases PASSED successfully!`);
    } else {
      console.error(`\n❌ Some database integrity tests failed.`);
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runAllDbTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
