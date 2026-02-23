import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/mock-api';
import { parseQueueUrl, validateQueueUrl } from '@/lib/queue/utils';
import { OrderStatus } from '@/lib/types';

/**
 * GET /api/queue/[queueId]
 * Get queue/order details by queue ID and hash
 * Format: GET /api/queue/Q001-abc12345
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const { queueId } = await params;

    // Parse queue URL
    const parsed = parseQueueUrl(queueId);

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'Invalid queue URL format' },
        { status: 400 }
      );
    }

    // Find order by queue number
    const order = await api.queue.getQueueByNumber(parsed.queueNumber);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Queue not found' },
        { status: 404 }
      );
    }

    // Validate hash
    const validation = await validateQueueUrl(queueId, order.id);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid queue URL' },
        { status: 403 }
      );
    }

    // Return order details
    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        queue_number: order.queue_number,
        queue_string: parsed.queueStr,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        status: order.status,
        items: order.items,
        total_amount: order.total_amount,
        notes: order.notes,
        tracking_url: order.tracking_url,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    });
  } catch (error) {
    console.error('Get queue error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/queue/[queueId]
 * Update queue status
 * Format: PATCH /api/queue/Q001-abc12345
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const { queueId } = await params;
    const body = await request.json();

    // Validate status
    const validStatuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ];

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Parse queue URL
    const parsed = parseQueueUrl(queueId);

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'Invalid queue URL format' },
        { status: 400 }
      );
    }

    // Find order by queue number
    const order = await api.queue.getQueueByNumber(parsed.queueNumber);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Queue not found' },
        { status: 404 }
      );
    }

    // Validate hash
    const validation = await validateQueueUrl(queueId, order.id);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid queue URL' },
        { status: 403 }
      );
    }

    // Update order status
    const updatedOrder = await api.orders.updateStatus(order.id, body.status);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        queue_number: updatedOrder.queue_number,
        status: updatedOrder.status,
        updated_at: updatedOrder.updated_at,
      },
    });
  } catch (error) {
    console.error('Update queue status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
