# Platform Foundation - Implementation Tasks

## Phase 1: Project Initialization

### 1. Next.js Project Setup
- [ ] 1.1 Initialize Next.js 15+ project with TypeScript and App Router
- [ ] 1.2 Configure TypeScript with strict mode in tsconfig.json
- [ ] 1.3 Set up ESLint with Next.js recommended config
- [ ] 1.4 Set up Prettier with configuration file
- [ ] 1.5 Add package.json scripts (dev, build, start, lint, format, type-check)
- [ ] 1.6 Create .gitignore with Next.js, Node, and environment files
- [ ] 1.7 Initialize Git repository and make initial commit

### 2. Tailwind CSS v4 Setup
- [ ] 2.1 Install Tailwind CSS v4 dependencies
- [ ] 2.2 Create app/globals.css with @theme directive
- [ ] 2.3 Configure CSS custom properties for collective theming
- [ ] 2.4 Add pattern background definitions (grid, circuit-board, hexagon)
- [ ] 2.5 Test Tailwind classes in a sample component
- [ ] 2.6 Configure dark mode support

### 3. shadcn/ui Installation
- [ ] 3.1 Install shadcn/ui CLI
- [ ] 3.2 Initialize shadcn/ui with Base UI primitives (not Radix)
- [ ] 3.3 Install core components (Button, Input, Card, Dialog, Sheet)
- [ ] 3.4 Install form components (Label, Textarea, Select, Checkbox)
- [ ] 3.5 Install feedback components (Toast, Alert, Badge)
- [ ] 3.6 Customize component styles for collective theming
- [ ] 3.7 Create components/ui/index.ts for exports

### 4. Environment Configuration
- [ ] 4.1 Create .env.example with all required variables
- [ ] 4.2 Create .env.local for local development (gitignored)
- [ ] 4.3 Document each environment variable in README
- [ ] 4.4 Set up environment variable validation with Zod
- [ ] 4.5 Create lib/env.ts for type-safe environment access

## Phase 2: Database Setup

### 5. Prisma Configuration
- [ ] 5.1 Install Prisma and Prisma Client
- [ ] 5.2 Initialize Prisma with PostgreSQL
- [ ] 5.3 Configure DATABASE_URL in .env.local
- [ ] 5.4 Create lib/prisma.ts with singleton client
- [ ] 5.5 Test database connection

### 6. Database Schema - User & Auth Models
- [ ] 6.1 Define User model with email, password, role
- [ ] 6.2 Define Account model for OAuth
- [ ] 6.3 Define Session model for NextAuth
- [ ] 6.4 Define VerificationToken model
- [ ] 6.5 Add UserRole enum (BUYER, CURATOR, ADMIN)
- [ ] 6.6 Add indexes for email lookups
- [ ] 6.7 Run migration for auth models

### 7. Database Schema - Profile Models
- [ ] 7.1 Define Buyer model with preferences and notifications
- [ ] 7.2 Define Curator model with reputation and Stripe account
- [ ] 7.3 Define CuratorFollow model for following curators
- [ ] 7.4 Add indexes for profile lookups
- [ ] 7.5 Run migration for profile models

### 8. Database Schema - Drop Models
- [ ] 8.1 Define Drop model with all fields (title, slug, description, etc.)
- [ ] 8.2 Add DropType enum (MYSTERY_BOX, SURPLUS, LIMITED_EDITION)
- [ ] 8.3 Add DropStatus enum (DRAFT, SCHEDULED, LIVE, SOLD_OUT, ENDED, ARCHIVED, CANCELLED)
- [ ] 8.4 Add Collective enum (MOD, MAKE, MINI)
- [ ] 8.5 Define DropFollow model
- [ ] 8.6 Add indexes for drop browsing (collective, status, startTime)
- [ ] 8.7 Run migration for drop models

### 9. Database Schema - Order Models
- [ ] 9.1 Define Order model with payment and shipping fields
- [ ] 9.2 Add OrderStatus enum (PENDING, PAID, CLOSED, PACKING, SHIPPED, DELIVERED, REVEALED, CANCELLED, DISPUTED)
- [ ] 9.3 Add platformFee, curatorPayout, escrowReleasedAt fields
- [ ] 9.4 Add indexes for order queries
- [ ] 9.5 Run migration for order models

### 10. Database Schema - Review & Dispute Models
- [ ] 10.1 Define Review model with ratings and moderation
- [ ] 10.2 Add ModerationStatus enum (PENDING, APPROVED, REJECTED)
- [ ] 10.3 Define Dispute model with status and resolution
- [ ] 10.4 Add DisputeStatus enum (OPEN, INVESTIGATING, RESOLVED, CLOSED)
- [ ] 10.5 Add indexes for review and dispute queries
- [ ] 10.6 Run migration for review and dispute models

### 11. Database Seeding
- [ ] 11.1 Create prisma/seed.ts script
- [ ] 11.2 Add seed data for test users (buyer, curator, admin)
- [ ] 11.3 Add seed data for sample drops (all three collectives)
- [ ] 11.4 Add seed data for sample orders
- [ ] 11.5 Add seed data for sample reviews
- [ ] 11.6 Run seed script and verify data
- [ ] 11.7 Add seed script to package.json

## Phase 3: Subdomain Architecture

### 12. Middleware Implementation
- [ ] 12.1 Create middleware.ts in project root
- [ ] 12.2 Implement subdomain detection from host header
- [ ] 12.3 Map subdomains to collectives (make/mod/mini → MAKE/MOD/MINI)
- [ ] 12.4 Add x-collective header to all responses
- [ ] 12.5 Handle www subdomain (default to MOD)
- [ ] 12.6 Handle invalid subdomains (redirect to main domain)
- [ ] 12.7 Configure middleware matcher to exclude static files

### 13. Collective Configuration
- [ ] 13.1 Create lib/collective-config.ts with configuration object
- [ ] 13.2 Define MOD collective config (purple, keyboard, grid)
- [ ] 13.3 Define MAKE collective config (cyan, circuit, circuit-board)
- [ ] 13.4 Define MINI collective config (pink, paintbrush, hexagon)
- [ ] 13.5 Add SEO metadata for each collective
- [ ] 13.6 Export getCollectiveConfig() helper function
- [ ] 13.7 Create TypeScript types for collective config

### 14. Local Development Setup
- [ ] 14.1 Create lib/collective.ts with getCollective() helper
- [ ] 14.2 Add query parameter support for testing (?collective=MOD)
- [ ] 14.3 Document /etc/hosts setup for subdomain testing
- [ ] 14.4 Test subdomain detection in development
- [ ] 14.5 Verify x-collective header is set correctly

## Phase 4: Collective Theming

### 15. Theme Provider
- [ ] 15.1 Create components/providers/theme-provider.tsx
- [ ] 15.2 Implement CSS custom property injection based on collective
- [ ] 15.3 Add collective class to body element
- [ ] 15.4 Handle theme changes on collective switch
- [ ] 15.5 Test theme provider with all three collectives

### 16. Root Layout Integration
- [ ] 16.1 Update app/layout.tsx to read x-collective header
- [ ] 16.2 Wrap children with ThemeProvider
- [ ] 16.3 Generate dynamic metadata based on collective
- [ ] 16.4 Add collective-specific fonts (if needed)
- [ ] 16.5 Test layout with all three collectives

### 17. Pattern Backgrounds
- [ ] 17.1 Create SVG patterns for grid (MOD)
- [ ] 17.2 Create SVG patterns for circuit-board (MAKE)
- [ ] 17.3 Create SVG patterns for hexagon (MINI)
- [ ] 17.4 Add pattern CSS classes to globals.css
- [ ] 17.5 Test patterns on sample pages

### 18. useCollective Hook
- [ ] 18.1 Create hooks/use-collective.ts
- [ ] 18.2 Implement hook to read collective from body class
- [ ] 18.3 Return collective key and config object
- [ ] 18.4 Test hook in client components
- [ ] 18.5 Document hook usage in README

## Phase 5: Authentication System

### 19. NextAuth.js Setup
- [ ] 19.1 Install NextAuth.js and dependencies
- [ ] 19.2 Create lib/auth.ts with NextAuth configuration
- [ ] 19.3 Configure PrismaAdapter for database sessions
- [ ] 19.4 Set up JWT session strategy
- [ ] 19.5 Configure custom pages (signIn, signOut, error)
- [ ] 19.6 Add session and JWT callbacks for role-based access

### 20. Credentials Provider
- [ ] 20.1 Configure CredentialsProvider in NextAuth
- [ ] 20.2 Implement authorize function with email/password
- [ ] 20.3 Add bcrypt for password hashing
- [ ] 20.4 Validate credentials against database
- [ ] 20.5 Return user object with role
- [ ] 20.6 Test credentials login flow

### 21. OAuth Providers
- [ ] 21.1 Configure GoogleProvider with client ID and secret
- [ ] 21.2 Configure GitHubProvider with client ID and secret
- [ ] 21.3 Set up OAuth apps in Google and GitHub consoles
- [ ] 21.4 Test OAuth login flows
- [ ] 21.5 Handle OAuth account linking

### 22. API Route Handler
- [ ] 22.1 Create app/api/auth/[...nextauth]/route.ts
- [ ] 22.2 Export GET and POST handlers
- [ ] 22.3 Test authentication endpoints
- [ ] 22.4 Verify session creation

### 23. Auth Helpers
- [ ] 23.1 Create lib/auth-helpers.ts
- [ ] 23.2 Implement requireAuth() for server-side auth checks
- [ ] 23.3 Implement requireRole() for role-based access
- [ ] 23.4 Test helpers in Server Actions
- [ ] 23.5 Document helper usage

### 24. Client-Side Auth
- [ ] 24.1 Create hooks/use-auth.ts
- [ ] 24.2 Implement useAuth() hook with useSession
- [ ] 24.3 Return user, isAuthenticated, isLoading, role
- [ ] 24.4 Test hook in client components
- [ ] 24.5 Add SessionProvider to root layout

### 25. Login Page
- [ ] 25.1 Create app/login/page.tsx
- [ ] 25.2 Implement login form with email and password
- [ ] 25.3 Add form validation with Zod
- [ ] 25.4 Handle credentials sign-in
- [ ] 25.5 Add OAuth buttons (Google, GitHub)
- [ ] 25.6 Handle errors and display messages
- [ ] 25.7 Redirect to callbackUrl after login
- [ ] 25.8 Add link to signup page

### 26. Signup Page
- [ ] 26.1 Create app/signup/page.tsx
- [ ] 26.2 Implement signup form with email, password, name
- [ ] 26.3 Add password strength validation
- [ ] 26.4 Hash password with bcrypt
- [ ] 26.5 Create user in database
- [ ] 26.6 Automatically sign in after signup
- [ ] 26.7 Send verification email
- [ ] 26.8 Add link to login page

### 27. Protected Routes
- [ ] 27.1 Add auth protection to middleware for /orders, /settings, /curator
- [ ] 27.2 Implement role-based access control in middleware
- [ ] 27.3 Redirect unauthenticated users to login
- [ ] 27.4 Redirect unauthorized users to /unauthorized
- [ ] 27.5 Test protected route access

### 28. Email Verification
- [ ] 28.1 Create verification token generation function
- [ ] 28.2 Send verification email on signup
- [ ] 28.3 Create app/auth/verify/page.tsx
- [ ] 28.4 Implement token verification logic
- [ ] 28.5 Update user emailVerified field
- [ ] 28.6 Test verification flow

### 29. Password Reset
- [ ] 29.1 Create app/auth/forgot-password/page.tsx
- [ ] 29.2 Implement password reset request form
- [ ] 29.3 Generate reset token and send email
- [ ] 29.4 Create app/auth/reset-password/page.tsx
- [ ] 29.5 Implement password reset form with token validation
- [ ] 29.6 Update password in database
- [ ] 29.7 Test password reset flow

## Phase 6: Core Utilities

### 30. Date Utilities
- [ ] 30.1 Create lib/utils/date.ts
- [ ] 30.2 Implement formatRelativeTime() using date-fns
- [ ] 30.3 Implement formatDate() with custom formats
- [ ] 30.4 Implement calculateCountdown() for drop timers
- [ ] 30.5 Implement isExpired() helper
- [ ] 30.6 Write unit tests for date utilities

### 31. Price Utilities
- [ ] 31.1 Create lib/utils/price.ts
- [ ] 31.2 Implement formatPrice() with Intl.NumberFormat
- [ ] 31.3 Implement calculatePlatformFee() (20%)
- [ ] 31.4 Implement calculateCuratorPayout() (80%)
- [ ] 31.5 Implement calculateStripeFee() (2.9% + $0.30)
- [ ] 31.6 Implement calculateNetPayout()
- [ ] 31.7 Write unit tests for price utilities

### 32. String Utilities
- [ ] 32.1 Create lib/utils/string.ts
- [ ] 32.2 Implement generateSlug() with random suffix
- [ ] 32.3 Implement truncate() for text truncation
- [ ] 32.4 Implement sanitizeHtml() for XSS prevention
- [ ] 32.5 Implement capitalizeFirst() helper
- [ ] 32.6 Write unit tests for string utilities

### 33. Validation Schemas
- [ ] 33.1 Create lib/validation/common.ts
- [ ] 33.2 Define emailSchema with Zod
- [ ] 33.3 Define passwordSchema with strength requirements
- [ ] 33.4 Define phoneSchema with regex validation
- [ ] 33.5 Define urlSchema for URL validation
- [ ] 33.6 Define slugSchema for slug validation
- [ ] 33.7 Define priceSchema with min/max constraints
- [ ] 33.8 Define inventorySchema with int constraints
- [ ] 33.9 Write tests for validation schemas

### 34. Error Handling
- [ ] 34.1 Create lib/errors.ts
- [ ] 34.2 Define AppError base class
- [ ] 34.3 Define ValidationError class
- [ ] 34.4 Define NotFoundError class
- [ ] 34.5 Define UnauthorizedError class
- [ ] 34.6 Define ForbiddenError class
- [ ] 34.7 Create components/error-boundary.tsx
- [ ] 34.8 Add error boundary to app/error.tsx
- [ ] 34.9 Test error handling

### 35. API Response Helpers
- [ ] 35.1 Create lib/api-response.ts
- [ ] 35.2 Implement successResponse() helper
- [ ] 35.3 Implement errorResponse() helper
- [ ] 35.4 Implement validationErrorResponse() helper
- [ ] 35.5 Test response helpers in API routes

## Phase 7: External Service Integrations

### 36. Stripe Integration
- [ ] 36.1 Install Stripe SDK
- [ ] 36.2 Create lib/stripe.ts with Stripe client
- [ ] 36.3 Implement createPaymentIntent() with escrow (manual capture)
- [ ] 36.4 Implement capturePayment() for escrow release
- [ ] 36.5 Implement refundPayment() for disputes
- [ ] 36.6 Calculate platform fee (20%) in payment intent
- [ ] 36.7 Set up Stripe Connect for curators (future task)
- [ ] 36.8 Test payment creation with test cards

### 37. Stripe Webhooks
- [ ] 37.1 Create app/api/webhooks/stripe/route.ts
- [ ] 37.2 Verify webhook signature
- [ ] 37.3 Handle payment_intent.succeeded event
- [ ] 37.4 Handle payment_intent.payment_failed event
- [ ] 37.5 Handle charge.refunded event
- [ ] 37.6 Update order status based on events
- [ ] 37.7 Test webhooks with Stripe CLI

### 38. Email Integration (Resend)
- [ ] 38.1 Install Resend SDK
- [ ] 38.2 Create lib/email.ts with Resend client
- [ ] 38.3 Implement sendEmail() function
- [ ] 38.4 Create email templates object
- [ ] 38.5 Implement orderConfirmation template
- [ ] 38.6 Implement orderShipped template
- [ ] 38.7 Implement emailVerification template
- [ ] 38.8 Implement passwordReset template
- [ ] 38.9 Test email sending in development

### 39. SMS Integration (Twilio)
- [ ] 39.1 Install Twilio SDK
- [ ] 39.2 Create lib/sms.ts with Twilio client
- [ ] 39.3 Implement sendSMS() function
- [ ] 39.4 Create SMS templates object
- [ ] 39.5 Implement orderConfirmation SMS template
- [ ] 39.6 Implement orderShipped SMS template
- [ ] 39.7 Implement dropLive SMS template
- [ ] 39.8 Test SMS sending in development

### 40. Image Upload (Vercel Blob)
- [ ] 40.1 Install @vercel/blob package
- [ ] 40.2 Create lib/upload.ts
- [ ] 40.3 Implement uploadImage() function
- [ ] 40.4 Implement uploadMultipleImages() function
- [ ] 40.5 Add file size and type validation
- [ ] 40.6 Test image upload to Vercel Blob
- [ ] 40.7 Create image upload component

### 41. Rate Limiting (Upstash Redis)
- [ ] 41.1 Install @upstash/ratelimit and @upstash/redis
- [ ] 41.2 Create lib/rate-limit.ts
- [ ] 41.3 Configure Redis connection with Upstash
- [ ] 41.4 Create authRateLimit (5 req/min)
- [ ] 41.5 Create apiRateLimit (100 req/min)
- [ ] 41.6 Create checkoutRateLimit (10 req/min)
- [ ] 41.7 Integrate rate limiting in middleware
- [ ] 41.8 Test rate limiting with multiple requests

## Phase 8: Background Jobs & Queues

### 42. BullMQ Setup
- [ ] 42.1 Install bullmq and ioredis
- [ ] 42.2 Create lib/queue.ts
- [ ] 42.3 Configure Redis connection for BullMQ
- [ ] 42.4 Define notificationQueue
- [ ] 42.5 Define emailQueue
- [ ] 42.6 Define escrowQueue
- [ ] 42.7 Create job type definitions

### 43. Queue Helpers
- [ ] 43.1 Implement addNotificationJob() helper
- [ ] 43.2 Implement addEmailJob() helper
- [ ] 43.3 Implement addEscrowJob() helper
- [ ] 43.4 Configure job retry logic with exponential backoff
- [ ] 43.5 Test job creation

### 44. Notification Worker
- [ ] 44.1 Create workers/notification-worker.ts
- [ ] 44.2 Implement worker to process notification jobs
- [ ] 44.3 Fetch user preferences from database
- [ ] 44.4 Send email if emailNotifications enabled
- [ ] 44.5 Send SMS if smsNotifications enabled
- [ ] 44.6 Handle worker completion and failure events
- [ ] 44.7 Test notification worker

### 45. Email Worker
- [ ] 45.1 Create workers/email-worker.ts
- [ ] 45.2 Implement worker to process email jobs
- [ ] 45.3 Call sendEmail() function
- [ ] 45.4 Handle email send failures
- [ ] 45.5 Log completion and failure events
- [ ] 45.6 Test email worker

### 46. Escrow Worker
- [ ] 46.1 Create workers/escrow-worker.ts
- [ ] 46.2 Implement worker to process escrow jobs
- [ ] 46.3 Handle 'release' action (capture payment)
- [ ] 46.4 Check 7-day dispute window before release
- [ ] 46.5 Handle 'refund' action (refund payment)
- [ ] 46.6 Update order status after escrow action
- [ ] 46.7 Test escrow worker

### 47. Scheduled Jobs (Cron)
- [ ] 47.1 Create lib/cron.ts
- [ ] 47.2 Implement scheduleEscrowReleaseJob() (daily at 2 AM)
- [ ] 47.3 Implement initializeScheduledJobs() function
- [ ] 47.4 Call initialization in server startup
- [ ] 47.5 Test scheduled job execution

### 48. Worker Process
- [ ] 48.1 Create workers/index.ts to start all workers
- [ ] 48.2 Add worker start script to package.json
- [ ] 48.3 Configure worker process for production
- [ ] 48.4 Test worker process startup
- [ ] 48.5 Add worker monitoring and logging

## Phase 9: Testing & Quality

### 49. Unit Tests Setup
- [ ] 49.1 Install Jest and React Testing Library
- [ ] 49.2 Configure Jest for Next.js
- [ ] 49.3 Create jest.config.js
- [ ] 49.4 Set up test database
- [ ] 49.5 Add test scripts to package.json

### 50. Utility Tests
- [ ] 50.1 Write tests for date utilities
- [ ] 50.2 Write tests for price utilities
- [ ] 50.3 Write tests for string utilities
- [ ] 50.4 Write tests for validation schemas
- [ ] 50.5 Write tests for error classes
- [ ] 50.6 Achieve 90%+ coverage for utilities

### 51. Integration Tests
- [ ] 51.1 Write tests for authentication flow
- [ ] 51.2 Write tests for subdomain routing
- [ ] 51.3 Write tests for collective theming
- [ ] 51.4 Write tests for rate limiting
- [ ] 51.5 Write tests for queue job processing

### 52. E2E Tests Setup
- [ ] 52.1 Install Playwright
- [ ] 52.2 Configure Playwright for Next.js
- [ ] 52.3 Create playwright.config.ts
- [ ] 52.4 Set up test fixtures
- [ ] 52.5 Add e2e test scripts to package.json

### 53. E2E Tests
- [ ] 53.1 Write test: User signup and login
- [ ] 53.2 Write test: OAuth login (Google, GitHub)
- [ ] 53.3 Write test: Password reset flow
- [ ] 53.4 Write test: Email verification
- [ ] 53.5 Write test: Protected route access
- [ ] 53.6 Write test: Subdomain routing
- [ ] 53.7 Write test: Collective theme switching

## Phase 10: Documentation & Deployment

### 54. Documentation
- [ ] 54.1 Update README.md with project overview
- [ ] 54.2 Document environment variables
- [ ] 54.3 Document database setup and migrations
- [ ] 54.4 Document authentication setup
- [ ] 54.5 Document subdomain configuration
- [ ] 54.6 Document external service setup (Stripe, Resend, Twilio)
- [ ] 54.7 Document development workflow
- [ ] 54.8 Document deployment process
- [ ] 54.9 Create CONTRIBUTING.md
- [ ] 54.10 Create API documentation

### 55. Production Configuration
- [ ] 55.1 Set up production database (Vercel Postgres or Supabase)
- [ ] 55.2 Configure production environment variables in Vercel
- [ ] 55.3 Set up Stripe production keys and webhooks
- [ ] 55.4 Configure Resend production API key
- [ ] 55.5 Configure Twilio production credentials
- [ ] 55.6 Set up Upstash Redis for production
- [ ] 55.7 Configure Sentry for error monitoring
- [ ] 55.8 Set up Vercel Analytics

### 56. DNS & Subdomain Setup
- [ ] 56.1 Purchase domain (dropr.com)
- [ ] 56.2 Configure DNS records for main domain
- [ ] 56.3 Add CNAME records for make.dropr.com
- [ ] 56.4 Add CNAME records for mod.dropr.com
- [ ] 56.5 Add CNAME records for mini.dropr.com
- [ ] 56.6 Verify subdomain routing in production
- [ ] 56.7 Configure SSL certificates

### 57. Deployment
- [ ] 57.1 Connect GitHub repository to Vercel
- [ ] 57.2 Configure build settings in Vercel
- [ ] 57.3 Run database migrations in production
- [ ] 57.4 Deploy to production
- [ ] 57.5 Verify deployment success
- [ ] 57.6 Test all features in production
- [ ] 57.7 Monitor error logs in Sentry

### 58. Post-Deployment
- [ ] 58.1 Set up automated database backups
- [ ] 58.2 Configure uptime monitoring
- [ ] 58.3 Set up performance monitoring
- [ ] 58.4 Create runbook for common issues
- [ ] 58.5 Set up alerts for critical errors
- [ ] 58.6 Document rollback procedure
- [ ] 58.7 Create incident response plan

---

## Notes

- This foundation must be complete before implementing feature specs
- All tasks should be completed in order within each phase
- Some phases can be parallelized (e.g., utilities while auth is being built)
- Mark tasks as complete using `[x]` when done
- Each task should take 1-4 hours to complete
- Test thoroughly at each phase before moving forward
- Document any deviations from the plan
- Keep environment variables secure and never commit them
