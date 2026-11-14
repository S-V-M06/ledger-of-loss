import fs from 'fs';
import path from 'path';
import { pool } from '../lib/pg';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  console.log('🔄 Checking database connection and migrations...');
  const client = await pool.connect();

  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id serial PRIMARY KEY,
        filename text NOT NULL UNIQUE,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // 2. Read all .sql files from db/migrations
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️ db/migrations directory does not exist yet.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // 3. Get already applied migrations
    const res = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(res.rows.map((r) => r.filename));

    let count = 0;
    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`⏳ Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✅ Applied migration: ${file}`);
          count++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration failed in ${file}:`, err);
          throw err;
        }
      } else {
        console.log(`⏭️  Already applied: ${file}`);
      }
    }

    if (count === 0) {
      console.log('✨ Database schema is up to date. No new migrations.');
    } else {
      console.log(`🎉 Successfully applied ${count} new migration(s).`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
