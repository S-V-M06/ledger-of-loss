import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../../lib/auth';

async function runAuthTests() {
  console.log('🔐 =========================================================================');
  console.log('🔐 STARTING AUTHENTICATION & RBAC SECURITY TESTS (jose + bcryptjs)');
  console.log('🔐 =========================================================================\n');

  const results: { id: string; test: string; passed: boolean }[] = [];

  // Test 1: Password hashing with bcryptjs (cost factor 10)
  try {
    const plain = 'SuperSecretPass123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);
    const valid = await bcrypt.compare(plain, hash);
    const invalid = await bcrypt.compare('WrongPass', hash);
    results.push({
      id: 'TC-A01',
      test: 'bcryptjs salt cost >= 10 hashes and compares correctly',
      passed: valid === true && invalid === false && hash.startsWith('$2'),
    });
  } catch (e) {
    results.push({ id: 'TC-A01', test: 'bcryptjs test', passed: false });
  }

  // Test 2: JWT token signing with jose (HS256)
  let token = '';
  try {
    token = await signToken({
      userId: 42,
      email: 'divya@example.com',
      name: 'Divya Sharma',
      role: 'user',
    });
    results.push({
      id: 'TC-A02',
      test: 'jose signs valid JWT token with user claims',
      passed: typeof token === 'string' && token.split('.').length === 3,
    });
  } catch (e) {
    results.push({ id: 'TC-A02', test: 'jose signing test', passed: false });
  }

  // Test 3: JWT token verification and payload integrity
  try {
    const payload = await verifyToken(token);
    results.push({
      id: 'TC-A03',
      test: 'jose verifies valid JWT token and extracts role payload correctly',
      passed: payload?.userId === 42 && payload?.role === 'user' && payload?.email === 'divya@example.com',
    });
  } catch (e) {
    results.push({ id: 'TC-A03', test: 'jose verification test', passed: false });
  }

  // Test 4: Rejection of forged or tampered JWT token
  try {
    const forgedToken = token.substring(0, token.length - 6) + 'abcdef';
    const payload = await verifyToken(forgedToken);
    results.push({
      id: 'TC-A04',
      test: 'jose strictly rejects forged/tampered JWT tokens',
      passed: payload === null,
    });
  } catch (e) {
    results.push({ id: 'TC-A04', test: 'forged token test', passed: false });
  }

  // Test 5: Admin role differentiation
  try {
    const adminToken = await signToken({
      userId: 1,
      email: 'admin@ledgerofloss.local',
      name: 'Admin',
      role: 'admin',
    });
    const payload = await verifyToken(adminToken);
    results.push({
      id: 'TC-A05',
      test: 'Admin role claim securely encoded and decoded',
      passed: payload?.role === 'admin' && payload?.userId === 1,
    });
  } catch (e) {
    results.push({ id: 'TC-A05', test: 'admin role test', passed: false });
  }

  console.table(
    results.map((r) => ({
      ID: r.id,
      Test: r.test,
      Status: r.passed ? '✅ PASS' : '❌ FAIL',
    }))
  );

  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log(`\n🎉 All ${results.length} Auth & RBAC security tests PASSED successfully!`);
  } else {
    console.error('\n❌ Some Auth tests failed.');
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error('Fatal auth test error:', err);
  process.exit(1);
});
