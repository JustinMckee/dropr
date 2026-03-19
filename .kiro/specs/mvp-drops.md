# Product Drops

## Overview
Limited-run product launches with countdown timers, scarcity mechanics, and timed availability windows. Drops are for products ready to ship immediately or within normal fulfillment timeframes.

## Requirements

### Drop Mechanics
- **Launch Date/Time**: Scheduled start of drop availability
- **End Date/Time**: Optional deadline for purchases
- **Limited Quantity**: Fixed inventory that creates scarcity
- **Countdown Timer**: Visual countdown to launch
- **Immediate/Near-term Fulfillment**: Products ship within standard timeframes (not pre-orders)

### Drop States
- **Draft**: Being created, not visible to public
- **Pending Approval**: Submitted for admin review
- **Scheduled**: Approved, countdown active, URL locked
- **Live**: Currently accepting orders
- **Sold Out**: Inventory depleted
- **Ended**: Past end date, page archived (not 404)
- **Completed**: All orders fulfilled and shipped

### Member Experience
- Browse upcoming and live drops
- Get notified when drops go live (email)
- See real-time inventory remaining
- Purchase during live window
- Track order fulfillment (standard shipping)

### Maker Experience
- Create drop in draft state
- Submit for admin approval
- Cannot delete scheduled/live drops (platform rating penalty)
- Monitor live drop performance with real-time inventory
- Extend drop deadline if needed
- Fulfill orders within standard shipping timeframes
- Past drops visible on maker profile (builds trust)

## Design

### Data Models

```typescript
Drop {
  id: string // unique, immutable once scheduled
  slug: string // unique URL slug, locked once scheduled
  productId: string (FK)
  makerId: string (FK to User)
  
  launchDate: datetime
  endDate: datetime?
  totalQuantity: int
  remainingQuantity: int // real-time updates
  
  status: 'draft' | 'pending_approval' | 'scheduled' | 'live' | 'sold_out' | 'ended' | 'completed'
  
  // Admin approval
  approvedBy: string? (FK to User with admin role)
  approvedAt: datetime?
  rejectionReason: string?
  
  // Media
  images: string[] // URLs
  videoUrl: string? // uploaded video
  
  notifySubscribers: boolean
  
  createdAt: datetime
  updatedAt: datetime
  scheduledAt: datetime? // when moved from draft to scheduled
}

DropNotification {
  id: string
  dropId: string (FK)
  userId: string (FK)
  notified: boolean
  notifiedAt: datetime?
}
```

### Business Rules

1. **Draft & Approval**
   - Drops created in draft state
   - Maker submits for admin approval
   - Admin approves or rejects with reason
   - Once scheduled, URL (slug) is locked and cannot change
   - Deleting scheduled/live drops incurs platform rating penalty

2. **Inventory Management**
   - Remaining quantity updates in real-time
   - Orders hold inventory (no overselling)
   - Abandoned carts release inventory after 15 minutes
   - Real-time inventory visible to all users

3. **Status Transitions**
   - `draft` → `pending_approval` (maker submits)
   - `pending_approval` → `scheduled` (admin approves)
   - `pending_approval` → `draft` (admin rejects)
   - `scheduled` → `live` (when launchDate reached)
   - `live` → `sold_out` (when remainingQuantity = 0)
   - `live` → `ended` (when endDate reached)
   - `ended` → `completed` (when all orders shipped)

4. **Ended Drop Pages**
   - Ended drops remain accessible (archived state, not 404)
   - Page shows "This drop has ended" message
   - Past drops visible on maker profile
   - SEO: 410 Gone status or archived content approach

5. **Fulfillment Rules**
   - Drops use standard product fulfillment (not escrow)
   - Funds released to maker immediately (minus platform fees)
   - Maker ships within estimated shipping days on product listing

6. **Rating Systems**
   - **Seller Rating**: Public, based on reviews and fulfillment
   - **Platform Rating**: Internal, affects maker privileges (drop deletion penalty)

### Server Actions & Routes

**Drop Routes & Actions:**
- `app/(makers)/drops/` - Maker drops dashboard (SSR)
- `app/(makers)/drops/create/` - Create new drop
  - `actions.ts`: `createDropAction()` - Create drop in draft
  - `actions.ts`: `submitForApprovalAction()` - Submit for admin review
- `app/(makers)/drops/[id]/edit/` - Edit draft drop
  - `actions.ts`: `updateDropAction()` - Update drop details
  - `actions.ts`: `deleteDropAction()` - Delete drop (with penalty if scheduled/live)
  - `actions.ts`: `extendDropAction()` - Extend drop deadline
- `app/drops/` - Browse drops (SSR)
- `app/drops/[slug]/` - Drop detail page (SSR)
  - `actions.ts`: `notifyMeAction()` - Subscribe to drop notifications
  - `actions.ts`: `removeNotificationAction()` - Unsubscribe
- `app/(admin)/drops/pending/` - Admin approval queue (SSR)
  - `actions.ts`: `approveDropAction()` - Approve drop
  - `actions.ts`: `rejectDropAction()` - Reject drop

**Real-time Data:**
- Server Component queries for real-time inventory display

## Implementation Tasks

- [ ] Create Drop and DropNotification schemas with approval fields
- [ ] Build drop creation form for makers (draft state)
- [ ] Implement image and video upload for drops
- [ ] Add unique slug generation (locked once scheduled)
- [ ] Build admin approval queue and interface
- [ ] Create approval/rejection workflow
- [ ] Implement platform rating system for makers
- [ ] Add penalty logic for drop deletion
- [ ] Implement countdown timer component
- [ ] Create drops listing page (upcoming, live, ended tabs)
- [ ] Build drop detail page with real-time inventory
- [ ] Add "Notify Me" functionality for scheduled drops
- [ ] Implement automated status transitions (cron job)
- [ ] Create inventory reservation system (15-min hold)
- [ ] Build real-time inventory updates (websockets or polling)
- [ ] Build maker drop management dashboard
- [ ] Add drop extension functionality
- [ ] Create past drops section on maker profile
- [ ] Implement ended drop archive pages (not 404)
- [ ] Add SEO handling for ended drops (410 Gone or archived)
- [ ] Send email notifications for drop launches and approvals

## Acceptance Criteria

- Makers can create drops in draft state
- Drops support image and video uploads
- Makers can submit drops for admin approval
- Admins can approve or reject drops
- Unique slug generated and locked once scheduled
- Scheduled drops cannot have URL changed
- Deleting scheduled/live drops incurs platform rating penalty
- Countdown displays correctly for scheduled drops
- Drops automatically transition to live at launch time
- Real-time inventory updates visible to all users
- Inventory decrements correctly on purchase
- Sold out status shows when inventory = 0
- Users can subscribe to drop notifications
- Email sent when subscribed drop goes live
- Abandoned carts release inventory after timeout
- Makers can extend drop deadline
- Drops use standard fulfillment (immediate payout)
- Past drops visible on maker profile page
- Ended drops show archived page (not 404)
- SEO properly handled for ended drops

## Out of Scope for MVP

- Waitlist for sold-out drops
- Early access for VIP buyers
- Drop analytics (conversion rates, traffic sources)
- Automatic inventory replenishment
- Multi-phase drops (waves of inventory)
- Drop templates for recurring launches
