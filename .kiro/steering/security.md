---
inclusion: fileMatch
fileMatchPattern: '**/*.actions.ts'
---
# Security Guidelines

## Philosophy

Security is non-negotiable. Use JWT sessions for performance, hash all passwords with bcrypt, validate all inputs with Zod, and verify user permissions on every mutation. Never trust client data. Use HTTPS, implement rate limiting, and monitor for suspicious activity. Defense in depth—multiple layers of security.

## Security Checklist

**Authentication & Authorization:**
- [ ] NextAuth.js configured with JWT sessions
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] User verification in database for payments
- [ ] Role-based access control (RBAC) implemented
- [ ] Resource ownership verified before mutations
- [ ] Protected routes with middleware

**Input Validation:**
- [ ] Zod schemas for all Server Actions
- [ ] Input sanitization for HTML content
- [ ] File upload validation (size, type, content)
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)

**API Security:**
- [ ] CSRF protection (built-in with Server Actions)
- [ ] Rate limiting on public endpoints
- [ ] Webhook signature verification (Stripe, Resend)
- [ ] CORS policies configured
- [ ] Security headers configured

**Data Protection:**
- [ ] Environment variables secured
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced in production
- [ ] Database credentials secured
- [ ] API keys never in code

**Monitoring:**
- [ ] Security event logging
- [ ] Failed login attempt monitoring
- [ ] Rate limit violation alerts
- [ ] Unusual access pattern detection

## Authentication

### Authentication Provider
- Use NextAuth.js (Auth.js) for authentication
- Support multiple providers: Email, Google, GitHub
- Use JWT sessions for better performance and scalability

### Password Hashing

**CRITICAL: Never store plain text passwords.**

NextAuth with Credentials provider handles password hashing automatically, but if implementing custom authentication:

```typescript
// lib/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
```

**Usage in authentication:**

```typescript
// Server Action for registration
'use server'

import { hashPassword } from '@/lib/password';
import { db } from '@/lib/db';

export async function registerUser(email: string, password: string) {
  // Validate password strength
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
  
  // Hash password before storing
  const hashedPassword = await hashPassword(password);
  
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword, // Never store plain text
    }
  });
  
  return user;
}
```

**NextAuth Credentials Provider with password hashing:**

```typescript
// lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/password';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        // Verify hashed password
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }),
    // OAuth providers don't need password hashing
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // ... rest of config
};
```

**Password Security Rules:**
- Always hash passwords with bcrypt (12+ rounds)
- Never log passwords (even in development)
- Never send passwords in API responses
- Never include passwords in error messages
- Use HTTPS in production (passwords encrypted in transit)
- Implement password strength requirements (min 8 chars, complexity)
- Consider rate limiting login attempts to prevent brute force

**Password Reset Flow:**

```typescript
'use server'

import { randomBytes } from 'crypto';
import { hashPassword } from '@/lib/password';

export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  
  if (!user) {
    // Don't reveal if email exists
    return { success: true };
  }
  
  // Generate secure reset token
  const resetToken = randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  
  await db.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    }
  });
  
  // Send email with reset link
  // await sendPasswordResetEmail(email, resetToken);
  
  return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await db.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    }
  });
  
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }
  
  // Hash new password
  const hashedPassword = await hashPassword(newPassword);
  
  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    }
  });
  
  return { success: true };
}
```

### Session Management

**Use JWT sessions for this marketplace application.**

JWT sessions are appropriate for dropr because:
- Marketplace doesn't store highly sensitive data (not banking/healthcare)
- Performance matters for real-time drops and countdowns
- Users can manually logout if needed
- Payment data is handled by Stripe (not stored locally)
- Scales better for high-traffic drop events

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Handle session updates (e.g., profile changes)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    // Configure providers
  ],
};
```

**When to consider database sessions:**
- If you need "logout all devices" functionality
- If you need to ban users and revoke access immediately
- If you're storing sensitive financial or health data

For a marketplace with Stripe handling payments, JWT is the right choice.

### Protected Routes

Use Next.js middleware to protect routes and redirect unauthorized users to login with a callback URL:

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Additional logic can go here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/curator/:path*',
    '/profile/:path*',
    '/orders/:path*',
    // Add other protected routes
  ],
};
```

**Redirect with Callback URL:**

NextAuth automatically adds a `callbackUrl` parameter when redirecting to login. After successful authentication, the user is redirected back to their original destination.

```typescript
// app/login/page.tsx
'use client'

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const handleLogin = async (provider: string) => {
    await signIn(provider, { callbackUrl });
  };
  
  return (
    <div>
      <button onClick={() => handleLogin('google')}>
        Sign in with Google
      </button>
      <button onClick={() => handleLogin('github')}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

**Server-Side Protection:**

For Server Actions and API routes, use `requireAuth()` helper:

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }
  
  return session;
}

// For page-level protection with redirect
export async function requireAuthWithRedirect(callbackUrl: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  return session;
}
```

**Usage in Server Components:**

```typescript
// app/curator/dashboard/page.tsx
import { requireAuthWithRedirect } from '@/lib/auth';

export default async function CuratorDashboard() {
  const session = await requireAuthWithRedirect('/curator/dashboard');
  
  return <div>Welcome, {session.user.name}</div>;
}
```

## Authorization

### Role-Based Access Control (RBAC)
```prisma
model User {
  id    String   @id @default(cuid())
  email String   @unique
  role  UserRole @default(BUYER)
}

enum UserRole {
  BUYER
  CURATOR
  ADMIN
}
```

### Permission Checks
```typescript
'use server'

export async function updateDrop(dropId: string, data: UpdateDropInput) {
  const session = await requireAuth();
  
  // Check if user is a curator
  if (session.user.role !== 'CURATOR') {
    throw new ForbiddenError('Only curators can update drops');
  }
  
  // Check ownership
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    select: { curatorId: true }
  });
  
  if (drop?.curatorId !== session.user.id) {
    throw new ForbiddenError('You can only update your own drops');
  }
  
  return await db.drop.update({
    where: { id: dropId },
    data,
  });
}
```

### Resource Ownership
- Always verify resource ownership before mutations
- Use database queries to check ownership, not client-provided data
- Implement at the Server Action level

## Input Validation

### Use Zod for Validation
```typescript
import { z } from 'zod';

const createDropSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(10000),
  inventory: z.number().int().nonnegative().max(1000),
  startTime: z.date().min(new Date()),
});

export async function createDrop(input: unknown) {
  const session = await requireAuth();
  
  // Validate input
  const data = createDropSchema.parse(input);
  
  // Additional business logic validation
  if (data.startTime < new Date()) {
    throw new ValidationError('Start time must be in the future');
  }
  
  return await db.drop.create({
    data: {
      ...data,
      curatorId: session.user.id,
    }
  });
}
```

### Sanitize User Input
- Never trust client input
- Validate all data before database operations
- Sanitize HTML content if allowing rich text
- Use DOMPurify for HTML sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedDescription = DOMPurify.sanitize(userInput);
```

## CSRF Protection

### Next.js Built-in Protection
- Next.js Server Actions have built-in CSRF protection
- No additional configuration needed for Server Actions
- For API routes, use CSRF tokens

### API Routes CSRF
```typescript
// For traditional API routes (if used)
import { getCsrfToken } from 'next-auth/react';

// Client-side
const csrfToken = await getCsrfToken();
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

## Environment Variables

### Secure Storage
```env
# .env.local (never commit)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Public variables (safe to expose)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Access Pattern
```typescript
// Server-side only
const secret = process.env.NEXTAUTH_SECRET;

// Client-side (must be prefixed with NEXT_PUBLIC_)
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

### Validation
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

## Rate Limiting

### Implement Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

// Usage in Server Action
export async function createDrop(input: unknown) {
  const session = await requireAuth();
  
  const { success } = await ratelimit.limit(session.user.id);
  if (!success) {
    throw new RateLimitError('Too many requests');
  }
  
  // Continue with action
}
```

### Rate Limit by IP for Public Endpoints
```typescript
import { headers } from 'next/headers';

const ip = headers().get('x-forwarded-for') ?? 'unknown';
const { success } = await ratelimit.limit(ip);
```

## Data Encryption

### Sensitive Data at Rest
```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Use for Sensitive Fields
```typescript
// Store encrypted payment info, API keys, etc.
const encryptedApiKey = encrypt(apiKey);
await db.curator.update({
  where: { id: curatorId },
  data: { encryptedApiKey }
});
```

## XSS Prevention

### React's Built-in Protection
- React escapes content by default
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- If using, sanitize with DOMPurify

```typescript
// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.stripe.com;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Payment Security

### Use Stripe for Payments
- Never store credit card numbers
- Use Stripe Elements for card input
- Process payments server-side only
- Verify webhook signatures

```typescript
'use server'

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(amount: number) {
  const session = await requireAuth();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    metadata: {
      userId: session.user.id,
    },
  });
  
  return { clientSecret: paymentIntent.client_secret };
}
```

### Webhook Verification
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  
  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Process successful payment
      break;
  }
  
  return new Response(JSON.stringify({ received: true }));
}
```

## Logging and Monitoring

### Log Security Events
```typescript
// lib/logger.ts
export function logSecurityEvent(event: string, details: Record<string, any>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'security',
    event,
    ...details,
  }));
}

// Usage
logSecurityEvent('unauthorized_access_attempt', {
  userId: session?.user.id,
  resource: 'drop',
  resourceId: dropId,
});
```

### Monitor for Suspicious Activity
- Failed login attempts
- Unusual access patterns
- Rate limit violations
- Authorization failures

## Error Handling

### Don't Leak Information
```typescript
// ❌ Bad: Exposes internal details
catch (error) {
  throw new Error(`Database error: ${error.message}`);
}

// ✅ Good: Generic message to client
catch (error) {
  console.error('Database error:', error);
  throw new Error('An error occurred while processing your request');
}
```

### Custom Error Classes
```typescript
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Security Checklist

Before deploying:
- [ ] All environment variables are set and validated
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] Rate limiting is implemented on public endpoints
- [ ] All user inputs are validated with Zod
- [ ] Authorization checks are in place for all mutations
- [ ] CSRF protection is enabled
- [ ] Content Security Policy headers are configured
- [ ] Sensitive data is encrypted at rest
- [ ] Payment webhooks verify signatures
- [ ] Error messages don't leak sensitive information
- [ ] Security logging is implemented
- [ ] Dependencies are up to date (npm audit)
