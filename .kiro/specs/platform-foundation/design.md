# Platform Foundation - Design

## 1. Architecture Overview

The platform foundation provides the core infrastructure for Dropr, a curated marketplace serving three distinct hobby collectives through subdomain-based routing. The architecture follows Next.js 15+ best practices with MVVM pattern, Server Actions, and collective-specific theming.

### 1.1 Technology Stack

**Frontend:**
- Next.js 15+ (App Router)
- React 19+ (Server Components, useActionState, useOptimistic)
- TypeScript (strict mode)
- Tailwind CSS v4 (configured in app/globals.css)
- shadcn/ui with Base UI primitives

**Backend:**
- Next.js API Routes (App Router route handlers)
- Server Actions for mutations
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication (JWT sessions)

**Infrastructure:**
- Vercel for hosting and deployment
- Vercel Postgres for database
- Upstash Redis for rate limiting and BullMQ
- Vercel Blob for image storage

**External Services:**
- Stripe (payments with Connect for escrow)
- Resend (transactional emails)
- Twilio (SMS notifications)
- Sentry (error monitoring)
- Vercel Analytics (performance monitoring)

### 1.2 Architecture Principles

1. **Single Deployment, Multiple Collectives**: One codebase serves all subdomains
2. **Middleware-Based Routing**: Subdomain detection adds x-collective header
3. **MVVM Pattern**: Scoped Zustand stores with Context Providers
4. **Server Actions**: All mutations use Server Actions (not API routes)
5. **Type Safety**: TypeScript strict mode throughout
6. **Collective Theming**: Dynamic CSS custom properties per collective


## 2. Database Schema (Prisma)

### 2.1 Core Models

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // Hashed with bcrypt
  
  role          UserRole  @default(BUYER)
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  buyer         Buyer?
  curator       Curator?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

enum UserRole {
  BUYER
  CURATOR
  ADMIN
}


// ============================================================================
// BUYER & CURATOR PROFILES
// ============================================================================

model Buyer {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  phone                 String?
  
  // Preferences
  preferredCollectives  Collective[]
  
  // Notifications
  emailNotifications    Boolean  @default(true)
  smsNotifications      Boolean  @default(false)
  pushNotifications     Boolean  @default(false)
  notifyFollowedCurators Boolean @default(true)
  notifyEndingSoon      Boolean  @default(true)
  notifyNewDrops        Boolean  @default(true)
  
  // Saved Info
  defaultShippingAddress Json?
  stripeCustomerId      String?  @unique
  
  orders                Order[]
  reviews               Review[]
  curatorFollows        CuratorFollow[]
  dropFollows           DropFollow[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([userId])
}

model Curator {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  businessName      String
  slug              String   @unique
  bio               String?  @db.Text
  avatarUrl         String?
  
  // Reputation
  reputationScore   Decimal  @db.Decimal(3, 2) @default(0)
  totalDrops        Int      @default(0)
  completedDrops    Int      @default(0)
  averageRating     Decimal? @db.Decimal(3, 2)
  
  // Stripe Connect
  stripeAccountId   String?  @unique
  stripeOnboarded   Boolean  @default(false)
  
  drops             Drop[]
  reviews           Review[]
  followers         CuratorFollow[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([slug])
  @@index([reputationScore])
}

model CuratorFollow {
  id          String   @id @default(cuid())
  buyerId     String
  buyer       Buyer    @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  curatorId   String
  curator     Curator  @relation(fields: [curatorId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([buyerId, curatorId])
  @@index([buyerId])
  @@index([curatorId])
}


// ============================================================================
// DROPS
// ============================================================================

model Drop {
  id                String   @id @default(cuid())
  curatorId         String
  curator           Curator  @relation(fields: [curatorId], references: [id])
  
  title             String
  slug              String   @unique
  description       String   @db.Text
  theme             String?
  
  // Categorization
  type              DropType
  collective        Collective
  category          String
  tags              String[]
  
  // Pricing & Inventory
  price             Decimal  @db.Decimal(10, 2)
  minValue          Decimal? @db.Decimal(10, 2) // For mystery boxes
  inventory         Int
  sold              Int      @default(0)
  reserved          Int      @default(0) // Items in carts
  
  // Media
  coverImage        String
  heroImageUrl      String?
  videoUrl          String?
  images            Json?    // Array of additional image URLs
  
  // Status & Timing
  status            DropStatus @default(DRAFT)
  startTime         DateTime?
  duration          Int?     // Hours
  endTime           DateTime?
  estimatedShipDate DateTime?
  
  // Policies
  shippingPolicy    String?  @db.Text
  shippingConfig    Json?
  
  // Analytics
  views             Int      @default(0)
  saves             Int      @default(0)
  shares            Int      @default(0)
  
  // Metadata
  isFeatured        Boolean  @default(false)
  featuredAt        DateTime?
  moderationStatus  ModerationStatus @default(APPROVED)
  
  orders            Order[]
  reviews           Review[]
  follows           DropFollow[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([collective, status, startTime])
  @@index([curatorId])
  @@index([isFeatured])
  @@index([slug])
  @@index([status])
  @@index([category])
}

model DropFollow {
  id        String   @id @default(cuid())
  buyerId   String
  buyer     Buyer    @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  dropId    String
  drop      Drop     @relation(fields: [dropId], references: [id], onDelete: Cascade)
  
  notifyOnLive Boolean @default(true)
  
  createdAt DateTime @default(now())
  
  @@unique([buyerId, dropId])
  @@index([buyerId])
  @@index([dropId])
}

enum DropType {
  MYSTERY_BOX
  SURPLUS
  LIMITED_EDITION
}

enum DropStatus {
  DRAFT
  SCHEDULED
  LIVE
  SOLD_OUT
  ENDED
  ARCHIVED
  CANCELLED
}

enum Collective {
  MOD
  MAKE
  MINI
}


// ============================================================================
// ORDERS
// ============================================================================

model Order {
  id                String      @id @default(cuid())
  buyerId           String
  buyer             Buyer       @relation(fields: [buyerId], references: [id])
  dropId            String
  drop              Drop        @relation(fields: [dropId], references: [id])
  
  // Payment
  status            OrderStatus
  paymentIntentId   String      @unique
  amount            Decimal     @db.Decimal(10, 2)
  platformFee       Decimal     @db.Decimal(10, 2) // 20% of amount
  curatorPayout     Decimal     @db.Decimal(10, 2) // 80% of amount
  
  // Shipping
  shippingAddress   Json
  trackingNumber    String?
  trackingUrl       String?
  carrier           String?
  
  // Lifecycle
  paidAt            DateTime?
  closedAt          DateTime?
  packedAt          DateTime?
  shippedAt         DateTime?
  deliveredAt       DateTime?
  revealedAt        DateTime?
  escrowReleasedAt  DateTime?
  
  review            Review?
  dispute           Dispute?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([buyerId, status])
  @@index([dropId])
  @@index([status, updatedAt])
}

enum OrderStatus {
  PENDING
  PAID
  CLOSED
  PACKING
  SHIPPED
  DELIVERED
  REVEALED
  CANCELLED
  DISPUTED
}

// ============================================================================
// REVIEWS & DISPUTES
// ============================================================================

model Review {
  id                String           @id @default(cuid())
  orderId           String           @unique
  order             Order            @relation(fields: [orderId], references: [id])
  buyerId           String
  buyer             Buyer            @relation(fields: [buyerId], references: [id])
  dropId            String
  drop              Drop             @relation(fields: [dropId], references: [id])
  curatorId         String
  curator           Curator          @relation(fields: [curatorId], references: [id])
  
  // Ratings
  overallRating     Int              // 1-5
  valueRating       Int              // 1-5
  qualityRating     Int              // 1-5
  curationRating    Int              // 1-5
  
  // Content
  comment           String?          @db.Text
  photos            String[]
  
  // Moderation
  isPublic          Boolean          @default(true)
  moderationStatus  ModerationStatus @default(PENDING)
  moderatedAt       DateTime?
  moderatedBy       String?
  
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  
  @@index([dropId, moderationStatus])
  @@index([curatorId, moderationStatus])
  @@index([buyerId])
}

model Dispute {
  id          String        @id @default(cuid())
  orderId     String        @unique
  order       Order         @relation(fields: [orderId], references: [id])
  
  reason      String
  description String        @db.Text
  evidence    String[]      // URLs to uploaded evidence
  
  status      DisputeStatus @default(OPEN)
  resolution  String?       @db.Text
  resolvedAt  DateTime?
  resolvedBy  String?
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@index([status])
}

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum DisputeStatus {
  OPEN
  INVESTIGATING
  RESOLVED
  CLOSED
}
```

### 2.2 Database Indexes

Critical indexes for performance:
- `User.email` - Login lookups
- `Curator.slug` - Curator profile pages
- `Drop.collective, status, startTime` - Drop browsing by collective
- `Drop.slug` - Drop detail pages
- `Order.buyerId, status` - Buyer order history
- `Order.status, updatedAt` - Order processing queues


## 3. Subdomain Architecture & Middleware

### 3.1 Middleware Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  
  // ============================================================================
  // SUBDOMAIN DETECTION & COLLECTIVE ROUTING
  // ============================================================================
  
  const subdomain = host.split('.')[0];
  const collectiveMap: Record<string, string> = {
    'make': 'MAKE',
    'mod': 'MOD',
    'mini': 'MINI',
    'www': 'MOD', // Default to MOD for www
  };
  
  const collective = collectiveMap[subdomain] || 'MOD'; // Default to MOD
  const response = NextResponse.next();
  
  // Add collective header for all requests
  response.headers.set('x-collective', collective);
  
  // ============================================================================
  // AUTHENTICATION PROTECTION
  // ============================================================================
  
  // Protected routes require authentication
  const protectedRoutes = ['/orders', '/settings', '/curator'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Role-based access control
    if (pathname.startsWith('/curator') && token.role !== 'CURATOR' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // ============================================================================
  // RATE LIMITING
  // ============================================================================
  
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip, pathname);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter.toString() } }
      );
    }
  }
  
  // ============================================================================
  // BOT PROTECTION FOR CHECKOUT
  // ============================================================================
  
  if (pathname.startsWith('/checkout')) {
    // Add bot detection logic here (Cloudflare Turnstile, etc.)
    // For now, just pass through
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// ============================================================================
// RATE LIMITING HELPER
// ============================================================================

async function checkRateLimit(ip: string, pathname: string): Promise<{ success: boolean; retryAfter: number }> {
  // Implement rate limiting with Upstash Redis
  // Different limits for different endpoints
  const limits: Record<string, { requests: number; window: number }> = {
    '/api/auth': { requests: 5, window: 60 }, // 5 requests per minute
    '/api/orders': { requests: 10, window: 60 }, // 10 requests per minute
    'default': { requests: 100, window: 60 }, // 100 requests per minute
  };
  
  const limit = Object.keys(limits).find(key => pathname.startsWith(key)) || 'default';
  const { requests, window } = limits[limit];
  
  // TODO: Implement actual rate limiting with Redis
  // For now, always allow
  return { success: true, retryAfter: 0 };
}
```

### 3.2 Local Development Setup

For local development, use query parameter to test collectives:

```typescript
// lib/collective.ts
import { headers } from 'next/headers';

export function getCollective(): 'MOD' | 'MAKE' | 'MINI' {
  const headersList = headers();
  const collective = headersList.get('x-collective') as 'MOD' | 'MAKE' | 'MINI' | null;
  
  // Fallback to MOD if not set
  return collective || 'MOD';
}
```

In development, you can test with:
- `http://localhost:3000?collective=MOD`
- `http://localhost:3000?collective=MAKE`
- `http://localhost:3000?collective=MINI`

Or configure `/etc/hosts`:
```
127.0.0.1 make.localhost
127.0.0.1 mod.localhost
127.0.0.1 mini.localhost
```


## 4. Collective-Specific Theming

### 4.1 Collective Configuration

```typescript
// lib/collective-config.ts
export const collectiveConfig = {
  MOD: {
    name: 'Mod',
    subdomain: 'mod',
    color: {
      primary: '#8b5cf6', // purple-500
      primaryDark: '#7c3aed', // purple-600
      primaryLight: '#a78bfa', // purple-400
      accent: '#c084fc', // purple-300
    },
    iconography: 'keyboard', // keyboard, switches, keycaps
    pattern: 'grid',
    headline: 'Curated drops for keyboard enthusiasts',
    description: 'Discover mystery boxes, surplus, and limited editions from verified makers',
    seo: {
      title: 'Dropr Mod - Mechanical Keyboard Drops',
      description: 'Curated mystery boxes and limited drops for mechanical keyboard enthusiasts',
    },
  },
  MAKE: {
    name: 'Make',
    subdomain: 'make',
    color: {
      primary: '#06b6d4', // cyan-500
      primaryDark: '#0891b2', // cyan-600
      primaryLight: '#22d3ee', // cyan-400
      accent: '#67e8f9', // cyan-300
    },
    iconography: 'circuit', // circuit boards, components, tools
    pattern: 'circuit-board',
    headline: 'Curated drops for makers and builders',
    description: 'Find electronics, 3D printing, and modular synth drops',
    seo: {
      title: 'Dropr Make - Electronics & Maker Drops',
      description: 'Curated drops for DIY electronics, 3D printing, and modular synth enthusiasts',
    },
  },
  MINI: {
    name: 'Mini',
    subdomain: 'mini',
    color: {
      primary: '#ec4899', // pink-500
      primaryDark: '#db2777', // pink-600
      primaryLight: '#f472b6', // pink-400
      accent: '#f9a8d4', // pink-300
    },
    iconography: 'paintbrush', // miniatures, paints, brushes
    pattern: 'hexagon',
    headline: 'Curated drops for miniature hobbyists',
    description: 'Discover paints, miniatures, and hobby supplies',
    seo: {
      title: 'Dropr Mini - Miniature & Model Drops',
      description: 'Curated drops for miniature painting, model kits, and tabletop gaming',
    },
  },
} as const;

export type CollectiveKey = keyof typeof collectiveConfig;

export function getCollectiveConfig(collective: CollectiveKey) {
  return collectiveConfig[collective];
}
```

### 4.2 Theme Provider

```typescript
// components/providers/theme-provider.tsx
'use client';

import { useEffect } from 'react';
import { collectiveConfig, type CollectiveKey } from '@/lib/collective-config';

interface ThemeProviderProps {
  collective: CollectiveKey;
  children: React.ReactNode;
}

export function ThemeProvider({ collective, children }: ThemeProviderProps) {
  const config = collectiveConfig[collective];
  
  useEffect(() => {
    // Apply CSS custom properties to :root
    const root = document.documentElement;
    root.style.setProperty('--color-collective-primary', config.color.primary);
    root.style.setProperty('--color-collective-primary-dark', config.color.primaryDark);
    root.style.setProperty('--color-collective-primary-light', config.color.primaryLight);
    root.style.setProperty('--color-collective-accent', config.color.accent);
    
    // Add collective class to body for pattern backgrounds
    document.body.classList.remove('collective-mod', 'collective-make', 'collective-mini');
    document.body.classList.add(`collective-${collective.toLowerCase()}`);
  }, [collective, config]);
  
  return <>{children}</>;
}
```

### 4.3 Root Layout Integration

```typescript
// app/layout.tsx
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { getCollectiveConfig } from '@/lib/collective-config';
import './globals.css';

export async function generateMetadata() {
  const headersList = headers();
  const collective = (headersList.get('x-collective') || 'MOD') as 'MOD' | 'MAKE' | 'MINI';
  const config = getCollectiveConfig(collective);
  
  return {
    title: config.seo.title,
    description: config.seo.description,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const collective = (headersList.get('x-collective') || 'MOD') as 'MOD' | 'MAKE' | 'MINI';
  
  return (
    <html lang="en">
      <body>
        <ThemeProvider collective={collective}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4.4 Tailwind CSS Configuration

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Collective-specific colors (set dynamically by ThemeProvider) */
  --color-collective-primary: #8b5cf6;
  --color-collective-primary-dark: #7c3aed;
  --color-collective-primary-light: #a78bfa;
  --color-collective-accent: #c084fc;
  
  /* Use collective colors in theme */
  --color-primary: var(--color-collective-primary);
  --color-primary-dark: var(--color-collective-primary-dark);
  --color-primary-light: var(--color-collective-primary-light);
  --color-accent: var(--color-collective-accent);
}

/* Pattern backgrounds */
.collective-mod {
  --pattern-bg: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z' fill='%238b5cf6' fill-opacity='0.05'/%3E%3C/svg%3E");
}

.collective-make {
  --pattern-bg: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2306b6d4' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E");
}

.collective-mini {
  --pattern-bg: url("data:image/svg+xml,%3Csvg width='56' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23ec4899' stroke-opacity='0.1'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%23ec4899' stroke-opacity='0.1'/%3E%3C/svg%3E");
}

/* Apply pattern to specific elements */
.pattern-bg {
  background-image: var(--pattern-bg);
  background-repeat: repeat;
}
```

### 4.5 useCollective Hook

```typescript
// hooks/use-collective.ts
'use client';

import { useEffect, useState } from 'react';
import { collectiveConfig, type CollectiveKey } from '@/lib/collective-config';

export function useCollective() {
  const [collective, setCollective] = useState<CollectiveKey>('MOD');
  
  useEffect(() => {
    // Read from body class
    const bodyClass = document.body.className;
    if (bodyClass.includes('collective-make')) setCollective('MAKE');
    else if (bodyClass.includes('collective-mini')) setCollective('MINI');
    else setCollective('MOD');
  }, []);
  
  return {
    collective,
    config: collectiveConfig[collective],
  };
}
```


## 5. Authentication System (NextAuth.js)

### 5.1 NextAuth Configuration

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }
        
        const isPasswordValid = await compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
};
```

### 5.2 API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 5.3 Server-Side Auth Helpers

```typescript
// lib/auth-helpers.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
}

export async function requireRole(role: 'BUYER' | 'CURATOR' | 'ADMIN') {
  const session = await requireAuth();
  
  if (session.user.role !== role && session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
  
  return session;
}
```

### 5.4 Client-Side Auth Hooks

```typescript
// hooks/use-auth.ts
'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    role: session?.user?.role,
  };
}
```

### 5.5 Login Page

```typescript
// app/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl });
  };
  
  return (
    <div className="container max-w-md mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">Sign In</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
          >
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
          >
            GitHub
          </Button>
        </div>
      </div>
      
      <p className="mt-6 text-center text-sm">
        Don't have an account?{' '}
        <a href="/signup" className="text-primary hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
```


## 6. Core Utilities & Helpers

### 6.1 Date Utilities

```typescript
// lib/utils/date.ts
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(date: Date, formatStr: string = 'PPP'): string {
  return format(date, formatStr);
}

export function calculateCountdown(targetDate: Date) {
  const now = new Date();
  const total = targetDate.getTime() - now.getTime();
  
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { total, days, hours, minutes, seconds };
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}
```

### 6.2 Price Utilities

```typescript
// lib/utils/price.ts
export function formatPrice(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
}

export function calculatePlatformFee(amount: number): number {
  return amount * 0.2; // 20% platform fee
}

export function calculateCuratorPayout(amount: number): number {
  return amount * 0.8; // 80% to curator
}

export function calculateStripeFee(amount: number): number {
  // Stripe fee: 2.9% + $0.30
  return (amount * 0.029) + 0.30;
}

export function calculateNetPayout(amount: number): number {
  const platformFee = calculatePlatformFee(amount);
  const stripeFee = calculateStripeFee(amount);
  return amount - platformFee - stripeFee;
}
```

### 6.3 String Utilities

```typescript
// lib/utils/string.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - use a library like DOMPurify for production
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
```

### 6.4 Validation Schemas (Zod)

```typescript
// lib/validation/common.ts
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const urlSchema = z.string().url('Invalid URL');

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export const priceSchema = z
  .number()
  .min(5, 'Minimum price is $5')
  .max(10000, 'Maximum price is $10,000');

export const inventorySchema = z
  .number()
  .int('Inventory must be a whole number')
  .min(1, 'Minimum inventory is 1')
  .max(1000, 'Maximum inventory is 1000');
```

### 6.5 Error Handling

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// Error boundary component
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    console.error(error);
  }, [error]);
  
  return (
    <div className="container max-w-md mx-auto py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### 6.6 API Response Helpers

```typescript
// lib/api-response.ts
import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status: number = 500, code?: string) {
  return NextResponse.json(
    { success: false, error: { message, code } },
    { status }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, error: { message: 'Validation failed', errors } },
    { status: 400 }
  );
}
```


## 7. External Service Integrations

### 7.1 Stripe Integration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Create PaymentIntent with escrow
export async function createPaymentIntent(
  amount: number,
  curatorStripeAccountId: string,
  metadata: Record<string, string>
) {
  const platformFee = Math.round(amount * 0.2 * 100); // 20% in cents
  
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    capture_method: 'manual', // Hold funds until delivery
    metadata,
    application_fee_amount: platformFee,
    transfer_data: {
      destination: curatorStripeAccountId,
    },
  });
}

// Capture payment (release escrow)
export async function capturePayment(paymentIntentId: string) {
  return await stripe.paymentIntents.capture(paymentIntentId);
}

// Refund payment
export async function refundPayment(paymentIntentId: string, amount?: number) {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}
```

### 7.2 Email Integration (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Dropr <noreply@dropr.com>',
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderNumber: string, dropTitle: string) => `
    <h1>Order Confirmed!</h1>
    <p>Your order #${orderNumber} for "${dropTitle}" has been confirmed.</p>
    <p>We'll notify you when it ships.</p>
  `,
  
  orderShipped: (orderNumber: string, trackingUrl: string) => `
    <h1>Your Order Has Shipped!</h1>
    <p>Order #${orderNumber} is on its way.</p>
    <p><a href="${trackingUrl}">Track your package</a></p>
  `,
  
  emailVerification: (verificationUrl: string) => `
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email address:</p>
    <p><a href="${verificationUrl}">Verify Email</a></p>
  `,
  
  passwordReset: (resetUrl: string) => `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `,
};
```

### 7.3 SMS Integration (Twilio)

```typescript
// lib/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error };
  }
}

// SMS templates
export const smsTemplates = {
  orderConfirmation: (orderNumber: string) =>
    `Your Dropr order #${orderNumber} is confirmed! We'll text you when it ships.`,
  
  orderShipped: (orderNumber: string, trackingUrl: string) =>
    `Your order #${orderNumber} has shipped! Track it: ${trackingUrl}`,
  
  dropLive: (dropTitle: string, dropUrl: string) =>
    `"${dropTitle}" is now live on Dropr! ${dropUrl}`,
};
```

### 7.4 Image Upload (Vercel Blob)

```typescript
// lib/upload.ts
import { put } from '@vercel/blob';

export async function uploadImage(file: File, folder: string = 'uploads') {
  try {
    const blob = await put(`${folder}/${file.name}`, file, {
      access: 'public',
    });
    
    return { success: true, url: blob.url };
  } catch (error) {
    console.error('Image upload error:', error);
    return { success: false, error };
  }
}

export async function uploadMultipleImages(files: File[], folder: string = 'uploads') {
  const uploads = await Promise.all(
    files.map(file => uploadImage(file, folder))
  );
  
  const successful = uploads.filter(u => u.success);
  const failed = uploads.filter(u => !u.success);
  
  return {
    success: failed.length === 0,
    urls: successful.map(u => u.url!),
    failed: failed.length,
  };
}
```

### 7.5 Rate Limiting (Upstash Redis)

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limiters for different endpoints
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
});

export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
});
```


## 8. Background Jobs & Queues (BullMQ)

### 8.1 Queue Setup

```typescript
// lib/queue.ts
import { Queue, Worker, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// ============================================================================
// QUEUE DEFINITIONS
// ============================================================================

export const notificationQueue = new Queue('notifications', { connection });
export const emailQueue = new Queue('emails', { connection });
export const escrowQueue = new Queue('escrow', { connection });

// ============================================================================
// JOB TYPES
// ============================================================================

export type NotificationJob = {
  type: 'order_confirmation' | 'order_shipped' | 'drop_live';
  userId: string;
  data: Record<string, any>;
};

export type EmailJob = {
  to: string;
  subject: string;
  html: string;
};

export type EscrowJob = {
  orderId: string;
  action: 'release' | 'refund';
};

// ============================================================================
// QUEUE HELPERS
// ============================================================================

export async function addNotificationJob(job: NotificationJob) {
  return await notificationQueue.add('send-notification', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

export async function addEmailJob(job: EmailJob) {
  return await emailQueue.add('send-email', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

export async function addEscrowJob(job: EscrowJob, delay?: number) {
  return await escrowQueue.add('process-escrow', job, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    delay, // Optional delay in milliseconds
  });
}
```

### 8.2 Workers

```typescript
// workers/notification-worker.ts
import { Worker } from 'bullmq';
import { connection } from '@/lib/queue';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';
import { prisma } from '@/lib/prisma';

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { type, userId, data } = job.data;
    
    // Get user preferences
    const buyer = await prisma.buyer.findUnique({
      where: { userId },
      include: { user: true },
    });
    
    if (!buyer) {
      throw new Error('Buyer not found');
    }
    
    // Send email if enabled
    if (buyer.emailNotifications) {
      await sendEmail({
        to: buyer.user.email,
        subject: getEmailSubject(type),
        html: getEmailTemplate(type, data),
      });
    }
    
    // Send SMS if enabled
    if (buyer.smsNotifications && buyer.phone) {
      await sendSMS(buyer.phone, getSMSTemplate(type, data));
    }
    
    return { success: true };
  },
  { connection }
);

notificationWorker.on('completed', (job) => {
  console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err);
});

function getEmailSubject(type: string): string {
  const subjects: Record<string, string> = {
    order_confirmation: 'Order Confirmed',
    order_shipped: 'Your Order Has Shipped',
    drop_live: 'Drop is Now Live',
  };
  return subjects[type] || 'Notification';
}

function getEmailTemplate(type: string, data: any): string {
  // Return appropriate email template
  return `<p>Notification: ${type}</p>`;
}

function getSMSTemplate(type: string, data: any): string {
  // Return appropriate SMS template
  return `Notification: ${type}`;
}
```

```typescript
// workers/email-worker.ts
import { Worker } from 'bullmq';
import { connection } from '@/lib/queue';
import { sendEmail } from '@/lib/email';

const emailWorker = new Worker(
  'emails',
  async (job) => {
    const { to, subject, html } = job.data;
    
    const result = await sendEmail({ to, subject, html });
    
    if (!result.success) {
      throw new Error('Email send failed');
    }
    
    return result;
  },
  { connection }
);

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});
```

```typescript
// workers/escrow-worker.ts
import { Worker } from 'bullmq';
import { connection } from '@/lib/queue';
import { capturePayment, refundPayment } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const escrowWorker = new Worker(
  'escrow',
  async (job) => {
    const { orderId, action } = job.data;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (action === 'release') {
      // Check if 7-day dispute window has passed
      if (!order.deliveredAt) {
        throw new Error('Order not delivered yet');
      }
      
      const disputeWindowEnd = new Date(order.deliveredAt);
      disputeWindowEnd.setDate(disputeWindowEnd.getDate() + 7);
      
      if (new Date() < disputeWindowEnd) {
        throw new Error('Dispute window still open');
      }
      
      // Capture payment
      await capturePayment(order.paymentIntentId);
      
      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'REVEALED',
          escrowReleasedAt: new Date(),
        },
      });
    } else if (action === 'refund') {
      // Refund payment
      await refundPayment(order.paymentIntentId);
      
      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
        },
      });
    }
    
    return { success: true };
  },
  { connection }
);

escrowWorker.on('completed', (job) => {
  console.log(`Escrow job ${job.id} completed`);
});

escrowWorker.on('failed', (job, err) => {
  console.error(`Escrow job ${job?.id} failed:`, err);
});
```

### 8.3 Scheduled Jobs (Cron)

```typescript
// lib/cron.ts
import { Queue } from 'bullmq';
import { connection } from './queue';

// Daily job to release escrow for eligible orders
export async function scheduleEscrowReleaseJob() {
  const escrowQueue = new Queue('escrow', { connection });
  
  // Run daily at 2 AM
  await escrowQueue.add(
    'daily-escrow-release',
    { action: 'check_and_release' },
    {
      repeat: {
        pattern: '0 2 * * *', // Cron expression
      },
    }
  );
}

// Initialize all scheduled jobs
export async function initializeScheduledJobs() {
  await scheduleEscrowReleaseJob();
  console.log('Scheduled jobs initialized');
}
```


## 9. Project Structure

```
dropr/
├── .next/                      # Next.js build output
├── node_modules/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data script
├── public/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (marketing)/       # Marketing pages (no auth required)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── about/
│   │   │   └── how-it-works/
│   │   ├── (shop)/            # Shop pages
│   │   │   ├── drops/
│   │   │   └── curators/
│   │   ├── (dashboard)/       # User dashboard (auth required)
│   │   │   ├── orders/
│   │   │   └── settings/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   ├── globals.css        # Tailwind CSS + theme config
│   │   ├── layout.tsx         # Root layout
│   │   └── error.tsx          # Global error boundary
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── providers/         # Context providers
│   │   │   └── theme-provider.tsx
│   │   └── error-boundary.tsx
│   ├── features/              # Feature-specific code (MVVM)
│   │   ├── drops/
│   │   │   ├── models/        # Server Actions + types
│   │   │   ├── stores/        # Zustand stores (ViewModels)
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── components/    # Feature components
│   │   ├── orders/
│   │   ├── cart/
│   │   └── auth/
│   ├── lib/                   # Utilities and helpers
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── stripe.ts          # Stripe client
│   │   ├── email.ts           # Email utilities
│   │   ├── sms.ts             # SMS utilities
│   │   ├── upload.ts          # Image upload
│   │   ├── queue.ts           # BullMQ queues
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── collective-config.ts # Collective configuration
│   │   ├── errors.ts          # Custom error classes
│   │   ├── api-response.ts    # API response helpers
│   │   ├── utils/             # Utility functions
│   │   │   ├── date.ts
│   │   │   ├── price.ts
│   │   │   └── string.ts
│   │   └── validation/        # Zod schemas
│   │       └── common.ts
│   ├── hooks/                 # Global custom hooks
│   │   ├── use-auth.ts
│   │   └── use-collective.ts
│   ├── types/                 # TypeScript types
│   │   ├── next-auth.d.ts     # NextAuth type extensions
│   │   └── index.ts
│   └── workers/               # Background workers
│       ├── notification-worker.ts
│       ├── email-worker.ts
│       └── escrow-worker.ts
├── .env.example               # Environment variables template
├── .env.local                 # Local environment variables (gitignored)
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── middleware.ts              # Next.js middleware
├── next.config.js             # Next.js configuration
├── package.json
├── tsconfig.json              # TypeScript configuration
└── README.md
```

## 10. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dropr"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (Email)
RESEND_API_KEY="re_..."

# Twilio (SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Vercel Blob (Image Storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Upstash Redis (Rate Limiting & Queues)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
REDIS_URL="redis://..."

# Sentry (Error Monitoring)
SENTRY_DSN="https://..."

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."
```

## 11. Development Workflow

### 11.1 Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/dropr.git
cd dropr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### 11.2 Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### 11.3 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:e2e

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run formatting
npm run format
```

## 12. Deployment

### 12.1 Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up production database (Vercel Postgres or Supabase)
4. Configure custom domains and subdomains
5. Deploy

### 12.2 DNS Configuration

```
# DNS Records for subdomains
make.dropr.com  CNAME  cname.vercel-dns.com
mod.dropr.com   CNAME  cname.vercel-dns.com
mini.dropr.com  CNAME  cname.vercel-dns.com
```

### 12.3 Post-Deployment

1. Run database migrations: `npx prisma migrate deploy`
2. Verify Stripe webhooks are configured
3. Test authentication flows
4. Test subdomain routing
5. Monitor error logs in Sentry
6. Check performance in Vercel Analytics

## 13. Security Considerations

- All secrets stored in environment variables
- HTTPS enforced in production
- CSRF protection enabled
- Rate limiting on authentication endpoints
- SQL injection prevention with Prisma
- XSS prevention with Content Security Policy
- Secure session management with NextAuth
- Input validation with Zod
- Image upload size limits
- Bot protection on checkout

## 14. Performance Optimizations

- Next.js Image component for automatic optimization
- ISR for static pages with revalidation
- Database connection pooling
- Redis for rate limiting and caching
- CDN for static assets (Vercel)
- Code splitting and lazy loading
- Optimized database queries with indexes
- Server Components for reduced client-side JavaScript

## 15. Monitoring & Observability

- Sentry for error tracking
- Vercel Analytics for performance monitoring
- Database query logging
- API endpoint monitoring
- Queue job monitoring
- Uptime monitoring
- Custom metrics and dashboards
