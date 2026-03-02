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
