import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/mock-api';
import { formatQueueNumber, generateQueueUrl } from '@/lib/queue/utils';
import { OrderItem, OrderStatus } from '@/lib/types';

interface CreateQueueRequest {
  customer_name?: string;
  customer_phone?: string;
  items: {
    menu_item_id: string;
    menu_item_name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  total_amount: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateQueueRequest = await request.json();

    // Validate input
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!body.total_amount || body.total_amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get next queue number
    const queueNumber = await api.queue.getNextQueueNumber();
    const queueStr = formatQueueNumber(queueNumber);

    // Create order items with IDs
    const orderItems: OrderItem[] = body.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      order_id: '', // Will be set after order creation
      menu_item_id: item.menu_item_id,
      menu_item_name: item.menu_item_name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
    }));

    // Create order
    const order = await api.orders.create({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      status: 'pending' as OrderStatus,
      items: orderItems,
      total_amount: body.total_amount,
      notes: body.notes,
      mode: 'market',
      queue_number: queueNumber,
    });

    // Update order items with correct order_id
    order.items = order.items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    // Generate persistent URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const urlInfo = generateQueueUrl(queueNumber, order.id, baseUrl);

    // Update order with tracking URL
    await api.orders.update(order.id, {
      tracking_url: urlInfo.url,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        queueNumber: queueNumber,
        queueString: queueStr,
        url: urlInfo.url,
        path: urlInfo.path,
        hash: urlInfo.hash,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error('Create queue error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
