import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear session cookie
    const cookie = clearSessionCookie();
    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
