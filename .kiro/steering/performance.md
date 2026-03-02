---
inclusion: manual
---
# Performance Optimization

## Philosophy

Performance is a feature. Target Core Web Vitals for optimal user experience, optimize images and bundles, minimize database queries, and use client-side calculations where possible. Every millisecond counts for conversion rates and user satisfaction.

## Performance Checklist

- [ ] Images optimized with Next.js Image component
- [ ] Bundle size under limits (< 200KB initial JS)
- [ ] Code splitting for large components
- [ ] Database queries optimized with indexes
- [ ] Pagination implemented for large lists
- [ ] Caching strategy in place (revalidateTag)
- [ ] Fonts optimized with next/font
- [ ] Console logs removed in production
- [ ] SSE connections optimized (client-side countdown)
- [ ] Suspense boundaries for streaming
- [ ] Layout shift minimized (CLS < 0.1)
- [ ] Core Web Vitals monitored
- [ ] Static generation used where possible
- [ ] Connection pooling configured
- [ ] CDN caching configured

## Performance Goals

Target Core Web Vitals for optimal user experience:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

## Image Optimization

### Next.js Image Component

Always use Next.js Image component for automatic optimization:

```typescript
import Image from 'next/image';

// ✅ Good: Optimized with automatic formats (WebP, AVIF)
<Image
  src="/drops/keyboard.jpg"
  alt="Mechanical Keyboard Drop"
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>

// ❌ Avoid: Regular img tag
<img src="/drops/keyboard.jpg" alt="..." />
```

### Image Guidelines

**Dimensions:**
- Drop hero images: 1200x800px (3:2 ratio)
- Drop thumbnails: 400x300px
- Curator avatars: 200x200px
- Product images: 800x800px

**Formats:**
- Use WebP or AVIF for modern browsers
- Provide JPEG fallback
- Next.js handles this automatically

**File Sizes:**
- Hero images: < 200KB
- Thumbnails: < 50KB
- Avatars: < 20KB

**Loading Strategy:**
- Use `priority` for above-the-fold images
- Use `loading="lazy"` for below-the-fold (default)
- Provide `placeholder="blur"` with blur data URL

### Image Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['dropr.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

## Bundle Size Optimization

### Code Splitting

Use dynamic imports for large components:

```typescript
// ✅ Good: Lazy load heavy components
import dynamic from 'next/dynamic';

const DropEditor = dynamic(() => import('@/features/drops/components/DropEditor'), {
  loading: () => <DropEditorSkeleton />,
  ssr: false, // If component doesn't need SSR
});

// ❌ Avoid: Importing everything upfront
import { DropEditor } from '@/features/drops/components/DropEditor';
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

Add to `package.json`:
```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... other config
});
```

### Bundle Size Limits

Set budget limits:
- Initial JS: < 200KB (gzipped)
- Total JS: < 500KB (gzipped)
- CSS: < 50KB (gzipped)
- Fonts: < 100KB

### Tree Shaking

Import only what you need:

```typescript
// ✅ Good: Named imports
import { formatDate } from '@/lib/utils/date';

// ❌ Avoid: Importing entire library
import * as utils from '@/lib/utils';
```

## Caching Strategy

### Next.js Caching

Use built-in caching with revalidation:

```typescript
// Server Action with cache tags
'use server'

import { revalidateTag } from 'next/cache';

export async function fetchDrops() {
  const drops = await db.drop.findMany();
  return drops;
}

export async function createDrop(data: CreateDropInput) {
  const drop = await db.drop.create({ data });
  revalidateTag('drops'); // Invalidate cache
  return drop;
}

// Expensive operations with caching
import { unstable_cache } from 'next/cache';

export const getCachedDrops = unstable_cache(
  async () => db.drop.findMany(),
  ['drops'],
  { tags: ['drops'], revalidate: 60 } // Cache for 60 seconds
);
```

### Static Generation

Use static generation for pages that don't change often:

```typescript
// Generate static pages at build time
export async function generateStaticParams() {
  const drops = await db.drop.findMany({ select: { id: true } });
  return drops.map((drop) => ({ id: drop.id }));
}

// Revalidate every hour
export const revalidate = 3600;
```

### CDN Caching

Vercel automatically caches static assets. Configure cache headers:

```typescript
// app/api/drops/route.ts
export async function GET() {
  const drops = await fetchDrops();
  
  return new Response(JSON.stringify(drops), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

## Database Query Optimization

### Select Only What You Need

```typescript
// ✅ Good: Select specific fields
const drops = await db.drop.findMany({
  select: {
    id: true,
    title: true,
    price: true,
    imageUrl: true,
  },
  take: 20,
});

// ❌ Avoid: Fetching all fields
const drops = await db.drop.findMany();
```

### Use Indexes

```prisma
model Drop {
  id        String   @id @default(cuid())
  status    DropStatus
  startTime DateTime
  curatorId String
  
  @@index([status])
  @@index([startTime])
  @@index([curatorId])
  @@index([status, startTime]) // Composite index for common queries
}
```

### Avoid N+1 Queries

```typescript
// ✅ Good: Use include to fetch related data
const drops = await db.drop.findMany({
  include: {
    curator: {
      select: { id: true, name: true, avatar: true }
    }
  }
});

// ❌ Avoid: N+1 query
const drops = await db.drop.findMany();
for (const drop of drops) {
  const curator = await db.curator.findUnique({ where: { id: drop.curatorId } });
}
```

### Pagination

Always paginate large result sets:

```typescript
export async function fetchDrops(page: number = 1, pageSize: number = 20) {
  const drops = await db.drop.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: { startTime: 'desc' },
  });
  
  return drops;
}
```

### Connection Pooling

Use connection pooling for serverless:

```env
# Prisma Data Proxy or PgBouncer
DATABASE_URL="prisma://..."
DIRECT_URL="postgresql://..."  # For migrations
```

## Server-Sent Events (SSE) Optimization

### Efficient SSE Streams

**Scaling Strategy**: Calculate countdown client-side, only stream inventory/status changes from server.

```typescript
// app/api/drops/[id]/stream/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Fetch initial drop data once
      const drop = await db.drop.findUnique({
        where: { id: params.id },
        select: {
          inventory: true,
          status: true,
          startTime: true,
        }
      });
      
      if (!drop) {
        controller.close();
        return;
      }
      
      // Send initial data with startTime for client-side countdown
      const initialData = {
        inventory: drop.inventory,
        status: drop.status,
        startTime: drop.startTime.toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
      
      // Only poll database for inventory/status changes (not every second)
      let lastInventory = drop.inventory;
      let lastStatus = drop.status;
      
      const checkForChanges = async () => {
        try {
          const updated = await db.drop.findUnique({
            where: { id: params.id },
            select: { inventory: true, status: true }
          });
          
          if (!updated) {
            clearInterval(interval);
            controller.close();
            return;
          }
          
          // Only send update if something changed
          if (updated.inventory !== lastInventory || updated.status !== lastStatus) {
            lastInventory = updated.inventory;
            lastStatus = updated.status;
            
            const data = {
              inventory: updated.inventory,
              status: updated.status,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
        } catch (error) {
          console.error('SSE stream error:', error);
          clearInterval(interval);
          controller.close();
        }
      };
      
      // Check for changes every 5 seconds (not every second)
      const interval = setInterval(checkForChanges, 5000);
      
      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    }
  });
}
```

**Alternative: Event-Driven Updates (Recommended for High Scale)**

For better scalability, use Redis Pub/Sub to broadcast changes only when they happen:

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Publish inventory change
export async function publishDropUpdate(dropId: string, data: { inventory?: number; status?: string }) {
  await redis.publish(`drop:${dropId}`, JSON.stringify(data));
}

// app/api/drops/[id]/stream/route.ts (with Redis)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const drop = await db.drop.findUnique({
        where: { id: params.id },
        select: { inventory: true, status: true, startTime: true }
      });
      
      if (!drop) {
        controller.close();
        return;
      }
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        inventory: drop.inventory,
        status: drop.status,
        startTime: drop.startTime.toISOString(),
      })}\n\n`));
      
      // Subscribe to Redis channel for this drop
      const subscriber = redis.duplicate();
      await subscriber.subscribe(`drop:${params.id}`, (message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
      });
      
      // Cleanup on disconnect
      req.signal.addEventListener('abort', async () => {
        await subscriber.unsubscribe(`drop:${params.id}`);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  });
}

// When inventory changes (in payment webhook or Server Action)
await db.drop.update({
  where: { id: dropId },
  data: { inventory: { decrement: 1 } }
});

// Broadcast change to all connected clients
await publishDropUpdate(dropId, { inventory: newInventory });
```

### SSE Best Practices

- **Calculate countdown client-side**: Send startTime once, let client calculate remaining time
- **Only stream changes**: Don't poll database every second, only send updates when data changes
- **Use event-driven updates**: Redis Pub/Sub for broadcasting changes to all connected clients
- **Limit polling frequency**: If polling, use 5-10 second intervals, not 1 second
- **Send only changed data**: Don't send full state if only inventory changed
- **Use efficient JSON serialization**: Minimize payload size
- **Implement reconnection logic on client**: Exponential backoff for retries
- **Close connections when component unmounts**: Prevent memory leaks
- **Limit concurrent connections per user**: Prevent abuse
- **Use Edge Runtime for SSE endpoints**: Better performance and lower latency
- **Monitor connection count**: Alert if connections spike unexpectedly

### Scaling Considerations

**At 100 concurrent viewers per drop:**
- Client-side countdown: 0 database queries/second
- Polling approach (5s interval): 20 queries/second per drop
- Redis Pub/Sub: 0 queries/second (event-driven)

**Recommendation**: Use Redis Pub/Sub for production. It scales horizontally and only sends updates when changes actually occur.

### Client-Side SSE

```typescript
// features/drops/stores/drop.store.ts
subscribeToDropUpdates: (dropId: string) => {
  const eventSource = new EventSource(`/api/drops/${dropId}/stream`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    set((state) => ({
      drops: state.drops.map(drop => {
        if (drop.id === dropId) {
          // If startTime is provided, store it for client-side countdown
          if (data.startTime) {
            return { ...drop, ...data };
          }
          // Otherwise just update inventory/status
          return { ...drop, inventory: data.inventory, status: data.status };
        }
        return drop;
      })
    }));
  };
  
  eventSource.onerror = () => {
    eventSource.close();
    // Implement exponential backoff for reconnection
    setTimeout(() => {
      get().subscribeToDropUpdates(dropId);
    }, 5000);
  };
  
  set({ eventSource });
},

// Client-side countdown calculation
getCountdown: (startTime: Date) => {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const diff = Math.max(0, start - now);
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
},
```

**Component Usage:**

```typescript
// features/drops/components/DropCountdown.tsx
'use client'

import { useState, useEffect } from 'react';
import { useDrop } from '../hooks/useDrop';

export function DropCountdown({ dropId, startTime }: { dropId: string; startTime: Date }) {
  const getCountdown = useDrop((state) => state.getCountdown);
  const [countdown, setCountdown] = useState(getCountdown(startTime));
  
  useEffect(() => {
    // Update countdown every second on client
    const interval = setInterval(() => {
      setCountdown(getCountdown(startTime));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, getCountdown]);
  
  return (
    <div>
      {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
    </div>
  );
}
```

## Font Optimization

### Next.js Font Optimization

```typescript
// app/layout.tsx
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Loading Strategy

- Use `font-display: swap` to prevent FOIT (Flash of Invisible Text)
- Preload critical fonts
- Subset fonts to include only needed characters
- Use variable fonts when possible

## JavaScript Optimization

### Remove Console Logs in Production

```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### Minimize Client-Side JavaScript

- Use Server Components by default
- Add `'use client'` only when needed
- Move logic to Server Actions when possible
- Avoid large client-side libraries

### Debounce and Throttle

```typescript
// lib/utils/performance.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage: Search input
const handleSearch = debounce((query: string) => {
  searchDrops(query);
}, 300);
```

## Rendering Optimization

### Streaming with Suspense

Use Suspense for granular loading control:

```typescript
// app/drops/page.tsx
import { Suspense } from 'react';
import { DropList } from '@/features/drops/components/DropList';
import { DropListSkeleton } from '@/features/drops/components/DropList.skeleton';

export default function DropsPage() {
  return (
    <div>
      <h1>Active Drops</h1>
      <Suspense fallback={<DropListSkeleton />}>
        <DropList />
      </Suspense>
    </div>
  );
}
```

### Avoid Layout Shift

- Reserve space for dynamic content
- Use skeleton loaders with correct dimensions
- Set explicit width/height on images
- Avoid inserting content above existing content

## Monitoring Performance

### Vercel Speed Insights

Enable in Vercel dashboard for automatic monitoring.

### Custom Performance Tracking

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start}ms`);
  
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value: Math.round(end - start),
    });
  }
}
```

### Web Vitals Tracking

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Performance Checklist

- [ ] Images optimized with Next.js Image component
- [ ] Bundle size under limits (< 200KB initial JS)
- [ ] Code splitting for large components
- [ ] Database queries optimized with indexes
- [ ] Pagination implemented for large lists
- [ ] Caching strategy in place
- [ ] Fonts optimized with next/font
- [ ] Console logs removed in production
- [ ] SSE connections optimized
- [ ] Suspense boundaries for streaming
- [ ] Layout shift minimized (CLS < 0.1)
- [ ] Core Web Vitals monitored
- [ ] Static generation used where possible
- [ ] Connection pooling configured
- [ ] CDN caching configured

## Performance Budget

Set and enforce performance budgets:

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  // Warn if bundle exceeds limits
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};
```

Monitor in CI:
```yaml
# .github/workflows/performance.yml
- name: Check bundle size
  run: |
    npm run build
    npx bundlesize
```
