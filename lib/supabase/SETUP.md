# Supabase Setup & Integration Guide

## Overview

This guide covers the Supabase setup and migration from mock data to real database.

## Files Structure

```
lib/supabase/
├── client.ts                 (Supabase client - anon key)
├── server.ts                 (Supabase server - service role key)
├── realtime.ts              (Real-time subscriptions)
├── seed.ts                  (Seed script for mock data)
├── api/
│   └── index.ts            (Supabase API wrapper - same interface as mock API)
├── migrations/
│   └── 001_initial_schema.sql (Database schema)
└── SETUP.md                 (This file)
```

## Setup Steps

### 1. Credentials Setup

Credentials are already saved in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://arfyenoaahizwpyimtqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_v30RkeMtW4kzvF7VOw0iog...
```

### 2. Create Database Schema

1. Go to Supabase Dashboard: https://app.supabase.com
2. Navigate to SQL Editor
3. Create new query and paste contents from `migrations/001_initial_schema.sql`
4. Execute the query

This creates all necessary tables with proper indexes and RLS policies.

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 4. Seed Mock Data

Run the seed script to populate Supabase with mock data:

```bash
npx ts-node lib/supabase/seed.ts
```

This will insert:
- 1 Settings record
- 13 Categories
- 50 Menu Items
- 5 Promotions
- 10 Tables
- 10 Orders with order items

### 5. Verify Connection

Test the connection by running:

```bash
npm run dev
```

Then navigate to `/admin` and check if data loads from Supabase.

## API Usage

### Switching from Mock API to Supabase

Before:
```typescript
import { api } from '@/lib/mock-api';
```

After:
```typescript
import { supabaseAPI as api } from '@/lib/supabase/api';
```

That's it! The interface is identical, so no other code changes needed.

### Common Operations

```typescript
import { supabaseAPI as api } from '@/lib/supabase/api';

// Get all categories
const categories = await api.categories.getAll();

// Get category by ID
const category = await api.categories.getById('cat-id');

// Create new category
const newCat = await api.categories.create({
  name: 'New Category',
  description: 'Description',
  display_order: 1,
  is_active: true
});

// Update category
const updated = await api.categories.update('cat-id', {
  name: 'Updated Name'
});

// Delete category
await api.categories.delete('cat-id');
```

## Real-time Subscriptions

Subscribe to real-time updates:

```typescript
import { subscribeToOrders } from '@/lib/supabase/realtime';

// Subscribe to order changes
const channel = subscribeToOrders((payload) => {
  console.log('Order updated:', payload);
});

// Unsubscribe
await channel.unsubscribe();
```

Available subscriptions:
- `subscribeToOrders()` - Order updates
- `subscribeToOrderItems()` - Order item updates
- `subscribeToMenuItems()` - Menu item updates
- `subscribeToQueue()` - Queue updates (market mode)
- `subscribeToSettings()` - Settings updates

## Authentication

### Admin Authentication

Supabase provides built-in authentication. For admin authentication:

1. Create admin users in Supabase Dashboard
2. Use Supabase Auth for login
3. RLS policies restrict access based on user roles

### Row Level Security (RLS)

Current RLS setup:
- **Public access**: Read-only for active categories, menu items, promotions
- **Admin access**: Full CRUD via service role key
- **Customer access**: Can view orders via public policies

## Troubleshooting

### "Table does not exist" Error

Make sure you ran the SQL schema migration in Supabase Dashboard.

### "Permission denied" Error

Check if RLS policies are enabled. The service role key should bypass RLS for admin operations.

### Real-time not working

1. Enable real-time in Supabase: Settings → Database → Replication
2. Make sure tables have replication enabled

## Performance Considerations

1. **Indexes**: Already created for common queries
2. **Pagination**: Use `.limit()` and `.offset()` for large datasets
3. **Caching**: Consider caching frequently accessed data

## Backup & Migration

To backup data:

```sql
-- Export data
SELECT * FROM categories;
SELECT * FROM menu_items;
-- ... etc
```

To restore:

1. Delete existing data
2. Run seed script again
3. Or manually insert backup data

## Next Steps

1. ✅ Schema created
2. ✅ Seed data inserted
3. ✅ API wrapper ready
4. ✅ Real-time subscriptions ready

Start using Supabase in your components!

## Support

For issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review RLS policies in Supabase Dashboard
3. Check browser console for errors
4. Review Supabase logs in Dashboard
