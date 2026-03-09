# Homepage & Drop Discovery - Design

## Overview

The homepage and drop discovery feature serves as the primary entry point for Dropr, providing four homepage variants that share a unified codebase while delivering tailored experiences through middleware-based filtering. The design implements an Airbnb Experiences-style horizontal scrolling interface with real-time updates, full-width spotlights, and comprehensive discovery features.

### Homepage Variants

1. **Main Homepage (dropr.com)**: Displays drops from all collectives (MOD + MAKE + MINI)
2. **Collective Subdomains**: mod.dropr.com, make.dropr.com, mini.dropr.com - filtered to specific collectives

### Key Design Principles

- **Unified Codebase**: Single component architecture with middleware-based filtering
- **Real-Time Updates**: SSE-powered countdown timers and inventory updates
- **Horizontal Scrolling**: Airbnb Experiences-style sections for engaging discovery
- **Mobile-First**: Responsive design optimized for all viewport sizes
- **Performance-Focused**: Core Web Vitals compliance with aggressive optimization
- **MVVM Architecture**: Thin views with fat ViewModels using scoped Zustand stores

## Architecture

### High-Level Component Structure

```
app/
├── page.tsx                           # Main homepage (dropr.com)
├── middleware.ts                      # Subdomain detection and filtering
├── api/
│   └── drops/
│       └── stream/
│           └── route.ts              # SSE endpoint for real-time updates
└── components/
    └── homepage/
        ├── HeroSection.tsx
        ├── FeaturedDropsSection.tsx
        ├── LiveUpcomingDropsSection.tsx
        ├── PopularCuratorsSection.tsx
        ├── FoundingCuratorsSection.tsx
        ├── CuratorSpotlight.tsx
        ├── DropSpotlight.tsx
        ├── ValuePropositionBuyers.tsx
        ├── ValuePropositionCurators.tsx
        ├── CollectiveSwitcher.tsx
        └── shared/
            ├── HorizontalScrollSection.tsx
            ├── DropCard.tsx
            ├── CuratorCard.tsx
            └── CountdownTimer.tsx

features/
└── homepage/
    ├── models/
    │   ├── homepage.types.ts
    │   └── homepage.actions.ts       # Server Actions
    ├── stores/
    │   └── homepage.store.ts         # Zustand ViewModel
    └── hooks/
        └── useHomepage.ts            # Context Provider + hook
```


### MVVM Pattern Implementation

The homepage follows the MVVM pattern with scoped Zustand stores:

**Model Layer** (features/homepage/models/):
- TypeScript types for Drop, Curator, HomepageData
- Server Actions for fetching drops, curators, and featured content
- Data transformation utilities

**ViewModel Layer** (features/homepage/stores/):
- Zustand store factory for homepage state management
- Client-side business logic (filtering, sorting, real-time updates)
- SSE subscription management
- Countdown calculation logic

**Glue Layer** (features/homepage/hooks/):
- Context Provider to scope store instances
- Custom hook to expose store with selectors

**View Layer** (app/components/homepage/):
- Thin React components consuming the hook
- Presentational logic only
- No direct Server Action calls

### Middleware Architecture

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const collective = detectCollective(hostname);
  
  // Add collective to request headers for Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-collective', collective);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function detectCollective(hostname: string): Collective | 'all' {
  if (hostname.startsWith('mod.')) return 'MOD';
  if (hostname.startsWith('make.')) return 'MAKE';
  if (hostname.startsWith('mini.')) return 'MINI';
  return 'all';
}
```


## Components and Interfaces

### Core Components

#### 1. HeroSection

**Purpose**: Above-the-fold content communicating value proposition

**Props**:
```typescript
interface HeroSectionProps {
  collective: Collective | 'all';
}
```

**Behavior**:
- Displays headline tailored to the collective or platform-wide for Main_Homepage
- Renders primary CTA (Browse Drops), secondary CTA (Sign Up), tertiary CTA (Become Curator)
- Hides CTAs based on authentication state (via useAuth hook)

**Variants**:
- Main Homepage: "Curated Drops for Makers & Modders"
- Collective Homepage: "Curated drops for [collective] enthusiasts"

#### 2. HorizontalScrollSection

**Purpose**: Reusable container for horizontally scrollable card grids

**Props**:
```typescript
interface HorizontalScrollSectionProps {
  title: string;
  items: Array<Drop | Curator>;
  renderCard: (item: Drop | Curator) => ReactNode;
  viewAllLink?: string;
  ariaLabel: string;
}
```

**Features**:
- Mouse drag scrolling (desktop)
- Touch swipe scrolling (mobile/tablet)
- Keyboard navigation (arrow keys, tab)
- Scroll indicators (left/right arrows) with visibility based on scroll position
- Snap-to-card boundaries
- Maintains scroll position during real-time updates
- ARIA labels for accessibility

**Implementation Details**:
- Uses CSS scroll-snap for smooth snapping
- Intersection Observer to detect scroll boundaries for arrow visibility
- useRef for scroll container manipulation
- Event listeners for mouse drag (mousedown, mousemove, mouseup)
- Touch event listeners for swipe (touchstart, touchmove, touchend)


#### 3. DropCard

**Purpose**: Display drop information in a compact, scannable format

**Props**:
```typescript
interface DropCardProps {
  drop: Drop;
  showCollectiveBadge: boolean;
  isFollowed?: boolean;
  onCardClick?: (dropId: string) => void;
  onFollowToggle?: (dropId: string, isFollowed: boolean) => void;
}

interface Drop {
  id: string;
  title: string;
  coverImageUrl: string;
  price: number;
  inventory: number;
  status: 'upcoming' | 'live' | 'sold_out';
  startTime: Date;
  endTime: Date;
  dropType: 'mystery_box' | 'surplus' | 'limited_edition';
  collective: 'MOD' | 'MAKE' | 'MINI';
  curator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  averageRating?: number;
}
```

**Display Elements**:
- Cover image (Next.js Image with optimization)
- Title (truncated to 2 lines)
- Price
- Curator name with verification badge
- Countdown timer (upcoming or live)
- Inventory status ("23 left" or "Sold Out")
- Drop type badge
- Collective badge (only on Main Homepage)
- Average rating (if reviews exist)
- Follow icon (bookmark, heart, or bell) with toggle state

**Follow Icon Behavior**:
- Displays in top-right corner of card
- Shows "unfollowed" state (outline icon) by default
- Shows "followed" state (filled icon or different color) when drop is followed
- Clicking when unauthenticated redirects to login flow
- Clicking when authenticated toggles follow state with optimistic UI update
- Accessible via keyboard (tab to focus, enter/space to toggle)
- ARIA label: "Follow drop" or "Unfollow drop"

**States**:
- Default: Standard display
- Hover (desktop): Preview tooltip with description snippet
- Sold Out: Overlay with "Sold Out" message
- Loading: Skeleton placeholder
- Followed: Follow icon shows filled/active state

#### 4. CuratorCard

**Purpose**: Display curator information emphasizing the person/team

**Props**:
```typescript
interface CuratorCardProps {
  curator: Curator;
  showFoundingBadge?: boolean;
  onCardClick?: (curatorId: string) => void;
}

interface Curator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  reputationScore: number;
  completedDrops: number;
  averageRating: number;
  verified: boolean;
  founding: boolean;
  collective: 'MOD' | 'MAKE' | 'MINI';
}
```

**Display Elements**:
- Avatar (circular, high-quality)
- Name (emphasize person, not brand)
- Bio snippet (truncated to 3 lines)
- Reputation score
- Completed drops count
- Average rating
- Verification badge
- Founding Curator badge (if applicable)


#### 5. CountdownTimer

**Purpose**: Real-time countdown display for drops with appropriate detail levels

**Props**:
```typescript
interface CountdownTimerProps {
  targetTime: Date;
  status: 'upcoming' | 'live';
  onComplete?: () => void;
}
```

**Behavior**:
- Calculates time difference on client side (no server calls)
- Updates at appropriate intervals based on time remaining
- Displays format based on time remaining (same logic for both upcoming and live)
- Calls onComplete callback when countdown reaches zero
- Handles timezone differences using browser's local time
- Visually distinguishes between upcoming and live timers (color, icon, styling)

**Display Rules (applies to both upcoming and live drops):**
- > 2 hours remaining: "2+ hours" (static, no updates needed)
- < 2 hours and > 1 hour remaining: "1 hr, X min" format, updates every 15 minutes
- < 1 hour remaining: "Xm Ys" format, updates every second

**Visual Distinction:**
- Upcoming timer: Use neutral or anticipatory color (e.g., blue, gray)
- Live timer: Use urgent color (e.g., red, orange) to indicate drop is ending

**Implementation**:
```typescript
function calculateCountdown(targetTime: Date, status: 'upcoming' | 'live'): CountdownData {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { expired: true, display: '', updateInterval: 0 };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  // Same display logic for both upcoming and live drops
  if (hours >= 2) {
    // > 2 hours: show "2+ hours", no updates needed
    return {
      expired: false,
      display: '2+ hours',
      updateInterval: 0, // Static display
      status,
    };
  } else if (hours >= 1) {
    // 1-2 hours: show "1 hr, X min", update every 15 minutes
    return {
      expired: false,
      display: `1 hr, ${minutes} min`,
      updateInterval: 15 * 60 * 1000, // 15 minutes
      status,
    };
  } else {
    // < 1 hour: show "Xm Ys", update every second
    return {
      expired: false,
      display: `${minutes}m ${seconds}s`,
      updateInterval: 1000,
      status,
    };
  }
}
```

#### 6. CuratorSpotlight

**Purpose**: Full-width teaser section highlighting a featured curator to drive traffic to their profile page

**Props**:
```typescript
interface CuratorSpotlightProps {
  curator: FeaturedCurator;
  recentDrops: Drop[];
}

interface FeaturedCurator extends Curator {
  heroImage: string;
  totalDrops: number;
  recentDrops: Drop[];
}
```

**Layout**:
- Full viewport width
- Split layout: 50% curator info, 50% hero image (desktop)
- Stacked layout on mobile
- Recent drops preview in horizontal scroll (3-5 drops)
- Prominent "View Profile" CTA button

**Content Strategy**:
- Display curator avatar, name, and bio snippet (teaser only)
- Show total drops count as social proof
- Preview 3-5 recent drops to showcase curation style
- Use engaging imagery to entice profile visits
- Detailed information (followers, rating, past drops, full story) lives on curator profile page


#### 7. DropSpotlight

**Purpose**: Full-width section highlighting a featured drop

**Props**:
```typescript
interface DropSpotlightProps {
  drop: FeaturedDrop;
}

interface FeaturedDrop extends Drop {
  description: string;
  heroImage: string;
  theme: string;
}
```

**Layout**:
- Full viewport width
- Hero image background with overlay
- Drop information overlaid on image
- Curator info card
- "View Drop" and "Add to Cart" CTAs
- Countdown timer prominently displayed

#### 8. CollectiveSwitcher

**Purpose**: Navigation between homepage variants

**Props**:
```typescript
interface CollectiveSwitcherProps {
  currentCollective: Collective | 'all';
}
```

**Display**:
- Four options: "All" (dropr.com), "MOD", "MAKE", "MINI"
- Highlights current selection
- Collective-specific colors and icons
- Accessible via keyboard navigation
- Mobile-friendly dropdown on small screens

**Behavior**:
- Clicking "All" navigates to dropr.com
- Clicking collective navigates to subdomain (mod.dropr.com, etc.)
- Preserves scroll position on navigation (if possible)


## Data Models

### TypeScript Types

```typescript
// features/homepage/models/homepage.types.ts

export type Collective = 'MOD' | 'MAKE' | 'MINI';

export type DropStatus = 'upcoming' | 'live' | 'sold_out';

export type DropType = 'mystery_box' | 'surplus' | 'limited_edition';

export interface Drop {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price: number;
  inventory: number;
  status: DropStatus;
  startTime: Date;
  endTime: Date;
  dropType: DropType;
  collective: Collective;
  featured: boolean;
  curator: CuratorSummary;
  averageRating?: number;
  reviewCount: number;
}

export interface CuratorSummary {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

export interface Curator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  reputationScore: number;
  completedDrops: number;
  averageRating: number;
  verified: boolean;
  founding: boolean;
  collective: Collective;
}

export interface FeaturedCurator extends Curator {
  heroImage: string;
  totalDrops: number;
  recentDrops: Drop[];
}

export interface FeaturedDrop extends Drop {
  heroImage: string;
  theme: string;
}

export interface HomepageData {
  collective: Collective | 'all';
  featuredDrops: Drop[];
  liveUpcomingDrops: Drop[];
  foundingCurators: Curator[];
  popularModders?: Curator[];
  popularMakers?: Curator[];
  popularMinists?: Curator[];
  curatorSpotlights: FeaturedCurator[];
  dropSpotlights: FeaturedDrop[];
  stats: PlatformStats;
}

export interface PlatformStats {
  totalDrops: number;
  totalCurators: number;
  totalBuyers: number;
  averageRating: number;
}

export interface FilterOptions {
  dropType?: DropType[];
  priceRange?: { min: number; max: number };
  status?: DropStatus[];
  collective?: Collective[];
}

export interface SortOption {
  field: 'createdAt' | 'startTime' | 'price';
  direction: 'asc' | 'desc';
}
```


### Server Actions

```typescript
// features/homepage/models/homepage.actions.ts
'use server'

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import type { HomepageData, Drop, Curator, FilterOptions, SortOption } from './homepage.types';

/**
 * Fetches all homepage data based on collective context
 * Cached for 60 seconds with revalidation
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  const headersList = headers();
  const collective = (headersList.get('x-collective') || 'all') as Collective | 'all';
  
  return await getCachedHomepageData(collective);
}

const getCachedHomepageData = unstable_cache(
  async (collective: Collective | 'all') => {
    const [
      featuredDrops,
      liveUpcomingDrops,
      foundingCurators,
      popularCurators,
      curatorSpotlights,
      dropSpotlights,
      stats,
    ] = await Promise.all([
      fetchFeaturedDrops(collective),
      fetchLiveUpcomingDrops(collective),
      fetchFoundingCurators(collective),
      fetchPopularCurators(collective),
      fetchCuratorSpotlights(collective),
      fetchDropSpotlights(collective),
      fetchPlatformStats(),
    ]);
    
    // Split popular curators by collective for Main Homepage
    const popularModders = collective === 'all' 
      ? popularCurators.filter(c => c.collective === 'MOD')
      : undefined;
    const popularMakers = collective === 'all'
      ? popularCurators.filter(c => c.collective === 'MAKE')
      : undefined;
    const popularMinists = collective === 'all'
      ? popularCurators.filter(c => c.collective === 'MINI')
      : undefined;
    
    return {
      collective,
      featuredDrops,
      liveUpcomingDrops,
      foundingCurators,
      popularModders,
      popularMakers,
      popularMinists,
      curatorSpotlights,
      dropSpotlights,
      stats,
    };
  },
  ['homepage-data'],
  { tags: ['homepage'], revalidate: 60 }
);

/**
 * Fetches featured drops with optional collective filtering
 */
async function fetchFeaturedDrops(collective: Collective | 'all'): Promise<Drop[]> {
  const where = {
    featured: true,
    status: { in: ['upcoming', 'live'] },
    ...(collective !== 'all' && { collective }),
  };
  
  const drops = await db.drop.findMany({
    where,
    take: 12,
    orderBy: { startTime: 'asc' },
    include: {
      curator: {
        include: { user: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });
  
  return drops.map(transformDropFromPrisma);
}

/**
 * Fetches live and upcoming drops
 */
async function fetchLiveUpcomingDrops(collective: Collective | 'all'): Promise<Drop[]> {
  const now = new Date();
  
  const where = {
    status: { in: ['upcoming', 'live'] },
    ...(collective !== 'all' && { collective }),
  };
  
  const drops = await db.drop.findMany({
    where,
    take: 16,
    orderBy: [
      { status: 'desc' }, // live first
      { startTime: 'asc' },
    ],
    include: {
      curator: {
        include: { user: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });
  
  return drops.map(transformDropFromPrisma);
}

/**
 * Fetches founding curators
 */
async function fetchFoundingCurators(collective: Collective | 'all'): Promise<Curator[]> {
  const where = {
    founding: true,
    ...(collective !== 'all' && { collective }),
  };
  
  const curators = await db.curator.findMany({
    where,
    take: 15,
    orderBy: { reputationScore: 'desc' },
    include: {
      user: true,
      drops: {
        where: { status: 'completed' },
        select: { id: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });
  
  return curators.map(transformCuratorFromPrisma);
}

/**
 * Fetches popular curators by collective
 */
async function fetchPopularCurators(collective: Collective | 'all'): Promise<Curator[]> {
  const where = collective !== 'all' ? { collective } : {};
  
  const curators = await db.curator.findMany({
    where,
    take: collective === 'all' ? 36 : 12, // 12 per collective for Main Homepage
    orderBy: { reputationScore: 'desc' },
    include: {
      user: true,
      drops: {
        where: { status: 'completed' },
        select: { id: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });
  
  return curators.map(transformCuratorFromPrisma);
}

/**
 * Fetches curator spotlights
 */
async function fetchCuratorSpotlights(collective: Collective | 'all'): Promise<FeaturedCurator[]> {
  const where = {
    spotlightActive: true,
    ...(collective !== 'all' && { collective }),
  };
  
  const curators = await db.curator.findMany({
    where,
    take: 3,
    orderBy: { spotlightPriority: 'desc' },
    include: {
      user: true,
      drops: {
        where: { status: { in: ['upcoming', 'live'] } },
        take: 5,
        orderBy: { startTime: 'asc' },
        include: {
          curator: { include: { user: true } },
          reviews: { select: { rating: true } },
        },
      },
      reviews: {
        select: { rating: true },
      },
      _count: {
        select: {
          drops: true,
        },
      },
    },
  });
  
  return curators.map(transformFeaturedCuratorFromPrisma);
}

/**
 * Fetches drop spotlights
 */
async function fetchDropSpotlights(collective: Collective | 'all'): Promise<FeaturedDrop[]> {
  const where = {
    spotlightActive: true,
    status: { in: ['upcoming', 'live'] },
    ...(collective !== 'all' && { collective }),
  };
  
  const drops = await db.drop.findMany({
    where,
    take: 2,
    orderBy: { spotlightPriority: 'desc' },
    include: {
      curator: {
        include: { user: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });
  
  return drops.map(transformFeaturedDropFromPrisma);
}

/**
 * Fetches platform statistics
 */
async function fetchPlatformStats(): Promise<PlatformStats> {
  const [totalDrops, totalCurators, totalBuyers, avgRating] = await Promise.all([
    db.drop.count({ where: { status: 'completed' } }),
    db.curator.count({ where: { verified: true } }),
    db.user.count({ where: { role: 'BUYER' } }),
    db.review.aggregate({ _avg: { rating: true } }),
  ]);
  
  return {
    totalDrops,
    totalCurators,
    totalBuyers,
    averageRating: avgRating._avg.rating || 0,
  };
}

// Transform functions to convert Prisma models to app types
function transformDropFromPrisma(prismaData: any): Drop {
  const reviews = prismaData.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : undefined;
  
  return {
    id: prismaData.id,
    title: prismaData.title,
    description: prismaData.description,
    coverImageUrl: prismaData.coverImageUrl,
    price: prismaData.price,
    inventory: prismaData.inventory,
    status: prismaData.status,
    startTime: prismaData.startTime,
    endTime: prismaData.endTime,
    dropType: prismaData.dropType,
    collective: prismaData.collective,
    featured: prismaData.featured,
    curator: {
      id: prismaData.curator.id,
      name: prismaData.curator.user.name,
      avatar: prismaData.curator.user.image,
      verified: prismaData.curator.verified,
    },
    averageRating,
    reviewCount: reviews.length,
  };
}

function transformCuratorFromPrisma(prismaData: any): Curator {
  const reviews = prismaData.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;
  
  return {
    id: prismaData.id,
    name: prismaData.user.name,
    avatar: prismaData.user.image,
    bio: prismaData.bio,
    reputationScore: prismaData.reputationScore,
    completedDrops: prismaData.drops.length,
    averageRating,
    verified: prismaData.verified,
    founding: prismaData.founding,
    collective: prismaData.collective,
  };
}

function transformFeaturedCuratorFromPrisma(prismaData: any): FeaturedCurator {
  const baseCurator = transformCuratorFromPrisma(prismaData);
  
  return {
    ...baseCurator,
    heroImage: prismaData.heroImage,
    totalDrops: prismaData._count.drops,
    recentDrops: prismaData.drops.map(transformDropFromPrisma),
  };
}

function transformFeaturedDropFromPrisma(prismaData: any): FeaturedDrop {
  const baseDrop = transformDropFromPrisma(prismaData);
  
  return {
    ...baseDrop,
    heroImage: prismaData.heroImage,
    theme: prismaData.theme,
  };
}

/**
 * Invalidates homepage cache (called after drop/curator updates)
 */
export async function revalidateHomepage() {
  'use server'
  const { revalidateTag } = await import('next/cache');
  revalidateTag('homepage');
}
```


### Real-Time Updates via SSE

```typescript
// app/api/drops/stream/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for real-time drop updates
 * Streams countdown, inventory, and status changes
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const drops = await fetchActiveDrops();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(drops)}\n\n`));
      
      // Update every second
      const interval = setInterval(async () => {
        try {
          const drops = await fetchActiveDrops();
          const data = drops.map(drop => ({
            id: drop.id,
            inventory: drop.inventory,
            status: drop.status,
            // Client calculates countdown from these timestamps
            startTime: drop.startTime.toISOString(),
            endTime: drop.endTime.toISOString(),
          }));
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('SSE error:', error);
        }
      }, 1000);
      
      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

async function fetchActiveDrops() {
  return await db.drop.findMany({
    where: {
      status: { in: ['upcoming', 'live'] },
    },
    select: {
      id: true,
      inventory: true,
      status: true,
      startTime: true,
      endTime: true,
    },
  });
}
```


### ViewModel: Zustand Store

```typescript
// features/homepage/stores/homepage.store.ts
'use client'

import { createStore } from 'zustand';
import { fetchHomepageData } from '../models/homepage.actions';
import type { HomepageData, Drop, FilterOptions, SortOption } from '../models/homepage.types';

export interface HomepageStore {
  // State
  data: HomepageData | null;
  loading: boolean;
  error: string | null;
  eventSource: EventSource | null;
  filters: FilterOptions;
  sort: SortOption;
  followedDropIds: Set<string>;
  
  // Actions
  loadHomepageData: () => Promise<void>;
  subscribeToDropUpdates: () => void;
  unsubscribe: () => void;
  updateDropFromSSE: (dropUpdate: Partial<Drop>) => void;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
  toggleFollowDrop: (dropId: string) => Promise<void>;
  loadFollowedDrops: () => Promise<void>;
}

export const createHomepageStore = () => {
  return createStore<HomepageStore>((set, get) => ({
    // Initial state
    data: null,
    loading: false,
    error: null,
    eventSource: null,
    filters: {},
    sort: { field: 'startTime', direction: 'asc' },
    
    // Load homepage data
    loadHomepageData: async () => {
      set({ loading: true, error: null });
      
      try {
        const data = await fetchHomepageData();
        set({ data, loading: false });
        
        // Subscribe to real-time updates after initial load
        get().subscribeToDropUpdates();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load homepage',
          loading: false 
        });
      }
    },
    
    // Subscribe to SSE for real-time updates
    subscribeToDropUpdates: () => {
      const eventSource = new EventSource('/api/drops/stream');
      
      eventSource.onmessage = (event) => {
        try {
          const updates = JSON.parse(event.data);
          
          // Update each drop with new data
          updates.forEach((update: any) => {
            get().updateDropFromSSE({
              id: update.id,
              inventory: update.inventory,
              status: update.status,
              startTime: new Date(update.startTime),
              endTime: new Date(update.endTime),
            });
          });
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        
        // Retry connection after 5 seconds
        setTimeout(() => {
          if (get().eventSource === eventSource) {
            get().subscribeToDropUpdates();
          }
        }, 5000);
      };
      
      set({ eventSource });
    },
    
    // Unsubscribe from SSE
    unsubscribe: () => {
      const { eventSource } = get();
      if (eventSource) {
        eventSource.close();
        set({ eventSource: null });
      }
    },
    
    // Update a single drop from SSE data
    updateDropFromSSE: (dropUpdate) => {
      set((state) => {
        if (!state.data) return state;
        
        const updateDropInArray = (drops: Drop[]) => 
          drops.map(drop => 
            drop.id === dropUpdate.id 
              ? { ...drop, ...dropUpdate }
              : drop
          );
        
        return {
          data: {
            ...state.data,
            featuredDrops: updateDropInArray(state.data.featuredDrops),
            liveUpcomingDrops: updateDropInArray(state.data.liveUpcomingDrops),
            dropSpotlights: state.data.dropSpotlights.map(spotlight =>
              spotlight.id === dropUpdate.id
                ? { ...spotlight, ...dropUpdate }
                : spotlight
            ),
          },
        };
      });
    },
    
    // Set filters
    setFilters: (filters) => {
      set({ filters });
    },
    
    // Set sort
    setSort: (sort) => {
      set({ sort });
    },
    
    // Clear all filters
    clearFilters: () => {
      set({ filters: {} });
    },
    
    // Toggle follow drop
    toggleFollowDrop: async (dropId: string) => {
      const { followedDropIds } = get();
      const isCurrentlyFollowed = followedDropIds.has(dropId);
      
      // Optimistic UI update
      const newFollowedDropIds = new Set(followedDropIds);
      if (isCurrentlyFollowed) {
        newFollowedDropIds.delete(dropId);
      } else {
        newFollowedDropIds.add(dropId);
      }
      set({ followedDropIds: newFollowedDropIds });
      
      try {
        // Call Server Action to persist follow state
        // Implementation will be in separate user dashboard spec
        // await toggleDropFollow(dropId);
      } catch (error) {
        // Revert optimistic update on error
        set({ followedDropIds });
        console.error('Failed to toggle drop follow:', error);
      }
    },
    
    // Load followed drops for authenticated user
    loadFollowedDrops: async () => {
      try {
        // Call Server Action to fetch user's followed drops
        // Implementation will be in separate user dashboard spec
        // const followedIds = await fetchFollowedDropIds();
        // set({ followedDropIds: new Set(followedIds) });
      } catch (error) {
        console.error('Failed to load followed drops:', error);
      }
    },
  }));
};
```


### Glue Layer: Context Provider and Hook

```typescript
// features/homepage/hooks/useHomepage.ts
'use client'

import { createContext, useContext, useRef, useEffect } from 'react';
import { useStore } from 'zustand';
import { createHomepageStore, HomepageStore } from '../stores/homepage.store';

const HomepageStoreContext = createContext<ReturnType<typeof createHomepageStore> | null>(null);

export function HomepageStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createHomepageStore());
  
  useEffect(() => {
    const store = storeRef.current;
    const state = store.getState();
    
    // Load data on mount
    state.loadHomepageData();
    
    // Cleanup on unmount
    return () => {
      state.unsubscribe();
    };
  }, []);
  
  return (
    <HomepageStoreContext.Provider value={storeRef.current}>
      {children}
    </HomepageStoreContext.Provider>
  );
}

export function useHomepage<T>(selector: (state: HomepageStore) => T): T {
  const store = useContext(HomepageStoreContext);
  if (!store) {
    throw new Error('useHomepage must be used within HomepageStoreProvider');
  }
  return useStore(store, selector);
}

// Convenience hooks for common selectors
export function useHomepageData() {
  return useHomepage((state) => state.data);
}

export function useHomepageLoading() {
  return useHomepage((state) => state.loading);
}

export function useHomepageError() {
  return useHomepage((state) => state.error);
}

export function useFeaturedDrops() {
  return useHomepage((state) => state.data?.featuredDrops || []);
}

export function useLiveUpcomingDrops() {
  const drops = useHomepage((state) => state.data?.liveUpcomingDrops || []);
  const filters = useHomepage((state) => state.filters);
  const sort = useHomepage((state) => state.sort);
  
  // Apply filters
  let filtered = drops;
  
  if (filters.dropType && filters.dropType.length > 0) {
    filtered = filtered.filter(drop => filters.dropType!.includes(drop.dropType));
  }
  
  if (filters.priceRange) {
    filtered = filtered.filter(drop => 
      drop.price >= filters.priceRange!.min && 
      drop.price <= filters.priceRange!.max
    );
  }
  
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(drop => filters.status!.includes(drop.status));
  }
  
  if (filters.collective && filters.collective.length > 0) {
    filtered = filtered.filter(drop => filters.collective!.includes(drop.collective));
  }
  
  // Apply sort
  const sorted = [...filtered].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];
    
    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

export function useFoundingCurators() {
  return useHomepage((state) => state.data?.foundingCurators || []);
}

export function usePopularCurators(collective?: 'MOD' | 'MAKE' | 'MINI') {
  return useHomepage((state) => {
    if (!state.data) return [];
    
    if (collective === 'MOD') return state.data.popularModders || [];
    if (collective === 'MAKE') return state.data.popularMakers || [];
    if (collective === 'MINI') return state.data.popularMinists || [];
    
    // Return all if no collective specified
    return [
      ...(state.data.popularModders || []),
      ...(state.data.popularMakers || []),
      ...(state.data.popularMinists || []),
    ];
  });
}

export function useCuratorSpotlights() {
  return useHomepage((state) => state.data?.curatorSpotlights || []);
}

export function useDropSpotlights() {
  return useHomepage((state) => state.data?.dropSpotlights || []);
}

export function usePlatformStats() {
  return useHomepage((state) => state.data?.stats);
}

export function useFilters() {
  return useHomepage((state) => state.filters);
}

export function useSetFilters() {
  return useHomepage((state) => state.setFilters);
}

export function useSort() {
  return useHomepage((state) => state.sort);
}

export function useSetSort() {
  return useHomepage((state) => state.setSort);
}

export function useClearFilters() {
  return useHomepage((state) => state.clearFilters);
}
```


## Horizontal Scroll Implementation

### Technical Approach

The horizontal scroll sections use a combination of CSS scroll-snap and JavaScript event handling to provide smooth, intuitive scrolling across all devices.

### CSS Implementation

```css
/* Horizontal scroll container */
.horizontal-scroll-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
  
  /* Hide scrollbar on mobile */
  @media (max-width: 768px) {
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  /* Custom scrollbar on desktop */
  @media (min-width: 769px) {
    &::-webkit-scrollbar {
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  }
}

/* Card snap points */
.horizontal-scroll-item {
  scroll-snap-align: start;
  flex-shrink: 0;
  
  /* Card widths by viewport */
  width: 280px; /* Mobile (≤768px) */
  
  @media (min-width: 769px) {
    width: 320px; /* Desktop (>768px) */
  }
}

/* Scroll indicators */
.scroll-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  
  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0;
    pointer-events: none;
  }
  
  &.left {
    left: 1rem;
  }
  
  &.right {
    right: 1rem;
  }
  
  /* Hide on mobile */
  @media (max-width: 768px) {
    display: none;
  }
}
```


### JavaScript Implementation

```typescript
// components/homepage/shared/HorizontalScrollSection.tsx
'use client'

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollSectionProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
  ariaLabel: string;
}

export function HorizontalScrollSection({
  title,
  children,
  viewAllLink,
  ariaLabel,
}: HorizontalScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Check scroll boundaries
  const checkScrollBoundaries = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);
  
  // Scroll by one card width
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const cardWidth = 360; // Desktop card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };
  
  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    container.scrollLeft = scrollLeft - walk;
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  };
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };
  
  // Setup scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    checkScrollBoundaries();
    container.addEventListener('scroll', checkScrollBoundaries);
    
    return () => {
      container.removeEventListener('scroll', checkScrollBoundaries);
    };
  }, [checkScrollBoundaries]);
  
  // Check boundaries when children change (real-time updates)
  useEffect(() => {
    checkScrollBoundaries();
  }, [children, checkScrollBoundaries]);
  
  return (
    <section className="horizontal-scroll-section" aria-label={ariaLabel}>
      <div className="section-header">
        <h2>{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="view-all-link">
            View All
          </a>
        )}
      </div>
      
      <div className="scroll-wrapper">
        <button
          className="scroll-indicator left"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div
          ref={scrollContainerRef}
          className="horizontal-scroll-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label={`${title} scrollable content`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {children}
        </div>
        
        <button
          className="scroll-indicator right"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
```

### Touch Swipe Support

Touch events are handled natively by the browser's scroll behavior. The CSS `scroll-snap-type: x mandatory` ensures smooth snapping on touch devices without additional JavaScript.

### Accessibility Features

- Keyboard navigation with arrow keys
- Focus management with tabIndex
- ARIA labels for screen readers
- Skip links for keyboard users
- Focus indicators on interactive elements


## Responsive Design Strategy

### Breakpoints

```typescript
// lib/constants/breakpoints.ts
export const breakpoints = {
  mobile: 320,
  desktop: 768,
} as const;
```

### Layout Variations

#### Mobile (≤ 768px)
- Two-column grid for drop cards
- Horizontal scroll sections with touch swipe
- Stacked full-width spotlights
- Collapsed navigation with hamburger menu
- Touch-friendly tap targets (minimum 44x44px)

#### Desktop (> 768px)
- Four-column grid for drop cards
- Horizontal scroll sections with mouse drag and arrows
- Split layout for full-width spotlights (50/50)
- Full navigation with collective switcher

### Responsive Images

```typescript
// components/homepage/shared/ResponsiveImage.tsx
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function ResponsiveImage({ src, alt, priority = false }: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 25vw"
      priority={priority}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Low-quality placeholder
    />
  );
}
```


## Error Handling

### Error Boundaries

```typescript
// components/homepage/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class HomepageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Homepage error:', error, errorInfo);
    
    // Log to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>We're having trouble loading the homepage. Please try refreshing.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Empty States

```typescript
// components/homepage/EmptyState.tsx
interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {action && (
        <a href={action.href} className="cta-button">
          {action.label}
        </a>
      )}
    </div>
  );
}

// Usage
function FeaturedDropsSection() {
  const drops = useFeaturedDrops();
  
  if (drops.length === 0) {
    return (
      <EmptyState
        title="No drops available"
        message="Check back soon for new curated drops from our community"
        action={{
          label: "Follow Curators",
          href: "/curators"
        }}
      />
    );
  }
  
  return <HorizontalScrollSection>{/* drops */}</HorizontalScrollSection>;
}
```

### Loading States

```typescript
// components/homepage/LoadingState.tsx
export function DropCardSkeleton() {
  return (
    <div className="drop-card skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-text skeleton-text--title" />
      <div className="skeleton-text skeleton-text--subtitle" />
      <div className="skeleton-text skeleton-text--price" />
    </div>
  );
}

export function HorizontalScrollSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="horizontal-scroll-container">
      {Array.from({ length: count }).map((_, i) => (
        <DropCardSkeleton key={i} />
      ))}
    </div>
  );
}
```


## Testing Strategy

### Unit Testing

Unit tests focus on individual components and utility functions in isolation.

**Test Coverage:**
- Countdown calculation logic
- Filter and sort functions
- Theme configuration selection
- Data transformation utilities
- Component rendering with mocked data

**Example Unit Test:**
```typescript
// features/homepage/models/homepage.utils.test.ts
import { describe, it, expect } from '@jest/globals';
import { calculateCountdown } from './homepage.utils';

describe('calculateCountdown', () => {
  it('should calculate days, hours, minutes, seconds correctly', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const target = new Date('2024-01-02T05:30:45Z');
    
    const result = calculateCountdown(target, now);
    
    expect(result.expired).toBe(false);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(5);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(45);
  });
  
  it('should mark as expired when target is in the past', () => {
    const now = new Date('2024-01-02T00:00:00Z');
    const target = new Date('2024-01-01T00:00:00Z');
    
    const result = calculateCountdown(target, now);
    
    expect(result.expired).toBe(true);
  });
});
```

### Component Testing

Component tests verify rendering and user interactions with React Testing Library.

**Example Component Test:**
```typescript
// components/homepage/DropCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DropCard } from './DropCard';

describe('DropCard', () => {
  const mockDrop = {
    id: '1',
    title: 'Mechanical Keyboard Mystery Box',
    coverImageUrl: '/images/drop.jpg',
    price: 49.99,
    inventory: 23,
    status: 'live' as const,
    startTime: new Date('2024-01-01'),
    endTime: new Date('2024-01-10'),
    dropType: 'mystery_box' as const,
    collective: 'MOD' as const,
    curator: {
      id: 'c1',
      name: 'KeycapKing',
      avatar: '/avatars/curator.jpg',
      verified: true,
    },
    averageRating: 4.8,
    reviewCount: 42,
  };
  
  it('should render drop information', () => {
    render(<DropCard drop={mockDrop} showCollectiveBadge={true} />);
    
    expect(screen.getByText('Mechanical Keyboard Mystery Box')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('23 left')).toBeInTheDocument();
    expect(screen.getByText('KeycapKing')).toBeInTheDocument();
  });
  
  it('should show collective badge when showCollectiveBadge is true', () => {
    render(<DropCard drop={mockDrop} showCollectiveBadge={true} />);
    
    expect(screen.getByText('MOD')).toBeInTheDocument();
  });
  
  it('should not show collective badge when showCollectiveBadge is false', () => {
    render(<DropCard drop={mockDrop} showCollectiveBadge={false} />);
    
    expect(screen.queryByText('MOD')).not.toBeInTheDocument();
  });
  
  it('should call onCardClick when clicked', () => {
    const handleClick = jest.fn();
    render(<DropCard drop={mockDrop} showCollectiveBadge={true} onCardClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('article'));
    
    expect(handleClick).toHaveBeenCalledWith('1');
  });
  
  it('should show sold out overlay when inventory is 0', () => {
    const soldOutDrop = { ...mockDrop, inventory: 0, status: 'sold_out' as const };
    render(<DropCard drop={soldOutDrop} showCollectiveBadge={true} />);
    
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });
});
```


### Property-Based Testing

Property-based tests verify universal properties across many generated inputs using a PBT library (fast-check for TypeScript).

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: homepage-drop-discovery, Property {number}: {property_text}`

**Example Property Test:**
```typescript
// features/homepage/models/homepage.properties.test.ts
import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { applyFilters, applySorting } from './homepage.utils';

describe('Homepage Property Tests', () => {
  /**
   * Feature: homepage-drop-discovery, Property 1: Filter preservation
   * For any list of drops and any valid filter options, applying filters
   * should return a subset of the original list
   */
  it('should preserve drop list subset when filtering', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        filterOptionsArbitrary(),
        (drops, filters) => {
          const filtered = applyFilters(drops, filters);
          
          // Every filtered drop should exist in original list
          filtered.every(drop => drops.some(d => d.id === drop.id));
          
          // Filtered list should be <= original list
          expect(filtered.length).toBeLessThanOrEqual(drops.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: homepage-drop-discovery, Property 2: Sort stability
   * For any list of drops and any sort option, sorting twice should
   * produce the same result
   */
  it('should produce stable sort results', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        sortOptionArbitrary(),
        (drops, sortOption) => {
          const sorted1 = applySorting([...drops], sortOption);
          const sorted2 = applySorting([...drops], sortOption);
          
          expect(sorted1).toEqual(sorted2);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: homepage-drop-discovery, Property 3: Countdown monotonicity
   * For any target time in the future, calculating countdown at time T1
   * and then at time T2 (where T2 > T1) should show less time remaining
   */
  it('should show decreasing time in countdown', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date() }),
        fc.nat(1000), // milliseconds to add
        (targetTime, msDelay) => {
          const now1 = new Date();
          const now2 = new Date(now1.getTime() + msDelay);
          
          const countdown1 = calculateCountdown(targetTime, now1);
          const countdown2 = calculateCountdown(targetTime, now2);
          
          if (!countdown1.expired && !countdown2.expired) {
            const total1 = countdown1.days * 86400 + countdown1.hours * 3600 + 
                          countdown1.minutes * 60 + countdown1.seconds;
            const total2 = countdown2.days * 86400 + countdown2.hours * 3600 + 
                          countdown2.minutes * 60 + countdown2.seconds;
            
            expect(total2).toBeLessThanOrEqual(total1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Arbitraries for generating test data
function dropArbitrary() {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    price: fc.float({ min: 5, max: 10000 }),
    inventory: fc.nat(1000),
    status: fc.constantFrom('upcoming', 'live', 'sold_out'),
    dropType: fc.constantFrom('mystery_box', 'surplus', 'limited_edition'),
    collective: fc.constantFrom('MOD', 'MAKE', 'MINI'),
    startTime: fc.date(),
    endTime: fc.date(),
  });
}

function filterOptionsArbitrary() {
  return fc.record({
    dropType: fc.option(fc.array(fc.constantFrom('mystery_box', 'surplus', 'limited_edition'))),
    priceRange: fc.option(fc.record({
      min: fc.float({ min: 0, max: 5000 }),
      max: fc.float({ min: 5000, max: 10000 }),
    })),
    status: fc.option(fc.array(fc.constantFrom('upcoming', 'live', 'sold_out'))),
    collective: fc.option(fc.array(fc.constantFrom('MOD', 'MAKE', 'MINI'))),
  });
}

function sortOptionArbitrary() {
  return fc.record({
    field: fc.constantFrom('createdAt', 'startTime', 'price'),
    direction: fc.constantFrom('asc', 'desc'),
  });
}
```

### Integration Testing

Integration tests verify full user flows with Playwright.

**Example Integration Test:**
```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display featured drops', async ({ page }) => {
    await page.goto('/');
    
    // Wait for homepage to load
    await expect(page.locator('h1')).toContainText('Curated Drops');
    
    // Check featured drops section exists
    const featuredSection = page.locator('[aria-label="Featured drops"]');
    await expect(featuredSection).toBeVisible();
    
    // Check at least one drop card is visible
    const dropCards = page.locator('.drop-card');
    await expect(dropCards.first()).toBeVisible();
  });
  
  test('should navigate to drop detail when card is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click first drop card
    await page.locator('.drop-card').first().click();
    
    // Should navigate to drop detail page
    await expect(page).toHaveURL(/\/drops\/.+/);
  });
  
  test('should support horizontal scrolling with mouse drag', async ({ page }) => {
    await page.goto('/');
    
    const scrollContainer = page.locator('.horizontal-scroll-container').first();
    const initialScroll = await scrollContainer.evaluate(el => el.scrollLeft);
    
    // Simulate drag
    await scrollContainer.hover();
    await page.mouse.down();
    await page.mouse.move(-200, 0);
    await page.mouse.up();
    
    const finalScroll = await scrollContainer.evaluate(el => el.scrollLeft);
    
    expect(finalScroll).toBeGreaterThan(initialScroll);
  });
  
  test('should filter drops by collective on Main Homepage', async ({ page }) => {
    await page.goto('/');
    
    // Apply MOD filter
    await page.locator('[data-filter="collective"]').selectOption('MOD');
    
    // All visible drop cards should have MOD badge
    const dropCards = page.locator('.drop-card');
    const count = await dropCards.count();
    
    for (let i = 0; i < count; i++) {
      await expect(dropCards.nth(i).locator('.collective-badge')).toContainText('MOD');
    }
  });
  
  test('should switch between homepage variants', async ({ page }) => {
    await page.goto('/');
    
    // Click MOD in collective switcher
    await page.locator('[data-collective="MOD"]').click();
    
    // Should navigate to mod.dropr.com
    await expect(page).toHaveURL(/mod\.dropr\.com/);
    
    // Should show MOD collective content
    const hero = page.locator('.hero-section');
    await expect(hero).toContainText('modders');
  });
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. Many criteria were duplicates (horizontal scroll behavior repeated across sections) or examples (specific UI elements existing). Here are the unique, non-redundant properties:

**Filtering and Display Properties:**
- Property about collective filtering on Collective_Homepage (2.4, 4.5 are the same)
- Property about drop card required fields (2.8)
- Property about collective badges on Main_Homepage (2.9, 4.6 are the same)
- Property about curator card required fields (3.4, 3.5, 3.6 can be combined)
- Property about filter result count matching actual filtered drops (15.10)
- Property about collective filter not showing on Collective_Homepage (15.5)

**Countdown Properties:**
- Property about countdown format for upcoming drops (10.1)
- Property about countdown format for live drops (10.2)
- Property about countdown working across timezones (10.6)
- Property about countdown monotonicity (time decreases)

**Sorting Properties:**
- Property about drop sort order (4.3)

**Spotlight Properties:**
- Property about curator spotlight required fields (6.3, 6.4, 6.5 can be combined)
- Property about drop spotlight required fields (7.3, 7.4, 7.5, 7.6 can be combined)
- Property about spotlight filtering on Collective_Homepage (6.10)
- Property about collective badges on spotlights on Main_Homepage (7.9)
- Property about popular curator section on Collective_Homepage (3.2)

**Redundancy Eliminated:**
- Horizontal scroll behavior (2.5-2.7, 2.15, 3.9-3.12, 22.1-22.12) → Tested once as examples, not properties
- Drop card countdown display (2.10, 2.11) → Combined into countdown format properties
- Collective filtering (2.4, 4.5) → Same property, test once
- Collective badges (2.9, 4.6) → Same property, test once


### Property 1: Collective Homepage Filtering

*For any* Collective_Homepage (mod.dropr.com, make.dropr.com, mini.dropr.com), all displayed drops should belong exclusively to that collective.

**Validates: Requirements 2.4, 4.5**

### Property 2: Drop Card Required Fields

*For any* drop card rendered on the homepage, the card must display title, cover image, price, curator name, inventory status, and countdown timer (if applicable).

**Validates: Requirements 2.8, 2.12**

### Property 3: Collective Badge Display on Main Homepage

*For any* drop card displayed on the Main_Homepage (dropr.com), the card must include a collective badge indicating whether the drop belongs to MOD, MAKE, or MINI.

**Validates: Requirements 2.9, 4.6, 7.9**

### Property 4: Curator Card Required Fields

*For any* curator card rendered on the homepage, the card must display avatar, name, bio snippet, reputation score, completed drops count, and average rating.

**Validates: Requirements 3.4, 3.5, 3.6**

### Property 5: Countdown Format for Upcoming Drops

*For any* drop with status "upcoming" and within 24 hours of start time, the countdown timer must display the appropriate format based on time remaining: "2+ hours" for > 2 hours, "1 hr, X min" for 1-2 hours, or "Xm Ys" for < 1 hour.

**Validates: Requirements 10.2, 10.5, 10.6, 10.7, 10.8**

### Property 6: Countdown Format for Live Drops

*For any* drop with status "live", the countdown timer must display the appropriate format based on time remaining: "2+ hours" for > 2 hours, "1 hr, X min" for 1-2 hours, or "Xm Ys" for < 1 hour (same logic as upcoming drops).

**Validates: Requirements 10.3, 10.5, 10.6, 10.7, 10.8**

### Property 7: Countdown Monotonicity

*For any* drop with a countdown timer, the displayed time remaining should never increase between successive calculations (allowing for the discrete update intervals: every second for < 1 hour upcoming and all live drops, every 15 minutes for 1-2 hours upcoming).

**Validates: Requirements 10.9**

### Property 8: Timezone-Independent Countdown

*For any* drop countdown and any user timezone, the countdown should display the correct time remaining relative to the drop's start or end time in UTC, with appropriate formatting based on the time remaining.

**Validates: Requirements 10.11**

### Property 9: Drop Sort Order

*For any* list of drops in the "Live & Upcoming Drops" section, the drops must be ordered with live drops first, then upcoming drops, both sorted by start time in ascending order.

**Validates: Requirements 4.3**

### Property 10: Filter Result Count Accuracy

*For any* combination of active filters, the displayed count of matching drops must equal the actual number of drops shown in the filtered results.

**Validates: Requirements 15.10**

### Property 11: Collective Filter Exclusion on Collective Homepage

*For any* Collective_Homepage (mod.dropr.com, make.dropr.com, mini.dropr.com), the filter UI must not display a collective filter option, since the page is already filtered by subdomain.

**Validates: Requirements 15.5**

### Property 12: Curator Spotlight Required Fields

*For any* curator spotlight section, the spotlight must display curator avatar/photo, name, bio snippet (teaser), recent drops preview (3-5), and total drops count.

**Validates: Requirements 6.3, 6.4, 6.5**

### Property 13: Drop Spotlight Required Fields

*For any* drop spotlight section, the spotlight must display hero image, title, description, theme, curator information, price, inventory, countdown timer, and drop type badge.

**Validates: Requirements 7.3, 7.4, 7.5, 7.6**

### Property 14: Spotlight Filtering on Collective Homepage

*For any* Collective_Homepage (mod.dropr.com, make.dropr.com, mini.dropr.com), all curator and drop spotlights must feature only curators and drops from that collective.

**Validates: Requirements 6.10**

### Property 15: Popular Curator Section on Collective Homepage

*For any* Collective_Homepage (mod.dropr.com, make.dropr.com, mini.dropr.com), the page must display exactly one "Popular [Collective Name]" section (e.g., "Popular Modders" on mod.dropr.com).

**Validates: Requirements 3.2**

### Property 16: Filter Subset Preservation

*For any* list of drops and any valid filter options, applying filters should return a subset of the original list where every filtered drop exists in the original list.

**Validates: Requirements 15.7** (implicit - filtering should preserve data integrity)

### Property 17: Sort Stability

*For any* list of drops and any sort option, applying the same sort twice should produce identical results, ensuring deterministic sorting behavior.

**Validates: Requirements 15.6** (implicit - sorting should be stable)


## Performance Optimization

### Image Optimization

**Strategy:**
- Use Next.js Image component for automatic optimization
- Serve WebP format with JPEG fallback
- Implement responsive image sizes based on viewport
- Lazy load images below the fold
- Use blur placeholders for better perceived performance

**Implementation:**
```typescript
// components/homepage/shared/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export function OptimizedImage({ 
  src, 
  alt, 
  priority = false,
  aspectRatio = '16:9' 
}: OptimizedImageProps) {
  const sizes = {
    '16:9': { width: 640, height: 360 },
    '4:3': { width: 640, height: 480 },
    '1:1': { width: 640, height: 640 },
  };
  
  const { width, height } = sizes[aspectRatio];
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      priority={priority}
      quality={85}
      placeholder="blur"
      blurDataURL={generateBlurDataURL(src)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}

function generateBlurDataURL(src: string): string {
  // Generate low-quality placeholder
  // In production, this would be pre-generated during build
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="640" height="360" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="360" fill="#f0f0f0"/>
    </svg>
  `)}`;
}
```

### Code Splitting

**Strategy:**
- Use dynamic imports for below-the-fold components
- Split vendor bundles for better caching
- Prefetch critical routes on hover

**Implementation:**
```typescript
// app/page.tsx
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/homepage/HeroSection';
import { FeaturedDropsSection } from '@/components/homepage/FeaturedDropsSection';

// Lazy load below-the-fold sections
const CuratorSpotlight = dynamic(
  () => import('@/components/homepage/CuratorSpotlight'),
  { loading: () => <div className="skeleton-spotlight" /> }
);

const ValuePropositionBuyers = dynamic(
  () => import('@/components/homepage/ValuePropositionBuyers'),
  { loading: () => <div className="skeleton-section" /> }
);

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedDropsSection />
      <CuratorSpotlight />
      <ValuePropositionBuyers />
    </>
  );
}
```

### Caching Strategy

**Server-Side Caching:**
- Cache homepage data for 60 seconds with revalidation
- Use Next.js unstable_cache for expensive queries
- Tag-based cache invalidation on data updates

**Client-Side Caching:**
- Store filter/sort preferences in sessionStorage
- Cache SSE data in Zustand store
- Prefetch drop detail pages on card hover

**CDN Caching:**
- Cache static assets (images, CSS, JS) at edge
- Set appropriate cache headers for API responses
- Use stale-while-revalidate for homepage HTML

### Bundle Size Optimization

**Strategies:**
- Tree-shake unused code
- Use barrel exports carefully to avoid importing entire modules
- Analyze bundle with @next/bundle-analyzer
- Split large dependencies into separate chunks

**Target Metrics:**
- Initial JS bundle < 200KB (gzipped)
- Total page weight < 1MB
- Time to Interactive < 3 seconds on 3G


## SEO Optimization

### Meta Tags

```typescript
// app/page.tsx
import { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const collective = headersList.get('x-collective') || 'all';
  
  const metaData = {
    all: {
      title: 'Dropr - Curated Drops for Makers & Modders',
      description: 'Discover limited-edition drops from verified curators. Mechanical keyboards, DIY electronics, miniatures, and more. Curated quality you can trust.',
      keywords: 'curated drops, maker marketplace, mechanical keyboards, DIY electronics, miniatures, limited edition',
    },
    MOD: {
      title: 'Dropr MOD - Curated Drops for Keyboard Enthusiasts',
      description: 'Discover curated drops of mechanical keyboards, keycaps, switches, and PC mods from verified modders. Limited releases you can trust.',
      keywords: 'mechanical keyboards, keycaps, switches, PC mods, gaming peripherals, custom keyboards',
    },
    MAKE: {
      title: 'Dropr MAKE - Curated Drops for Makers',
      description: 'Discover curated drops of DIY electronics, 3D printing supplies, and modular synth components from expert makers. Limited releases you can trust.',
      keywords: 'DIY electronics, 3D printing, modular synth, maker supplies, components, kits',
    },
    MINI: {
      title: 'Dropr MINI - Curated Drops for Miniature Enthusiasts',
      description: 'Discover curated drops of miniatures, model kits, painting supplies, and terrain from master painters. Limited releases you can trust.',
      keywords: 'miniatures, model kits, painting supplies, terrain, tabletop gaming, figurines',
    },
  };
  
  const meta = metaData[collective as keyof typeof metaData];
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: collective === 'all' ? 'https://dropr.com' : `https://${collective.toLowerCase()}.dropr.com`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Dropr - Curated Drops',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/og-image.jpg'],
    },
    alternates: {
      canonical: collective === 'all' ? 'https://dropr.com' : `https://${collective.toLowerCase()}.dropr.com`,
    },
  };
}
```

### Structured Data

```typescript
// app/page.tsx
export default async function HomePage() {
  const headersList = headers();
  const collective = headersList.get('x-collective') || 'all';
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dropr',
    url: collective === 'all' ? 'https://dropr.com' : `https://${collective.toLowerCase()}.dropr.com`,
    description: 'Curated drops for makers and modders',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://dropr.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Page content */}
    </>
  );
}
```

### Semantic HTML

```typescript
// components/homepage/HeroSection.tsx
export function HeroSection({ collective, theme }: HeroSectionProps) {
  return (
    <header className="hero-section" role="banner">
      <h1>{theme.heroHeadline}</h1>
      <p className="hero-subheadline">{theme.heroSubheadline}</p>
      <nav className="hero-cta" aria-label="Primary actions">
        <a href="/drops" className="cta-primary">Browse Drops</a>
        <a href="/signup" className="cta-secondary">Sign Up</a>
        <a href="/curator/apply" className="cta-tertiary">Become a Curator</a>
      </nav>
    </header>
  );
}
```


## Accessibility Implementation

### Keyboard Navigation

**Requirements:**
- All interactive elements must be keyboard accessible
- Focus indicators must be visible
- Skip links for main content
- Logical tab order

**Implementation:**
```typescript
// components/homepage/SkipLinks.tsx
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#featured-drops" className="skip-link">
        Skip to featured drops
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
    </div>
  );
}

// CSS for skip links
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Labels

```typescript
// components/homepage/shared/HorizontalScrollSection.tsx
export function HorizontalScrollSection({ title, ariaLabel, children }: Props) {
  return (
    <section aria-label={ariaLabel}>
      <h2 id={`${ariaLabel}-heading`}>{title}</h2>
      <div
        className="horizontal-scroll-container"
        role="region"
        aria-labelledby={`${ariaLabel}-heading`}
        tabIndex={0}
      >
        {children}
      </div>
      <button
        className="scroll-indicator left"
        aria-label={`Scroll ${title} left`}
      >
        <ChevronLeft />
      </button>
      <button
        className="scroll-indicator right"
        aria-label={`Scroll ${title} right`}
      >
        <ChevronRight />
      </button>
    </section>
  );
}
```

### Screen Reader Announcements

```typescript
// components/homepage/shared/LiveRegion.tsx
'use client'

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (regionRef.current && message) {
      regionRef.current.textContent = message;
    }
  }, [message]);
  
  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Usage for real-time updates
function DropCard({ drop }: DropCardProps) {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (drop.inventory < 10 && drop.inventory > 0) {
      setAnnouncement(`Only ${drop.inventory} items left for ${drop.title}`);
    } else if (drop.inventory === 0) {
      setAnnouncement(`${drop.title} is now sold out`);
    }
  }, [drop.inventory, drop.title]);
  
  return (
    <>
      <LiveRegion message={announcement} />
      {/* Card content */}
    </>
  );
}
```

### Color Contrast

```css
/* Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text) */

.cta-primary {
  background: var(--color-primary);
  color: white; /* Ensure contrast ratio >= 4.5:1 */
}

.drop-card-title {
  color: #1a1a1a; /* Dark text on light background */
  background: white;
}

.collective-badge {
  background: var(--color-accent);
  color: #1a1a1a; /* Ensure contrast with badge background */
}

/* Focus indicators */
*:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Touch Target Sizes

```css
/* Ensure minimum 44x44px touch targets for mobile */

.cta-button,
.drop-card,
.curator-card,
.scroll-indicator {
  min-width: 44px;
  min-height: 44px;
}

/* Increase tap target size on mobile */
@media (max-width: 768px) {
  .cta-button {
    padding: 12px 24px;
    min-height: 48px;
  }
  
  .scroll-indicator {
    width: 48px;
    height: 48px;
  }
}
```


## Security Considerations

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' https://*.dropr.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
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
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
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

### XSS Prevention

```typescript
// Always sanitize user-generated content
import DOMPurify from 'isomorphic-dompurify';

function CuratorBio({ bio }: { bio: string }) {
  const sanitizedBio = DOMPurify.sanitize(bio, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
  
  return (
    <div 
      className="curator-bio"
      dangerouslySetInnerHTML={{ __html: sanitizedBio }}
    />
  );
}
```

### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // Continue with collective detection
  const hostname = request.headers.get('host') || '';
  const collective = detectCollective(hostname);
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-collective', collective);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

### CSRF Protection

```typescript
// Server Actions automatically include CSRF protection in Next.js 15+
// No additional configuration needed for Server Actions

// For API routes, use next-csrf
import { createCsrfProtect } from '@edge-csrf/nextjs';

const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function POST(request: Request) {
  const csrfError = await csrfProtect(request);
  
  if (csrfError) {
    return new Response('Invalid CSRF token', { status: 403 });
  }
  
  // Process request
}
```


## Monitoring and Analytics

### Error Tracking

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error && error.message.includes('ResizeObserver')) {
        return null; // Ignore ResizeObserver errors
      }
    }
    return event;
  },
});

// Usage in components
export function HomepageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export function trackWebVitals(metric: NextWebVitalsMetric) {
  // Send to Vercel Analytics
  if (window.va) {
    window.va('event', {
      name: metric.name,
      value: metric.value,
      label: metric.id,
    });
  }
  
  // Send to custom analytics
  if (metric.name === 'LCP') {
    console.log('Largest Contentful Paint:', metric.value);
  }
  
  if (metric.name === 'FID') {
    console.log('First Input Delay:', metric.value);
  }
  
  if (metric.name === 'CLS') {
    console.log('Cumulative Layout Shift:', metric.value);
  }
}

// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  trackWebVitals(metric);
}
```

### Custom Analytics Events

```typescript
// lib/analytics/events.ts
export const analyticsEvents = {
  dropCardClick: (dropId: string, position: number) => ({
    event: 'drop_card_click',
    dropId,
    position,
  }),
  
  curatorCardClick: (curatorId: string, position: number) => ({
    event: 'curator_card_click',
    curatorId,
    position,
  }),
  
  horizontalScroll: (section: string, direction: 'left' | 'right') => ({
    event: 'horizontal_scroll',
    section,
    direction,
  }),
  
  filterApplied: (filterType: string, filterValue: string) => ({
    event: 'filter_applied',
    filterType,
    filterValue,
  }),
  
  collectiveSwitched: (from: string, to: string) => ({
    event: 'collective_switched',
    from,
    to,
  }),
};

// Usage in components
function DropCard({ drop, position }: DropCardProps) {
  const handleClick = () => {
    // Track click
    if (window.va) {
      window.va('event', analyticsEvents.dropCardClick(drop.id, position));
    }
    
    // Navigate
    router.push(`/drops/${drop.id}`);
  };
  
  return <div onClick={handleClick}>{/* content */}</div>;
}
```

### A/B Testing Setup

```typescript
// lib/experiments/ab-testing.ts
export function getExperimentVariant(experimentId: string): 'control' | 'variant' {
  // Use consistent hashing based on user ID or session ID
  const userId = getUserId(); // From session or cookie
  const hash = hashString(`${experimentId}-${userId}`);
  
  return hash % 2 === 0 ? 'control' : 'variant';
}

// Usage
function HeroSection() {
  const variant = getExperimentVariant('hero-cta-text');
  
  const ctaText = variant === 'control' 
    ? 'Browse Drops' 
    : 'Explore Curated Drops';
  
  return (
    <section>
      <button>{ctaText}</button>
    </section>
  );
}
```


## Deployment and Infrastructure

### Environment Configuration

```typescript
// .env.example
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="https://dropr.com"
NEXTAUTH_SECRET="..."

# Storage
BLOB_READ_WRITE_TOKEN="..."

# Email
RESEND_API_KEY="..."

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."

# Feature Flags
NEXT_PUBLIC_ENABLE_AB_TESTING="true"
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

### Database Migrations

```typescript
// prisma/migrations/add_homepage_fields.sql
-- Add spotlight fields to Drop table
ALTER TABLE "Drop" ADD COLUMN "spotlightActive" BOOLEAN DEFAULT false;
ALTER TABLE "Drop" ADD COLUMN "spotlightPriority" INTEGER DEFAULT 0;
ALTER TABLE "Drop" ADD COLUMN "heroImage" TEXT;
ALTER TABLE "Drop" ADD COLUMN "theme" TEXT;

-- Add spotlight fields to Curator table
ALTER TABLE "Curator" ADD COLUMN "spotlightActive" BOOLEAN DEFAULT false;
ALTER TABLE "Curator" ADD COLUMN "spotlightPriority" INTEGER DEFAULT 0;
ALTER TABLE "Curator" ADD COLUMN "story" TEXT;
ALTER TABLE "Curator" ADD COLUMN "heroImage" TEXT;

-- Add founding curator flag
ALTER TABLE "Curator" ADD COLUMN "founding" BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX "Drop_featured_status_idx" ON "Drop"("featured", "status");
CREATE INDEX "Drop_collective_status_idx" ON "Drop"("collective", "status");
CREATE INDEX "Curator_founding_idx" ON "Curator"("founding");
CREATE INDEX "Curator_collective_idx" ON "Curator"("collective");
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```


## Future Enhancements

### Phase 2 Considerations

**Personalization:**
- User preference-based drop recommendations
- Personalized homepage layouts based on browsing history
- Saved filters and custom views
- Follow notifications for favorite curators

**Advanced Filtering:**
- Faceted search with multiple dimensions
- Price history and trend indicators
- Curator reputation filters
- Category and tag-based filtering

**Social Features:**
- Drop sharing with custom OG images
- Curator following and notifications
- Community-driven featured drops
- User reviews and ratings on homepage

**Performance Improvements:**
- Implement service worker for offline support
- Progressive Web App (PWA) capabilities
- Edge rendering for faster global performance
- WebSocket for real-time updates (replace SSE)

**Analytics and Insights:**
- Heatmap tracking for user behavior
- Conversion funnel analysis
- Cohort analysis for visitor segments
- A/B testing framework for homepage variations

### Technical Debt to Address

**Current Limitations:**
- SSE connection management could be improved with reconnection logic
- Image optimization could use next-gen formats (AVIF)
- Bundle size could be further reduced with more aggressive code splitting
- Horizontal scroll could use Intersection Observer for better performance

**Refactoring Opportunities:**
- Extract common card components into a shared library
- Create a design system for consistent styling
- Add more comprehensive error boundaries

### Scalability Considerations

**Database Optimization:**
- Add database indexes for common queries
- Implement read replicas for homepage queries
- Use materialized views for complex aggregations
- Cache frequently accessed data in Redis

**CDN Strategy:**
- Implement edge caching for static content
- Use Vercel Edge Functions for dynamic content
- Optimize image delivery with Cloudflare Images
- Implement stale-while-revalidate for HTML

**Monitoring and Alerting:**
- Set up alerts for performance degradation
- Monitor SSE connection health
- Track error rates and set thresholds
- Implement automated rollback on critical failures

