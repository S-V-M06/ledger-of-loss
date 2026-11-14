import { pool } from '../../lib/pg';
import dotenv from 'dotenv';

dotenv.config();

async function runScanTransactionTests() {
  console.log('🔄 =========================================================================');
  console.log('🔄 STARTING ACID SCAN TRANSACTION & TRIGGER TEST SUITE (Slice A)');
  console.log('🔄 =========================================================================\n');

  const client = await pool.connect();
  const results: { id: string; test: string; passed: boolean; message: string }[] = [];

  try {
    // Setup isolated test harness user
    const userRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('ACID Scan Harness', 'acidharness@example.com', 'dummyhash', 'user')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING user_id;
    `);
    const userId = userRes.rows[0].user_id;

    // Test 1: Function calculate_exposure_risk() with bounded score
    try {
      const breachRes = await client.query(`
        INSERT INTO breaches (breach_name, source_name, breach_date, severity)
        VALUES ('Formula Bounded Breach', 'SecLabs', CURRENT_DATE - INTERVAL '1 month', 'critical')
        ON CONFLICT (breach_name) DO UPDATE SET severity = EXCLUDED.severity
        RETURNING breach_id;
      `);
      const breachId = breachRes.rows[0].breach_id;

      const identRes = await client.query(`
        INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
        VALUES ($1, 'formula_test@example.com', 'email', true, now())
        RETURNING identity_id;
      `, [userId]);
      const identId = identRes.rows[0].identity_id;

      const expRes = await client.query(`
        INSERT INTO exposures (identity_id, breach_id, risk_score)
        VALUES ($1, $2, 0)
        RETURNING exposure_id;
      `, [identId, breachId]);
      const expId = expRes.rows[0].exposure_id;

      // Add high-weight data types: password(30) + financial(25) + government_id(25) = 80
      // Base: critical (40) + recency (10) + data_types (80) = 130 -> LEAST(100, 130) = 100
      const dtPass = await client.query(`SELECT data_type_id FROM data_types WHERE name = 'password'`);
      const dtFin = await client.query(`SELECT data_type_id FROM data_types WHERE name = 'financial'`);
      const dtGov = await client.query(`SELECT data_type_id FROM data_types WHERE name = 'government_id'`);

      await client.query(`
        INSERT INTO exposure_data_types (exposure_id, data_type_id)
        VALUES ($1, $2), ($1, $3), ($1, $4);
      `, [expId, dtPass.rows[0].data_type_id, dtFin.rows[0].data_type_id, dtGov.rows[0].data_type_id]);

      const scoreRes = await client.query(`SELECT calculate_exposure_risk($1) AS score;`, [expId]);
      const score = Number(scoreRes.rows[0].score);

      results.push({
        id: 'TC-S01',
        test: 'calculate_exposure_risk correctly caps maximum score at 100',
        passed: score === 100,
        message: `Calculated score: ${score} (Expected bounded 100)`,
      });
    } catch (e: any) {
      results.push({ id: 'TC-S01', test: 'calculate_exposure_risk capping', passed: false, message: e.message });
    }

    // Test 2: Trigger T1 enforces no scans on unverified identities
    try {
      const unverifiedRes = await client.query(`
        INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
        VALUES ($1, 'unverified_trigger_check@example.com', 'email', false, null)
        RETURNING identity_id;
      `, [userId]);
      const unverifiedId = unverifiedRes.rows[0].identity_id;

      let triggerBlocked = false;
      try {
        await client.query(`INSERT INTO scan_requests (identity_id) VALUES ($1);`, [unverifiedId]);
      } catch (err: any) {
        triggerBlocked = err.code === 'P0001' || err.message.includes('not verified');
      }

      results.push({
        id: 'TC-S02',
        test: 'Trigger T1 raises database exception before insert on unverified identity',
        passed: triggerBlocked,
        message: triggerBlocked ? 'Trigger T1 aborted bad scan insertion' : 'Trigger T1 failed to block scan',
      });
    } catch (e: any) {
      results.push({ id: 'TC-S02', test: 'Trigger T1 check', passed: false, message: e.message });
    }

    // Test 3: Trigger T2 auto-refreshes user_risk_summary on risk_score update
    try {
      const verifiedRes = await client.query(`
        INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
        VALUES ($1, 't2_trigger_check@example.com', 'email', true, now())
        RETURNING identity_id;
      `, [userId]);
      const vId = verifiedRes.rows[0].identity_id;

      const brRes = await client.query(`SELECT breach_id FROM breaches LIMIT 1;`);
      const expRes = await client.query(`
        INSERT INTO exposures (identity_id, breach_id, risk_score)
        VALUES ($1, $2, 0)
        RETURNING exposure_id;
      `, [vId, brRes.rows[0].breach_id]);
      const expId = expRes.rows[0].exposure_id;

      // Updating risk_score fires Trigger T2
      await client.query(`UPDATE exposures SET risk_score = 78 WHERE exposure_id = $1;`, [expId]);

      // Check user_risk_summary
      const summaryRes = await client.query(`
        SELECT total_exposures, critical_count, overall_score
        FROM user_risk_summary
        WHERE user_id = $1;
      `, [userId]);

      const passed =
        summaryRes.rows.length > 0 &&
        Number(summaryRes.rows[0].overall_score) >= 78 &&
        Number(summaryRes.rows[0].critical_count) >= 1;

      results.push({
        id: 'TC-S03',
        test: 'Trigger T2 auto-updates user_risk_summary on exposure risk_score update',
        passed,
        message: passed ? 'user_risk_summary synchronized automatically' : 'Trigger T2 failed to refresh',
      });
    } catch (e: any) {
      results.push({ id: 'TC-S03', test: 'Trigger T2 check', passed: false, message: e.message });
    }

    // Test 4: Forced Rollback on Scan Transaction (ACID Atomicity Proof)
    try {
      const rollbackIdentityRes = await client.query(`
        INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
        VALUES ($1, 'acid_rollback_target@example.com', 'email', true, now())
        RETURNING identity_id;
      `, [userId]);
      const rollbackIdentityId = rollbackIdentityRes.rows[0].identity_id;

      let rollbackOccurred = false;
      const txClient = await pool.connect();
      try {
        await txClient.query('BEGIN');

        // Step A: Insert scan request
        const scanRes = await txClient.query(`
          INSERT INTO scan_requests (identity_id, status)
          VALUES ($1, 'pending')
          RETURNING scan_id;
        `, [rollbackIdentityId]);
        const testScanId = scanRes.rows[0].scan_id;

        // Step B: Insert exposure
        const brRes = await txClient.query(`SELECT breach_id FROM breaches LIMIT 1;`);
        await txClient.query(`
          INSERT INTO exposures (identity_id, breach_id, scan_id, risk_score)
          VALUES ($1, $2, $3, 50);
        `, [rollbackIdentityId, brRes.rows[0].breach_id, testScanId]);

        // Step C: Force intentional error (violating foreign key constraint on invalid data_type_id)
        await txClient.query(`
          INSERT INTO exposure_data_types (exposure_id, data_type_id)
          VALUES ($1, 999999);
        `);

        await txClient.query('COMMIT');
      } catch (err) {
        await txClient.query('ROLLBACK');
        rollbackOccurred = true;
      } finally {
        txClient.release();
      }

      // Assert that neither the scan_request nor the exposure were persisted
      const checkScan = await client.query(`SELECT COUNT(*)::int AS count FROM scan_requests WHERE identity_id = $1;`, [rollbackIdentityId]);
      const checkExp = await client.query(`SELECT COUNT(*)::int AS count FROM exposures WHERE identity_id = $1;`, [rollbackIdentityId]);

      const isClean = Number(checkScan.rows[0].count) === 0 && Number(checkExp.rows[0].count) === 0;

      results.push({
        id: 'TC-S04',
        test: 'ACID Forced Rollback: Error during scan reverts all pending SQL writes atomically',
        passed: rollbackOccurred && isClean,
        message: rollbackOccurred && isClean
          ? 'Transaction rolled back cleanly; 0 orphan rows left in database'
          : 'Rollback failed to ensure atomicity',
      });
    } catch (e: any) {
      results.push({ id: 'TC-S04', test: 'Forced Rollback test', passed: false, message: e.message });
    }

    // Cleanup harness user
    await client.query(`DELETE FROM users WHERE user_id = $1;`, [userId]);

    console.table(
      results.map((r) => ({
        ID: r.id,
        Test: r.test,
        Status: r.passed ? '✅ PASS' : '❌ FAIL',
        Details: r.message,
      }))
    );

    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      console.log(`\n🎉 All ${results.length} ACID Scan Transaction & Trigger tests PASSED successfully!`);
    } else {
      console.error('\n❌ Some Scan Transaction tests failed.');
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runScanTransactionTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
