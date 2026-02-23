# Admin Authentication System

Simple password-based authentication for admin dashboard.

## Features

- Password-based authentication
- JWT session tokens (7-day expiry)
- HTTP-only cookies
- Session verification middleware

## Setup

### 1. Generate Password Hash

For development (uses default password "admin123"):
```bash
# Leave ADMIN_PASSWORD_HASH empty in .env.local
```

For production:
```bash
# Generate hash
node scripts/generate-password-hash.js yourpassword

# Add to .env.local
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=your-secret-key
```

### 2. Environment Variables

Required in `.env.local`:

```env
ADMIN_PASSWORD_HASH=  # Leave empty for dev (uses "admin123")
JWT_SECRET=your-jwt-secret-key
```

## API Routes

### POST /api/auth/login
Login with password.

**Request:**
```json
{
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

Sets `admin_session` cookie with JWT token.

### POST /api/auth/logout
Logout and clear session.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/auth/session
Check current session.

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "session": {
    "userId": "admin",
    "role": "admin"
  }
}
```

## Usage in Components

```typescript
import { useAuth } from '@/lib/hooks/use-auth';

export function LoginForm() {
  const { login, loading } = useAuth();

  const handleLogin = async (password: string) => {
    const result = await login(password);
    if (result.success) {
      // Redirect to admin dashboard
    }
  };

  return (
    // ... form UI
  );
}
```

## Protecting Admin Routes

### Option 1: Client-side (useAuth hook)

```typescript
'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/admin/login');
    }
  }, [session, loading]);

  if (loading) return <div>Loading...</div>;
  if (!session) return null;

  return <div>Admin Dashboard</div>;
}
```

### Option 2: Server-side (middleware)

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function middleware(request: NextRequest) {
  // Protect /admin/* routes (except /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const authResponse = await requireAuth(request);
    if (authResponse) {
      return authResponse; // Redirect to login
    }
  }
}

export const config = {
  matcher: '/admin/:path*',
};
```

## Security Notes

- JWT tokens expire after 7 days
- Cookies are HTTP-only (not accessible via JavaScript)
- Cookies use secure flag in production
- Password hashing uses bcrypt with 10 salt rounds
- Single admin password (no user management)

## Development

Default development password: `admin123`

To change:
1. Generate hash: `node scripts/generate-password-hash.js newpassword`
2. Set `ADMIN_PASSWORD_HASH` in `.env.local`
