# Homepage & Drop Discovery - Requirements

## Introduction

This specification defines the public-facing homepage and drop discovery experience for Dropr. The platform has four homepage variants:

1. **Main Homepage (dropr.com)** - Shows drops from ALL collectives (MOD + MAKE + MINI combined), serving as the ultimate overview and primary entry point for new visitors
2. **Collective Subdomains (mod.dropr.com, make.dropr.com, mini.dropr.com)** - Structurally similar to the main homepage but filtered to show only drops from that specific collective

All four homepages share the same codebase and component structure, with middleware-based filtering applied based on the subdomain. The homepage serves as the primary entry point for unauthenticated users, communicating the platform's value proposition, showcasing active and upcoming drops, and driving user actions (browsing drops, signing up, or applying as a curator).

The homepage must balance multiple goals: educate new visitors about Dropr, create excitement around time-limited drops, build trust through curator verification and escrow protection, and provide seamless navigation to drop browsing and authentication flows.

## Glossary

- **Main_Homepage**: The landing page at dropr.com showing drops from all collectives
- **Collective_Homepage**: The landing page at collective subdomains (mod.dropr.com, make.dropr.com, mini.dropr.com) showing filtered drops
- **Drop_Discovery**: The browsing experience for viewing available drops without authentication
- **Hero_Section**: The above-the-fold content that immediately communicates value
- **Drop_Card**: A visual component displaying drop information (title, image, price, countdown)
- **Curator_Card**: A visual component displaying curator information (avatar, name, bio, reputation)
- **Horizontal_Scroll_Section**: A section with horizontally scrollable cards (similar to Airbnb Experiences)
- **Full_Width_Spotlight**: A full viewport-width section promoting a single featured curator or drop
- **Collective**: One of three hobby communities (MOD, MAKE, MINI)
- **Featured_Drop**: A drop highlighted by the platform for prominence
- **Featured_Curator**: A curator highlighted by the platform for prominence
- **Founding_Curator**: A curator who joined during the platform's founding period
- **Live_Drop**: A drop currently accepting purchases
- **Upcoming_Drop**: A scheduled drop that hasn't started yet
- **Countdown_Timer**: Real-time display of time remaining until drop starts or ends
- **CTA**: Call-to-action button or link driving user behavior
- **Trust_Signal**: Visual indicator building confidence (verified badge, escrow protection, ratings)

## Requirements

### Requirement 1: Homepage Hero Section

**User Story:** As a first-time visitor, I want to immediately understand what Dropr is and why I should care, so that I can decide if the platform is relevant to my interests.

#### Acceptance Criteria

1. WHEN on Main_Homepage (dropr.com), THE Homepage SHALL display a platform-wide headline (e.g., "Curated Drops for Makers & Modders")
2. WHEN on Collective_Homepage, THE Homepage SHALL display a headline tailored to that collective (e.g., "Curated drops for keyboard enthusiasts")
3. THE Homepage SHALL display a subheadline explaining the value proposition
4. THE Homepage SHALL display a primary CTA button for browsing drops
5. THE Homepage SHALL display a secondary CTA button for curator applications
6. WHEN the viewport width is less than 768px, THE Homepage SHALL display a mobile-optimized hero layout
7. THE Hero_Section SHALL load within 1.5 seconds on 3G connections

### Requirement 2: Featured Drops Horizontal Scroll

**User Story:** As a visitor, I want to browse featured drops in an engaging way, so that I can quickly discover exciting items.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Featured Drops" section with horizontal scrolling
2. THE Horizontal_Scroll_Section SHALL display 6-12 featured drops
3. WHEN on Main_Homepage (dropr.com), THE Homepage SHALL show featured drops from ALL collectives
4. WHEN on Collective_Homepage, THE Homepage SHALL show featured drops filtered to that collective only
5. THE Horizontal_Scroll_Section SHALL support mouse drag scrolling on desktop
6. THE Horizontal_Scroll_Section SHALL support touch swipe scrolling on mobile/tablet
7. THE Horizontal_Scroll_Section SHALL display scroll indicators (left/right arrows) on desktop
8. THE Drop_Card SHALL display the drop title, cover image, price, and curator name
9. WHEN on Main_Homepage, THE Drop_Card SHALL display a collective badge (MOD/MAKE/MINI)
10. WHEN a drop is live, THE Drop_Card SHALL display a countdown timer showing time remaining
11. WHEN a drop is upcoming and within 24 hours of start, THE Drop_Card SHALL display a countdown timer showing time until start
12. THE Drop_Card SHALL display inventory status (e.g., "23 left" or "Sold Out")
13. WHEN a user clicks a Drop_Card, THE Homepage SHALL navigate to the drop detail page
14. THE Featured_Drops SHALL update in real-time when inventory changes
15. THE Horizontal_Scroll_Section SHALL snap to card boundaries on scroll

### Requirement 3: Popular Curators by Collective

**User Story:** As a visitor, I want to discover popular curators in my hobby community, so that I can follow experts I trust.

#### Acceptance Criteria

1. WHEN on Main_Homepage, THE Homepage SHALL display three sections: "Popular Modders", "Popular Makers", "Popular Minists"
2. WHEN on Collective_Homepage, THE Homepage SHALL display one section: "Popular [Collective Name]" (e.g., "Popular Modders")
3. EACH section SHALL use horizontal scrolling to display 6-12 curators
4. THE Curator_Card SHALL display curator avatar, name, bio snippet, and reputation score
5. THE Curator_Card SHALL display the number of completed drops
6. THE Curator_Card SHALL display average rating
7. THE Curator_Card SHALL emphasize the person/people behind the curation (not brand names)
8. WHEN a user clicks a Curator_Card, THE Homepage SHALL navigate to the curator profile page
9. THE Horizontal_Scroll_Section SHALL support mouse drag scrolling on desktop
10. THE Horizontal_Scroll_Section SHALL support touch swipe scrolling on mobile/tablet
11. THE Horizontal_Scroll_Section SHALL display scroll indicators (left/right arrows) on desktop
12. THE Horizontal_Scroll_Section SHALL snap to card boundaries on scroll
13. EACH section SHALL include a "View All [Collective] Curators" link at the end

### Requirement 4: Live & Upcoming Drops Horizontal Scroll

**User Story:** As a visitor, I want to browse all available drops, so that I can find items matching my interests.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Live & Upcoming Drops" section with horizontal scrolling
2. THE Horizontal_Scroll_Section SHALL display 8-16 drops
3. THE Horizontal_Scroll_Section SHALL prioritize live drops, then upcoming drops, ordered by start time
4. WHEN on Main_Homepage (dropr.com), THE Horizontal_Scroll_Section SHALL show drops from ALL collectives
5. WHEN on Collective_Homepage, THE Horizontal_Scroll_Section SHALL filter drops to that collective only
6. WHEN on Main_Homepage, THE Drop_Card SHALL display a collective badge (MOD/MAKE/MINI)
7. THE Horizontal_Scroll_Section SHALL support mouse drag scrolling on desktop
8. THE Horizontal_Scroll_Section SHALL support touch swipe scrolling on mobile/tablet
9. THE Horizontal_Scroll_Section SHALL display scroll indicators (left/right arrows) on desktop
10. THE Drop_Card SHALL display drop type badge (Mystery Box, Surplus, Limited Edition)
11. THE Drop_Card SHALL display curator verification badge
12. THE Drop_Card SHALL display average rating when reviews exist
13. WHEN a drop is sold out, THE Drop_Card SHALL display a "Sold Out" overlay
14. THE Horizontal_Scroll_Section SHALL include a "View All Drops" link at the end
15. THE Horizontal_Scroll_Section SHALL snap to card boundaries on scroll

### Requirement 5: Founding Curators Horizontal Scroll

**User Story:** As a visitor, I want to see the founding curators who helped build this platform, so that I can discover trusted community experts.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Founding Curators" section with horizontal scrolling
2. THE Horizontal_Scroll_Section SHALL display 8-15 founding curators
3. THE Curator_Card SHALL display curator avatar, name, bio snippet, and reputation score
4. THE Curator_Card SHALL display a "Founding Curator" badge
5. THE Curator_Card SHALL display the number of completed drops
6. THE Curator_Card SHALL display average rating
7. THE Curator_Card SHALL emphasize the person/people behind the curation (not brand names)
8. WHEN a user clicks a Curator_Card, THE Homepage SHALL navigate to the curator profile page
9. THE Horizontal_Scroll_Section SHALL support mouse drag scrolling on desktop
10. THE Horizontal_Scroll_Section SHALL support touch swipe scrolling on mobile/tablet
11. THE Horizontal_Scroll_Section SHALL display scroll indicators (left/right arrows) on desktop
12. THE Horizontal_Scroll_Section SHALL snap to card boundaries on scroll

### Requirement 6: Full-Width Curator Spotlight

**User Story:** As a visitor, I want to discover featured curators through engaging teasers, so that I'm motivated to visit their profile pages to learn more.

#### Acceptance Criteria

1. THE Homepage SHALL display 1-3 full-width curator spotlight sections
2. EACH Full_Width_Spotlight SHALL occupy the full viewport width
3. THE Full_Width_Spotlight SHALL display curator avatar/photo, name, and bio snippet (teaser)
4. THE Full_Width_Spotlight SHALL display curator's recent drops (3-5 drops in horizontal scroll) as a preview
5. THE Full_Width_Spotlight SHALL display basic curator statistics (total drops count only)
6. THE Full_Width_Spotlight SHALL emphasize the person/people behind the curation (not brand names)
7. THE Full_Width_Spotlight SHALL include a prominent "View Profile" CTA button
8. THE Full_Width_Spotlight SHALL NOT display detailed statistics (followers, rating, past drops) - these belong on the curator profile page
9. WHEN on Main_Homepage, THE Full_Width_Spotlight SHALL feature curators from different collectives
10. WHEN on Collective_Homepage, THE Full_Width_Spotlight SHALL feature curators from that collective only
11. THE Full_Width_Spotlight SHALL use high-quality imagery and engaging layout to entice clicks
12. THE Full_Width_Spotlight SHALL be responsive across mobile, tablet, and desktop viewports

### Requirement 7: Full-Width Drop Spotlight

**User Story:** As a visitor, I want to see featured drops presented in an engaging way, so that I can understand what makes them special.

#### Acceptance Criteria

1. THE Homepage SHALL display 1-2 full-width drop spotlight sections
2. EACH Full_Width_Spotlight SHALL occupy the full viewport width
3. THE Full_Width_Spotlight SHALL display drop hero image, title, description, and theme
4. THE Full_Width_Spotlight SHALL display curator information (avatar, name, reputation)
5. THE Full_Width_Spotlight SHALL display price, inventory, and countdown timer
6. THE Full_Width_Spotlight SHALL display drop type badge (Mystery Box, Surplus, Limited Edition)
7. THE Full_Width_Spotlight SHALL include a "View Drop" CTA button
8. THE Full_Width_Spotlight SHALL include a "Add to Cart" CTA button
9. WHEN on Main_Homepage, THE Full_Width_Spotlight SHALL display a collective badge
10. THE Full_Width_Spotlight SHALL use high-quality imagery and engaging layout
11. THE Full_Width_Spotlight SHALL be responsive across mobile, tablet, and desktop viewports

### Requirement 8: Value Proposition for Buyers

**User Story:** As a potential buyer, I want to understand why I should buy from Dropr instead of other marketplaces, so that I can make an informed decision.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Why Dropr" section for buyers
2. THE Why_Dropr_Section SHALL emphasize the unique value proposition: themed mystery boxes, themed surplus, and limited runs BY makers and modders FOR makers and modders
3. THE Why_Dropr_Section SHALL highlight 3-4 key benefits including:
   - Themed mystery boxes curated by community experts
   - Themed surplus from makers' personal collections
   - Limited edition runs created by makers for makers
   - Trust through verified curators and escrow protection
4. THE Why_Dropr_Section SHALL include trust signals (escrow protection, verified curators, ratings)
5. THE Why_Dropr_Section SHALL include a CTA to browse drops or sign up
6. THE Why_Dropr_Section SHALL be visually engaging with icons or illustrations that represent the three drop types (mystery box, surplus, limited edition)

### Requirement 9: Value Proposition for Curators

**User Story:** As a potential curator, I want to understand how I can monetize my expertise and surplus, so that I can decide if I should apply.

#### Acceptance Criteria

1. THE Homepage SHALL display a "Become a Curator" section
2. THE Become_Curator_Section SHALL explain curator benefits (monetization, audience, platform support)
3. THE Become_Curator_Section SHALL display the fee structure (80% payout to curator)
4. THE Become_Curator_Section SHALL include a CTA to apply as a curator
5. THE Become_Curator_Section SHALL include social proof (number of curators, total drops, community size)

### Requirement 10: Real-Time Countdown Timers

**User Story:** As a visitor viewing drops, I want to see accurate countdowns with appropriate detail levels, so that I know exactly when drops start or end without information overload.

#### Acceptance Criteria

1. WHEN a drop is more than 24 hours away, THE Drop_Card SHALL NOT display a countdown timer
2. WHEN a drop is within 24 hours of starting (upcoming), THE Drop_Card SHALL display an "upcoming" countdown timer
3. WHEN a drop is live, THE Drop_Card SHALL display a "live" countdown timer
4. THE "upcoming" countdown timer SHALL be visually distinct from the "live" countdown timer (different color, icon, or styling)
5. WHEN a countdown has more than 2 hours remaining, THE Countdown_Timer SHALL display "2+ hours"
6. WHEN a countdown has less than 2 hours and more than 1 hour remaining, THE Countdown_Timer SHALL display "1 hr, X min" format and update every 15 minutes
7. WHEN a countdown has less than 1 hour remaining, THE Countdown_Timer SHALL display hours, minutes, and seconds format and update every second
8. THE countdown display logic SHALL apply identically to both upcoming drops (time until start) and live drops (time until end)
9. WHEN a countdown reaches zero, THE Drop_Card SHALL update its status automatically
10. THE Countdown_Timer SHALL calculate time on the client side to avoid server load
11. THE Countdown_Timer SHALL handle timezone differences correctly
12. WHEN a drop transitions from upcoming to live, THE Homepage SHALL update the drop status and timer styling without page reload

### Requirement 11: SEO Optimization

**User Story:** As a potential user searching for hobby supplies, I want to discover Dropr through search engines, so that I can find curated drops relevant to my interests.

#### Acceptance Criteria

1. WHEN on Main_Homepage, THE Homepage SHALL include platform-wide meta title and description
2. WHEN on Collective_Homepage, THE Homepage SHALL include tailored meta title and description for that collective
3. THE Homepage SHALL include Open Graph tags for social sharing
4. THE Homepage SHALL include structured data (JSON-LD) for drops and organization
5. THE Homepage SHALL use semantic HTML (header, main, section, article)
6. THE Homepage SHALL include descriptive alt text for all images
7. THE Homepage SHALL have a canonical URL for each homepage variant (dropr.com, mod.dropr.com, make.dropr.com, mini.dropr.com)
8. THE Homepage SHALL load critical CSS inline for above-the-fold content
9. THE Homepage SHALL achieve a Lighthouse SEO score of 95+

### Requirement 12: Performance Optimization

**User Story:** As a visitor on a mobile device, I want the homepage to load quickly, so that I can browse drops without frustration.

#### Acceptance Criteria

1. THE Homepage SHALL achieve a Largest Contentful Paint (LCP) under 2.5 seconds
2. THE Homepage SHALL achieve a First Input Delay (FID) under 100ms
3. THE Homepage SHALL achieve a Cumulative Layout Shift (CLS) under 0.1
4. THE Homepage SHALL use Next.js Image component for optimized image loading
5. THE Homepage SHALL lazy-load images below the fold
6. THE Homepage SHALL prefetch drop detail pages on Drop_Card hover
7. THE Homepage SHALL use Server Components for static content
8. THE Homepage SHALL cache drop data with revalidation every 60 seconds
9. THE Homepage SHALL achieve a Lighthouse Performance score of 90+

### Requirement 13: Mobile Responsiveness

**User Story:** As a mobile user, I want the homepage to be fully functional on my phone, so that I can browse drops on the go.

#### Acceptance Criteria

1. THE Homepage SHALL be fully functional on viewports from 320px to 1920px width
2. THE Homepage SHALL use a mobile-first responsive design approach
3. WHEN viewport width is 768px or less, THE Homepage SHALL display a two-column layout for drop grids
4. WHEN viewport width is greater than 768px, THE Homepage SHALL display a four-column layout for drop grids
5. THE Homepage SHALL use touch-friendly tap targets (minimum 44x44px)
6. THE Homepage SHALL support swipe gestures for horizontal scroll navigation on mobile
7. THE Homepage SHALL maintain readability without horizontal scrolling
8. THE Horizontal_Scroll_Section components SHALL work seamlessly on all viewport sizes

### Requirement 14: Accessibility Compliance

**User Story:** As a user with disabilities, I want the homepage to be accessible, so that I can navigate and understand the content using assistive technologies.

#### Acceptance Criteria

1. THE Homepage SHALL achieve WCAG 2.1 AA compliance
2. THE Homepage SHALL support keyboard navigation for all interactive elements
3. THE Homepage SHALL include ARIA labels for screen readers
4. THE Homepage SHALL maintain color contrast ratios of at least 4.5:1 for text
5. THE Homepage SHALL include skip-to-content links
6. THE Homepage SHALL announce dynamic content updates to screen readers
7. THE Homepage SHALL support browser zoom up to 200% without breaking layout
8. THE Homepage SHALL include focus indicators for keyboard navigation

### Requirement 15: Drop Filtering and Sorting

**User Story:** As a visitor browsing drops, I want to filter and sort drops, so that I can find items matching my specific interests.

#### Acceptance Criteria

1. THE Homepage SHALL display filter options for drop type (Mystery Box, Surplus, Limited Edition)
2. THE Homepage SHALL display filter options for price range
3. THE Homepage SHALL display filter options for drop status (Live, Upcoming)
4. WHEN on Main_Homepage, THE Homepage SHALL display filter options for collective (MOD, MAKE, MINI, All)
5. WHEN on Collective_Homepage, THE Homepage SHALL NOT display collective filter (already filtered by subdomain)
6. THE Homepage SHALL display sort options (Newest, Ending Soon, Price Low-High, Price High-Low)
7. WHEN a user applies filters, THE Homepage SHALL update the drop grid without page reload
8. WHEN a user applies filters, THE Homepage SHALL update the URL with query parameters
9. THE Homepage SHALL persist filter selections across page navigation
10. THE Homepage SHALL display the number of drops matching current filters
11. THE Homepage SHALL display a "Clear Filters" button when filters are active

### Requirement 16: Social Proof and Trust Signals

**User Story:** As a skeptical visitor, I want to see evidence that Dropr is trustworthy, so that I feel confident making a purchase.

#### Acceptance Criteria

1. THE Homepage SHALL display total number of completed drops
2. THE Homepage SHALL display total number of verified curators
3. THE Homepage SHALL display total number of satisfied buyers
4. THE Homepage SHALL display average platform rating
5. THE Homepage SHALL include testimonials from buyers and curators
6. THE Homepage SHALL display trust badges (escrow protection, secure payments)
7. THE Homepage SHALL include links to transparency reports or policies
8. THE Homepage SHALL display recent positive reviews

### Requirement 17: Call-to-Action Hierarchy

**User Story:** As a visitor, I want clear guidance on what actions to take, so that I can easily engage with the platform.

#### Acceptance Criteria

1. THE Homepage SHALL display a primary CTA for browsing drops
2. THE Homepage SHALL display a secondary CTA for signing up
3. THE Homepage SHALL display a tertiary CTA for curator applications
4. THE Homepage SHALL use consistent CTA styling throughout the page
5. WHEN a user is authenticated, THE Homepage SHALL hide the sign-up CTA
6. WHEN a user is a curator, THE Homepage SHALL hide the curator application CTA
7. THE Homepage SHALL track CTA click-through rates for analytics

### Requirement 18: Footer Navigation

**User Story:** As a visitor, I want to access important links and information from the footer, so that I can learn more about the platform and policies.

#### Acceptance Criteria

1. THE Homepage SHALL display a footer with navigation links
2. THE Footer SHALL include links to About, How It Works, FAQ, Contact
3. THE Footer SHALL include links to Terms of Service, Privacy Policy, Content Guidelines
4. THE Footer SHALL include social media links (Twitter, Instagram, Discord)
5. THE Footer SHALL include a newsletter signup form
6. THE Footer SHALL display copyright information
7. THE Footer SHALL include links to all three collective subdomains
8. THE Footer SHALL be consistent across all pages

### Requirement 19: Newsletter Signup

**User Story:** As an interested visitor, I want to subscribe to updates, so that I can be notified about new drops and platform news.

#### Acceptance Criteria

1. THE Homepage SHALL display a newsletter signup form
2. THE Newsletter_Form SHALL collect email address
3. THE Newsletter_Form SHALL allow users to select notification preferences (new drops, featured curators, platform updates)
4. WHEN a user submits the form, THE Homepage SHALL validate the email format
5. WHEN submission succeeds, THE Homepage SHALL display a success message
6. WHEN submission fails, THE Homepage SHALL display an error message
7. THE Newsletter_Form SHALL integrate with email service (Resend)
8. THE Newsletter_Form SHALL comply with GDPR and CAN-SPAM requirements

### Requirement 20: Drop Detail Preview

**User Story:** As a visitor browsing drops, I want to preview drop details without leaving the homepage, so that I can quickly assess multiple drops.

#### Acceptance Criteria

1. WHEN a user hovers over a Drop_Card on desktop, THE Homepage SHALL display a preview tooltip
2. THE Preview_Tooltip SHALL display drop description snippet
3. THE Preview_Tooltip SHALL display curator information
4. THE Preview_Tooltip SHALL display key details (inventory, shipping estimate)
5. WHEN a user clicks "Quick View" on a Drop_Card, THE Homepage SHALL open a modal with full drop details
6. THE Quick_View_Modal SHALL allow users to add the drop to their cart without navigation
7. THE Quick_View_Modal SHALL support keyboard navigation and screen readers
8. WHEN a user closes the modal, THE Homepage SHALL return focus to the triggering element

### Requirement 21: Collective Switcher

**User Story:** As a visitor interested in multiple hobbies, I want to easily switch between collectives, so that I can browse drops across different communities.

#### Acceptance Criteria

1. THE Homepage SHALL display a collective switcher in the navigation
2. THE Collective_Switcher SHALL display four options: "All" (dropr.com), "MOD", "MAKE", "MINI"
3. WHEN on Main_Homepage, THE Collective_Switcher SHALL highlight "All"
4. WHEN on Collective_Homepage, THE Collective_Switcher SHALL highlight the current collective
5. WHEN a user selects "All", THE Homepage SHALL navigate to dropr.com
6. WHEN a user selects a collective, THE Homepage SHALL navigate to that collective's subdomain
7. THE Collective_Switcher SHALL be accessible via keyboard navigation
8. THE Collective_Switcher SHALL be visible on mobile devices

### Requirement 22: Horizontal Scroll Interaction

**User Story:** As a visitor using the homepage, I want smooth and intuitive horizontal scrolling, so that I can easily browse drops and curators.

#### Acceptance Criteria

1. ALL Horizontal_Scroll_Section components SHALL support mouse drag scrolling on desktop
2. ALL Horizontal_Scroll_Section components SHALL support touch swipe scrolling on mobile/tablet
3. ALL Horizontal_Scroll_Section components SHALL support keyboard navigation (arrow keys, tab)
4. ALL Horizontal_Scroll_Section components SHALL display scroll indicators (left/right arrows) on desktop
5. THE scroll indicators SHALL hide when at the start/end of the scrollable area
6. ALL Horizontal_Scroll_Section components SHALL use smooth scroll behavior
7. ALL Horizontal_Scroll_Section components SHALL snap to card boundaries on scroll
8. THE scroll snap SHALL align cards to the left edge of the container
9. ALL Horizontal_Scroll_Section components SHALL display a subtle scrollbar on desktop (auto-hide)
10. ALL Horizontal_Scroll_Section components SHALL NOT display a scrollbar on mobile/tablet
11. THE Horizontal_Scroll_Section SHALL maintain scroll position when cards update in real-time
12. THE Horizontal_Scroll_Section SHALL be accessible via screen readers with proper ARIA labels

### Requirement 23: Error States and Empty States

**User Story:** As a visitor, I want helpful feedback when content fails to load or no drops are available, so that I understand what's happening and what I can do.

#### Acceptance Criteria

1. WHEN no drops are available, THE Homepage SHALL display an empty state message
2. THE Empty_State SHALL include a CTA to follow curators or sign up for notifications
3. WHEN drop data fails to load, THE Homepage SHALL display an error message
4. THE Error_State SHALL include a retry button
5. WHEN images fail to load, THE Drop_Card SHALL display a placeholder image
6. WHEN countdown data is unavailable, THE Drop_Card SHALL display static timing information
7. THE Homepage SHALL log errors to monitoring service (Sentry)
8. THE Homepage SHALL degrade gracefully when JavaScript is disabled

### Requirement 24: Drop Follow Functionality

**User Story:** As a visitor or authenticated user, I want to follow drops I'm interested in, so that I can track them and receive updates.

#### Acceptance Criteria

1. THE Drop_Card SHALL display a "follow" icon (e.g., bookmark, heart, or bell icon)
2. THE follow icon SHALL be visible on all drop cards across all homepage sections
3. WHEN a user clicks the follow icon and is NOT authenticated, THE Homepage SHALL redirect the user to the login flow
4. WHEN a user clicks the follow icon and IS authenticated, THE Drop_Card SHALL add the drop to the user's follow list
5. WHEN a drop is already followed by the authenticated user, THE follow icon SHALL display a "followed" state (filled icon or different color)
6. WHEN a user clicks the follow icon on an already-followed drop, THE Drop_Card SHALL remove the drop from the user's follow list
7. THE follow icon interaction SHALL provide immediate visual feedback (optimistic UI update)
8. THE follow icon SHALL be accessible via keyboard navigation
9. THE follow icon SHALL have appropriate ARIA labels for screen readers
10. THE mechanics of the user dashboard and follow list management are out of scope for this feature (detailed in separate spec)

## Functional Requirements

### Content Display
- Main_Homepage (dropr.com) displays platform-wide hero section showing drops from all collectives
- Collective_Homepage displays hero section with filtered drops for that collective
- Multiple horizontal scroll sections display drops and curators (Airbnb Experiences-style)
- Featured drops section with 6-12 drops in horizontal scroll
- Live & Upcoming drops section with 8-16 drops in horizontal scroll
- Founding Curators section with 8-15 curators in horizontal scroll
- Popular Curators sections by collective (Modders, Makers, Minists) with 6-12 curators each
- Full-width curator spotlights (1-3 per page) as teasers highlighting individual curators with preview of recent drops
- Full-width drop spotlights (1-2 per page) highlighting featured drops with engaging imagery
- Drop cards on Main_Homepage include collective badges; Collective_Homepage cards do not
- Curator cards emphasize people/teams behind curation, not brand names
- Value proposition sections for buyers and curators with appropriate messaging based on homepage variant

### Real-Time Updates
- Countdown timers update every second on client side
- Drop status transitions (upcoming → live → sold out) update without page reload
- Inventory counts update in real-time via Server-Sent Events
- Horizontal scroll sections refresh when inventory or status changes
- Scroll position maintained during real-time updates

### Filtering and Sorting
- Filter drops by type, price range, and status
- On Main_Homepage, filter drops by collective (MOD, MAKE, MINI, All)
- On Collective_Homepage, collective filter is not shown (already filtered by subdomain)
- Sort drops by newest, ending soon, price low-high, price high-low
- URL query parameters persist filter and sort selections
- Filter count displays number of matching drops

### Navigation and CTAs
- Primary CTA for browsing drops
- Secondary CTA for user signup
- Tertiary CTA for curator applications
- "View All" links at the end of each horizontal scroll section
- "View Profile" CTA in full-width curator spotlights
- "View Drop" and "Add to Cart" CTAs in full-width drop spotlights
- Footer navigation with links to policies, social media, and all homepage variants
- Collective switcher in header with four options: "All" (dropr.com), "MOD", "MAKE", "MINI"
- Collective switcher highlights current homepage variant

### SEO and Performance
- Platform-wide meta tags for Main_Homepage, tailored meta tags for Collective_Homepage
- Open Graph tags for social sharing
- Structured data (JSON-LD) for drops and organization
- Server-side rendering for initial page load
- Image optimization with Next.js Image component
- Lazy loading for below-the-fold content
- Cache revalidation every 60 seconds
- Canonical URLs for each homepage variant (dropr.com, mod.dropr.com, make.dropr.com, mini.dropr.com)

## Non-Functional Requirements

### Performance
- Largest Contentful Paint (LCP) under 2.5 seconds
- First Input Delay (FID) under 100ms
- Cumulative Layout Shift (CLS) under 0.1
- Lighthouse Performance score of 90+
- Hero section loads within 1.5 seconds on 3G connections

### SEO
- Lighthouse SEO score of 95+
- Semantic HTML structure
- Descriptive alt text for all images
- Canonical URLs for each collective subdomain
- Structured data for rich search results

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility with ARIA labels
- Color contrast ratios of at least 4.5:1
- Focus indicators for interactive elements
- Support for browser zoom up to 200%

### Responsiveness
- Fully functional on viewports from 320px to 1920px
- Mobile-first responsive design
- Touch-friendly tap targets (minimum 44x44px)
- Swipe gesture support for carousels on mobile
- No horizontal scrolling required

### Security
- HTTPS enforcement
- Content Security Policy headers
- XSS prevention
- CSRF protection for forms
- Rate limiting on API endpoints

### Reliability
- Graceful degradation when JavaScript is disabled
- Error boundaries for component failures
- Retry logic for failed API requests
- Fallback content for failed image loads
- Error logging to Sentry

## Constraints & Assumptions

### Constraints
- Must use Next.js 15+ with App Router and Server Components
- Must filter drops by collective based on subdomain for Collective_Homepage
- Must show all drops on Main_Homepage (dropr.com)
- All four homepage variants share the same codebase with middleware-based filtering
- Must use Server-Sent Events for real-time countdown updates
- Must achieve Core Web Vitals targets for SEO
- Must comply with WCAG 2.1 AA accessibility standards

### Assumptions
- Platform foundation is complete with subdomain routing
- Middleware can detect subdomain and apply appropriate filtering (dropr.com = all, mod.dropr.com = MOD only, etc.)
- Database schema includes Drop, Curator, and Review models
- Authentication system is functional for signup/login flows
- Image storage is configured (Vercel Blob)
- Email service is configured (Resend) for newsletter signups
- Analytics tracking is configured (Vercel Analytics)
- At least 3-5 drops exist per collective for initial launch (9-15 total drops across all collectives)
- Curators have been onboarded and verified

## Success Metrics

### Engagement Metrics
- Homepage bounce rate < 40%
- Average time on page > 3 minutes (increased due to horizontal scroll engagement)
- CTA click-through rate > 15%
- Drop card click-through rate > 25%
- Curator card click-through rate > 20%
- Horizontal scroll interaction rate > 60% (percentage of visitors who scroll at least one section)
- Full-width spotlight engagement rate > 30%
- Newsletter signup conversion rate > 5%

### Performance Metrics
- Lighthouse Performance score > 90
- Lighthouse SEO score > 95
- Lighthouse Accessibility score > 95
- LCP < 2.5 seconds
- FID < 100ms
- CLS < 0.1

### Business Metrics
- 60% of visitors browse at least 3 drops
- 30% of visitors sign up within first visit
- 10% of visitors apply as curators
- 20% of visitors return within 7 days
- 50% of signups occur from homepage CTAs

## Out of Scope

### Phase 1 (Current Spec)
- Authenticated buyer dashboard (covered in buyer-drop-experience spec)
- User follow list management and dashboard view (separate user dashboard spec)
- Drop follow notifications and alerts (separate spec)
- Curator dashboard and drop creation (separate spec)
- Admin moderation tools (separate spec)
- Drop detail page (separate spec)
- Checkout and payment flow (separate spec)
- User profile pages (separate spec)
- Search functionality (future enhancement)
- Advanced filtering (category, tags, curator) (future enhancement)
- Personalized recommendations (future enhancement)

### Future Enhancements
- A/B testing for hero section variations
- Personalized homepage based on browsing history
- Drop recommendations based on user preferences
- Live chat support widget
- Video backgrounds for hero section
- Interactive drop previews with 3D models
- Gamification elements (badges, achievements)
- Community-generated content sections

## Dependencies

### Platform Foundation
- Subdomain routing middleware must be functional
- Database schema must include Drop, Curator, Review models
- Authentication system must be operational

### External Services
- Vercel Blob for image storage
- Resend for newsletter email delivery
- Vercel Analytics for performance monitoring
- Sentry for error tracking

### Other Specs
- Drop detail page spec (for navigation from Drop_Card)
- Curator profile page spec (for navigation from Curator_Card)
- Authentication spec (for signup/login CTAs)
- Curator application spec (for curator CTA)

## Technical Debt & Future Considerations

### Performance Optimization
- Consider implementing Incremental Static Regeneration (ISR) for homepage
- Evaluate edge caching for drop data
- Consider WebSocket for real-time updates instead of SSE
- Implement service worker for offline support

### Feature Enhancements
- Add search functionality with Algolia or similar
- Implement advanced filtering with faceted search
- Add personalized recommendations engine
- Build A/B testing framework for homepage variations
- Add interactive onboarding tour for first-time visitors

### Analytics and Tracking
- Implement heatmap tracking for user behavior analysis
- Add conversion funnel tracking
- Build custom analytics dashboard for homepage metrics
- Implement cohort analysis for visitor segments

### Content Management
- Consider headless CMS for homepage content management
- Build admin interface for featured drop curation
- Implement content scheduling for seasonal campaigns
- Add support for promotional banners and announcements
