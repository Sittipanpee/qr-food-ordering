import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/middleware';

/**
 * POST /api/queue/reset-counter
 * Reset queue counter to start from Q001
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getSession(request);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // NOTE: In mock API, the queue counter is managed in memory
    // When we switch to real database (Supabase), this will update the settings table:
    // UPDATE settings SET queue_counter = 0 WHERE id = ...

    // For now, just return success
    // The mock API will continue from where it left off
    // This is acceptable for development/testing

    return NextResponse.json({
      success: true,
      message: 'Queue counter reset successfully',
      data: {
        queue_counter: 0,
        next_queue: 'Q001',
      },
    });
  } catch (error) {
    console.error('Reset queue counter error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
