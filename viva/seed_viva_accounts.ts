import bcrypt from 'bcryptjs';
import { pool } from '../lib/pg';
import { getDb } from '../lib/mongo';
import dotenv from 'dotenv';

dotenv.config();

export async function seedVivaAccounts() {
  console.log('🎓 Seeding 5 Special Viva Accounts with Distinct Security Personas...');
  const client = await pool.connect();
  const mongoDb = await getDb();

  try {
    const password = process.env.SEED_USER_PASSWORD || 'UserPass123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Fetch data types map
    const dtRes = await client.query('SELECT data_type_id, name FROM data_types;');
    const dtMap = new Map<string, number>();
    dtRes.rows.forEach((r) => dtMap.set(r.name, r.data_type_id));

    // 2. Fetch breaches map
    const bRes = await client.query('SELECT breach_id, breach_name, severity FROM breaches;');
    const breachMap = new Map<number, any>();
    bRes.rows.forEach((b) => breachMap.set(b.breach_id, b));

    // 3. Define the 5 personas
    const personas = [
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        personaTitle: 'CRITICAL THREAT / HIGH FINANCIAL EXPOSURE',
        identities: [
          { value: 'rohan.verma@example.com', type: 'email', verified: true }
        ],
        exposuresToSeed: [
          { breach_id: 1, fields: ['password', 'financial', 'government_id', 'email'] }, // Apex Health (Critical)
          { breach_id: 5, fields: ['financial', 'security_questions', 'email'] },          // FinSecure (Critical)
          { breach_id: 9, fields: ['password', 'security_questions', 'email'] }           // CyberForums (Critical)
        ],
        completedRemediations: false
      },
      {
        name: 'Pooja Rao',
        email: 'pooja.rao@example.com',
        personaTitle: 'HIGH RISK / CREDENTIAL REUSE & STUFFING',
        identities: [
          { value: 'pooja.rao@example.com', type: 'email', verified: true }
        ],
        exposuresToSeed: [
          { breach_id: 2, fields: ['password', 'phone', 'email'] },   // CloudScale Nexus (High)
          { breach_id: 6, fields: ['address', 'phone', 'email'] }     // GigaShop Global (High)
        ],
        completedRemediations: false
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram.m@example.com',
        personaTitle: 'LOW RISK / MINIMAL FOOTPRINT',
        identities: [
          { value: 'vikram.m@example.com', type: 'email', verified: true }
        ],
        exposuresToSeed: [
          { breach_id: 4, fields: ['email', 'ip_address'] },  // VoltUtility (Low)
          { breach_id: 8, fields: ['username', 'email'] }     // OmniTravel (Low)
        ],
        completedRemediations: false
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.com',
        personaTitle: 'HERO REMEDIATED / RECOVERED PERSONA',
        identities: [
          { value: 'ananya.iyer@example.com', type: 'email', verified: true }
        ],
        exposuresToSeed: [
          { breach_id: 7, fields: ['username', 'password'] }, // StreamWave (Medium)
          { breach_id: 10, fields: ['username', 'ip_address'] } // NexusPlay (Medium)
        ],
        completedRemediations: true // All recovery actions marked COMPLETED!
      },
      {
        name: 'Kabir Mehta',
        email: 'kabir.mehta@example.com',
        personaTitle: 'CLEAN SLATE / LIVE SCAN DEMO PERSONA',
        identities: [
          { value: 'kabir.mehta@example.com', type: 'email', verified: true }
        ],
        exposuresToSeed: [], // Zero exposures! Ready for live scan demo in front of professor.
        completedRemediations: false
      }
    ];

    for (const p of personas) {
      // Upsert User
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash
         RETURNING user_id;`,
        [p.name, p.email, passwordHash]
      );
      const userId = userRes.rows[0].user_id;

      // Upsert Identities
      for (const ident of p.identities) {
        const identRes = await client.query(
          `INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
           VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN now() ELSE null END)
           ON CONFLICT (user_id, identity_value) DO UPDATE SET
             verified = EXCLUDED.verified,
             verified_at = EXCLUDED.verified_at
           RETURNING identity_id;`,
          [userId, ident.value, ident.type, ident.verified]
        );
        const identityId = identRes.rows[0].identity_id;

        // If persona has exposures to pre-seed, create a completed scan and exposures
        if (p.exposuresToSeed.length > 0) {
          // Check if scan already exists
          const existingScan = await client.query(
            `SELECT scan_id FROM scan_requests WHERE identity_id = $1 LIMIT 1;`,
            [identityId]
          );

          let scanId: number;
          if (existingScan.rows.length === 0) {
            const scanRes = await client.query(
              `INSERT INTO scan_requests (identity_id, status, started_at, completed_at, exposures_found)
               VALUES ($1, 'completed', now() - INTERVAL '1 hour', now() - INTERVAL '59 minutes', $2)
               RETURNING scan_id;`,
              [identityId, p.exposuresToSeed.length]
            );
            scanId = scanRes.rows[0].scan_id;
          } else {
            scanId = existingScan.rows[0].scan_id;
          }

          for (const exp of p.exposuresToSeed) {
            // Upsert exposure
            const expInsert = await client.query(
              `INSERT INTO exposures (identity_id, breach_id, scan_id, risk_score)
               VALUES ($1, $2, $3, 0)
               ON CONFLICT (identity_id, breach_id) DO UPDATE SET
                 scan_id = EXCLUDED.scan_id
               RETURNING exposure_id;`,
              [identityId, exp.breach_id, scanId]
            );
            const exposureId = expInsert.rows[0].exposure_id;

            // Link data types
            for (const field of exp.fields) {
              const dtId = dtMap.get(field);
              if (dtId) {
                await client.query(
                  `INSERT INTO exposure_data_types (exposure_id, data_type_id)
                   VALUES ($1, $2)
                   ON CONFLICT DO NOTHING;`,
                  [exposureId, dtId]
                );
              }
            }

            // Recalculate risk score via SQL function
            await client.query(
              `UPDATE exposures
               SET risk_score = calculate_exposure_risk($1)
               WHERE exposure_id = $1;`,
              [exposureId]
            );

            // Fetch matched guidance playbooks from MongoDB
            const playbooks = await mongoDb
              .collection('guidance_playbooks')
              .find({
                'applies_to.data_types': { $in: exp.fields }
              })
              .limit(2)
              .toArray();

            for (const pb of playbooks) {
              const actionStatus = p.completedRemediations ? 'completed' : 'pending';
              const completedAt = p.completedRemediations ? 'now()' : 'null';

              await client.query(
                `INSERT INTO recovery_actions (exposure_id, playbook_ref, title, priority, status, completed_at)
                 VALUES ($1, $2, $3, $4, $5, ${completedAt})
                 ON CONFLICT (exposure_id, playbook_ref) DO UPDATE SET
                   status = EXCLUDED.status,
                   completed_at = EXCLUDED.completed_at;`,
                [exposureId, pb._id.toString(), pb.title, pb.priority, actionStatus]
              );
            }
          }

          // Trigger T2 automatically refreshes user_risk_summary on exposure risk update,
          // but we also invoke refresh_user_risk_summary directly to guarantee synchronization
          await client.query(`SELECT refresh_user_risk_summary($1);`, [userId]);
        } else {
          // Clean slate: ensure user_risk_summary has 0
          await client.query(`SELECT refresh_user_risk_summary($1);`, [userId]);
        }
      }
      console.log(`  [+] Seeded Persona: ${p.name} (${p.email}) - ${p.personaTitle}`);
    }

    console.log('✅ Successfully seeded all 5 Viva Test Personas in PostgreSQL and MongoDB!');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedVivaAccounts()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Error seeding viva accounts:', err);
      await pool.end();
      process.exit(1);
    });
}
