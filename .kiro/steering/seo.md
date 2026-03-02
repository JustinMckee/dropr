---
inclusion: manual
---
# SEO Guidelines

## Philosophy

SEO is about being found by the right people at the right time. Optimize for humans first, search engines second. Use semantic HTML, descriptive content, and proper metadata. Focus on technical SEO fundamentals, quality content, and page speed. Build for discovery without compromising user experience.

## SEO Checklist

**Technical SEO:**
- [ ] Semantic HTML with proper heading hierarchy
- [ ] Descriptive page titles (50-60 characters)
- [ ] Meta descriptions (150-160 characters)
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags
- [ ] Canonical URLs to prevent duplicate content
- [ ] XML sitemap generated and submitted
- [ ] robots.txt configured
- [ ] Structured data (JSON-LD) for drops and curators
- [ ] Mobile-friendly and responsive
- [ ] Fast page load times (LCP < 2.5s)
- [ ] HTTPS enabled

**Content SEO:**
- [ ] Unique, descriptive titles for each page
- [ ] Keyword-rich but natural content
- [ ] Alt text on all images
- [ ] Internal linking strategy
- [ ] Breadcrumb navigation
- [ ] URL structure is clean and descriptive

**Performance:**
- [ ] Core Web Vitals optimized
- [ ] Images optimized and lazy loaded
- [ ] Minimal JavaScript blocking render
- [ ] Server-side rendering for public pages

## Metadata Patterns

### Page Titles

Follow this format: `[Page Name] | Dropr`

```typescript
// app/drops/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const drop = await db.drop.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, imageUrl: true }
  });

  if (!drop) {
    return {
      title: 'Drop Not Found | Dropr',
    };
  }

  return {
    title: `${drop.title} | Dropr`,
    description: drop.description.slice(0, 160),
    openGraph: {
      title: drop.title,
      description: drop.description.slice(0, 160),
      images: [{ url: drop.imageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: drop.title,
      description: drop.description.slice(0, 160),
      images: [drop.imageUrl],
    },
  };
}
```

### Root Layout Metadata

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://dropr.com'),
  title: {
    default: 'Dropr - Curated Mystery Drops for Makers & Modders',
    template: '%s | Dropr',
  },
  description: 'Discover limited mystery drops and curated bundles for mechanical keyboards, PC mods, DIY electronics, and miniatures.',
  keywords: ['mystery drops', 'mechanical keyboards', 'PC modding', 'DIY electronics', 'miniatures', 'curated marketplace'],
  authors: [{ name: 'Dropr' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dropr.com',
    siteName: 'Dropr',
    title: 'Dropr - Curated Mystery Drops for Makers & Modders',
    description: 'Discover limited mystery drops and curated bundles for mechanical keyboards, PC mods, DIY electronics, and miniatures.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dropr Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dropr',
    creator: '@dropr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

## Structured Data (JSON-LD)

### Product Schema for Drops

```typescript
// components/DropSchema.tsx
export function DropSchema({ drop }: { drop: Drop }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: drop.title,
    description: drop.description,
    image: drop.imageUrl,
    offers: {
      '@type': 'Offer',
      price: drop.price,
      priceCurrency: 'USD',
      availability: drop.inventory > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://dropr.com/drops/${drop.id}`,
    },
    brand: {
      '@type': 'Brand',
      name: drop.curator.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Organization Schema

```typescript
// app/layout.tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dropr',
  url: 'https://dropr.com',
  logo: 'https://dropr.com/logo.png',
  sameAs: [
    'https://twitter.com/dropr',
    'https://instagram.com/dropr',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@dropr.com',
    contactType: 'Customer Service',
  },
};
```

### Breadcrumb Schema

```typescript
// components/Breadcrumbs.tsx
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://dropr.com${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

## Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dropr.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/drops`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/curators`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // Dynamic drop pages
  const drops = await db.drop.findMany({
    where: { status: 'LIVE' },
    select: { id: true, updatedAt: true },
  });

  const dropPages = drops.map((drop) => ({
    url: `${baseUrl}/drops/${drop.id}`,
    lastModified: drop.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Dynamic curator pages
  const curators = await db.curator.findMany({
    select: { id: true, updatedAt: true },
  });

  const curatorPages = curators.map((curator) => ({
    url: `${baseUrl}/curators/${curator.id}`,
    lastModified: curator.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...dropPages, ...curatorPages];
}
```

## Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/curator/dashboard/',
          '/profile/',
          '/checkout/',
        ],
      },
    ],
    sitemap: 'https://dropr.com/sitemap.xml',
  };
}
```

## URL Structure

Use clean, descriptive URLs:

```
✅ Good:
/drops
/drops/mechanical-keyboard-mystery-box
/curators/keycap-king
/drops?category=keyboards&status=live

❌ Avoid:
/drops?id=123
/p/12345
/curator.php?user=456
```

## Internal Linking

```typescript
// Strategic internal linking
<Link href="/drops">Browse all drops</Link>
<Link href={`/curators/${drop.curatorId}`}>View curator profile</Link>
<Link href="/drops?category=keyboards">More keyboard drops</Link>
```

## Canonical URLs

Prevent duplicate content:

```typescript
// app/drops/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://dropr.com/drops/${params.id}`,
    },
  };
}
```

## Image Optimization for SEO

```typescript
// Use descriptive filenames and alt text
<Image
  src="/drops/mechanical-keyboard-mystery-box.jpg"
  alt="Mechanical keyboard mystery box with custom keycaps and switches"
  width={800}
  height={600}
/>
```

## Performance for SEO

Google uses Core Web Vitals as ranking factors:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

See performance.md for optimization strategies.

## Content Guidelines

### Drop Descriptions

- Minimum 100 words for SEO value
- Include relevant keywords naturally
- Describe what's included
- Mention the community/niche
- Use bullet points for readability

### Curator Profiles

- Unique bio for each curator
- Mention specialties and niches
- Link to social profiles
- Showcase featured drops

## Social Sharing

### Open Graph Images

Create custom OG images for drops:

```typescript
// app/drops/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Drop Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const drop = await db.drop.findUnique({
    where: { id: params.id },
    select: { title: true, price: true, imageUrl: true }
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, #262083, #1a1560)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: 60, color: 'white' }}>{drop?.title}</h1>
          <p style={{ fontSize: 40, color: '#00ffff' }}>${drop?.price}</p>
        </div>
      </div>
    ),
    { ...size }
  );
}
```

## Monitoring SEO

### Google Search Console

- Submit sitemap
- Monitor indexing status
- Check for crawl errors
- Review search performance
- Identify top queries

### Tools

- Google Search Console
- Google Analytics 4
- Lighthouse (built into Chrome DevTools)
- PageSpeed Insights
- Ahrefs or SEMrush (optional)

## SEO Best Practices

- Write for humans, optimize for search engines
- Use descriptive, keyword-rich titles
- Create unique meta descriptions
- Implement proper heading hierarchy
- Use semantic HTML
- Optimize images with alt text
- Build internal linking structure
- Ensure fast page load times
- Make site mobile-friendly
- Use HTTPS
- Create quality, original content
- Update content regularly
- Build backlinks naturally (don't buy links)
- Monitor and fix broken links
- Use structured data where appropriate

## Common SEO Mistakes to Avoid

- Duplicate content across pages
- Missing or duplicate meta descriptions
- Broken internal links
- Slow page load times
- Not mobile-friendly
- Missing alt text on images
- Thin content (< 100 words)
- Keyword stuffing
- Hidden text or links
- Cloaking (showing different content to search engines)
- Buying backlinks
- Ignoring Core Web Vitals
