# Buyer Drop Experience - Requirements

## 1. Overview

This specification defines the complete buyer journey for Dropr's drop-based marketplace, from discovering available drops through the post-purchase reveal experience. The buyer experience is designed for enthusiast hobbyists across three culture collectives (Mod, Make, Mini) who value discovery, trust, and the anticipation of curated mystery drops.

Each collective has its own subdomain (make.dropr.com, mod.dropr.com, mini.dropr.com) with collective-specific theming and content filtering, while sharing a single codebase and deployment.

## 2. User Stories

### 2.1 Drop Discovery

**As an enthusiast buyer**, I want to discover relevant drops for my hobby interests so that I can find curated items that match my passion.

**Acceptance Criteria:**
- 2.1.1 Buyers can browse drops filtered by collective subdomain (make.dropr.com, mod.dropr.com, mini.dropr.com) or tags (Mechanical Keyboards, Modular Synths, miniatures)
- 2.1.2 Each collective subdomain displays only drops for that collective with collective-specific theming (Mod: purple, Make: cyan, Mini: pink)
- 2.1.3 Drops display key information: Drop type (Mystery Box, Surplus, Limited Edition), theme, curator details, countdown timer, and availability
- 2.1.4 Featured or trending drops are highlighted prominently
- 2.1.5 Buyers can see curator reputation/rating at a glance
- 2.1.6 Drop thumbnails provide visual appeal without revealing contents for mystery boxes

### 2.2 Drop Details & Trust Signals

**As an enthusiast buyer**, I want to understand what I'm purchasing and trust the curator so that I feel confident in my purchase decision.

**Acceptance Criteria:**
- 2.2.1 Drop detail page shows single price point, estimated value range (for mystery boxes), and inventory count
- 2.2.2 Drop type is clearly indicated (Mystery Box, Surplus, Limited Edition)
- 2.2.3 Curator profile information is accessible (reputation score, past drop history, social proof, and ratings)
- 2.2.4 Drop description provides theme/title and context without spoiling mystery (for mystery boxes)
- 2.2.5 Clear escrow protection messaging is displayed (20% platform fee held until delivery + 7-day dispute window)
- 2.2.6 Shipping timeline and policies are clearly stated
- 2.2.7 Community collective badge/category is prominently displayed with collective-specific styling
- 2.2.8 Dispute management process is clearly explained
- 2.2.9 "Drop Mechanics" guide helps set buyer expectations
- 2.2.10 Post drop reveal is clearly explained (for mystery boxes)
- 2.2.11 Benefits of joining dropr and the dropr account dashboard

### 2.3 Purchase Flow

**As an enthusiast buyer**, I want a smooth and secure checkout process so that I can quickly claim my spot in a limited drop.

**Acceptance Criteria:**
- 2.3.1 One-click purchase option for returning buyers with saved payment methods
- 2.3.2 Guest checkout available for new buyers
- 2.3.3 Real-time inventory updates prevent overselling
- 2.3.4 Clear confirmation of purchase with order number
- 2.3.5 Escrow hold messaging reassures buyer that payment is protected
- 2.3.6 Email, SMS confirmation sent immediately after purchase
- 2.3.7 Purchase confirmation page shows next steps in the drop process
- 2.3.8 Users can create account during checkout for order tracking and future purchases
- 2.3.9 Checkout form fields have instant validation and helpful error messages
- 2.3.10 Interrupted checkout recovery flow (e.g., server errors, network issues)
- 2.3.11 Payment options include credit/debit card, photo card reader, Apple Pay, Google Pay, PayPal, etc
- 2.3.12 Combination Cart and Checkout slide-in flow for seamless purchasing

### 2.4 Anticipation & Tracking

**As an enthusiast buyer**, I want to track my drop's progress and build anticipation so that I stay engaged until delivery.

**Acceptance Criteria:**
- 2.4.1 Order status page shows drop close date, packing timeline, and shipping status
- 2.4.2 Email, SMS, Push notifications at key milestones (drop closed, packing started, shipped, delivered, ratings/review open)
- 2.4.4 Tracking number provided when drop ships
- 2.4.5 Dashboard shows drop order history, followed upcoming drops, upcoming ratings/review for recently purchased drops
- 2.4.7 Settings page allows notification preferences 

### 2.5 Reveal & Feedback

**As an enthusiast buyer**, I want to discover what's in my drop and rate/review the drop so that I can celebrate my haul and help the community and currators gain positive ratings.

**Acceptance Criteria:**
- 2.5.1 Buyers can mark drop as "received" to unlock reveal experience for community
- 2.5.2 Reveal interface encourages sharing (optional photo upload, social sharing)
- 2.5.3 Buyers can rate the drop (value, quality, curation)
- 2.5.4 Buyers can leave public reviews for the curator is visible to other potential buyers (with moderation)
- 2.5.6 Buyers can report issues, file a dispute, or request support if needed

### 2.6 Notifications & Engagement

**As an enthusiast buyer**, I want to be notified about drops I care about so that I don't miss limited opportunities.

**Acceptance Criteria:**
- 2.6.1 Buyers can follow specific curators for drop notifications
- 2.6.2 Buyers can set preferences for culture collective notifications
- 2.6.3 Email, SMS, push notifications for followed curator drops (with unsubscribe option)
- 2.6.5 "Drops ending soon" reminders

## 3. Functional Requirements

### 3.1 Drop Browsing & Filtering
- Subdomain-based collective filtering (make.dropr.com, mod.dropr.com, mini.dropr.com)
- Middleware detects subdomain and adds x-collective header for content filtering
- Support filtering by drop type (Mystery Box, Surplus, Limited Edition), tags, price range, curator rating, trending, and drop status
- Implement search functionality for curator names and drop keywords
- Display drop cards with essential information in grid or list view
- Show real-time availability and countdown timers via SSE
- Collective-specific theming applied dynamically via CSS custom properties

### 3.2 Drop Detail Page
- Render comprehensive drop information including collective, drop type, theme, single price, value estimate (for mystery boxes), inventory count
- Display drop type badge (Mystery Box, Surplus, Limited Edition)
- For mystery boxes: show theme without revealing contents
- For surplus/limited edition: show specific item details
- Optional video upload for use in hero or other context
- Display curator profile with reputation metrics and past drop history
- Show escrow protection badge and trust signals (20% platform fee, 7-day dispute window)
- Provide clear call-to-action for purchase
- Display shipping policies and estimated delivery timeline
- Display related drops from same collective for cross-selling
- Implement "share drop" functionality
- Real-time inventory updates via SSE
- Combination cart and checkout slide-in flow prevents navigation away from drop context
- Collective-specific theming applied to page elements

### 3.3 Checkout & Payment
- Integrate Stripe with Connect for escrow support (capture_method: 'manual')
- 20% platform fee structure with 80% going to curator
- Support multiple payment methods (credit card, Apple Pay, Google Pay, PayPal, etc.)
- Implement atomic inventory locking during checkout to prevent overselling
- Generate unique order IDs (cuid) for tracking
- Send transactional emails (Resend) and SMS (Twilio) for order confirmation
- Provide cart recovery for abandoned checkouts
- Combination Cart, checkout, payment slide-in aside
- Escrow release after delivery confirmation + 7-day dispute window

### 3.4 Order Management
- Provide order status dashboard for buyers
- Track drop lifecycle: purchased → drop closed → packing → shipped → delivered
- Integrate with shipping carriers for tracking updates
- Send automated email, SMS notifications at each status change

### 3.5 Reveal Experience
- Create engaging reveal interface for mystery boxes (gamified or visual)
- Support optional photo uploads for community sharing
- Implement rating system (overall, value, quality, curation - 1-5 stars + written reviews)
- Moderate feedback before public display (ModerationStatus: PENDING, APPROVED, REJECTED)
- Reveal only applies to mystery boxes (surplus/limited edition are known items)

### 3.6 Notification System
- Implement curator and drop follow functionality
- Manage email and SMS notification preferences
- Support transactional emails (order updates) and marketing emails (new drops)
- Background job queue (BullMQ) for notification processing
- Provide unsubscribe and preference management
- Collective-specific notification preferences (notify for specific collectives)

## 4. Non-Functional Requirements

### 4.1 Performance
- Drop listing page loads in under 2 seconds
- Checkout flow completes in under 5 seconds
- Real-time inventory updates with minimal latency

### 4.2 Security
- PCI-compliant payment processing
- Secure escrow fund handling
- Encrypted data transmission (HTTPS)
- Protection against bot purchases and scalping

### 4.3 Usability
- Mobile-responsive design for all buyer flows
- Accessible UI following WCAG 2.1 AA standards
- Clear error messaging and validation
- Intuitive navigation and information hierarchy

### 4.4 Reliability
- 99.9% uptime for core buyer flows
- Graceful degradation if external services fail
- Transaction rollback on payment failures

## 5. Constraints & Assumptions

### 5.1 Constraints
- Must integrate with curator drop creation system (separate spec)
- Payment processing must support escrow holds (Stripe Connect with manual capture)
- Must comply with marketplace regulations and consumer protection laws
- Initial launch supports web only (mobile apps future consideration)
- Single deployment serving all subdomains (not separate builds)
- 20% platform fee structure (non-negotiable for Phase 1)

### 5.2 Assumptions
- Buyers have basic familiarity with online shopping
- Buyers understand the mystery drop or product concept
- Curators will fulfill drops within stated timelines
- Platform will handle dispute resolution and refunds

## 6. Success Metrics

- Conversion rate from drop view to purchase
- Average time from discovery to purchase
- Buyer satisfaction ratings (post-reveal feedback)
- Repeat purchase rate
- Drop completion rate (buyers who receive and rate drops)
- Email notification engagement rates
- SMS signup rates
- Customer support ticket or dispute volume

## 7. Out of Scope

- Subscription box management (separate feature)
- Buyer-to-buyer resale marketplace
- Live auctions
- Cryptocurrency payment options
- International shipping (phase 1 domestic only)
