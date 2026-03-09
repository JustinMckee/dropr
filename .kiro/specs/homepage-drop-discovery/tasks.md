# Implementation Plan: Homepage & Drop Discovery

## Overview

This implementation plan breaks down the homepage and drop discovery feature into discrete coding tasks. The feature implements four homepage variants (dropr.com + 3 collective subdomains) with MVVM architecture, scoped Zustand stores, horizontal scrolling sections, real-time SSE updates, and comprehensive accessibility compliance.

The implementation follows a bottom-up approach: core infrastructure first, then shared components, then feature-specific sections, and finally integration and optimization.

## Tasks

- [x] 1. Set up core infrastructure and middleware
  - Create middleware for subdomain detection and collective filtering
  - Set up TypeScript types for Drop, Curator, HomepageData
  - Configure environment variables and constants
  - _Requirements: 1.1, 1.2, 2.3, 2.4, 4.4, 4.5, 21.1-21.9_

- [x] 2. Implement data layer (Models)
  - [x] 2.1 Create homepage TypeScript types and interfaces
    - Define Drop, Curator, FeaturedCurator, FeaturedDrop interfaces
    - Define HomepageData and PlatformStats interfaces
    - Define FilterOptions and SortOption types
    - _Requirements: All requirements (data foundation)_

  - [x] 2.2 Implement Server Actions for data fetching
    - Create fetchHomepageData() with collective-based filtering
    - Implement fetchFeaturedDrops(), fetchLiveUpcomingDrops()
    - Implement fetchFoundingCurators(), fetchPopularCurators()
    - Implement fetchCuratorSpotlights(), fetchDropSpotlights()
    - Implement fetchPlatformStats()
    - Add caching with unstable_cache (60s revalidation)
    - _Requirements: 2.1-2.4, 3.1-3.3, 4.1-4.5, 5.1-5.2, 6.1-6.2, 7.1-7.2, 16.1-16.8_

  - [ ]* 2.3 Write property test for collective filtering
    - **Property 1: Collective Homepage Filtering**
    - **Validates: Requirements 2.4, 4.5**
    - Test that Collective_Homepage only shows drops from that collective

  - [ ]* 2.4 Write property test for filter subset preservation
    - **Property 17: Filter Subset Preservation**
    - **Validates: Requirements 15.7**
    - Test that filtered drops are always a subset of original list

- [x] 3. Implement real-time updates (SSE)
  - [x] 3.1 Create SSE endpoint for drop updates
    - Implement /api/drops/stream route handler
    - Stream countdown, inventory, and status updates every second
    - Handle client disconnection and cleanup
    - _Requirements: 10.1-10.7, 2.14_

  - [x] 3.2 Implement countdown calculation utilities
    - Create calculateCountdown() function with timezone handling
    - Implement unified countdown formatting logic for both upcoming and live drops
    - Support "2+ hours" static display for > 2 hours remaining
    - Support "1 hr, X min" with 15-minute updates for 1-2 hours remaining
    - Support "Xm Ys" with 1-second updates for < 1 hour remaining
    - Apply same logic to both upcoming (time until start) and live (time until end) drops
    - _Requirements: 10.1-10.12_

  - [ ]* 3.3 Write property test for countdown monotonicity
    - **Property 7: Countdown Monotonicity**
    - **Validates: Requirements 10.9**
    - Test that countdown never increases between calculations
    - Account for discrete update intervals (15 min vs 1 sec)

  - [ ]* 3.4 Write property test for timezone-independent countdown
    - **Property 8: Timezone-Independent Countdown**
    - **Validates: Requirements 10.11**
    - Test countdown accuracy across different timezones
    - Test formatting is correct regardless of timezone

- [ ] 4. Checkpoint - Ensure data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement ViewModel layer (Zustand stores)
  - [x] 5.1 Create homepage Zustand store factory
    - Implement createHomepageStore() with state and actions
    - Add loadHomepageData(), subscribeToDropUpdates(), unsubscribe()
    - Add updateDropFromSSE() for real-time updates
    - Add setFilters(), setSort(), clearFilters()
    - Add followedDropIds Set to track followed drops
    - Add toggleFollowDrop() with optimistic UI update
    - Add loadFollowedDrops() for authenticated users
    - _Requirements: 2.14, 10.4, 10.7, 15.1-15.11, 24.1-24.10_

  - [x] 5.2 Implement filtering and sorting logic in store
    - Add client-side filter application (dropType, priceRange, status, collective)
    - Add client-side sort application (newest, ending soon, price)
    - Maintain scroll position during real-time updates
    - _Requirements: 15.1-15.11, 4.3_

  - [ ]* 5.3 Write property test for sort stability
    - **Property 18: Sort Stability**
    - **Validates: Requirements 15.6**
    - Test that sorting twice produces identical results

  - [ ]* 5.4 Write property test for filter result count accuracy
    - **Property 10: Filter Result Count Accuracy**
    - **Validates: Requirements 15.10**
    - Test that displayed count matches actual filtered drops

- [x] 6. Implement glue layer (Context Provider and hooks)
  - [x] 6.1 Create HomepageStoreProvider component
    - Implement Context Provider with scoped store instance
    - Add automatic data loading on mount
    - Add cleanup on unmount (unsubscribe from SSE)
    - _Requirements: All requirements (state management foundation)_

  - [x] 6.2 Create useHomepage hook and convenience selectors
    - Implement useHomepage() base hook with selector support
    - Create convenience hooks: useHomepageData(), useFeaturedDrops(), etc.
    - Implement useLiveUpcomingDrops() with filtering and sorting
    - _Requirements: All requirements (state access)_

- [x] 7. Implement shared UI components
  - [x] 7.1 Create CountdownTimer component
    - Implement client-side countdown with dynamic update intervals
    - Add unified format logic based on time remaining (same for upcoming and live)
    - Implement visual distinction between upcoming and live timers (color, icon, styling)
    - For > 2 hours remaining: display "2+ hours" (static)
    - For 1-2 hours remaining: display "1 hr, X min", update every 15 minutes
    - For < 1 hour remaining: display "Xm Ys", update every second
    - Apply same display logic to both upcoming and live drops
    - Handle countdown expiration with callback
    - _Requirements: 10.1-10.12_

  - [ ]* 7.2 Write property test for countdown format
    - **Property 5: Countdown Format for Upcoming Drops**
    - **Property 6: Countdown Format for Live Drops**
    - **Validates: Requirements 10.2-10.8**
    - Test countdown displays correct format based on time remaining
    - Test same format logic applies to both upcoming and live drops
    - Test update intervals are appropriate (static, 15 min, 1 sec)

  - [x] 7.3 Create HorizontalScrollSection component
    - Implement scroll container with CSS scroll-snap
    - Add mouse drag scrolling for desktop
    - Add scroll indicators (left/right arrows) with visibility logic
    - Add keyboard navigation (arrow keys, tab)
    - Maintain scroll position during content updates
    - _Requirements: 2.5-2.7, 2.15, 3.9-3.12, 4.7-4.9, 5.9-5.12, 22.1-22.12_

  - [ ]* 7.4 Write unit tests for HorizontalScrollSection
    - Test scroll indicator visibility based on scroll position
    - Test keyboard navigation
    - Test scroll position maintenance during updates

  - [x] 7.5 Create DropCard component
    - Display drop title, cover image, price, curator info
    - Add CountdownTimer for live/upcoming drops
    - Display inventory status and sold out overlay
    - Show collective badge (conditional on showCollectiveBadge prop)
    - Display drop type badge and average rating
    - Add follow icon (bookmark/heart/bell) in top-right corner
    - Implement follow icon toggle with optimistic UI update
    - Handle unauthenticated follow click (redirect to login)
    - Handle authenticated follow click (toggle follow state)
    - Show followed state (filled icon or different color)
    - Ensure follow icon is keyboard accessible with ARIA labels
    - _Requirements: 2.8-2.13, 4.10-4.13, 24.1-24.10_

  - [ ]* 7.6 Write property test for drop card required fields
    - **Property 2: Drop Card Required Fields**
    - **Validates: Requirements 2.8, 2.12**
    - Test that all required fields are present on drop cards

  - [ ]* 7.7 Write property test for collective badge display
    - **Property 3: Collective Badge Display on Main Homepage**
    - **Validates: Requirements 2.9, 4.6, 7.9**
    - Test that Main_Homepage shows badges, Collective_Homepage doesn't

  - [x] 7.8 Create CuratorCard component
    - Display curator avatar, name, bio snippet
    - Show reputation score, completed drops, average rating
    - Display verification badge and founding curator badge
    - Emphasize person/team over brand names
    - _Requirements: 3.4-3.7, 5.3-5.7_

  - [ ]* 7.9 Write property test for curator card required fields
    - **Property 4: Curator Card Required Fields**
    - **Validates: Requirements 3.4, 3.5, 3.6**
    - Test that all required fields are present on curator cards

  - [x] 7.10 Create loading skeletons
    - Implement DropCardSkeleton component
    - Implement CuratorCardSkeleton component
    - Implement HorizontalScrollSkeleton component
    - _Requirements: 12.1-12.9, 23.1-23.8_

  - [x] 7.11 Create error and empty state components
    - Implement EmptyState component with CTA
    - Implement ErrorBoundary component with retry
    - Implement LiveRegion for screen reader announcements
    - _Requirements: 23.1-23.8_

- [ ] 8. Checkpoint - Ensure shared components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement homepage sections
  - [x] 9.1 Create HeroSection component
    - Display headline tailored to the collective or platform-wide for Main_Homepage
    - Render primary, secondary, tertiary CTAs
    - Hide CTAs based on authentication state
    - Implement mobile-optimized layout
    - _Requirements: 1.1-1.9_

  - [x] 9.2 Create FeaturedDropsSection component
    - Use HorizontalScrollSection with DropCard components
    - Display 6-12 featured drops
    - Show collective badge on Main_Homepage only
    - Include "View All" link
    - _Requirements: 2.1-2.15_

  - [x] 9.3 Create LiveUpcomingDropsSection component
    - Use HorizontalScrollSection with DropCard components
    - Display 8-16 drops prioritized by status and start time
    - Apply filtering and sorting from store
    - Show collective badge on Main_Homepage only
    - _Requirements: 4.1-4.15_

  - [ ]* 9.4 Write property test for drop sort order
    - **Property 9: Drop Sort Order**
    - **Validates: Requirements 4.3**
    - Test that live drops appear before upcoming drops

  - [x] 9.5 Create PopularCuratorsSection component
    - Display three sections on Main_Homepage (Modders, Makers, Minists)
    - Display one section on Collective_Homepage
    - Use HorizontalScrollSection with CuratorCard components
    - Display 6-12 curators per section
    - _Requirements: 3.1-3.13_

  - [ ]* 9.6 Write property test for popular curator section on Collective Homepage
    - **Property 16: Popular Curator Section on Collective Homepage**
    - **Validates: Requirements 3.2**
    - Test that Collective_Homepage shows exactly one curator section

  - [x] 9.7 Create FoundingCuratorsSection component
    - Use HorizontalScrollSection with CuratorCard components
    - Display 8-15 founding curators
    - Show "Founding Curator" badge on cards
    - _Requirements: 5.1-5.12_

  - [x] 9.8 Create CuratorSpotlight component
    - Implement full-width layout with curator info and hero image
    - Display curator avatar, name, and bio snippet (teaser only)
    - Display total drops count as social proof
    - Preview 3-5 recent drops in horizontal scroll
    - Add prominent "View Profile" CTA button
    - Filter by collective on Collective_Homepage
    - _Requirements: 6.1-6.12_

  - [ ]* 9.9 Write property test for curator spotlight required fields
    - **Property 12: Curator Spotlight Required Fields**
    - **Validates: Requirements 6.3, 6.4, 6.5**
    - Test that spotlights display avatar, name, bio snippet, recent drops preview, and total drops count

  - [ ]* 9.10 Write property test for spotlight filtering on Collective Homepage
    - **Property 14: Spotlight Filtering on Collective Homepage**
    - **Validates: Requirements 6.10**
    - Test that Collective_Homepage spotlights match collective

  - [x] 9.11 Create DropSpotlight component
    - Implement full-width layout with hero image and drop info
    - Display curator information, price, inventory, countdown
    - Add "View Drop" and "Add to Cart" CTAs
    - Show collective badge on Main_Homepage only
    - _Requirements: 7.1-7.11_

  - [ ]* 9.12 Write property test for drop spotlight required fields
    - **Property 13: Drop Spotlight Required Fields**
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**
    - Test that spotlights display all required drop information

  - [x] 9.13 Create ValuePropositionBuyers component
    - Display "Why Dropr" section emphasizing unique value proposition
    - Highlight themed mystery boxes BY makers FOR makers
    - Highlight themed surplus from makers' personal collections
    - Highlight limited edition runs created by makers for makers
    - Include trust signals (escrow, verified curators, ratings)
    - Use "by makers, for makers" messaging on Main_Homepage
    - Use tailored messaging on Collective_Homepage (e.g., "by modders, for modders")
    - Add visual representations of three drop types (mystery box, surplus, limited edition)
    - Add CTA to browse drops or sign up
    - _Requirements: 8.1-8.8_

  - [x] 9.14 Create ValuePropositionCurators component
    - Display "Become a Curator" section with benefits
    - Show fee structure (80% payout)
    - Include social proof (curator count, total drops)
    - Add CTA to apply as curator
    - _Requirements: 9.1-9.7_

  - [x] 9.15 Create CollectiveSwitcher component
    - Display four options: "All", "MOD", "MAKE", "MINI"
    - Highlight current selection
    - Implement keyboard navigation
    - Create mobile-friendly dropdown variant
    - _Requirements: 21.1-21.9_

  - [ ]* 9.16 Write property test for collective filter exclusion
    - **Property 11: Collective Filter Exclusion on Collective Homepage**
    - **Validates: Requirements 15.5**
    - Test that Collective_Homepage doesn't show collective filter

- [ ] 10. Checkpoint - Ensure all sections render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement main homepage page component
  - [x] 11.1 Create app/page.tsx with all sections
    - Wrap page in HomepageStoreProvider
    - Compose all homepage sections in correct order
    - Implement responsive layout (mobile/tablet/desktop)
    - _Requirements: All requirements (page composition)_

  - [x] 11.2 Implement SEO metadata generation
    - Create generateMetadata() with tailored meta tags for each homepage variant
    - Add Open Graph tags for social sharing
    - Add Twitter Card tags
    - Set canonical URLs for each homepage variant
    - _Requirements: 11.1-11.9_

  - [x] 11.3 Add structured data (JSON-LD)
    - Implement WebSite schema for homepage
    - Add SearchAction for search functionality
    - Include Organization schema with platform info
    - _Requirements: 11.4_

  - [ ]* 11.4 Write integration tests for homepage
    - Test homepage loads and displays featured drops
    - Test navigation to drop detail on card click
    - Test horizontal scrolling with mouse drag
    - Test filtering drops by collective
    - Test collective switcher navigation

- [ ] 12. Implement filtering and sorting UI
  - [ ] 12.1 Create FilterPanel component
    - Add filter options for drop type, price range, status
    - Add collective filter on Main_Homepage only
    - Display active filter count
    - Add "Clear Filters" button
    - Update URL with query parameters
    - _Requirements: 15.1-15.11_

  - [ ] 12.2 Create SortDropdown component
    - Add sort options (Newest, Ending Soon, Price Low-High, Price High-Low)
    - Update URL with query parameters
    - Persist sort selection across navigation
    - _Requirements: 15.6_

  - [ ]* 12.3 Write unit tests for filtering and sorting
    - Test filter application updates drop list
    - Test sort application changes drop order
    - Test URL parameter persistence

- [ ] 13. Implement accessibility features
  - [ ] 14.1 Add skip links and ARIA labels
    - Create SkipLinks component for keyboard navigation
    - Add ARIA labels to all interactive elements
    - Implement proper heading hierarchy
    - Add alt text to all images
    - _Requirements: 14.1-14.8_

  - [ ] 14.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Implement logical tab order
    - Test with keyboard-only navigation
    - _Requirements: 14.2, 22.3_

  - [ ] 14.3 Add screen reader support
    - Implement LiveRegion for dynamic content updates
    - Add ARIA live regions for countdown changes
    - Announce inventory updates to screen readers
    - Test with screen reader software
    - _Requirements: 14.3, 14.6_

  - [ ]* 13.4 Write accessibility tests
    - Test keyboard navigation works for all interactive elements
    - Test ARIA labels are present and correct
    - Test color contrast ratios meet WCAG AA
    - Test with automated accessibility tools

- [ ] 14. Implement responsive design
  - [ ] 14.1 Create responsive layouts for all components
    - Implement mobile-first CSS (320px - 1920px)
    - Add breakpoint at 768px (mobile vs desktop)
    - Two-column grid for mobile (≤768px)
    - Four-column grid for desktop (>768px)
    - Ensure touch-friendly tap targets (44x44px minimum)
    - Test swipe gestures on mobile
    - _Requirements: 13.1-13.8_

  - [ ] 15.2 Optimize images for responsive viewports
    - Use Next.js Image component with responsive sizes
    - Configure sizes: "(max-width: 768px) 50vw, 25vw"
    - Implement blur placeholders
    - Lazy load below-the-fold images
    - _Requirements: 12.4, 12.5_

  - [ ]* 14.3 Write responsive design tests
    - Test two-column layout at mobile breakpoint (≤768px)
    - Test four-column layout at desktop breakpoint (>768px)
    - Test touch targets meet minimum size requirements
    - Test no horizontal scrolling on mobile

- [ ] 15. Checkpoint - Ensure responsive design works across devices
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement performance optimizations
  - [ ] 16.1 Optimize images and assets
    - Configure Next.js Image optimization
    - Generate blur placeholders for images
    - Implement lazy loading for below-fold content
    - _Requirements: 12.4, 12.5_

  - [ ] 16.2 Implement code splitting
    - Use dynamic imports for below-fold sections
    - Split vendor bundles for better caching
    - Prefetch critical routes on hover
    - _Requirements: 12.6_

  - [ ] 16.3 Configure caching strategy
    - Set up server-side caching with revalidation
    - Implement client-side caching in Zustand store
    - Configure CDN caching headers
    - _Requirements: 12.8_

  - [ ]* 16.4 Run performance tests
    - Test LCP < 2.5s, FID < 100ms, CLS < 0.1
    - Test Lighthouse Performance score > 90
    - Test hero section loads within 1.5s on 3G
    - _Requirements: 12.1-12.3, 1.9_

- [ ] 17. Implement security features
  - [ ] 17.1 Configure Content Security Policy
    - Add CSP headers in next.config.js
    - Set X-Frame-Options, X-Content-Type-Options
    - Configure Referrer-Policy and Permissions-Policy
    - _Requirements: Security (non-functional)_

  - [ ] 17.2 Implement XSS prevention
    - Sanitize user-generated content with DOMPurify
    - Validate all inputs
    - Use parameterized queries in Server Actions
    - _Requirements: Security (non-functional)_

  - [ ] 17.3 Add rate limiting to middleware
    - Implement rate limiting for API endpoints
    - Configure limits per IP address
    - Return 429 status for exceeded limits
    - _Requirements: Security (non-functional)_

  - [ ]* 17.4 Write security tests
    - Test CSP headers are present
    - Test XSS prevention with malicious inputs
    - Test rate limiting blocks excessive requests

- [ ] 18. Implement monitoring and analytics
  - [ ] 18.1 Set up error tracking with Sentry
    - Configure Sentry for error monitoring
    - Add error boundaries with Sentry integration
    - Filter out non-critical errors
    - _Requirements: 23.7_

  - [ ] 18.2 Implement performance monitoring
    - Track Core Web Vitals (LCP, FID, CLS)
    - Send metrics to Vercel Analytics
    - Log performance data for analysis
    - _Requirements: 12.1-12.3_

  - [ ] 18.3 Add custom analytics events
    - Track drop card clicks with position
    - Track curator card clicks
    - Track horizontal scroll interactions
    - Track filter and sort usage
    - Track collective switcher usage
    - _Requirements: 17.8_

- [ ] 19. Implement footer and newsletter
  - [ ] 19.1 Create Footer component
    - Add navigation links (About, FAQ, Contact, Policies)
    - Add social media links
    - Add links to all collective subdomains
    - Display copyright information
    - _Requirements: 18.1-18.8_

  - [ ] 19.2 Create NewsletterSignup component
    - Implement email input with validation
    - Add notification preference checkboxes
    - Integrate with email service (Resend)
    - Display success/error messages
    - Ensure GDPR/CAN-SPAM compliance
    - _Requirements: 19.1-19.8_

  - [ ]* 19.3 Write unit tests for newsletter signup
    - Test email validation
    - Test form submission success/error handling
    - Test GDPR compliance features

- [ ] 20. Implement drop preview features
  - [ ] 20.1 Create preview tooltip for drop cards
    - Display on hover (desktop only)
    - Show drop description snippet and curator info
    - Position tooltip relative to card
    - _Requirements: 20.1-20.4_

  - [ ] 20.2 Create QuickViewModal component
    - Display full drop details in modal
    - Allow adding to cart without navigation
    - Support keyboard navigation and screen readers
    - Return focus to triggering element on close
    - _Requirements: 20.5-20.8_

  - [ ]* 20.3 Write integration tests for preview features
    - Test tooltip appears on hover
    - Test modal opens on "Quick View" click
    - Test modal keyboard navigation
    - Test focus management

- [ ] 21. Final integration and polish
  - [ ] 21.1 Test all homepage variants
    - Test dropr.com (Main_Homepage)
    - Test mod.dropr.com (MOD Collective_Homepage)
    - Test make.dropr.com (MAKE Collective_Homepage)
    - Test mini.dropr.com (MINI Collective_Homepage)
    - Verify collective filtering works correctly
    - _Requirements: All requirements_

  - [ ] 21.2 Test real-time updates
    - Verify SSE connection establishes correctly
    - Verify countdown timers update every second
    - Verify inventory updates reflect in real-time
    - Verify drop status transitions work without reload
    - _Requirements: 10.1-10.7, 2.14_

  - [ ] 21.3 Test error handling and edge cases
    - Test empty states when no drops available
    - Test error states when data fails to load
    - Test image fallbacks when images fail to load
    - Test graceful degradation without JavaScript
    - _Requirements: 23.1-23.8_

  - [ ]* 21.4 Run full test suite
    - Run all unit tests
    - Run all property-based tests
    - Run all integration tests (Playwright)
    - Ensure all tests pass

- [ ] 22. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Integration tests validate full user flows with Playwright
- The implementation uses TypeScript with Next.js 15, React 19, and Zustand for state management
- Real-time updates are implemented via Server-Sent Events (SSE)
- All components follow MVVM architecture with scoped Zustand stores
- Accessibility compliance targets WCAG 2.1 AA
- Performance targets: LCP < 2.5s, FID < 100ms, CLS < 0.1, Lighthouse scores > 90
