# Queue System - Market Mode Implementation

## Overview

Complete queue system implementation for Market Mode with secure persistent URLs and queue management.

## Features

### 1. Queue Number Generation
- Format: Q001, Q002, Q003...
- Auto-increment counter
- Atomic increment (prevents collision)
- Customizable prefix

### 2. Persistent URLs
- Secure HMAC-SHA256 hash (8 characters)
- Format: `/queue/Q001-abc12345`
- Prevents URL guessing
- Validates on every access

### 3. Queue Management
- Create orders with queue numbers
- Track order status
- Update queue status
- Reset counter (admin only)

## API Routes

### POST /api/orders/create-queue
Create a new order with queue number.

**Request:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "0812345678",
  "items": [
    {
      "menu_item_id": "menu-1",
      "menu_item_name": "ข้าวผัดกะเพรา",
      "quantity": 2,
      "price": 45,
      "notes": "ไม่เผ็ด"
    }
  ],
  "total_amount": 90,
  "notes": "รับกลับบ้าน"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order-1234567890",
    "orderNumber": "#011",
    "queueNumber": 11,
    "queueString": "Q011",
    "url": "http://localhost:3000/queue/Q011-67ef2799",
    "path": "/queue/Q011-67ef2799",
    "hash": "67ef2799",
    "status": "pending",
    "total_amount": 90,
    "created_at": "2026-02-23T10:33:32.672Z"
  }
}
```

### GET /api/queue/[queueId]
Get queue/order details by queue ID and hash.

**Example:**
```bash
curl http://localhost:3000/api/queue/Q011-67ef2799
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-1234567890",
    "order_number": "#011",
    "queue_number": 11,
    "queue_string": "Q011",
    "customer_name": "John Doe",
    "customer_phone": "0812345678",
    "status": "preparing",
    "items": [
      {
        "id": "item-1234567890-0",
        "order_id": "order-1234567890",
        "menu_item_id": "menu-1",
        "menu_item_name": "ข้าวผัดกะเพรา",
        "quantity": 2,
        "price": 45
      }
    ],
    "total_amount": 90,
    "notes": "รับกลับบ้าน",
    "tracking_url": "http://localhost:3000/queue/Q011-67ef2799",
    "created_at": "2026-02-23T10:33:32.672Z",
    "updated_at": "2026-02-23T10:33:42.010Z"
  }
}
```

**Error Responses:**

Invalid format:
```json
{
  "success": false,
  "error": "Invalid queue URL format"
}
```

Invalid hash:
```json
{
  "success": false,
  "error": "Invalid queue URL hash"
}
```

Queue not found:
```json
{
  "success": false,
  "error": "Queue not found"
}
```

### PATCH /api/queue/[queueId]
Update queue status.

**Request:**
```json
{
  "status": "preparing"
}
```

Valid statuses:
- `pending` - รอยืนยัน
- `confirmed` - ยืนยันแล้ว
- `preparing` - กำลังเตรียม
- `ready` - พร้อมรับ
- `completed` - เสร็จสิ้น
- `cancelled` - ยกเลิก

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-1234567890",
    "order_number": "#011",
    "queue_number": 11,
    "status": "preparing",
    "updated_at": "2026-02-23T10:33:42.010Z"
  }
}
```

### POST /api/queue/reset-counter
Reset queue counter to Q001. Requires admin authentication.

**Example:**
```bash
curl -X POST http://localhost:3000/api/queue/reset-counter \
  -H "Cookie: admin_session=<token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Queue counter reset successfully",
  "data": {
    "queue_counter": 0,
    "next_queue": "Q001"
  }
}
```

**Unauthorized Response:**
```json
{
  "success": false,
  "error": "Unauthorized. Admin access required."
}
```

## Queue Utilities

Located in `lib/queue/utils.ts`:

### formatQueueNumber(number, prefix)
Format queue number with prefix.

```typescript
formatQueueNumber(1, 'Q') // => 'Q001'
formatQueueNumber(42, 'Q') // => 'Q042'
```

### parseQueueNumber(queueStr)
Parse queue string to get number.

```typescript
parseQueueNumber('Q001') // => 1
parseQueueNumber('Q042') // => 42
```

### generateQueueHash(orderId)
Generate HMAC-SHA256 hash for order ID.

```typescript
generateQueueHash('order-123') // => 'abc12345'
```

### verifyQueueHash(orderId, hash)
Verify hash is valid for order ID.

```typescript
verifyQueueHash('order-123', 'abc12345') // => true
verifyQueueHash('order-123', 'invalid') // => false
```

### generateQueueUrl(queueNumber, orderId, baseUrl)
Generate complete queue URL.

```typescript
generateQueueUrl(11, 'order-123', 'http://localhost:3000')
// Returns:
// {
//   path: '/queue/Q011-abc12345',
//   url: 'http://localhost:3000/queue/Q011-abc12345',
//   hash: 'abc12345'
// }
```

### parseQueueUrl(urlPart)
Parse queue URL to extract components.

```typescript
parseQueueUrl('Q011-abc12345')
// Returns:
// {
//   queueNumber: 11,
//   queueStr: 'Q011',
//   hash: 'abc12345'
// }
```

### validateQueueUrl(urlPart, orderId)
Validate queue URL format and hash.

```typescript
await validateQueueUrl('Q011-abc12345', 'order-123')
// Returns: { valid: true }

await validateQueueUrl('Q011-invalid', 'order-123')
// Returns: { valid: false, error: 'Invalid queue URL hash' }
```

## Environment Variables

Add to `.env.local`:

```env
QUEUE_SECRET=your-secure-random-secret-key
```

For production, use a strong random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Security Features

1. **HMAC Hash**: Prevents URL guessing
2. **Hash Validation**: Verifies on every request
3. **Admin Protection**: Reset counter requires authentication
4. **Short Hash**: 8 characters (sufficient for uniqueness)

## Usage Flow

### Customer Side

1. Customer places order
2. System calls `POST /api/orders/create-queue`
3. System generates queue number (Q001, Q002...)
4. System generates secure hash
5. Customer receives URL: `/queue/Q011-abc12345`
6. Customer can track order status via URL

### Admin Side

1. View all active queues
2. Update queue status via dashboard
3. Call `PATCH /api/queue/Q011-abc12345` with new status
4. Customer's tracking page updates automatically
5. Reset counter at end of day if needed

## Testing Results

All API endpoints tested and working:

✅ **Create Queue**: Queue number generation, hash creation, URL generation
✅ **Get Queue**: URL parsing, hash validation, order retrieval
✅ **Update Status**: Status validation, hash verification
✅ **Reset Counter**: Admin authentication, counter reset
✅ **Security**: Invalid hash rejection, unauthorized access prevention

## Files Created

```
lib/queue/
└── utils.ts              # Queue utilities and hash generation

app/api/orders/
└── create-queue/
    └── route.ts          # POST /api/orders/create-queue

app/api/queue/
├── [queueId]/
│   └── route.ts          # GET, PATCH /api/queue/[queueId]
└── reset-counter/
    └── route.ts          # POST /api/queue/reset-counter

.env.local                # Added QUEUE_SECRET
.env.example              # Added QUEUE_SECRET example
```

## Integration with Frontend

Frontend teams can now integrate:

### Customer Queue Ticket (Task #25)
```typescript
// Create order and get queue URL
const response = await fetch('/api/orders/create-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData),
});

const { data } = await response.json();
// Show QR code with data.url
// Display queue number: data.queueString
```

### Queue Tracking Page
```typescript
// Get queue status
const response = await fetch(`/api/queue/${queueId}`);
const { data } = await response.json();
// Display: data.status, data.items, etc.

// Poll for updates
setInterval(async () => {
  const response = await fetch(`/api/queue/${queueId}`);
  const { data } = await response.json();
  updateUI(data.status);
}, 5000); // Poll every 5 seconds
```

### Admin Queue Management (Task #26)
```typescript
// Update queue status
await fetch(`/api/queue/${queueId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'ready' }),
});
```

### Queue Display Screen (Task #27)
```typescript
// Get all active queues
const orders = await api.queue.getActiveQueue();
// Filter by status and display
```

## Status

Task #24 (Queue System Backend) - COMPLETED ✅

All queue APIs implemented, tested, and documented.
Ready for frontend integration.
