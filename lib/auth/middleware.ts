import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './utils';

export const SESSION_COOKIE_NAME = 'admin_session';

/**
 * Get session from request cookies
 */
export async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

/**
 * Middleware to protect admin routes
 * Returns null if authenticated, or NextResponse redirect if not
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSession(request);

  if (!session || session.role !== 'admin') {
    // Not authenticated - redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated
  return null;
}

/**
 * Helper to create session cookie response
 */
export function createSessionCookie(token: string): {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
  path: string;
} {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };
}

/**
 * Helper to clear session cookie
 */
export function clearSessionCookie(): {
  name: string;
  value: string;
  maxAge: number;
  path: string;
} {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    maxAge: 0,
    path: '/',
  };
}
