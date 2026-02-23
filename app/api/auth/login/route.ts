import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  generateSessionToken,
} from '@/lib/auth/utils';
import { createSessionCookie } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate session token
    const token = await generateSessionToken({
      userId: 'admin',
      role: 'admin',
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
    });

    // Set session cookie
    const cookie = createSessionCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
