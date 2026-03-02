---
inclusion: always
---
# Technology Stack

## Philosophy

Build with modern, production-ready tools that prioritize developer experience and performance. Use Next.js 15+ with React 19+ for cutting-edge features like Server Actions, useActionState, and useOptimistic. Leverage the Next.js ecosystem for full-stack development, TypeScript for type safety, and proven libraries for common needs. Favor convention over configuration and leverage platform features over custom solutions.

## Tech Stack Checklist

**Core:**
- [ ] Next.js 15+ with App Router
- [ ] TypeScript with strict mode
- [ ] React 19+ with Server Components
- [ ] Prisma ORM with PostgreSQL
- [ ] NextAuth.js for authentication (JWT sessions)

**UI & Styling:**
- [ ] Tailwind CSS v4 (configured in app/globals.css)
- [ ] shadcn/ui with Base UI primitives
- [ ] next-themes for dark/light mode
- [ ] framer-motion for animations

**State & Data:**
- [ ] Zustand with scoped stores (Context Provider pattern)
- [ ] Server Actions for mutations
- [ ] Next.js caching with revalidateTag()
- [ ] SSE for real-time updates

**External Services:**
- [ ] Stripe for payments
- [ ] Resend for transactional emails
- [ ] Sentry for error monitoring
- [ ] Vercel Analytics for performance

**Testing:**
- [ ] Jest for unit tests
- [ ] React Testing Library for components
- [ ] Playwright for e2e tests
- [ ] Storybook for component development

## Core Stack

- Next.js 15+ (App Router)
- TypeScript
- React 19+ (Server Components, useActionState, useOptimistic)
- Node.js ecosystem
- Prisma (ORM)
- PostgreSQL (Database)
- NextAuth.js (Authentication)
- Zod (Validation)
- Stripe (Payments)

## Styling & UI

- Tailwind CSS v4 (configured via app/globals.css with @theme directive)
- shadcn/ui with Base UI primitives (not Radix)
- next-themes (dark/light mode persistence)
- framer-motion (animations and transitions)

## State Management

- Zustand (feature-level state management with scoped stores)
- React Context (app-wide state: theme, auth, user profile)
- Server Actions with useActionState (React 19+) for form state
- useOptimistic (React 19+) for optimistic UI updates
- Next.js caching with revalidateTag() for server state

## Real-Time Updates

- Server-Sent Events (SSE) for real-time broadcasts
  - Drop countdowns
  - Inventory updates
  - Drop status changes
- Implemented via Next.js Route Handlers
- No custom server or WebSocket infrastructure needed

## Testing

- Jest (unit testing)
- React Testing Library (component testing helpers)
- Playwright (e2e testing)
- Storybook (component development and documentation)

## Development Approach

- Spec-driven development: Features designed in `.kiro/specs/` before implementation
- MVVM architecture: Thin views, fat ViewModels (see architecture.md)
- Mobile-first responsive design
- WCAG AA accessibility compliance
- Component-based architecture with shadcn/ui
- Streaming with Suspense: Use React Suspense with custom skeleton components for granular loading control
- Avoid route-level loading.tsx: Prefer component-level Suspense boundaries

## Common Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## Project Structure

```
dropr/
├── app/                    # Next.js App Router
│   ├── globals.css        # Tailwind v4 config, theme tokens, custom utilities
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                  # Utilities and shared logic
├── public/               # Static assets
└── .kiro/
    ├── specs/            # Feature specifications
    └── steering/         # AI guidance documents
```

## Code Quality

- TypeScript for type safety with strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Dedicated types files for components

## Performance Considerations

- Use Next.js Image component for optimized images
- Implement code splitting and lazy loading
- Minimize client-side JavaScript
- Optimize for Core Web Vitals (LCP, FID, CLS)
