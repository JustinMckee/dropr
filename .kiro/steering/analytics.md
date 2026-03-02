---
inclusion: manual
---
# Analytics and Tracking

## Philosophy

Measure what matters. Track user behavior to understand how people use the platform, identify friction points, and optimize conversion funnels. Respect user privacy with transparent data collection and GDPR compliance. Use analytics to inform product decisions, not to invade privacy. Focus on actionable metrics over vanity metrics.

## Analytics Checklist

**Setup:**
- [ ] Analytics provider configured (Vercel Analytics or Plausible)
- [ ] Privacy policy updated with tracking disclosure
- [ ] Cookie consent banner implemented (if using cookies)
- [ ] GDPR compliance verified
- [ ] Analytics script loaded asynchronously
- [ ] Do Not Track (DNT) respected

**Core Metrics:**
- [ ] Page views and unique visitors
- [ ] Bounce rate and session duration
- [ ] Conversion rate (signup, purchase, drop creation)
- [ ] Drop view-to-purchase rate
- [ ] Curator signup-to-first-drop rate
- [ ] Average order value
- [ ] Revenue tracking

**Event Tracking:**
- [ ] Drop views
- [ ] Add to cart / Buy now clicks
- [ ] Checkout initiated
- [ ] Purchase completed
- [ ] Drop created (curator)
- [ ] User signup
- [ ] Search queries
- [ ] Filter usage

**Performance:**
- [ ] Core Web Vitals tracked
- [ ] Page load times monitored
- [ ] API response times tracked
- [ ] Error rates monitored

**Privacy:**
- [ ] No PII collected without consent
- [ ] IP anonymization enabled
- [ ] Data retention policy defined
- [ ] User opt-out mechanism provided

## Analytics Provider

### Recommended: Vercel Analytics

Use Vercel Analytics for privacy-friendly, zero-config analytics:

**Benefits:**
- No cookies required
- GDPR compliant by default
- Automatic Core Web Vitals tracking
- No impact on performance
- Built-in to Vercel platform

**Setup:**

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Alternative: Plausible Analytics

Privacy-focused alternative with more detailed insights:

**Benefits:**
- Open source
- No cookies
- GDPR, CCPA, PECR compliant
- Lightweight script (< 1KB)
- EU-hosted data

**Setup:**

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          data-domain="dropr.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Not Recommended: Google Analytics 4

While powerful, GA4 has privacy concerns and requires cookie consent in many jurisdictions. Use only if you need advanced features like user-level tracking or integration with Google Ads.

## Event Tracking

### Custom Events

Track key user actions:

```typescript
// lib/analytics.ts
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', event, properties);
    }
    
    // Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(event, { props: properties });
    }
  },
};

// Type definitions
declare global {
  interface Window {
    va?: (event: string, name: string, properties?: Record<string, any>) => void;
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}
```

### Drop Events

```typescript
// features/drops/components/DropCard.tsx
'use client'

import { analytics } from '@/lib/analytics';

export function DropCard({ drop }: DropCardProps) {
  const handleView = () => {
    analytics.track('Drop Viewed', {
      dropId: drop.id,
      dropTitle: drop.title,
      price: drop.price,
      category: drop.category,
    });
  };
  
  const handleBuyClick = () => {
    analytics.track('Buy Now Clicked', {
      dropId: drop.id,
      dropTitle: drop.title,
      price: drop.price,
    });
  };
  
  useEffect(() => {
    handleView();
  }, []);
  
  return (
    <div>
      <h3>{drop.title}</h3>
      <button onClick={handleBuyClick}>Buy Now</button>
    </div>
  );
}
```

### Checkout Events

```typescript
// features/checkout/components/CheckoutForm.tsx
'use client'

import { analytics } from '@/lib/analytics';

export function CheckoutForm({ drop }: CheckoutFormProps) {
  useEffect(() => {
    analytics.track('Checkout Initiated', {
      dropId: drop.id,
      price: drop.price,
    });
  }, []);
  
  const handlePaymentSuccess = () => {
    analytics.track('Purchase Completed', {
      dropId: drop.id,
      price: drop.price,
      revenue: drop.price,
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Curator Events

```typescript
// features/curator/components/CreateDropForm.tsx
'use client'

import { analytics } from '@/lib/analytics';

export function CreateDropForm() {
  const handleSubmit = async (data: CreateDropInput) => {
    const result = await createDrop(data);
    
    if (result.success) {
      analytics.track('Drop Created', {
        dropId: result.drop.id,
        price: data.price,
        inventory: data.inventory,
      });
    }
  };
  
  return <form onSubmit={handleSubmit}>{/* fields */}</form>;
}
```

### Search Events

```typescript
// features/search/components/SearchBar.tsx
'use client'

import { analytics } from '@/lib/analytics';
import { debounce } from '@/lib/utils';

export function SearchBar() {
  const trackSearch = debounce((query: string) => {
    analytics.track('Search Performed', {
      query,
      resultsCount: results.length,
    });
  }, 1000);
  
  const handleSearch = (query: string) => {
    setQuery(query);
    trackSearch(query);
  };
  
  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

## Conversion Funnels

### Buyer Funnel

Track the buyer journey:

1. **Drop Discovery** → Drop Viewed
2. **Interest** → Buy Now Clicked
3. **Checkout** → Checkout Initiated
4. **Purchase** → Purchase Completed

```typescript
// Calculate conversion rates
const dropViewToPurchase = (purchases / dropViews) * 100;
const checkoutToPurchase = (purchases / checkoutsInitiated) * 100;
```

### Curator Funnel

Track the curator journey:

1. **Signup** → User Signup (role: curator)
2. **First Drop** → Drop Created
3. **First Sale** → Purchase Completed (curator's drop)
4. **Repeat** → Multiple drops created

```typescript
// Calculate curator activation
const signupToFirstDrop = (firstDrops / curatorSignups) * 100;
const firstDropToFirstSale = (firstSales / firstDrops) * 100;
```

## Revenue Tracking

### Track Revenue Events

```typescript
// After successful payment
analytics.track('Purchase Completed', {
  dropId: drop.id,
  revenue: drop.price,
  currency: 'USD',
  orderId: order.id,
});

// Track refunds
analytics.track('Refund Issued', {
  orderId: order.id,
  revenue: -order.total,
  currency: 'USD',
});
```

### Revenue Metrics

Calculate key revenue metrics:

```typescript
// lib/analytics/revenue.ts
export async function getRevenueMetrics(startDate: Date, endDate: Date) {
  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
  });
  
  return {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
    orderCount: orders.length,
    revenuePerDay: totalRevenue / daysBetween(startDate, endDate),
  };
}
```

## Performance Tracking

### Core Web Vitals

Automatically tracked by Vercel Analytics and Speed Insights:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Custom Performance Metrics

```typescript
// lib/analytics/performance.ts
export function trackPerformance(name: string, duration: number) {
  analytics.track('Performance Metric', {
    name,
    duration,
    url: window.location.pathname,
  });
}

// Usage
const start = performance.now();
await fetchDrops();
const duration = performance.now() - start;
trackPerformance('Fetch Drops', duration);
```

### API Response Times

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  
  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow request: ${request.url} took ${duration}ms`);
  }
  
  return response;
}
```

## Error Tracking

### Track Errors

```typescript
// lib/analytics/errors.ts
export function trackError(error: Error, context?: Record<string, any>) {
  analytics.track('Error Occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
  
  // Also send to Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
}

// Usage
try {
  await createDrop(data);
} catch (error) {
  trackError(error as Error, { action: 'createDrop', data });
  throw error;
}
```

## Privacy and GDPR Compliance

### Cookie Consent

If using cookies (not needed for Vercel Analytics or Plausible):

```typescript
// components/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Initialize analytics
  };
  
  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="cookie-banner">
      <p>We use cookies to improve your experience. See our Privacy Policy.</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
}
```

### Respect Do Not Track

```typescript
// lib/analytics.ts
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Check Do Not Track
    if (navigator.doNotTrack === '1') {
      return;
    }
    
    // Track event
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', event, properties);
    }
  },
};
```

### Data Retention

Define data retention policy:

```typescript
// Delete old analytics data (if self-hosted)
export async function cleanupOldAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await db.analyticsEvent.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
  });
}
```

### User Opt-Out

Provide opt-out mechanism:

```typescript
// app/privacy/page.tsx
'use client'

export default function PrivacyPage() {
  const handleOptOut = () => {
    localStorage.setItem('analytics-opt-out', 'true');
    // Disable analytics
    window.va = undefined;
    window.plausible = undefined;
  };
  
  return (
    <div>
      <h1>Privacy Settings</h1>
      <button onClick={handleOptOut}>Opt Out of Analytics</button>
    </div>
  );
}
```

## Dashboard and Reporting

### Key Metrics Dashboard

Create internal dashboard for key metrics:

```typescript
// app/admin/analytics/page.tsx
import { getRevenueMetrics } from '@/lib/analytics/revenue';

export default async function AnalyticsDashboard() {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const metrics = await getRevenueMetrics(last30Days, new Date());
  
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      <div className="metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
        />
        <MetricCard
          title="Average Order Value"
          value={`$${metrics.averageOrderValue.toFixed(2)}`}
        />
        <MetricCard
          title="Orders"
          value={metrics.orderCount}
        />
        <MetricCard
          title="Revenue/Day"
          value={`$${metrics.revenuePerDay.toFixed(2)}`}
        />
      </div>
    </div>
  );
}
```

## Testing Analytics

### Test Events in Development

```typescript
// lib/analytics.ts
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }
    
    // Track in production
    if (process.env.NODE_ENV === 'production') {
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', event, properties);
      }
    }
  },
};
```

### Verify Event Tracking

Use browser console to verify events:

```typescript
// Enable debug mode
localStorage.setItem('analytics-debug', 'true');

// Check events
window.addEventListener('va-event', (e) => {
  console.log('Analytics event:', e.detail);
});
```

## Best Practices

- Track user behavior, not users (no PII)
- Use descriptive event names (verb + noun: "Drop Viewed", "Purchase Completed")
- Include relevant context in event properties
- Debounce high-frequency events (search, scroll)
- Test analytics in development before deploying
- Monitor analytics performance impact
- Respect user privacy preferences
- Document tracked events for team reference
- Review and clean up unused events regularly
- Use analytics to inform decisions, not vanity metrics

## Common Mistakes to Avoid

- Tracking PII without consent
- Not respecting Do Not Track
- Blocking page load with analytics scripts
- Tracking too many events (noise over signal)
- Not testing analytics implementation
- Ignoring GDPR requirements
- Using analytics for surveillance
- Not documenting tracked events
- Tracking without a purpose
- Forgetting to anonymize IP addresses

## Resources

- Vercel Analytics: https://vercel.com/analytics
- Plausible Analytics: https://plausible.io/
- GDPR Compliance: https://gdpr.eu/
- Privacy by Design: https://www.privacybydesign.ca/
