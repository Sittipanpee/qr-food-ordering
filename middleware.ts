import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/jwt';

const SESSION_COOKIE_NAME = 'admin_session';

/**
 * Next.js Middleware - Route Protection
 *
 * Protects admin routes from unauthorized access
 * Edge Runtime compatible (no bcrypt dependency)
 */
export async function middleware(request: NextRequest) {
  // Allow access to login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if user has valid session
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    // No session - redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session token
  const session = await verifySessionToken(token);

  if (!session || session.role !== 'admin') {
    // Invalid session - redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Valid session - allow access
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
  runtime: 'nodejs', // Use Node.js runtime instead of Edge to support bcrypt
};
