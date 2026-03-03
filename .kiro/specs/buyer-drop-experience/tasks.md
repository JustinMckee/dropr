# Buyer Drop Experience - Implementation Tasks

## Prerequisites
This spec assumes the following foundation is already in place:
- Next.js 15+ project with TypeScript and App Router
- Prisma with PostgreSQL (Drop, Order, Buyer, Curator models)
- Subdomain middleware and collective detection
- Authentication system (NextAuth.js)
- Collective-specific theming infrastructure
- shadcn/ui component library

If these are not set up, create a "platform-foundation" spec first.

## Phase 1: Drop Discovery & Browsing

### 1. Drop Browsing & Discovery
- [ ] 1.1 Create drops listing page (app/(shop)/drops/page.tsx) with SSR
- [ ] 1.2 Implement Server Action to fetch drops filtered by collective (features/drops/models/drop.actions.ts)
- [ ] 1.3 Create DropCard component with drop type badge, countdown, inventory
- [ ] 1.4 Implement DropGrid component for responsive grid layout
- [ ] 1.5 Add filtering UI (drop type, price range, status)
- [ ] 1.6 Implement search functionality (title, description, tags)
- [ ] 1.7 Add sorting options (newest, ending soon, popular, price)
- [ ] 1.8 Create featured drops section on homepage
- [ ] 1.9 Implement trending drops algorithm (views, sales velocity, save rate)
- [ ] 1.10 Add "ending soon" section (drops ending in < 6 hours)

### 2. Drop Detail Page
- [ ] 2.1 Create drop detail page (app/(shop)/drops/[slug]/page.tsx) with SSR
- [ ] 2.2 Implement Server Action to fetch drop by slug with relations
- [ ] 2.3 Create DropHero component with image, title, curator info
- [ ] 2.4 Display drop type badge (Mystery Box, Surplus, Limited Edition)
- [ ] 2.5 Show price, inventory, and countdown timer
- [ ] 2.6 Create CuratorProfile sidebar component with reputation
- [ ] 2.7 Display escrow protection messaging (20% fee, 7-day dispute window)
- [ ] 2.8 Add shipping policy and estimated ship date
- [ ] 2.9 Implement related drops section (same collective)
- [ ] 2.10 Add share drop functionality (social sharing)
- [ ] 2.11 Implement save/follow drop button
- [ ] 2.12 Generate SEO metadata (title, description, og:image)

### 3. Real-Time Updates (SSE)
- [ ] 3.1 Create SSE route handler (app/api/drops/[id]/stream/route.ts)
- [ ] 3.2 Implement polling mechanism to fetch drop updates every 5 seconds
- [ ] 3.3 Stream inventory, sold count, and status changes
- [ ] 3.4 Create useDropUpdates() hook for client-side SSE consumption
- [ ] 3.5 Update DropCard to use real-time inventory data
- [ ] 3.6 Update drop detail page to use real-time data
- [ ] 3.7 Handle SSE connection errors and reconnection
- [ ] 3.8 Close SSE stream when drop ends or sells out

### 4. Countdown Timer
- [ ] 4.1 Create CountdownTimer component with days/hours/minutes/seconds
- [ ] 4.2 Implement client-side countdown calculation
- [ ] 4.3 Handle countdown completion (show "Live now!" or "Ended")
- [ ] 4.4 Add timezone-aware countdown display
- [ ] 4.5 Test countdown accuracy across different timezones
- [ ] 4.6 Optimize countdown to avoid excessive re-renders

## Phase 2: Cart & Checkout

### 5. Cart Management (MVVM Pattern)
- [ ] 5.1 Create cart store factory (features/cart/stores/cart.store.ts)
- [ ] 5.2 Implement CartStoreProvider with Context
- [ ] 5.3 Create useCart() hook with selectors
- [ ] 5.4 Implement addItem, removeItem, clearCart actions
- [ ] 5.5 Add cart persistence with localStorage
- [ ] 5.6 Create CartSummary component showing items and total
- [ ] 5.7 Implement cart validation (check inventory before checkout)
- [ ] 5.8 Add cart item quantity limits (1 per drop per buyer)

### 6. Checkout Flow
- [ ] 6.1 Create checkout page (app/checkout/[dropId]/page.tsx)
- [ ] 6.2 Implement CartCheckoutSlideIn component (Sheet from shadcn/ui)
- [ ] 6.3 Create multi-step checkout (cart → shipping → payment)
- [ ] 6.4 Implement CheckoutForm with React Hook Form + Zod validation
- [ ] 6.5 Add shipping address form with validation
- [ ] 6.6 Implement guest checkout flow
- [ ] 6.7 Add "create account" option during checkout
- [ ] 6.8 Show order summary with price breakdown (item + platform fee)
- [ ] 6.9 Add terms of service and escrow protection messaging
- [ ] 6.10 Implement checkout error handling and recovery

### 7. Payment Integration (Stripe)
- [ ] 7.1 Create Server Action to create PaymentIntent with escrow (capture_method: 'manual')
- [ ] 7.2 Calculate platform fee (20%) and curator payout (80%)
- [ ] 7.3 Implement Stripe Elements for payment form
- [ ] 7.4 Add support for credit/debit cards
- [ ] 7.5 Add Apple Pay and Google Pay support
- [ ] 7.6 Implement payment confirmation and order creation
- [ ] 7.7 Handle payment errors and display user-friendly messages
- [ ] 7.8 Create Stripe webhook handler for payment events (app/api/webhooks/stripe/route.ts)
- [ ] 7.9 Test payment flow with Stripe test cards
- [ ] 7.10 Implement payment retry logic for failed payments

### 8. Order Creation & Inventory Management
- [ ] 8.1 Create Server Action to create order (features/orders/models/order.actions.ts)
- [ ] 8.2 Implement atomic inventory locking with Prisma transaction
- [ ] 8.3 Prevent overselling with inventory check (sold + reserved < inventory)
- [ ] 8.4 Generate unique order ID (cuid)
- [ ] 8.5 Store shipping address and payment details
- [ ] 8.6 Update drop sold count and inventory
- [ ] 8.7 Handle concurrent order attempts (race conditions)
- [ ] 8.8 Implement order rollback on payment failure
- [ ] 8.9 Add order confirmation page with next steps
- [ ] 8.10 Test inventory management with property-based tests

## Phase 3: Order Management & Tracking

### 9. Order Dashboard
- [ ] 9.1 Create orders page (app/(dashboard)/orders/page.tsx) with auth
- [ ] 9.2 Fetch buyer's orders with drop and curator details
- [ ] 9.3 Create OrderList component showing order history
- [ ] 9.4 Display order status badges (Paid, Packing, Shipped, Delivered)
- [ ] 9.5 Add order filtering (status, date range)
- [ ] 9.6 Implement order search by drop name or order ID
- [ ] 9.7 Create FollowedDrops component showing upcoming drops
- [ ] 9.8 Create PendingReviews component for delivered orders
- [ ] 9.9 Add dashboard navigation and layout
- [ ] 9.10 Implement mobile-responsive dashboard design

### 10. Order Detail & Tracking
- [ ] 10.1 Create order detail page (app/(dashboard)/orders/[id]/page.tsx)
- [ ] 10.2 Display order timeline (paid → closed → packing → shipped → delivered)
- [ ] 10.3 Show shipping address and payment details
- [ ] 10.4 Display tracking number and carrier information
- [ ] 10.5 Integrate with shipping API (EasyPost or Shippo) for tracking updates
- [ ] 10.6 Add "mark as received" button for delivered orders
- [ ] 10.7 Show escrow release date (delivery + 7 days)
- [ ] 10.8 Implement order cancellation (before drop closes)
- [ ] 10.9 Add dispute filing option
- [ ] 10.10 Create order receipt download (PDF)

### 11. Notification System
- [ ] 11.1 Create email templates (order confirmation, shipping, delivery)
- [ ] 11.2 Implement sendOrderConfirmation() function using Resend
- [ ] 11.3 Implement sendShippingNotification() function
- [ ] 11.4 Implement sendOrderConfirmationSMS() function using Twilio
- [ ] 11.5 Create BullMQ notification queue with Redis
- [ ] 11.6 Implement notification worker to process jobs
- [ ] 11.7 Add notification preferences page (email, SMS, push)
- [ ] 11.8 Test notification delivery and error handling
- [ ] 11.9 Implement notification retry logic for failures
- [ ] 11.10 Add unsubscribe functionality for marketing emails

### 12. Escrow & Payment Release
- [ ] 12.1 Create Server Action to release escrow (lib/escrow.ts)
- [ ] 12.2 Check if 7-day dispute window has passed
- [ ] 12.3 Capture Stripe PaymentIntent to release funds
- [ ] 12.4 Update order status to REVEALED
- [ ] 12.5 Calculate and record platform fee and curator payout
- [ ] 12.6 Implement automated escrow release job (runs daily)
- [ ] 12.7 Handle escrow release failures and retries
- [ ] 12.8 Send notification to curator when funds are released
- [ ] 12.9 Add escrow status to order detail page
- [ ] 12.10 Test escrow release with test Stripe accounts

## Phase 4: Reviews & Feedback

### 13. Reveal Experience (Mystery Boxes)
- [ ] 13.1 Create RevealModal component for mystery box reveals
- [ ] 13.2 Implement "Reveal My Drop" button with animation
- [ ] 13.3 Add photo upload for unboxing photos
- [ ] 13.4 Integrate with Vercel Blob for image storage
- [ ] 13.5 Implement image optimization and resizing
- [ ] 13.6 Add social sharing for reveals (Twitter, Instagram)
- [ ] 13.7 Update order revealedAt timestamp
- [ ] 13.8 Skip reveal for non-mystery box drops
- [ ] 13.9 Test reveal flow end-to-end
- [ ] 13.10 Add reveal gallery to curator profile

### 14. Review & Rating System
- [ ] 14.1 Create ReviewForm component with star ratings
- [ ] 14.2 Implement 4 rating categories (overall, value, quality, curation)
- [ ] 14.3 Add optional written review (textarea with character limit)
- [ ] 14.4 Create Server Action to submit review
- [ ] 14.5 Set review moderationStatus to PENDING
- [ ] 14.6 Implement review moderation queue for admins
- [ ] 14.7 Display approved reviews on drop detail page
- [ ] 14.8 Calculate and update curator averageRating
- [ ] 14.9 Add review photos to review display
- [ ] 14.10 Implement review reporting for inappropriate content

### 15. Dispute Management
- [ ] 15.1 Create dispute filing form (reason, description, evidence)
- [ ] 15.2 Implement Server Action to create dispute
- [ ] 15.3 Update order status to DISPUTED
- [ ] 15.4 Send notification to curator and admin
- [ ] 15.5 Create admin dispute review interface
- [ ] 15.6 Implement dispute resolution workflow
- [ ] 15.7 Add refund processing for resolved disputes
- [ ] 15.8 Update order and escrow status after resolution
- [ ] 15.9 Send resolution notification to buyer and curator
- [ ] 15.10 Test dispute flow with various scenarios

## Phase 5: User Features

### 16. Curator & Drop Following
- [ ] 16.1 Create Server Action to follow/unfollow curator
- [ ] 16.2 Implement CuratorFollow model operations
- [ ] 16.3 Add "Follow" button to curator profile
- [ ] 16.4 Create Server Action to follow/unfollow drop
- [ ] 16.5 Implement DropFollow model operations
- [ ] 16.6 Add "Save Drop" button to drop detail page
- [ ] 16.7 Send notification when followed curator creates new drop
- [ ] 16.8 Display followed curators on dashboard
- [ ] 16.9 Display saved drops on dashboard
- [ ] 16.10 Add follower count to curator profile

### 17. Notification Preferences
- [ ] 17.1 Create settings page (app/(dashboard)/settings/page.tsx)
- [ ] 17.2 Add notification preferences form (email, SMS, push)
- [ ] 17.3 Implement preference toggles (followed curators, ending soon, new drops)
- [ ] 17.4 Create Server Action to update preferences
- [ ] 17.5 Add collective-specific notification preferences
- [ ] 17.6 Implement unsubscribe links in emails
- [ ] 17.7 Add "Do Not Disturb" mode
- [ ] 17.8 Test preference changes reflect in notifications
- [ ] 17.9 Add notification frequency settings (instant, daily digest)
- [ ] 17.10 Implement notification preview/test

## Phase 6: Testing & Quality

### 18. Unit Tests
- [ ] 18.1 Write tests for Server Actions (drop fetching, order creation)
- [ ] 18.2 Write tests for Zustand stores (cart, drop state)
- [ ] 18.3 Write tests for utility functions (date formatting, price calculations)
- [ ] 18.4 Write tests for validation schemas (Zod)
- [ ] 18.5 Write tests for email/SMS sending functions
- [ ] 18.6 Write tests for escrow release logic
- [ ] 18.7 Achieve 80%+ code coverage for critical paths
- [ ] 18.8 Set up Jest and React Testing Library
- [ ] 18.9 Configure test database for integration tests
- [ ] 18.10 Add test scripts to package.json

### 19. Property-Based Tests
- [ ] 19.1 Install fast-check for property-based testing
- [ ] 19.2 Write property test: No overselling (inventory consistency)
- [ ] 19.3 Write property test: Payment atomicity (order exists ⟺ payment succeeded)
- [ ] 19.4 Write property test: Escrow balance (total escrowed = sum of paid, non-released orders)
- [ ] 19.5 Write property test: Valid order state transitions
- [ ] 19.6 Write property test: Platform fee calculation (always 20%)
- [ ] 19.7 Write property test: Countdown timer accuracy
- [ ] 19.8 Run property tests with 1000+ iterations
- [ ] 19.9 Document failing cases and fix bugs
- [ ] 19.10 Add property tests to CI pipeline

### 20. Integration Tests (Playwright)
- [ ] 20.1 Set up Playwright and configure browsers
- [ ] 20.2 Write test: Browse drops and filter by collective
- [ ] 20.3 Write test: View drop detail and add to cart
- [ ] 20.4 Write test: Complete checkout flow (guest)
- [ ] 20.5 Write test: Complete checkout flow (authenticated)
- [ ] 20.6 Write test: Track order and view status
- [ ] 20.7 Write test: Submit review after delivery
- [ ] 20.8 Write test: Follow curator and receive notifications
- [ ] 20.9 Write test: File dispute and resolve
- [ ] 20.10 Add visual regression tests for key pages

## Phase 7: Performance & Polish

### 21. Performance Optimization
- [ ] 21.1 Implement Next.js Image component for all images
- [ ] 21.2 Add image optimization with Vercel Blob
- [ ] 21.3 Implement ISR for drop listings (60s revalidation)
- [ ] 21.4 Implement ISR for drop details (30s revalidation)
- [ ] 21.5 Add loading skeletons for async components
- [ ] 21.6 Implement React Suspense boundaries
- [ ] 21.7 Optimize database queries with proper indexes
- [ ] 21.8 Add database connection pooling
- [ ] 21.9 Implement rate limiting for API routes
- [ ] 21.10 Measure and optimize Core Web Vitals (LCP, FID, CLS)

### 22. Security Hardening
- [ ] 22.1 Implement CSRF protection for forms
- [ ] 22.2 Add input sanitization for user-generated content
- [ ] 22.3 Implement rate limiting for authentication endpoints
- [ ] 22.4 Add bot protection for checkout (Cloudflare Turnstile)
- [ ] 22.5 Implement SQL injection prevention (Prisma parameterized queries)
- [ ] 22.6 Add XSS protection (Content Security Policy)
- [ ] 22.7 Implement secure session management
- [ ] 22.8 Add HTTPS enforcement
- [ ] 22.9 Implement security headers (HSTS, X-Frame-Options)
- [ ] 22.10 Run security audit and fix vulnerabilities

### 23. Monitoring & Analytics
- [ ] 23.1 Set up Vercel Analytics for performance monitoring
- [ ] 23.2 Set up Sentry for error tracking
- [ ] 23.3 Implement custom error boundaries
- [ ] 23.4 Add logging for critical operations (orders, payments)
- [ ] 23.5 Track conversion funnel (view → cart → checkout → purchase)
- [ ] 23.6 Monitor drop performance (views, saves, sales)
- [ ] 23.7 Set up uptime monitoring (Vercel or external)
- [ ] 23.8 Create alerts for critical errors (payment failures, inventory issues)
- [ ] 23.9 Implement analytics event tracking (drop views, purchases, reviews)
- [ ] 23.10 Create buyer behavior reports for insights

## Optional Enhancements (Post-Launch)

### 24. Advanced Features
- [ ] 24.1 Implement drop waitlist with automatic notifications
- [ ] 24.2 Create drop recommendations for buyers
- [ ] 24.3 Add early access for followers
- [ ] 24.4 Implement drop bundles (buy multiple drops together)
- [ ] 24.5 Add gift purchase functionality
- [ ] 24.6 Create buyer wishlist feature
- [ ] 24.7 Implement referral program
- [ ] 24.8 Add drop reminders (SMS/email before drop goes live)
- [ ] 24.9 Create buyer badges/achievements
- [ ] 24.10 Implement social features (buyer profiles, activity feed)

---

## Notes

- This spec focuses on the buyer-facing features only
- Foundation tasks (project setup, database, auth, subdomain middleware) should be in a separate "platform-foundation" spec
- Curator-facing features (drop creation, analytics) should be in a separate "curator-dashboard" spec
- Tasks are organized by phase for logical progression
- Each task should take 1-4 hours to complete
- Mark tasks as complete using `[x]` when done
- Property-based tests are critical for correctness
- Follow MVVM pattern for all state management
- Use Server Actions for all mutations
- Implement SSE for real-time updates
- Test thoroughly before moving to next phase
