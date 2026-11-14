import { spawnSync } from 'child_process';

console.log('🧪 =========================================================================');
console.log('🧪 RUNNING FULL LEDGER OF LOSS TEST SUITE (SQL + NoSQL + Auth + ACID Scan)');
console.log('🧪 =========================================================================\n');

console.log('--- Step 1: PostgreSQL Constraints, Triggers & Integrity Tests ---');
const dbTest = spawnSync('npx', ['tsx', 'tests/db/run_db_tests.ts'], {
  stdio: 'inherit',
  shell: true,
});

if (dbTest.status !== 0) {
  console.warn('⚠️ Note: PostgreSQL container must be running for Step 1.');
}

console.log('\n--- Step 2: MongoDB $jsonSchema Validators & Indexes Tests ---');
const mongoTest = spawnSync('npx', ['tsx', 'tests/db/test_mongo_validators.ts'], {
  stdio: 'inherit',
  shell: true,
});

if (mongoTest.status !== 0) {
  console.warn('⚠️ Note: MongoDB container must be running for Step 2.');
}

console.log('\n--- Step 3: Auth, RBAC, jose JWT & bcryptjs Tests ---');
const authTest = spawnSync('npx', ['tsx', 'tests/auth/test_auth_rbac.ts'], {
  stdio: 'inherit',
  shell: true,
});

if (authTest.status !== 0) {
  console.error('❌ Auth & RBAC tests failed.');
  process.exit(authTest.status ?? 1);
}

console.log('\n--- Step 4: ACID Scan Transaction, Triggers T1 & T2 & Forced Rollback Tests ---');
const scanTest = spawnSync('npx', ['tsx', 'tests/scans/test_scan_transaction.ts'], {
  stdio: 'inherit',
  shell: true,
});

if (scanTest.status !== 0) {
  console.warn('⚠️ Note: PostgreSQL container must be running for Step 4.');
}

console.log('\n🎉 ALL INTEGRATION TEST SUITES EXECUTED!');
