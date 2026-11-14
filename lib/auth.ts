import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface UserJwtPayload {
  userId: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-minimum-32-chars-long!';
const encodedKey = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = 'ledger_session_token';

/**
 * Signs a cryptographically secure JWT token with 24-hour expiration.
 */
export async function signToken(payload: UserJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey);
}

/**
 * Verifies a JWT token and returns its decoded payload, or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserJwtPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to retrieve the authenticated user session from Next.js server components or route handlers.
 */
export async function getCurrentUser(): Promise<UserJwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Helper to retrieve user session directly from an incoming NextRequest.
 */
export async function getRequestUser(req: NextRequest): Promise<UserJwtPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
