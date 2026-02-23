# Mock API Layer

This directory contains the mock API layer for the QR Food Ordering System. It's designed to work seamlessly with mock data while maintaining the same interface as the real Supabase API.

## Overview

The mock API provides all necessary functions to simulate database operations with realistic delays to mimic network latency.

## Usage

### Import the API

```typescript
import { api } from '@/lib/mock-api';
```

### Settings

```typescript
// Get settings
const settings = await api.settings.get();

// Update settings
const updated = await api.settings.update({
  restaurant_name: 'New Name',
  primary_color: '#FF0000'
});
```

### Categories

```typescript
// Get all categories
const categories = await api.categories.getAll();

// Get single category
const category = await api.categories.getById('cat-1');

// Create category
const newCat = await api.categories.create({
  name: 'New Category',
  description: 'Description',
  display_order: 11,
  is_active: true
});

// Update category
const updated = await api.categories.update('cat-1', {
  name: 'Updated Name'
});

// Delete category
await api.categories.delete('cat-1');
```

### Menu Items

```typescript
// Get all menu items
const items = await api.menuItems.getAll();

// Get single item
const item = await api.menuItems.getById('item-1');

// Get items by category
const categoryItems = await api.menuItems.getByCategoryId('cat-1');

// Create item
const newItem = await api.menuItems.create({
  name: 'New Dish',
  description: 'Delicious dish',
  price: 100,
  category_id: 'cat-1',
  image_url: '/menu/dish.jpg',
  is_available: true,
  preparation_time: 15,
  display_order: 1
});

// Update item
const updated = await api.menuItems.update('item-1', {
  price: 120
});

// Delete item
await api.menuItems.delete('item-1');
```

### Promotions

```typescript
// Get all promotions
const promos = await api.promotions.getAll();

// Get active promotions
const activePromos = await api.promotions.getActive();

// Get single promotion
const promo = await api.promotions.getById('promo-1');

// Create promotion
const newPromo = await api.promotions.create({
  name: '10% Discount',
  description: 'Save 10%',
  discount_type: 'percentage',
  discount_value: 10,
  start_date: '2025-02-01T00:00:00Z',
  end_date: '2025-03-31T23:59:59Z',
  is_active: true
});

// Update promotion
const updated = await api.promotions.update('promo-1', {
  is_active: false
});

// Delete promotion
await api.promotions.delete('promo-1');
```

### Tables

```typescript
// Get all tables
const tables = await api.tables.getAll();

// Get single table
const table = await api.tables.getById('table-1');

// Get table by number
const table = await api.tables.getByTableNumber('A1');

// Create table
const newTable = await api.tables.create({
  table_number: 'C1',
  qr_code: '/qr/table-c1.png',
  is_active: true
});

// Update table
const updated = await api.tables.update('table-1', {
  is_active: false
});

// Delete table
await api.tables.delete('table-1');
```

### Orders

```typescript
// Get all orders
const orders = await api.orders.getAll();

// Get single order
const order = await api.orders.getById('order-1');

// Get orders by status
const pending = await api.orders.getByStatus('pending');

// Get orders by table
const tableOrders = await api.orders.getByTableId('table-1');

// Get orders by table number
const tableOrders = await api.orders.getByTableNumber('A1');

// Create order
const newOrder = await api.orders.create({
  table_number: 'A1',
  table_id: 'table-1',
  status: 'pending',
  items: [
    {
      id: 'item-order-1',
      order_id: 'order-new',
      menu_item_id: 'item-1',
      menu_item_name: 'Fried Rice',
      quantity: 2,
      price: 60,
      notes: 'No spice'
    }
  ],
  total_amount: 120,
  notes: 'Special request',
  mode: 'restaurant'
});

// Update order status
const updated = await api.orders.updateStatus('order-1', 'preparing');

// Update order
const updated = await api.orders.update('order-1', {
  total_amount: 150,
  notes: 'New notes'
});

// Delete order
await api.orders.delete('order-1');
```

### Queue Management

```typescript
// Get next queue number
const queueNum = await api.queue.getNextQueueNumber();

// Get order by queue number
const order = await api.queue.getQueueByNumber(5);

// Get all queued orders
const allQueue = await api.queue.getAllQueue();

// Get active queue orders
const activeQueue = await api.queue.getActiveQueue();
```

## Features

- **Async/Promise-based**: All methods return Promises for consistency
- **Realistic Delays**: Simulates network latency (50-200ms)
- **In-memory Storage**: Data persists during the session
- **CRUD Operations**: Full Create, Read, Update, Delete support
- **Type-safe**: Full TypeScript support with type inference

## Migration to Real API

When Supabase is ready, swap the import:

```typescript
// Change from:
import { api } from '@/lib/mock-api';

// To:
import { api } from '@/lib/supabase/client';
```

The interface remains the same, so minimal code changes are required.

## File Structure

```
lib/
├── mock-api/
│   ├── index.ts       (Main API implementation)
│   └── README.md      (This file)
├── mock-data/
│   ├── settings.ts    (Default settings)
│   ├── categories.ts  (10-15 sample categories)
│   ├── menu-items.ts  (30+ sample menu items)
│   ├── promotions.ts  (5 sample promotions)
│   ├── tables.ts      (10 sample tables)
│   ├── orders.ts      (10 sample orders)
│   └── index.ts       (Exports all mock data)
└── types.ts           (TypeScript type definitions)
```
