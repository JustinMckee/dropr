---
inclusion: auto
---
# Project Structure

## Philosophy

Organize by feature, not by file type. Co-locate related files (components, tests, stores) for easy navigation and maintenance. Use clear naming conventions and consistent directory structure. Keep the root clean and use `.kiro/` for project metadata.

## Structure Checklist

**Organization:**
- [ ] Features organized in `features/` directory
- [ ] MVVM structure (models, stores, hooks, components)
- [ ] Tests co-located with source files
- [ ] Shared components in `components/`
- [ ] Utilities in `lib/`
- [ ] Email templates in `emails/`

**Naming:**
- [ ] kebab-case for directories
- [ ] PascalCase for components
- [ ] camelCase for utilities
- [ ] Route groups use parentheses: `(group)/`
- [ ] Dynamic routes use brackets: `[id]/`

**Files:**
- [ ] `.test.ts` for tests (co-located)
- [ ] `.skeleton.tsx` for loading states
- [ ] `.stories.tsx` for Storybook
- [ ] `.types.ts` for TypeScript types
- [ ] `.actions.ts` for Server Actions

**Special Directories:**
- [ ] `.kiro/specs/` for feature specifications
- [ ] `.kiro/steering/` for AI guidance
- [ ] `prisma/` for database schema and migrations
- [ ] `__tests__/e2e/` for end-to-end tests only

## Current Organization

```
dropr/
├── .git/
├── .kiro/
│   ├── specs/          # Feature specifications and implementation plans
│   │   └── buyer-drop-experience/
│   └── steering/       # AI assistant guidance documents
├── .gitignore
├── .kiroignore
├── CSS-REFERENCE.css   # Reference for styling patterns
├── README.md           # Project overview
├── PERSONAS.md         # User personas and culture clusters
├── FEATURES.md         # Feature documentation (ignored by AI)
└── INFOARCH.md         # Information architecture (ignored by AI)
```

## Conventions

- Spec-driven development: Features are designed in `.kiro/specs/` before implementation
- Feature naming: Use kebab-case for feature directories
- Documentation: Key personas and product vision documented at root level
- Route groups: Use parentheses for logical grouping without affecting URL structure
- Loading states: Prefer Suspense with custom skeletons over route-level loading.tsx
- Error boundaries: Include error.tsx at route segment level for granular error handling
- Not found pages: Include not-found.tsx for custom 404 experiences per route group

## Future Structure

```
dropr/
├── app/
│   ├── (route-group)/            # Route groups use parentheses
│   │   ├── layout.tsx            # Group-specific layout
│   │   ├── page.tsx              # Route page
│   │   ├── not-found.tsx         # Custom 404
│   │   ├── error.tsx             # Error boundary
│   │   ├── loading.tsx           # Loading fallback (prefer Suspense)
│   │   │
│   │   ├── static-route/         # Static route
│   │   │   └── page.tsx
│   │   │
│   │   └── [dynamic]/            # Dynamic route ([id], [...slug], [[...slug]])
│   │       └── page.tsx
│   │
│   ├── api/                      # API routes
│   │   └── resource/
│   │       └── [id]/
│   │           └── route.ts      # GET, POST, etc.
│   │
│   ├── globals.css               # Tailwind v4 config, theme tokens
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx             # Global 404
│   └── error.tsx                 # Global error boundary
│
├── features/                     # Feature modules (MVVM)
│   └── feature-name/
│       ├── models/
│       │   ├── feature.actions.ts    # Server Actions ('use server')
│       │   ├── feature.types.ts      # TypeScript types
│       │   └── feature.actions.test.ts
│       ├── stores/
│       │   ├── feature.store.ts      # Zustand store factory
│       │   └── feature.store.test.ts
│       ├── hooks/
│       │   └── useFeature.ts         # Context Provider + hook
│       └── components/
│           └── ComponentName/
│               ├── ComponentName.tsx
│               ├── ComponentName.skeleton.tsx
│               ├── ComponentName.test.tsx
│               └── ComponentName.stories.tsx
│
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui components
│   └── common/                   # Reusable components
│
├── lib/                          # Utilities and shared logic
│   ├── utils.ts
│   ├── db.ts                     # Prisma client singleton
│   └── auth.ts
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed data script
│   └── migrations/               # Migration history
│
├── types/                        # Shared TypeScript types
│
└── public/                       # Static assets
```

## Subdomain Architecture

**Collective-Specific Subdomains:**

Use subdomains to separate the three collectives, providing focused experiences for each community:

- **make.dropr.com** - The Make Collective (DIY electronics, 3D printing, modular synth)
- **mod.dropr.com** - The Mod Collective (mechanical keyboards, PC modding, gaming)
- **mini.dropr.com** - The Mini Collective (miniatures, model kits, figurines)
- **dropr.com** - Main landing page with collective selection

**Important: Single Deployment Architecture**

All subdomains are served by ONE deployment:
- Single codebase
- Single build process
- Single Vercel deployment
- Shared database and infrastructure
- Middleware detects subdomain and filters content

This is NOT:
- ❌ Separate deployments per subdomain
- ❌ Redirections between domains
- ❌ Multiple codebases
- ❌ Separate databases

This IS:
- ✅ One deployment serving multiple subdomains
- ✅ Middleware detecting which subdomain user is on
- ✅ Content filtered by collective based on subdomain
- ✅ Shared infrastructure with collective-specific views

**Benefits:**
- Clear separation of communities and content
- Focused discovery (only relevant drops for each collective)
- Better SEO (collective-specific keywords)
- Easier to market to specific communities
- Allows collective-specific branding and design
- Simpler navigation and filtering
- Deploy once, all subdomains updated
- Lower infrastructure costs (single deployment)
- Easy to add new collectives (just add DNS record)

**Implementation:**
- Next.js middleware to detect subdomain and add header
- Shared codebase with collective-aware components
- Database filtering by collective using header
- Collective-specific analytics and metrics

**Technical Approach:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Map subdomains to collectives
  const collectiveMap: Record<string, string> = {
    'make': 'make',
    'mod': 'mod',
    'mini': 'mini',
  };
  
  const collective = collectiveMap[subdomain];
  
  if (collective) {
    // Add collective to request headers for use in app
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-collective', collective);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}
```

**Using Collective in Components:**
```typescript
// Server Component
import { headers } from 'next/headers';

export default async function DropsPage() {
  const headersList = headers();
  const collective = headersList.get('x-collective');
  
  // Fetch drops filtered by collective
  const drops = await getDropsByCollective(collective);
  
  return <DropList drops={drops} collective={collective} />;
}

// Server Action
'use server'
import { headers } from 'next/headers';

export async function getDropsByCollective(collective: string | null) {
  return await db.drop.findMany({
    where: collective ? { collective } : {},
  });
}
```

**Collective-Specific Theming:**

The `x-collective` header enables collective-specific branding and content:

**Visual Customization:**
- Hero imagery (keyboards for Mod, electronics for Make, miniatures for Mini)
- Iconography (switches for Mod, resistors for Make, paintbrushes for Mini)
- Color accents (purple for Mod, cyan for Make, pink for Mini)
- Background patterns (grid for Mod, circuit for Make, hex for Mini)

**Content Customization:**
- Headlines: "Curated Drops for Keyboard Enthusiasts" vs "Curated Drops for Makers"
- Value propositions tailored to each community
- Featured curators from that collective
- Community-specific terminology and language

**Implementation Example:**
```typescript
// lib/collective-config.ts
export const collectiveConfig = {
  mod: {
    name: 'Mod Collective',
    tagline: 'Curated Drops for Keyboard Enthusiasts & PC Modders',
    heroImage: '/images/hero-mod.jpg',
    accentColor: '#8b5cf6', // purple
    icon: 'keyboard',
    pattern: 'grid',
  },
  make: {
    name: 'Make Collective',
    tagline: 'Curated Drops for DIY Electronics & 3D Printing',
    heroImage: '/images/hero-make.jpg',
    accentColor: '#06b6d4', // cyan
    icon: 'circuit',
    pattern: 'circuit-board',
  },
  mini: {
    name: 'Mini Collective',
    tagline: 'Curated Drops for Miniature Painters & Collectors',
    heroImage: '/images/hero-mini.jpg',
    accentColor: '#ec4899', // pink
    icon: 'paintbrush',
    pattern: 'hexagon',
  },
};

// app/page.tsx
import { headers } from 'next/headers';
import { collectiveConfig } from '@/lib/collective-config';

export default async function HomePage() {
  const collective = headers().get('x-collective') as 'mod' | 'make' | 'mini' | null;
  const config = collective ? collectiveConfig[collective] : null;
  
  return (
    <div className={config?.pattern}>
      <h1 style={{ color: config?.accentColor }}>
        {config?.tagline || 'Curated Mystery Drops for Makers & Modders'}
      </h1>
      <img src={config?.heroImage || '/images/hero-default.jpg'} alt="Hero" />
    </div>
  );
}
```

**CSS Custom Properties:**
```typescript
// app/layout.tsx
import { headers } from 'next/headers';
import { collectiveConfig } from '@/lib/collective-config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const collective = headers().get('x-collective') as 'mod' | 'make' | 'mini' | null;
  const config = collective ? collectiveConfig[collective] : null;
  
  return (
    <html lang="en" style={{
      '--collective-accent': config?.accentColor || '#8b5cf6',
    } as React.CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
```

This allows each collective to feel like its own distinct community while sharing the same codebase!

**URL Structure:**
- `make.dropr.com/drops` - All Make Collective drops
- `mod.dropr.com/drops/[slug]` - Specific drop in Mod Collective
- `mini.dropr.com/curators/[username]` - Curator profile in Mini Collective
- `dropr.com` - Main landing page with collective selection
- `dropr.com/drops` - All drops across all collectives (optional)

## Component Structure

```
Component/
├── Component.tsx              # Main component file
├── Component.skeleton.tsx     # Custom loading/skeleton state
├── Component.module.scss      # Scoped styles (when needed)
├── Component.test.tsx         # Unit tests
├── Component.stories.tsx      # Storybook stories
└── Component.types.ts         # TypeScript types
```

## Feature Module Structure (MVVM)

```
feature-name/
├── models/
│   ├── feature.actions.ts        # Server Actions ('use server')
│   ├── feature.types.ts          # TypeScript types
│   └── feature.actions.test.ts   # Server Action tests
├── stores/
│   ├── feature.store.ts          # Zustand store factory
│   └── feature.store.test.ts     # ViewModel tests
├── hooks/
│   └── useFeature.ts             # Context Provider + hook
└── components/
    └── ComponentName/
        ├── ComponentName.tsx
        ├── ComponentName.test.tsx
        └── ComponentName.stories.tsx
```

See architecture.md for MVVM pattern details and when to use this structure.
