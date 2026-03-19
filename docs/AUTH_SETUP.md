# Authentication Setup Guide

This project uses NextAuth.js v5 (beta) with Prisma for authentication and user management.

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 3. Database Schema

The authentication system includes:

- **User**: Core user account with email, password, role, and verification status
- **Profile**: User profile information (display name, bio, photo, etc.)
- **Account**: OAuth account linking (for future OAuth providers)
- **Session**: User sessions
- **VerificationToken**: Email verification and password reset tokens

### 4. User Roles

- **member**: Default role for buyers
- **maker**: Users who can create and sell products
- **admin**: Platform administrators
- **isArbitrator**: Boolean flag for admins who handle disputes

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/logout` - Logout current user

- `GET /api/auth/me` - Get current user info

### Email Verification

- `POST /api/auth/verify-email` - Verify email with token
  ```json
  {
    "token": "verification-token"
  }
  ```

### Password Reset

- `POST /api/auth/forgot-password` - Request password reset
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `POST /api/auth/reset-password` - Reset password with token
  ```json
  {
    "token": "reset-token",
    "password": "newpassword123"
  }
  ```

## Usage in Components

### Server Components

```typescript
import { auth } from '@/auth'
import { getCurrentUser } from '@/lib/auth-utils'

export default async function Page() {
  const session = await auth()
  const user = await getCurrentUser()
  
  if (!session) {
    return <div>Not authenticated</div>
  }
  
  return <div>Welcome {user?.profile?.displayName}</div>
}
```

### API Routes

```typescript
import { requireAuth, requireAdmin } from '@/lib/auth-utils'

export async function GET() {
  try {
    const user = await requireAuth()
    // User is authenticated
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### Client Components

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function UserProfile() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  return <div>Welcome {session.user.email}</div>
}
```

## Protected Routes

The middleware in `middleware.ts` automatically protects routes. Public routes are:

- `/` - Home page
- `/auth/*` - All auth pages
- `/api/auth/*` - All auth API endpoints

All other routes require authentication.

## Role-Based Access Control

Use the helper functions in `lib/auth-utils.ts`:

```typescript
import { isAdmin, isMaker, requireMaker } from '@/lib/auth-utils'

// Check role
if (await isAdmin()) {
  // Admin-only logic
}

// Require role (throws if not authorized)
await requireMaker()
```

## TODO

- [ ] Implement email sending for verification and password reset
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Add rate limiting for auth endpoints
- [ ] Implement account lockout after failed login attempts
- [ ] Add audit logging for security events
