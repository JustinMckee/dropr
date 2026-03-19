# Reputation System & Reviews

## Overview
Trust and accountability system using star ratings, written reviews, and calculated reputation scores to ensure quality and delivery reliability.

## Requirements

### Review System
- Star rating (1-5 stars)
- Written review (optional, max 500 chars)
- Review photos (optional, max 3)
- Review timestamp
- Only verified members can review
- One review per product purchase

### Reputation Score Calculation
Maker reputation based on:
- **Review Average** (40% weight): Average star rating across all reviews
- **Fulfillment Rate** (30% weight): % of orders shipped on time
- **Response Time** (15% weight): Average time to respond to messages
- **Dispute Rate** (15% weight): % of orders without disputes

Score: 0-100 scale, displayed as 0-5 stars on profile

### Review Features
- Buyers can edit reviews within 30 days
- Makers can respond to reviews (one response per review)
- Reviews display on product and maker profile pages
- Flag inappropriate reviews for moderation

### Trust Signals
- Verified maker badge (after 10 successful deliveries)
- Fast shipper badge (ships 90% of orders within estimated time)
- Responsive badge (responds to messages within 24 hours)
- Total sales count
- Member since date

## Design

### Data Models

```typescript
Review {
  id: string
  productId: string (FK)
  makerId: string (FK)
  memberId: string (FK)
  orderId: string (FK)
  
  rating: int // 1-5
  comment: string?
  photos: string[]?
  
  makerResponse: string?
  makerRespondedAt: datetime?
  
  flagged: boolean
  flagReason: string?
  
  createdAt: datetime
  updatedAt: datetime
}

MakerReputation {
  makerId: string (FK, unique)
  
  // Components
  avgRating: float // 0-5
  fulfillmentRate: float // 0-1
  avgResponseTimeHours: float
  disputeRate: float // 0-1
  
  // Calculated score
  reputationScore: float // 0-100
  
  // Counts for badges
  totalOrders: int
  onTimeShipments: int
  totalDisputes: int
  
  // Badges
  isVerified: boolean
  isFastShipper: boolean
  isResponsive: boolean
  
  updatedAt: datetime
}
```

### Reputation Score Formula

```
reputationScore = (
  (avgRating / 5 * 100) * 0.40 +
  (fulfillmentRate * 100) * 0.30 +
  (responseScore * 100) * 0.15 +
  ((1 - disputeRate) * 100) * 0.15
)

responseScore = min(1, 24 / max(avgResponseTimeHours, 1))
```

### Badge Criteria
- **Verified**: 10+ completed orders, 4.0+ avg rating
- **Fast Shipper**: 90%+ on-time shipments, 20+ orders
- **Responsive**: Avg response time < 24 hours, 10+ conversations

### Server Actions & Routes

**Review Routes & Actions:**
- `app/(users)/orders/[id]/review/` - Submit review after delivery
  - `actions.ts`: `createReviewAction()` - Submit new review
  - `actions.ts`: `updateReviewAction()` - Edit review (within 30 days)
  - `actions.ts`: `deleteReviewAction()` - Delete review (within 30 days)
  - `actions.ts`: `flagReviewAction()` - Flag inappropriate review
- `app/(makers)/reviews/` - Maker reviews dashboard (SSR)
- `app/(makers)/reviews/[id]/respond/` - Respond to review
  - `actions.ts`: `respondToReviewAction()` - Add maker response
- `app/products/[id]/` - Product page with reviews (SSR)
- `app/(makers)/maker/[slug]/` - Maker profile with reviews (SSR)
- `app/(admin)/reviews/flagged/` - Admin moderation queue (SSR)

**Automated Actions:**
- Cron job for daily reputation score recalculation
- Automated badge assignment based on criteria

## Implementation Tasks

- [ ] Create Review and MakerReputation schemas
- [ ] Build review submission form (post-delivery)
- [ ] Implement star rating component
- [ ] Add review photo upload
- [ ] Create review display components
- [ ] Build maker response functionality
- [ ] Implement review flagging system
- [ ] Create reputation calculation service
- [ ] Build automated reputation update (cron job)
- [ ] Add badge display on maker profiles
- [ ] Implement review edit/delete (30-day window)
- [ ] Create review moderation queue (admin)
- [ ] Add review verification (confirmed purchase check)
- [ ] Build reputation score display component

## Acceptance Criteria

- Only verified members can leave reviews
- One review per product purchase
- Star ratings and comments display correctly
- Makers can respond to reviews
- Reputation score calculates accurately
- Badges awarded based on criteria
- Reviews editable within 30 days
- Flagged reviews go to moderation queue
- Reputation updates daily via cron job
- Trust signals visible on maker profiles
- Review photos display in gallery format

## Out of Scope for MVP

- Review helpfulness voting
- Review sorting (most helpful, recent)
- Verified purchase badge on reviews
- Review response notifications
- Detailed reputation breakdown page
- Historical reputation tracking
- Maker reputation comparison
