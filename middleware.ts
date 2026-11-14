import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'ledger_session_token';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-minimum-32-chars-long!';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let userPayload: { userId: number; email: string; role: 'user' | 'admin'; name: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ['HS256'],
      });
      userPayload = payload as any;
    } catch (err) {
      userPayload = null;
    }
  }

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isProtectedUserRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/identities') ||
    pathname.startsWith('/exposures') ||
    pathname.startsWith('/actions') ||
    pathname.startsWith('/guidance') ||
    pathname.startsWith('/api/scans') ||
    pathname.startsWith('/api/identities') ||
    pathname.startsWith('/api/recovery-actions') ||
    pathname.startsWith('/api/dashboard');

  // 1. If trying to access login/signup while already authenticated, redirect to appropriate home
  if (isAuthRoute && userPayload) {
    const destination = userPayload.role === 'admin' ? '/admin/analytics' : '/dashboard';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // 2. Protect Admin routes
  if (isAdminRoute) {
    if (!userPayload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userPayload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 3. Protect User routes
  if (isProtectedUserRoute) {
    if (!userPayload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/identities/:path*',
    '/exposures/:path*',
    '/actions/:path*',
    '/guidance/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/scans/:path*',
    '/api/identities/:path*',
    '/api/recovery-actions/:path*',
    '/api/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
