import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/pg';
import { getMongoClient } from '../lib/mongo';
import { setupMongoCollections } from './mongo_setup';
import { seedMongoData } from './mongo_seed';
import { seedVivaAccounts } from '../viva/seed_viva_accounts';
import dotenv from 'dotenv';

dotenv.config();

export async function seedSqlData() {
  console.log('🌱 Starting PostgreSQL database seed...');
  const client = await pool.connect();

  try {
    // 1. Run seed.sql for data_types and breaches
    const seedSqlPath = path.join(process.cwd(), 'db', 'seed.sql');
    if (fs.existsSync(seedSqlPath)) {
      const sql = fs.readFileSync(seedSqlPath, 'utf-8');
      await client.query(sql);
      console.log('✅ Seeded data_types and breaches from seed.sql');
    }

    // 2. Hash passwords using bcryptjs with cost factor >= 10
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!';
    const userPassword = process.env.SEED_USER_PASSWORD || 'UserPass123!';

    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(adminPassword, salt);
    const userHash = await bcrypt.hash(userPassword, salt);

    // 3. Insert or update Admin account
    const adminRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role
       RETURNING user_id, email, role;`,
      ['System Administrator', 'admin@ledgerofloss.local', adminHash]
    );

    // 4. Insert or update Demo User 1 (Divya)
    const user1Res = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role
       RETURNING user_id, email, role;`,
      ['Divya Sharma', 'divya@example.com', userHash]
    );

    // 5. Insert or update Demo User 2 (Arjun)
    const user2Res = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role
       RETURNING user_id, email, role;`,
      ['Arjun Patel', 'arjun@example.com', userHash]
    );

    const divyaId = user1Res.rows[0].user_id;
    const arjunId = user2Res.rows[0].user_id;

    // 6. Pre-seed verified identities for demo users so initial scans can be tested
    await client.query(
      `INSERT INTO identities (user_id, identity_value, identity_type, verified, verified_at)
       VALUES 
         ($1, 'divya@example.com', 'email', true, now()),
         ($1, 'divya_sharma', 'username', true, now()),
         ($2, 'arjun@example.com', 'email', true, now()),
         ($2, 'arjun_coder', 'username', false, null)
       ON CONFLICT (user_id, identity_value) DO NOTHING;`,
      [divyaId, arjunId]
    );

    console.log('✅ Seeded users and initial identities in PostgreSQL.');
    console.log('\n================ SEEDED USER CREDENTIALS ================');
    console.log(`Admin User:   admin@ledgerofloss.local | Password: ${adminPassword}`);
    console.log(`Demo User 1:  divya@example.com        | Password: ${userPassword}`);
    console.log(`Demo User 2:  arjun@example.com        | Password: ${userPassword}`);
    console.log('=========================================================\n');
  } finally {
    client.release();
  }
}

export async function seedAll() {
  console.log('🚀 Running Full Seed Routine (PostgreSQL + MongoDB)...\n');
  await seedSqlData();
  await setupMongoCollections();
  await seedMongoData();
  await seedVivaAccounts();
  console.log('🎉 Full database seeding completed successfully!');
}

if (require.main === module) {
  seedAll()
    .then(async () => {
      await pool.end();
      const client = await getMongoClient();
      await client.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal seed error:', err);
      await pool.end();
      try {
        const client = await getMongoClient();
        await client.close();
      } catch {}
      process.exit(1);
    });
}
