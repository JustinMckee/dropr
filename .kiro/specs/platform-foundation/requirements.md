# Platform Foundation - Requirements

## 1. Overview

This specification defines the foundational infrastructure for the Dropr platform. It covers project setup, database architecture, authentication, subdomain routing with collective-specific theming, and core utilities that all features depend on. This foundation must be in place before implementing any feature-specific specs (buyer-drop-experience, curator-dashboard, etc.).

The platform serves three distinct collectives (Mod, Make, Mini) through subdomain-based routing with collective-specific theming, all from a single codebase and deployment.

## 2. User Stories

### 2.1 Project Initialization

**As a developer**, I want a properly configured Next.js 15+ project so that I can build features with modern React patterns and optimal performance.

**Acceptance Criteria:**
- 2.1.1 Next.js 15+ with App Router and TypeScript configured
- 2.1.2 Tailwind CSS v4 configured in app/globals.css with @theme directive
- 2.1.3 ESLint and Prettier configured for code quality
- 2.1.4 TypeScript strict mode enabled
- 2.1.5 shadcn/ui with Base UI primitives installed and configured
- 2.1.6 Environment variables template (.env.example) provided
- 2.1.7 Package.json scripts for dev, build, test, lint, format

### 2.2 Database Setup

**As a developer**, I want a properly structured database schema so that all features can store and retrieve data consistently.

**Acceptance Criteria:**
- 2.2.1 Prisma ORM configured with PostgreSQL connection
- 2.2.2 Core models defined (User, Buyer, Curator, Drop, Order, Review, Dispute)
- 2.2.3 Enums defined (Collective, DropType, DropStatus, OrderStatus, ModerationStatus, DisputeStatus)
- 2.2.4 All IDs use cuid() for generation
- 2.2.5 Proper indexes for performance (collective, status, timestamps)
- 2.2.6 Relations properly defined with cascade rules
- 2.2.7 Initial migration created and applied
- 2.2.8 Seed script for development data (sample drops, curators, buyers)

### 2.3 Subdomain Architecture

**As a user**, I want to access collective-specific content through subdomains so that I see only relevant drops for my hobby.

**Acceptance Criteria:**
- 2.3.1 Middleware detects subdomain from host header (make/mod/mini.dropr.com)
- 2.3.2 Middleware adds x-collective header based on subdomain
- 2.3.3 Single deployment serves all subdomains (not separate builds)
- 2.3.4 Fallback to default collective for main domain (dropr.com)
- 2.3.5 Local development supports collective testing (query param or hosts file)
- 2.3.6 Middleware handles www subdomain correctly
- 2.3.7 Invalid subdomains redirect to main domain

### 2.4 Collective-Specific Theming

**As a user**, I want each collective to have distinct visual identity so that the platform feels tailored to my hobby.

**Acceptance Criteria:**
- 2.4.1 Collective configuration object with colors, iconography, patterns, messaging
- 2.4.2 Mod collective: Purple (#8b5cf6), keyboard iconography, grid pattern
- 2.4.3 Make collective: Cyan (#06b6d4), circuit iconography, circuit-board pattern
- 2.4.4 Mini collective: Pink (#ec4899), paintbrush iconography, hexagon pattern
- 2.4.5 CSS custom properties dynamically applied based on x-collective header
- 2.4.6 ThemeProvider component applies collective theme to app
- 2.4.7 Pattern backgrounds implemented (SVG or CSS)
- 2.4.8 useCollective() hook provides access to collective config
- 2.4.9 Theme persists across navigation within collective
- 2.4.10 Dark mode support for all collective themes

### 2.5 Authentication System

**As a user**, I want to securely authenticate so that I can access my account and make purchases.

**Acceptance Criteria:**
- 2.5.1 NextAuth.js configured with JWT sessions
- 2.5.2 Email/password authentication implemented
- 2.5.3 OAuth providers configured (Google, GitHub)
- 2.5.4 Password hashing with bcrypt
- 2.5.5 Email verification flow implemented
- 2.5.6 Password reset flow implemented
- 2.5.7 Session management with secure cookies
- 2.5.8 Role-based access control (BUYER, CURATOR, ADMIN)
- 2.5.9 Protected routes with middleware
- 2.5.10 Login and signup pages with validation

### 2.6 Core Utilities & Helpers

**As a developer**, I want reusable utilities so that I can build features efficiently without duplicating code.

**Acceptance Criteria:**
- 2.6.1 Date formatting utilities (relative time, countdown calculations)
- 2.6.2 Price formatting utilities (currency, platform fee calculations)
- 2.6.3 String utilities (slug generation, truncation, sanitization)
- 2.6.4 Validation schemas (Zod) for common data types
- 2.6.5 Error handling utilities (custom error classes, error boundaries)
- 2.6.6 API response helpers (success, error, validation error)
- 2.6.7 Image upload utilities (Vercel Blob integration)
- 2.6.8 Rate limiting utilities (Upstash Redis)
- 2.6.9 Email utilities (Resend integration, templates)
- 2.6.10 SMS utilities (Twilio integration)

### 2.7 UI Component Library

**As a developer**, I want a consistent component library so that all features have the same look and feel.

**Acceptance Criteria:**
- 2.7.1 shadcn/ui primitives installed (Button, Input, Card, Dialog, Sheet, etc.)
- 2.7.2 Custom components built on primitives (DropCard, CuratorBadge, etc.)
- 2.7.3 Loading skeletons for async content
- 2.7.4 Error states and empty states
- 2.7.5 Form components with validation (React Hook Form + Zod)
- 2.7.6 Toast notifications (sonner)
- 2.7.7 Modal/Dialog patterns
- 2.7.8 Responsive navigation components
- 2.7.9 Collective-specific styling applied to components
- 2.7.10 Accessibility compliance (WCAG AA)

### 2.8 Background Jobs & Queues

**As a developer**, I want a job queue system so that I can process background tasks reliably.

**Acceptance Criteria:**
- 2.8.1 BullMQ configured with Redis connection
- 2.8.2 Queue definitions for notifications, emails, escrow release
- 2.8.3 Worker processes for job execution
- 2.8.4 Job retry logic with exponential backoff
- 2.8.5 Job failure handling and logging
- 2.8.6 Queue monitoring and metrics
- 2.8.7 Scheduled jobs (cron) for recurring tasks
- 2.8.8 Job priority levels
- 2.8.9 Dead letter queue for failed jobs
- 2.8.10 Development mode with in-memory queue

## 3. Functional Requirements

### 3.1 Project Configuration
- Next.js 15+ with App Router and TypeScript
- Tailwind CSS v4 with @theme directive in globals.css
- ESLint and Prettier for code quality
- TypeScript strict mode enabled
- Environment variables for all external services
- Development, staging, and production configurations

### 3.2 Database Architecture
- PostgreSQL database with Prisma ORM
- All models use cuid() for IDs
- Proper indexes for query performance
- Cascade delete rules for data integrity
- Seed data for development and testing
- Migration strategy for schema changes

### 3.3 Subdomain Routing
- Middleware-based subdomain detection
- x-collective header for content filtering
- Single deployment serving all subdomains
- Local development support for testing
- DNS configuration for production subdomains

### 3.4 Theming System
- Collective configuration with colors, patterns, messaging
- CSS custom properties for dynamic theming
- ThemeProvider component for app-wide theme
- useCollective() hook for accessing config
- Dark mode support

### 3.5 Authentication
- NextAuth.js with JWT sessions
- Email/password and OAuth authentication
- Email verification and password reset
- Role-based access control
- Protected routes and API endpoints

### 3.6 External Service Integrations
- Stripe for payments (Connect for escrow)
- Resend for transactional emails
- Twilio for SMS notifications
- Vercel Blob for image storage
- Upstash Redis for rate limiting and queues
- Sentry for error monitoring
- Vercel Analytics for performance

### 3.7 Development Tools
- Hot reload for rapid development
- TypeScript type checking
- Database migrations and rollbacks
- Seed data generation
- Test database setup
- Storybook for component development (required)

## 4. Non-Functional Requirements

### 4.1 Performance
- Initial page load < 2 seconds
- Time to interactive < 3 seconds
- Database queries optimized with indexes
- Image optimization with Next.js Image
- Code splitting and lazy loading

### 4.2 Security
- HTTPS enforcement
- Secure session management
- CSRF protection
- XSS prevention (Content Security Policy)
- SQL injection prevention (Prisma parameterized queries)
- Rate limiting on authentication endpoints
- Environment variables for secrets

### 4.3 Scalability
- Horizontal scaling with stateless architecture
- Database connection pooling
- Redis for caching and queues
- CDN for static assets
- Serverless functions for API routes

### 4.4 Reliability
- 99.9% uptime target
- Automated backups for database
- Error monitoring with Sentry
- Graceful degradation for external service failures
- Health check endpoints

### 4.5 Developer Experience
- Clear documentation for setup
- Consistent code style with linting
- Type safety with TypeScript
- Fast feedback loop with hot reload
- Easy local development setup

## 5. Constraints & Assumptions

### 5.1 Constraints
- Must use Next.js 15+ with App Router (no Pages Router)
- Must use PostgreSQL (no other databases)
- Must use Prisma ORM (no raw SQL)
- Must support three collectives (Mod, Make, Mini)
- Must use single deployment for all subdomains
- Must use Vercel for hosting (optimized for Next.js)

### 5.2 Assumptions
- Developers have Node.js 18+ installed
- Developers have access to PostgreSQL database
- Developers have Vercel account for deployment
- External services (Stripe, Resend, Twilio) accounts available
- DNS configuration can be managed for subdomains

## 6. Success Metrics

- Project setup time < 30 minutes for new developers
- Database migration success rate 100%
- Authentication success rate > 99%
- Subdomain routing accuracy 100%
- Theme application consistency 100%
- Zero security vulnerabilities in dependencies
- Test coverage > 80% for core utilities

## 7. Out of Scope

- Feature-specific functionality (drops, orders, reviews)
- Admin dashboard and moderation tools
- Analytics and reporting features
- Mobile app development
- Internationalization (i18n)
- Multi-currency support
- Advanced caching strategies (Phase 1)

## 8. Dependencies

This foundation must be complete before:
- buyer-drop-experience spec
- curator-dashboard spec
- admin-moderation spec
- Any other feature specs

## 9. Technical Debt & Future Considerations

- Consider Redis for caching (currently using Next.js built-in)
- Consider WebSocket for real-time updates (currently using SSE)
- Consider CDN for image optimization (currently using Vercel Blob)
- Consider multi-region deployment for global performance
- Consider database read replicas for scaling
