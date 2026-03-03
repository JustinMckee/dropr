# Buyer Drop Experience - Design

## 1. Architecture Overview

The buyer drop experience is built as a full-stack Next.js application with the following key components:

### 1.1 Frontend Architecture
- **Framework**: Next.js 15+ (App Router) with TypeScript
- **Rendering**: Hybrid SSR/SSG for SEO + Client-side for interactivity
- **State Management**: MVVM pattern with scoped Zustand stores (Context Provider pattern), Server Actions for mutations
- **Styling**: Tailwind CSS v4 (configured in app/globals.css with @theme directive)
- **Real-time Updates**: Server-Sent Events (SSE) for live inventory and countdown timers
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui with Base UI primitives (not Radix)

### 1.2 Backend Architecture
- **API**: Next.js API Routes (App Router route handlers) + Server Actions
- **Database**: PostgreSQL with Prisma ORM (cuid() for IDs)
- **Cache**: Next.js built-in caching with revalidateTag() (no external Redis for caching)
- **Queue**: BullMQ with Redis for background jobs (emails, notifications, order processing)
- **Storage**: Vercel Blob for images and media
- **Middleware**: Next.js middleware for subdomain detection, auth, rate limiting, bot protection

### 1.3 External Integrations
- **Payment Processing**: Stripe with Connect for escrow (20% platform fee, capture_method: 'manual')
- **Email Service**: Resend for transactional emails
- **SMS Service**: Twilio for SMS notifications
- **Shipping**: EasyPost or Shippo for tracking integration
- **Analytics**: Vercel Analytics for performance
- **Error Monitoring**: Sentry for error tracking

## 2. Database Schema (Prisma)

### 2.1 Core Models

```prisma
// schema.prisma

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

model Buyer {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String
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
  
  @@index([email])
}

model Curator {
  id                String   @id @default(cuid())
  name              String
  bio               String?  @db.Text
  avatarUrl         String?
  
  // Reputation
  reputationScore   Decimal  @db.Decimal(3, 2) @default(0)
  totalDrops        Int      @default(0)
  completedDrops    Int      @default(0)
  averageRating     Decimal? @db.Decimal(3, 2)
  
  // Stripe Connect
  stripeAccountId   String?  @unique
  
  drops             Drop[]
  reviews           Review[]
  followers         CuratorFollow[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
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

model DropFollow {
  id        String   @id @default(cuid())
  buyerId   String
  buyer     Buyer    @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  dropId    String
  drop      Drop     @relation(fields: [dropId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([buyerId, dropId])
  @@index([buyerId])
  @@index([dropId])
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

// Enums
enum Collective {
  MOD
  MAKE
  MINI
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

## 3. Next.js App Structure

The app uses the App Router with a clear separation of concerns: 
FAT business logic, THIN components

MVVM (Model-View-ViewModel) pattern is used to achieve a clear separation of concerns and keep components "dumb/thin"

ViewModels to encapsulate logic, allowing UI components to remain "dumb"

Routing directory structure ONLY handles:
- Routes and their views
- Pages and their data requirements
- Error boundaries (error.tsx, not-found.tsx, global-error.tsx)
- Data fetching strategies (SSR, SSG, ISR)
- React Suspense & loading states (loading.tsx, skeleton.tsx)
- Layouts (layout.tsx) and their data requirements 

Components directory structure separates concerns:
-  ViewModels
- `primitives`: Smallest reusable UI elements (Button, Input, Card, etc)
- `common`: Components built from primitives (ProductCard, ReviewCard, etc)
- `features`: Feature-specific components built from primitive + common (TierSelector, Order, )


### 3.1 Directory Structure
```
├── node_modules/
├── public/                # Static assets (images, icons, fonts, etc.)
├── src/                   # Main application code
        app/
        ├── (marketing)/
        │   ├── page.tsx                    # Homepage
        │   ├── about/
        │   └── how-it-works/
        ├── (shop)/
        │   ├── drops/
        │   │   ├── page.tsx                # Browse drops (SSR)
        │   │   ├── [id]/
        │   │   │   └── page.tsx            # Drop detail (SSR)
        │   │   └── loading.tsx
        │   ├── curators/
        │   │   └── [id]/
        │   │       └── page.tsx            # Curator profile (SSR)
        │   └── layout.tsx
        ├── (dashboard)/
        │   ├── orders/
        │   │   ├── page.tsx                # Order list
        │   │   └── [id]/
        │   │       └── page.tsx            # Order detail
        │   ├── settings/
        │   │   ├── page.tsx                # Account settings
        │   │   └── notifications/
        │   │       └── page.tsx
        │   └── layout.tsx                  # Dashboard layout with nav
        ├── checkout/
        │   └── [dropId]/
        │       └── page.tsx                # Checkout flow
        ├── api/
        │   ├── drops/
        │   │   ├── route.ts                # GET /api/drops (list)
        │   │   ├── [id]/
        │   │   │   ├── route.ts            # GET /api/drops/[id]
        │   │   │   └── availability/
        │   │   │       └── route.ts        # GET availability
        │   ├── orders/
        │   │   ├── route.ts                # POST /api/orders (create)
        │   │   ├── [id]/
        │   │   │   ├── route.ts            # GET /api/orders/[id]
        │   │   │   ├── reveal/
        │   │   │   │   └── route.ts        # PATCH reveal
        │   │   │   └── tracking/
        │   │   │       └── route.ts        # GET tracking
        │   ├── reviews/
        │   │   └── route.ts                # POST /api/reviews
        │   ├── buyers/
        │   │   └── me/
        │   │       ├── route.ts            # GET/PATCH profile
        │   │       ├── follow/
        │   │       │   └── [curatorId]/
        │   │       │       └── route.ts    # POST/DELETE follow
        │   │       └── notifications/
        │   │           └── route.ts        # PATCH preferences
        │   ├── webhooks/
        │   │   ├── stripe/
        │   │   │   └── route.ts            # Stripe webhooks
        │   │   └── shipping/
        │   │       └── route.ts            # Shipping webhooks
        │   └── sse/
        │       └── drops/
        │           └── [id]/
        │               └── route.ts        # SSE for real-time updates
        ├── _components/                    # Shared components
        │   ├── drop-card.tsx
        │   ├── countdown-timer.tsx
        │   ├── curator-badge.tsx
        │   └── ...
        └── middleware.ts                   # Auth, rate limiting, bot protection
│   ├── components/                         # Shared component library structure
        ├── primitives                      # Highly reusable, global UI components (e.g., Button, Input, Card, etc)
        ├── common                          # UI using 1+ primitive components, global UI
        └── features                        # UI using common + primitive components, specific to a feature, generally not reusable.
│   ├── lib/                                # Helper functions, utility modules, database config, auth layer logic
│   ├── hooks/                              # Custom React hooks
│   ├── styles/                             # Global CSS or SCSS files, Tailwind config (e.g. @layer, @theme, tokens, etc) 
│   └── types/                              # Global TypeScript types and interfaces
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── package.json
├── prettier.json
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

### 3.2 Middleware Configuration
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { verifyAuth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  
  // Detect subdomain and add collective header
  const subdomain = host.split('.')[0];
  const collectiveMap: Record<string, string> = {
    'make': 'MAKE',
    'mod': 'MOD',
    'mini': 'MINI',
  };
  
  const collective = collectiveMap[subdomain];
  const response = NextResponse.next();
  
  if (collective) {
    response.headers.set('x-collective', collective);
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  }
  
  // Auth protection for dashboard routes
  if (pathname.startsWith('/orders') || pathname.startsWith('/settings')) {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Bot protection for checkout
  if (pathname.startsWith('/checkout')) {
    // Implement bot detection logic
  }
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/orders/:path*', '/settings/:path*', '/checkout/:path*', '/drops/:path*'],
};
```

### 3.3 Collective-Specific Theming

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
    },
    iconography: 'keyboard', // keyboard, switches, keycaps
    pattern: 'grid',
    headline: 'Curated drops for keyboard enthusiasts',
    description: 'Discover mystery boxes, surplus, and limited editions from verified makers',
  },
  MAKE: {
    name: 'Make',
    subdomain: 'make',
    color: {
      primary: '#06b6d4', // cyan-500
      primaryDark: '#0891b2', // cyan-600
      primaryLight: '#22d3ee', // cyan-400
    },
    iconography: 'circuit', // circuit boards, components, tools
    pattern: 'circuit-board',
    headline: 'Curated drops for makers and builders',
    description: 'Find electronics, 3D printing, and modular synth drops',
  },
  MINI: {
    name: 'Mini',
    subdomain: 'mini',
    color: {
      primary: '#ec4899', // pink-500
      primaryDark: '#db2777', // pink-600
      primaryLight: '#f472b6', // pink-400
    },
    iconography: 'paintbrush', // miniatures, paints, brushes
    pattern: 'hexagon',
    headline: 'Curated drops for miniature hobbyists',
    description: 'Discover paints, miniatures, and hobby supplies',
  },
};

// Usage in components
export function useCollective() {
  const collective = headers().get('x-collective') as keyof typeof collectiveConfig;
  return collectiveConfig[collective] || collectiveConfig.MOD;
}
```

### 3.4 Dynamic Theming with CSS Custom Properties

```css
/* app/globals.css */
@theme {
  --color-collective-primary: var(--collective-primary, #8b5cf6);
  --color-collective-primary-dark: var(--collective-primary-dark, #7c3aed);
  --color-collective-primary-light: var(--collective-primary-light, #a78bfa);
}

/* Applied dynamically via inline styles based on collective */
```

## 4. Component Design

### 4.1 Drop Discovery Components


#### DropBrowser (Server Component)
```typescript
// app/(shop)/drops/page.tsx
import { prisma } from '@/lib/prisma';
import { DropGrid } from '@/components/drop-grid';
import { DropFilters } from '@/components/drop-filters';

export default async function DropsPage({
  searchParams,
}: {
  searchParams: { collective?: string; tags?: string; sort?: string };
}) {
  const drops = await prisma.drop.findMany({
    where: {
      status: 'ACTIVE',
      collective: searchParams.collective as Collective,
      tags: searchParams.tags ? { hasSome: searchParams.tags.split(',') } : undefined,
    },
    include: {
      curator: true,
      tiers: true,
      _count: { select: { reviews: true } },
    },
    orderBy: getOrderBy(searchParams.sort),
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DropFilters />
      <DropGrid drops={drops} />
    </div>
  );
}
```

#### DropCard (Client Component)
```typescript
// components/drop-card.tsx
'use client';

import { Drop, Curator, DropTier } from '@prisma/client';
import { CountdownTimer } from './countdown-timer';
import { CuratorBadge } from './curator-badge';
import Link from 'next/link';
import Image from 'next/image';

type DropWithRelations = Drop & {
  curator: Curator;
  tiers: DropTier[];
  _count: { reviews: number };
};

export function DropCard({ drop }: { drop: DropWithRelations }) {
  const minPrice = Math.min(...drop.tiers.map(t => Number(t.price)));
  const totalRemaining = drop.tiers.reduce((sum, t) => sum + t.quantityRemaining, 0);
  
  return (
    <Link href={`/drops/${drop.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg border bg-card">
        <Image
          src={drop.thumbnailUrl}
          alt={drop.title}
          width={400}
          height={300}
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {drop.isFeatured && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {drop.collective}
            </span>
            <CuratorBadge curator={drop.curator} compact />
          </div>
          
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {drop.title}
          </h3>
          
          {drop.theme && (
            <p className="text-sm text-muted-foreground mb-2">{drop.theme}</p>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-lg font-bold">From ${minPrice}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {totalRemaining} left
              </span>
            </div>
          </div>
          
          <CountdownTimer endDate={drop.closeDate} className="mt-3" />
        </div>
      </div>
    </Link>
  );
}
```

### 4.2 Drop Detail Page (SSR)

```typescript
// app/(shop)/drops/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DropHero } from '@/components/drop-hero';
import { TierSelector } from '@/components/tier-selector';
import { CuratorProfile } from '@/components/curator-profile';
import { DropReviews } from '@/components/drop-reviews';
import { RelatedDrops } from '@/components/related-drops';
import { CartCheckoutSlideIn } from '@/components/cart-checkout-slide-in';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const drop = await prisma.drop.findUnique({
    where: { id: params.id },
    include: { curator: true },
  });
  
  if (!drop) return {};
  
  return {
    title: `${drop.title} | Dropr`,
    description: drop.description,
    openGraph: {
      images: [drop.heroImageUrl || drop.thumbnailUrl],
    },
  };
}

export default async function DropDetailPage({ params }: { params: { id: string } }) {
  const drop = await prisma.drop.findUnique({
    where: { id: params.id },
    include: {
      curator: true,
      tiers: true,
      reviews: {
        where: { moderationStatus: 'APPROVED' },
        include: { buyer: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  
  if (!drop) notFound();
  
  const relatedDrops = await prisma.drop.findMany({
    where: {
      collective: drop.collective,
      status: 'ACTIVE',
      id: { not: drop.id },
    },
    include: { curator: true, tiers: true },
    take: 4,
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DropHero drop={drop} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <TierSelector drop={drop} />
          
          <div className="mt-8 prose max-w-none">
            <h2>About This Drop</h2>
            <p>{drop.description}</p>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <DropReviews reviews={drop.reviews} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <CuratorProfile curator={drop.curator} />
          
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">Escrow Protection</h3>
            <p className="text-sm text-muted-foreground">
              Your payment is held securely until delivery is confirmed.
            </p>
          </div>
          
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Shipping</h3>
            <p className="text-sm">{drop.shippingPolicy}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Est. ship date: {new Date(drop.estimatedShipDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <RelatedDrops drops={relatedDrops} className="mt-12" />
      
      <CartCheckoutSlideIn />
    </div>
  );
}
```

### 4.3 Checkout Flow (Combination Cart + Checkout Slide-in)

```typescript
// components/cart-checkout-slide-in.tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CheckoutForm } from './checkout-form';
import { CartSummary } from './cart-summary';

export function CartCheckoutSlideIn() {
  const { isOpen, items, closeCart } = useCartStore();
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  
  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {step === 'cart' && 'Your Cart'}
            {step === 'checkout' && 'Checkout'}
            {step === 'payment' && 'Payment'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {step === 'cart' && (
            <CartSummary onContinue={() => setStep('checkout')} />
          )}
          
          {step === 'checkout' && (
            <CheckoutForm onContinue={() => setStep('payment')} />
          )}
          
          {step === 'payment' && (
            <PaymentForm />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 4.4 Order Dashboard

```typescript
// app/(dashboard)/orders/page.tsx
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderList } from '@/components/order-list';
import { FollowedDrops } from '@/components/followed-drops';
import { PendingReviews } from '@/components/pending-reviews';

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect('/login');
  
  const [orders, followedDrops, pendingReviews] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: session.user.id },
      include: { drop: true, tier: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.drop.findMany({
      where: {
        follows: { some: { buyerId: session.user.id } },
        status: { in: ['UPCOMING', 'ACTIVE'] },
      },
      include: { curator: true, tiers: true },
    }),
    prisma.order.findMany({
      where: {
        buyerId: session.user.id,
        status: 'DELIVERED',
        review: null,
      },
      include: { drop: true },
    }),
  ]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Order History</h2>
          <OrderList orders={orders} />
        </div>
        
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Followed Drops</h2>
            <FollowedDrops drops={followedDrops} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
            <PendingReviews orders={pendingReviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4.5 Reveal Experience

```typescript
// components/reveal-modal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ReviewForm } from './review-form';

export function RevealModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const handleReveal = async () => {
    await fetch(`/api/orders/${orderId}/reveal`, { method: 'PATCH' });
    setRevealed(true);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {!revealed && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Your Drop Has Arrived!</h2>
            <p className="text-muted-foreground mb-8">
              Ready to see what's inside?
            </p>
            <Button size="lg" onClick={handleReveal}>
              Reveal My Drop
            </Button>
          </div>
        )}
        
        {revealed && !showReviewForm && (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-4">Share Your Haul</h2>
            <p className="text-muted-foreground mb-6">
              Upload photos of your items to share with the community!
            </p>
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop photos or click to upload
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                Skip
              </Button>
              <Button onClick={() => setShowReviewForm(true)}>
                Continue to Review
              </Button>
            </div>
          </div>
        )}
        
        {showReviewForm && (
          <ReviewForm orderId={orderId} onComplete={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## 5. API Route Handlers

### 5.1 Create Order
```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  tierId: z.string(),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { tierId, shippingAddress } = createOrderSchema.parse(body);
    
    // Check inventory availability
    const tier = await prisma.dropTier.findUnique({
      where: { id: tierId },
      include: { drop: true },
    });
    
    if (!tier || tier.quantityRemaining < 1) {
      return NextResponse.json({ error: 'Sold out' }, { status: 400 });
    }
    
    // Create Stripe PaymentIntent with escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(tier.price) * 100),
      currency: 'usd',
      metadata: {
        tierId,
        buyerId: session.user.id,
        dropId: tier.dropId,
      },
      transfer_data: {
        destination: tier.drop.curator.stripeAccountId,
      },
      on_behalf_of: tier.drop.curator.stripeAccountId,
      // Funds held until explicitly captured
      capture_method: 'manual',
    });
    
    // Create order and decrement inventory atomically
    const order = await prisma.$transaction(async (tx) => {
      // Lock the tier row
      const lockedTier = await tx.dropTier.findUnique({
        where: { id: tierId },
        select: { quantityRemaining: true },
      });
      
      if (!lockedTier || lockedTier.quantityRemaining < 1) {
        throw new Error('Sold out');
      }
      
      // Decrement inventory
      await tx.dropTier.update({
        where: { id: tierId },
        data: { quantityRemaining: { decrement: 1 } },
      });
      
      // Create order
      return tx.order.create({
        data: {
          buyerId: session.user.id,
          dropId: tier.dropId,
          tierId,
          status: 'PENDING',
          paymentIntentId: paymentIntent.id,
          amount: tier.price,
          shippingAddress,
        },
        include: {
          drop: true,
          tier: true,
        },
      });
    });
    
    return NextResponse.json({ order, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

### 5.2 Real-time Drop Updates (SSE)
```typescript
// app/api/sse/drops/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const drop = await prisma.drop.findUnique({
        where: { id: params.id },
        include: { tiers: true },
      });
      
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(drop)}\n\n`)
      );
      
      // Subscribe to Redis pub/sub for updates
      const subscriber = redis.duplicate();
      await subscriber.subscribe(`drop:${params.id}`);
      
      subscriber.on('message', (channel, message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
      });
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        subscriber.unsubscribe();
        subscriber.quit();
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 6. State Management

### 6.1 Cart Store (Zustand)
```typescript
// stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  dropId: string;
  tierId: string;
  tierName: string;
  price: number;
  dropTitle: string;
  thumbnailUrl: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (tierId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => ({
          items: [...state.items.filter((i) => i.tierId !== item.tierId), item],
          isOpen: true,
        })),
      removeItem: (tierId) =>
        set((state) => ({
          items: state.items.filter((i) => i.tierId !== tierId),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### 6.2 Server State (React Query)
```typescript
// lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDrops(filters: DropFilters) {
  return useQuery({
    queryKey: ['drops', filters],
    queryFn: () => fetch(`/api/drops?${new URLSearchParams(filters)}`).then(r => r.json()),
    staleTime: 30_000,
  });
}

export function useDrop(id: string) {
  return useQuery({
    queryKey: ['drop', id],
    queryFn: () => fetch(`/api/drops/${id}`).then(r => r.json()),
    staleTime: 60_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderData) =>
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

## 7. Notification System

### 7.1 Email Notifications (Resend)
```typescript
// lib/email.ts
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(order: Order) {
  await resend.emails.send({
    from: 'Dropr <orders@dropr.com>',
    to: order.buyer.email,
    subject: `Order Confirmed: ${order.drop.title}`,
    react: OrderConfirmationEmail({ order }),
  });
}

export async function sendShippingNotification(order: Order) {
  await resend.emails.send({
    from: 'Dropr <orders@dropr.com>',
    to: order.buyer.email,
    subject: `Your drop has shipped!`,
    react: ShippingNotificationEmail({ order }),
  });
}
```

### 7.2 SMS Notifications (Twilio)
```typescript
// lib/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOrderConfirmationSMS(order: Order) {
  if (!order.buyer.phone || !order.buyer.smsNotifications) return;
  
  await client.messages.create({
    body: `Your Dropr order #${order.id.slice(0, 8)} is confirmed! Track it at dropr.com/orders/${order.id}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: order.buyer.phone,
  });
}
```

### 7.3 Background Jobs (BullMQ)
```typescript
// lib/queues/notification-queue.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '@/lib/redis';

export const notificationQueue = new Queue('notifications', {
  connection: redis,
});

const worker = new Worker(
  'notifications',
  async (job) => {
    const { type, orderId } = job.data;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true, drop: true },
    });
    
    if (!order) return;
    
    switch (type) {
      case 'order_confirmation':
        await sendOrderConfirmation(order);
        if (order.buyer.smsNotifications) {
          await sendOrderConfirmationSMS(order);
        }
        break;
      case 'shipping':
        await sendShippingNotification(order);
        break;
      // ... other notification types
    }
  },
  { connection: redis }
);
```

## 8. Payment & Escrow Flow

### 8.1 Stripe Connect Setup
- Curators onboard via Stripe Connect Express
- Platform holds funds in escrow using `capture_method: 'manual'`
- Funds released after delivery confirmation + 7-day dispute window

### 8.2 Escrow Release Logic
```typescript
// lib/escrow.ts
export async function releaseEscrow(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { drop: { include: { curator: true } } },
  });
  
  if (!order || order.status !== 'DELIVERED') {
    throw new Error('Order not eligible for escrow release');
  }
  
  // Check if 7-day dispute window has passed
  const disputeWindowEnd = new Date(order.deliveredAt);
  disputeWindowEnd.setDate(disputeWindowEnd.getDate() + 7);
  
  if (new Date() < disputeWindowEnd) {
    throw new Error('Dispute window still open');
  }
  
  // Capture the payment
  await stripe.paymentIntents.capture(order.paymentIntentId);
  
  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'REVEALED' },
  });
}
```

## 9. Security & Performance

### 9.1 Rate Limiting
```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});
```

### 9.2 Caching Strategy
- Drop listings: ISR with 60s revalidation
- Drop details: ISR with 30s revalidation
- User orders: Client-side caching with React Query
- Real-time inventory: Redis cache

### 9.3 Image Optimization
- Next.js Image component for automatic optimization
- Vercel Blob or S3 + CloudFront for CDN delivery
- WebP format with fallbacks

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)
- Component rendering
- Business logic functions
- API route handlers
- Prisma model validations

### 10.2 Integration Tests (Playwright)
- Full checkout flow
- Order tracking
- Review submission
- Email delivery (using test mode)

### 10.3 Property-Based Tests (fast-check)
- Inventory management (no overselling)
- Escrow calculations
- Order state transitions
- Rating aggregations

## 11. Correctness Properties

### 11.1 Inventory Management
**Property 1.1**: No overselling
```typescript
// For any drop tier, sum of order quantities ≤ tier.quantity
fc.assert(
  fc.property(fc.array(fc.nat()), async (orderCounts) => {
    // Test concurrent order attempts
  })
);
```

**Property 1.2**: Inventory consistency
```typescript
// quantityRemaining = quantity - confirmed orders
fc.assert(
  fc.property(fc.record({ quantity: fc.nat(), orders: fc.array(fc.nat()) }), async (data) => {
    // Verify consistency after random order sequences
  })
);
```

### 11.2 Payment & Escrow
**Property 2.1**: Payment atomicity
```typescript
// Order exists ⟺ payment succeeded
fc.assert(
  fc.property(fc.boolean(), async (paymentSucceeds) => {
    // Simulate payment success/failure
  })
);
```

**Property 2.2**: Escrow balance
```typescript
// Total escrowed = sum of paid, non-released orders
fc.assert(
  fc.property(fc.array(fc.record({ amount: fc.nat(), released: fc.boolean() })), async (orders) => {
    // Verify escrow balance
  })
);
```

### 11.3 Order Status Transitions
**Property 3.1**: Valid state transitions
```typescript
// Orders follow valid state machine
const validTransitions = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['CLOSED', 'CANCELLED'],
  CLOSED: ['PACKING'],
  PACKING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REVEALED', 'DISPUTED'],
};

fc.assert(
  fc.property(fc.array(fc.constantFrom(...Object.keys(validTransitions))), async (transitions) => {
    // Verify only valid transitions occur
  })
);
```

## 12. Deployment & Infrastructure

### 12.1 Vercel Deployment
- Next.js app deployed to Vercel
- Edge functions for middleware
- Serverless functions for API routes
- Automatic preview deployments

### 12.2 Database
- PostgreSQL on Vercel Postgres or Supabase
- Connection pooling via Prisma
- Automated backups

### 12.3 Monitoring
- Vercel Analytics for performance
- Sentry for error tracking
- Mixpanel for user analytics
- Uptime monitoring

## 13. Open Questions

1. Should we implement a wishlist/save for later feature?
2. What's the dispute resolution process for unsatisfied buyers?
3. Should buyers be able to cancel orders before drop closes?
4. Do we need a buyer reputation system (for curators to see)?
5. Should we support gift purchases?
6. What's the refund policy for undelivered drops?
7. Should we implement push notifications via web push API?
8. Do we need a mobile app or is PWA sufficient?
