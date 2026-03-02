---
inclusion: manual
---
# Deployment

## Philosophy

Deploy with confidence. Automate everything, test thoroughly, and maintain the ability to rollback instantly. Use staging environments to catch issues before production. Monitor actively and respond to incidents quickly. Zero-downtime deployments are the standard, not the exception.

## Deployment Checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Environment variables configured
- [ ] Database migrations tested on staging
- [ ] Stripe webhooks configured with production URL
- [ ] Email sending tested (Resend production mode)
- [ ] Error monitoring configured (Sentry)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Health check endpoint working
- [ ] Database backup created
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Rate limiting tested
- [ ] Security headers configured
- [ ] CORS policies set
- [ ] API keys rotated from test to production

## Platform

Deploy to Vercel for optimal Next.js integration and performance.

## Environment Setup

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For migrations (bypasses connection pooling)

# Authentication
NEXTAUTH_SECRET="..."  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Environment Management

**Development** (`.env.local`):
- Use test API keys (Stripe test mode, Resend sandbox)
- Point to local or development database
- Enable debug logging

**Staging** (Vercel environment variables):
- Use test API keys
- Separate staging database
- Mirror production configuration
- Test migrations before production

**Production** (Vercel environment variables):
- Use live API keys
- Production database with backups
- Minimal logging
- Enable monitoring

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

## Database Migrations

### Migration Strategy

**Development:**
```bash
# Create migration
npx prisma migrate dev --name add_drop_status

# Reset database (dev only)
npx prisma migrate reset
```

**Production:**
```bash
# Apply migrations (non-interactive)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Vercel Build Process

Add to `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

### Migration Best Practices

- Test migrations on staging first
- Create backup before production migrations
- Make migrations backward compatible when possible
- Use multiple small migrations instead of one large migration
- Never edit applied migrations
- Include rollback plan for breaking changes

### Zero-Downtime Migrations

For breaking schema changes:

1. **Add new column** (nullable or with default)
2. **Deploy code** that writes to both old and new columns
3. **Backfill data** from old to new column
4. **Deploy code** that reads from new column
5. **Remove old column** in separate migration

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run e2e tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel Staging
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Monitoring and Logging

### Vercel Analytics

Enable in Vercel dashboard:
- Web Analytics (Core Web Vitals)
- Speed Insights
- Audience insights

### Error Monitoring

Use Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Application Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
      timestamp: new Date().toISOString()
    }));
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
  },
};
```

### Database Monitoring

Use Prisma Pulse or database provider's monitoring:
- Query performance
- Connection pool usage
- Slow query logs
- Database size and growth

## Health Checks

```typescript
// app/api/health/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

## Backup Strategy

### Database Backups

**Automated backups:**
- Daily automated backups (via database provider)
- Retain backups for 30 days
- Test restore process monthly

**Manual backups before:**
- Major migrations
- Production deployments
- Schema changes

### Backup Commands

```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup-20260301-120000.sql
```

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (unit, integration, e2e)
- [ ] Environment variables configured in Vercel
- [ ] Database migrations tested on staging
- [ ] Stripe webhooks configured with production URL
- [ ] Email sending tested (Resend production mode)
- [ ] Error monitoring configured (Sentry)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Health check endpoint working
- [ ] Database backup created
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured
- [ ] Rate limiting tested
- [ ] Security headers configured
- [ ] CORS policies set
- [ ] API keys rotated from test to production

## Rollback Strategy

### Quick Rollback

Vercel allows instant rollback to previous deployment:
```bash
# Via Vercel dashboard: Deployments → Select previous → Promote to Production
# Via CLI:
vercel rollback
```

### Database Rollback

If migration causes issues:
```bash
# Restore from backup
psql $DATABASE_URL < backup-before-migration.sql

# Or revert migration (if possible)
npx prisma migrate resolve --rolled-back migration_name
```

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['dropr.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### Edge Functions

Use Edge Runtime for performance-critical routes:
```typescript
export const runtime = 'edge';
```

Good candidates:
- API routes with simple logic
- Middleware
- SSE endpoints (drop countdowns)

## Scaling Considerations

### Database Connection Pooling

Use connection pooling for serverless:
```env
# Use Prisma Data Proxy or PgBouncer
DATABASE_URL="prisma://..."
DIRECT_URL="postgresql://..."  # For migrations
```

### Caching Strategy

- Use Next.js built-in caching with `revalidateTag()`
- Cache static assets on CDN (automatic with Vercel)
- Consider Redis for session storage if needed (future)

### Rate Limiting

Implement rate limiting for API routes:
- Use Upstash Redis for distributed rate limiting
- Protect payment endpoints
- Limit email sending

## Monitoring Alerts

Set up alerts for:
- Error rate spikes (Sentry)
- Response time degradation (Vercel)
- Database connection failures
- Payment processing failures (Stripe webhooks)
- Email delivery failures (Resend)
- Disk space usage
- SSL certificate expiration

## Security in Production

- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Security headers configured (see security.md)
- [ ] Rate limiting enabled
- [ ] CORS policies set
- [ ] API keys in environment variables (never in code)
- [ ] Database credentials secured
- [ ] Webhook signatures verified
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)

## Post-Deployment

After successful deployment:
1. Verify health check endpoint
2. Test critical user flows (signup, purchase, drop creation)
3. Monitor error rates for 24 hours
4. Check performance metrics
5. Verify webhook deliveries (Stripe, Resend)
6. Test SSE connections (drop countdowns)
7. Monitor database performance
8. Check email delivery rates
