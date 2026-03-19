# Platform Rating System

## Overview
Internal rating system for makers that affects platform privileges and account standing, separate from the public seller rating.

## Requirements

### Rating Systems

**Seller Rating (Public)**
- Based on member reviews and fulfillment performance
- Visible on maker profiles
- Affects buyer trust and purchasing decisions
- Covered in mvp-reputation-reviews.md

**Platform Rating (Internal)**
- Internal score affecting maker privileges
- Not publicly visible
- Based on platform policy compliance
- Affects account standing and features access

## Platform Rating

### Starting Score
- New makers start at 100 points
- Score range: 0-100

### Penalties

**Drop/Pre-order Deletion**
- Deleting scheduled drop: -15 points
- Deleting live drop: -25 points
- Deleting active pre-order: -20 points
- Draft deletions: No penalty

**Other Violations**
- Late shipments (>7 days past estimate): -5 points per occurrence
- Dispute escalation (maker fault): -10 points
- Policy violations: -10 to -50 points (admin discretion)

### Score Thresholds & Consequences

**90-100 (Good Standing)**
- Full platform access
- No restrictions

**70-89 (Warning)**
- Email warning sent
- Drop/pre-order creation requires extra review

**50-69 (Restricted)**
- Cannot create new drops or pre-orders
- Existing listings remain active
- Must improve score to regain access

**Below 50 (Suspended)**
- Account review required
- All listings paused
- Cannot create new content
- Admin intervention needed

### Score Recovery
- +5 points for every 10 successful deliveries
- +10 points after 30 days with no violations
- Maximum recovery: +15 points per month

## Data Models

```typescript
MakerPlatformRating {
  makerId: string (FK, unique)
  
  score: int // 0-100
  status: 'good_standing' | 'warning' | 'restricted' | 'suspended'
  
  totalPenalties: int
  totalRecoveries: int
  
  lastPenaltyAt: datetime?
  lastRecoveryAt: datetime?
  
  updatedAt: datetime
}

PlatformRatingEvent {
  id: string
  makerId: string (FK)
  
  type: 'penalty' | 'recovery'
  reason: string
  pointsChange: int // negative for penalties, positive for recovery
  
  relatedEntityType: 'drop' | 'preorder' | 'order' | 'dispute' | 'policy'?
  relatedEntityId: string?
  
  adminId: string? (FK, if manual)
  
  createdAt: datetime
}
```

### Server Actions & Routes

**Platform Rating Routes & Actions:**
- `app/(makers)/platform-rating/` - Maker platform rating dashboard (SSR)
- `app/(admin)/platform-rating/` - Admin rating management (SSR)
  - `actions.ts`: `applyPenaltyAction()` - Apply manual penalty
  - `actions.ts`: `applyRecoveryAction()` - Apply manual recovery

**Automated Actions:**
- Cron job for automated recovery calculations
- Automated penalty triggers on drop/pre-order deletion

## Implementation Tasks

- [ ] Create MakerPlatformRating and PlatformRatingEvent schemas
- [ ] Implement rating calculation logic
- [ ] Add penalty triggers for drop/pre-order deletion
- [ ] Build automated recovery system (cron job)
- [ ] Create maker platform rating dashboard
- [ ] Implement restriction enforcement (drop/pre-order creation)
- [ ] Build admin rating management interface
- [ ] Add email notifications for rating changes
- [ ] Create rating history view for makers
- [ ] Implement account suspension workflow

## Acceptance Criteria

- New makers start with 100 platform rating
- Deleting scheduled/live drops/pre-orders applies correct penalty
- Rating thresholds enforce appropriate restrictions
- Makers notified when rating drops below thresholds
- Automated recovery works correctly
- Admin can manually adjust ratings with reason
- Rating history tracked and viewable
- Suspended accounts require admin review
- Restrictions properly enforced on drop/pre-order creation

## Out of Scope for MVP

- Appeal process for penalties
- Detailed penalty breakdown on profile
- Rating badges or achievements
- Maker rating comparison/leaderboard
