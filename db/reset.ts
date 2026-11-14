import fs from 'fs';
import path from 'path';
import { pool } from '../lib/pg';
import { getDb, getMongoClient } from '../lib/mongo';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabases() {
  console.log('⚠️  RESETTING ALL DATABASES (PostgreSQL + MongoDB)...');

  // 1. Reset PostgreSQL
  const pgClient = await pool.connect();
  try {
    const teardownPath = path.join(process.cwd(), 'db', 'teardown.sql');
    if (fs.existsSync(teardownPath)) {
      console.log('🔄 Executing db/teardown.sql on PostgreSQL...');
      const teardownSql = fs.readFileSync(teardownPath, 'utf-8');
      await pgClient.query(teardownSql);
    } else {
      console.log('🔄 Dropping and recreating public schema in PostgreSQL...');
      await pgClient.query('DROP SCHEMA public CASCADE;');
      await pgClient.query('CREATE SCHEMA public;');
      await pgClient.query('GRANT ALL ON SCHEMA public TO postgres;');
      await pgClient.query('GRANT ALL ON SCHEMA public TO public;');
    }
    console.log('✅ PostgreSQL reset complete.');
  } finally {
    pgClient.release();
  }

  // 2. Reset MongoDB
  try {
    const mongoDb = await getDb();
    const collections = await mongoDb.listCollections().toArray();
    for (const col of collections) {
      await mongoDb.collection(col.name).drop();
      console.log(`🗑️  Dropped MongoDB collection: ${col.name}`);
    }
    console.log('✅ MongoDB reset complete.');
  } catch (err: any) {
    console.warn('⚠️ MongoDB reset warning (database may be empty or not yet reachable):', err.message);
  } finally {
    const client = await getMongoClient();
    await client.close();
    await pool.end();
  }

  console.log('🎉 Reset finished! You can now run `npm run db:migrate` and `npm run db:seed`.');
}

resetDatabases().catch((err) => {
  console.error('Fatal reset error:', err);
  process.exit(1);
});
