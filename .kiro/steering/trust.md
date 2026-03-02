---
inclusion: manual
---

# Trust and Safety

## Philosophy

Build marketplace trust through escrow protection, transparent dispute resolution, and proactive fraud prevention. Trust is earned through consistent buyer protection, fair curator treatment, and swift issue resolution. Escrow holds funds until delivery confirmation, disputes are resolved with evidence-based decisions, and fraud detection prevents bad actors. Transparency in policies and processes builds confidence for both buyers and curators.

## Trust and Safety Checklist

**Escrow System:**
- [ ] Funds held until delivery confirmed
- [ ] Automatic release after confirmation period
- [ ] Manual release option for buyers
- [ ] Refund process for disputes
- [ ] Escrow status visible to both parties

**Dropr Buyer Warranty:**
- [ ] 14-day warranty claim window
- [ ] Quality defects covered
- [ ] Non-working parts covered
- [ ] Craftsmanship failures covered
- [ ] Deceptive descriptions covered
- [ ] Evidence required (photos, videos)
- [ ] Community moderation available
- [ ] Gracious dispute handling

**Dispute Resolution:**
- [ ] Dispute filing window defined (7-14 days)
- [ ] Evidence submission required (photos, messages)
- [ ] Mediation process documented
- [ ] Resolution timeline (3-5 business days)
- [ ] Appeal process available
- [ ] Partial refunds supported

**Community Moderation:**
- [ ] Trusted community members as moderators
- [ ] Expertise-based moderator selection
- [ ] Moderator reputation system
- [ ] Conflict of interest prevention
- [ ] Admin oversight and final authority
- [ ] Moderator incentives/rewards

**Fraud Prevention:**
- [ ] Identity verification for curators
- [ ] Payment fraud detection (Stripe Radar)
- [ ] Suspicious activity monitoring
- [ ] Account takeover prevention
- [ ] Chargeback handling process
- [ ] Ban evasion detection

**Buyer Protection:**
- [ ] Item not received protection
- [ ] Item not as described protection
- [ ] Damaged item protection
- [ ] Refund policy clearly stated
- [ ] Return shipping cost policy
- [ ] Partial refund guidelines

**Curator Protection:**
- [ ] False claim prevention
- [ ] Evidence review process
- [ ] Seller performance metrics
- [ ] Chargeback representation
- [ ] Account suspension appeal

**Communication:**
- [ ] In-platform messaging only
- [ ] Message moderation enabled
- [ ] No external contact sharing
- [ ] Conversation history saved
- [ ] Automated response templates

## Database Schema

```prisma
// prisma/schema.prisma
model Escrow {
  id          String   @id @default(cuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")
  
  status      EscrowStatus @default(HELD)
  heldAt      DateTime @default(now())
  releasedAt  DateTime?
  refundedAt  DateTime?
  
  // Automatic release after X days
  autoReleaseAt DateTime
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([autoReleaseAt])
}

enum EscrowStatus {
  HELD
  RELEASED
  REFUNDED
  DISPUTED
}

model Dispute {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  
  initiatedBy String   // buyerId or curatorId
  initiator   User     @relation("DisputeInitiator", fields: [initiatedBy], references: [id])
  
  reason      DisputeReason
  description String
  evidence    Json?    // Array of evidence URLs
  
  status      DisputeStatus @default(OPEN)
  resolution  DisputeResolution?
  resolutionNote String?
  resolvedBy  String?
  resolvedAt  DateTime?
  
  // Refund details
  refundAmount Decimal? @db.Decimal(10, 2)
  refundReason String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([orderId])
  @@index([status])
  @@index([initiatedBy])
}

enum DisputeReason {
  ITEM_NOT_RECEIVED
  ITEM_NOT_AS_DESCRIBED
  ITEM_DAMAGED
  WRONG_ITEM
  MISSING_ITEMS
  COUNTERFEIT
  WARRANTY_QUALITY_DEFECT
  WARRANTY_NON_WORKING
  WARRANTY_CRAFTSMANSHIP
  WARRANTY_DECEPTIVE_DESCRIPTION
  OTHER
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  AWAITING_EVIDENCE
  RESOLVED
  CLOSED
}

enum DisputeResolution {
  REFUND_FULL
  REFUND_PARTIAL
  NO_REFUND
  REPLACEMENT
}

model FraudAlert {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  type        FraudType
  severity    FraudSeverity
  description String
  metadata    Json?
  
  status      AlertStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  action      String?
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([status])
  @@index([type])
}

enum FraudType {
  PAYMENT_FRAUD
  ACCOUNT_TAKEOVER
  FAKE_REVIEWS
  COUNTERFEIT_ITEMS
  CHARGEBACK_ABUSE
  MULTIPLE_ACCOUNTS
  SUSPICIOUS_ACTIVITY
}

enum FraudSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum AlertStatus {
  PENDING
  INVESTIGATING
  CONFIRMED
  FALSE_POSITIVE
  RESOLVED
}

model WarrantyClaim {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  
  claimType   WarrantyClaimType
  description String
  evidence    Json     // Array of evidence URLs (photos, videos)
  
  status      WarrantyStatus @default(PENDING)
  
  // Community moderation
  moderatorId String?
  moderator   User?    @relation("WarrantyModerator", fields: [moderatorId], references: [id])
  moderatorRecommendation String?
  moderatorNotes String?
  moderatedAt DateTime?
  
  // Final resolution
  resolution  WarrantyResolution?
  resolutionNote String?
  resolvedBy  String?
  resolvedAt  DateTime?
  
  // Refund details
  refundAmount Decimal? @db.Decimal(10, 2)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([orderId])
  @@index([status])
  @@index([moderatorId])
}

enum WarrantyClaimType {
  QUALITY_DEFECT
  NON_WORKING_PARTS
  CRAFTSMANSHIP_FAILURE
  DECEPTIVE_DESCRIPTION
}

enum WarrantyStatus {
  PENDING
  UNDER_REVIEW
  COMMUNITY_MODERATION
  ADMIN_REVIEW
  RESOLVED
  REJECTED
}

enum WarrantyResolution {
  FULL_REFUND
  PARTIAL_REFUND
  REPLACEMENT
  REPAIR_CREDIT
  NO_ACTION
}

model CommunityModerator {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Expertise areas
  specialties String[] // Categories they can moderate
  
  // Stats
  totalCases      Int     @default(0)
  accuracyRate    Float?  // % of recommendations upheld by admin
  averageTime     Int?    // Average hours to review
  
  // Reputation
  reputationScore Int     @default(0)
  level           ModeratorLevel @default(NOVICE)
  
  // Status
  status          ModeratorStatus @default(ACTIVE)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([reputationScore])
}

enum ModeratorLevel {
  NOVICE
  INTERMEDIATE
  EXPERT
  MASTER
}

enum ModeratorStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

## Escrow System

### Escrow Flow

1. Buyer completes purchase → Funds held in escrow
2. Curator ships item → Tracking number added
3. Item delivered → Buyer has 7 days to confirm or dispute
4. No dispute filed → Funds auto-release to curator
5. Dispute filed → Funds held until resolution

### Create Escrow

```typescript
// features/payments/models/escrow.actions.ts
'use server'

import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function createEscrow(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { drop: true },
  });
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  // Calculate auto-release date (7 days after expected delivery)
  const autoReleaseAt = new Date();
  autoReleaseAt.setDate(autoReleaseAt.getDate() + 14); // 7 days shipping + 7 days confirmation
  
  // Create escrow record
  const escrow = await db.escrow.create({
    data: {
      orderId,
      amount: order.total,
      currency: 'USD',
      status: 'HELD',
      autoReleaseAt,
    },
  });
  
  return escrow;
}
```

### Release Escrow

```typescript
// features/payments/models/escrow.actions.ts
'use server'

export async function releaseEscrow(orderId: string, manual: boolean = false) {
  const escrow = await db.escrow.findUnique({
    where: { orderId },
    include: { order: { include: { drop: { include: { curator: true } } } } },
  });
  
  if (!escrow) {
    throw new NotFoundError('Escrow not found');
  }
  
  if (escrow.status !== 'HELD') {
    throw new ValidationError('Escrow already processed');
  }
  
  // Check if there's an open dispute
  const openDispute = await db.dispute.findFirst({
    where: {
      orderId,
      status: { in: ['OPEN', 'UNDER_REVIEW', 'AWAITING_EVIDENCE'] },
    },
  });
  
  if (openDispute) {
    throw new ValidationError('Cannot release funds during active dispute');
  }
  
  // Transfer funds to curator via Stripe Connect
  const transfer = await stripe.transfers.create({
    amount: Math.round(escrow.amount * 100), // Convert to cents
    currency: escrow.currency.toLowerCase(),
    destination: escrow.order.drop.curator.stripeAccountId,
    transfer_group: orderId,
  });
  
  // Update escrow status
  await db.escrow.update({
    where: { id: escrow.id },
    data: {
      status: 'RELEASED',
      releasedAt: new Date(),
    },
  });
  
  // Update order status
  await db.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' },
  });
  
  // Notify curator
  await createNotification({
    userId: escrow.order.drop.curator.userId,
    type: 'FUNDS_RELEASED',
    title: 'Funds Released',
    message: `$${escrow.amount} has been transferred to your account`,
    link: `/curator/earnings`,
  });
  
  return { success: true, transferId: transfer.id };
}
```

### Auto-Release Cron Job

```typescript
// lib/cron/auto-release-escrow.ts
import { db } from '@/lib/db';
import { releaseEscrow } from '@/features/payments/models/escrow.actions';

export async function autoReleaseEscrows() {
  const now = new Date();
  
  // Find escrows ready for auto-release
  const escrows = await db.escrow.findMany({
    where: {
      status: 'HELD',
      autoReleaseAt: { lte: now },
    },
  });
  
  console.log(`Auto-releasing ${escrows.length} escrows`);
  
  for (const escrow of escrows) {
    try {
      await releaseEscrow(escrow.orderId, false);
      console.log(`Released escrow for order ${escrow.orderId}`);
    } catch (error) {
      console.error(`Failed to release escrow ${escrow.id}:`, error);
    }
  }
}

// Run every hour
// Configure in Vercel Cron or similar
```

## Dropr Buyer Warranty

### Warranty Overview

The Dropr Buyer Warranty provides an additional layer of trust beyond standard dispute resolution. It covers quality issues, non-working parts, craftsmanship failures, and deceptive descriptions for 14 days after delivery.

**What's Covered:**
- Quality defects (items that don't meet reasonable quality standards)
- Non-working parts (components that don't function as intended)
- Craftsmanship failures (poor assembly, weak joints, inadequate finishing)
- Deceptive descriptions (significant misrepresentation of contents or quality)

**What's NOT Covered:**
- Normal wear and tear
- Buyer's remorse or change of mind
- Damage caused by buyer misuse
- Items accurately described as "as-is" or "for parts"
- Subjective preferences (color, style) when accurately described

**Claim Window:** 14 days from delivery confirmation

### File Warranty Claim

```typescript
// features/warranty/models/warranty.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function fileWarrantyClaim(
  orderId: string,
  claimType: WarrantyClaimType,
  description: string,
  evidence: string[] // URLs to photos/videos
) {
  const session = await requireAuth();
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      drop: { include: { curator: true } },
      buyer: true,
    },
  });
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  // Check ownership
  if (order.buyerId !== session.user.id) {
    throw new ForbiddenError('Not your order');
  }
  
  // Check if delivered
  if (order.status !== 'DELIVERED') {
    throw new ValidationError('Order must be delivered to file warranty claim');
  }
  
  // Check warranty window (14 days after delivery)
  const daysSinceDelivery = Math.floor(
    (Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceDelivery > 14) {
    throw new ValidationError('Warranty period expired (14 days after delivery)');
  }
  
  // Check if claim already exists
  const existingClaim = await db.warrantyClaim.findFirst({
    where: { orderId },
  });
  
  if (existingClaim) {
    throw new ValidationError('Warranty claim already filed for this order');
  }
  
  // Validate evidence
  if (!evidence || evidence.length === 0) {
    throw new ValidationError('Evidence required (photos or videos showing the issue)');
  }
  
  // Create warranty claim
  const claim = await db.warrantyClaim.create({
    data: {
      orderId,
      claimType,
      description,
      evidence,
      status: 'PENDING',
    },
  });
  
  // Update escrow to hold funds
  await db.escrow.update({
    where: { orderId },
    data: { status: 'DISPUTED' },
  });
  
  // Notify curator
  await createNotification({
    userId: order.drop.curator.userId,
    type: 'WARRANTY_CLAIM',
    title: 'Warranty Claim Filed',
    message: `A buyer filed a warranty claim for order ${order.orderNumber}`,
    link: `/curator/warranty/${claim.id}`,
  });
  
  // Assign to community moderator if available
  await assignCommunityModerator(claim.id, order.drop.category);
  
  return { success: true, claimId: claim.id };
}
```

### Warranty Claim Form

```typescript
// features/warranty/components/WarrantyClaimForm.tsx
'use client'

import { useState } from 'react';
import { fileWarrantyClaim } from '../models/warranty.actions';

export function WarrantyClaimForm({ orderId }: { orderId: string }) {
  const [claimType, setClaimType] = useState<WarrantyClaimType>('QUALITY_DEFECT');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (evidence.length === 0) {
      alert('Please upload at least one photo or video showing the issue');
      return;
    }
    
    const result = await fileWarrantyClaim(orderId, claimType, description, evidence);
    
    if (result.success) {
      // Show success message
      // Redirect to claim page
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>File Warranty Claim</h2>
      
      <div className="warranty-info">
        <h3>Dropr Buyer Warranty</h3>
        <p>
          Our warranty covers quality defects, non-working parts, craftsmanship
          failures, and deceptive descriptions for 14 days after delivery.
        </p>
      </div>
      
      <div>
        <label>Claim Type *</label>
        <select
          value={claimType}
          onChange={(e) => setClaimType(e.target.value as WarrantyClaimType)}
          required
        >
          <option value="QUALITY_DEFECT">
            Quality Defect - Item doesn't meet reasonable quality standards
          </option>
          <option value="NON_WORKING_PARTS">
            Non-Working Parts - Components don't function as intended
          </option>
          <option value="CRAFTSMANSHIP_FAILURE">
            Craftsmanship Failure - Poor assembly, weak joints, inadequate finishing
          </option>
          <option value="DECEPTIVE_DESCRIPTION">
            Deceptive Description - Significant misrepresentation of contents
          </option>
        </select>
      </div>
      
      <div>
        <label>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe the issue in detail. Be specific about what's wrong and how it differs from the description..."
          minLength={100}
          maxLength={2000}
          required
          rows={6}
        />
        <small>{description.length}/2000 characters (minimum 100)</small>
      </div>
      
      <div>
        <label>Evidence * (Required)</label>
        <PhotoVideoUpload
          onUpload={(urls) => setEvidence(urls)}
          maxFiles={10}
          acceptVideo={true}
        />
        <small>
          Upload photos or videos clearly showing the issue. Multiple angles
          and close-ups help us resolve your claim faster.
        </small>
      </div>
      
      <div className="warranty-process">
        <h4>What Happens Next?</h4>
        <ol>
          <li>Your claim is reviewed by our team within 24 hours</li>
          <li>A community expert may review and provide recommendations</li>
          <li>The curator is notified and can respond with their perspective</li>
          <li>We make a fair decision within 3-5 business days</li>
          <li>Funds remain in escrow until resolution</li>
        </ol>
        
        <h4>Possible Outcomes:</h4>
        <ul>
          <li><strong>Full Refund:</strong> Complete reimbursement</li>
          <li><strong>Partial Refund:</strong> Compensation for the defect</li>
          <li><strong>Replacement:</strong> Curator sends replacement item</li>
          <li><strong>Repair Credit:</strong> Credit toward fixing the issue</li>
          <li><strong>No Action:</strong> Claim doesn't meet warranty criteria</li>
        </ul>
      </div>
      
      <button type="submit">Submit Warranty Claim</button>
    </form>
  );
}
```

### Community Moderation System

Community moderation leverages the expertise of trusted curators and experienced buyers to help review warranty claims. This provides:
- **Domain expertise** for technical issues
- **Faster resolution** through distributed review
- **Community trust** through peer involvement
- **Scalability** as the platform grows

#### Become a Community Moderator

```typescript
// features/warranty/models/moderator.actions.ts
'use server'

export async function applyForModerator(specialties: string[]) {
  const session = await requireAuth();
  
  // Check eligibility
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      curator: true,
      orders: true,
      reviews: true,
    },
  });
  
  // Eligibility criteria
  const isCurator = !!user.curator;
  const hasMinOrders = user.orders.length >= 10;
  const hasGoodReputation = user.reviews.filter(r => r.overallRating >= 4).length >= 5;
  const accountAge = Date.now() - user.createdAt.getTime();
  const isEstablished = accountAge > 90 * 24 * 60 * 60 * 1000; // 90 days
  
  if (!isEstablished) {
    throw new ValidationError('Account must be at least 90 days old');
  }
  
  if (!isCurator && !hasMinOrders) {
    throw new ValidationError('Must be a curator or have at least 10 orders');
  }
  
  // Check if already a moderator
  const existing = await db.communityModerator.findUnique({
    where: { userId: session.user.id },
  });
  
  if (existing) {
    throw new ValidationError('Already a community moderator');
  }
  
  // Create moderator profile
  const moderator = await db.communityModerator.create({
    data: {
      userId: session.user.id,
      specialties,
      status: 'ACTIVE',
      level: 'NOVICE',
      reputationScore: 0,
    },
  });
  
  return { success: true, moderatorId: moderator.id };
}
```

#### Assign Community Moderator

```typescript
// features/warranty/models/warranty.actions.ts
'use server'

async function assignCommunityModerator(
  claimId: string,
  category: string
) {
  // Find available moderators with relevant expertise
  const moderators = await db.communityModerator.findMany({
    where: {
      status: 'ACTIVE',
      specialties: { has: category },
    },
    orderBy: [
      { reputationScore: 'desc' },
      { accuracyRate: 'desc' },
    ],
    take: 5,
  });
  
  if (moderators.length === 0) {
    // No community moderators available, skip to admin review
    await db.warrantyClaim.update({
      where: { id: claimId },
      data: { status: 'ADMIN_REVIEW' },
    });
    return;
  }
  
  // Select moderator with lowest current workload
  const moderatorWorkloads = await Promise.all(
    moderators.map(async (mod) => {
      const activeCases = await db.warrantyClaim.count({
        where: {
          moderatorId: mod.userId,
          status: 'COMMUNITY_MODERATION',
        },
      });
      return { moderator: mod, workload: activeCases };
    })
  );
  
  const selected = moderatorWorkloads.sort((a, b) => a.workload - b.workload)[0];
  
  // Assign to moderator
  await db.warrantyClaim.update({
    where: { id: claimId },
    data: {
      status: 'COMMUNITY_MODERATION',
      moderatorId: selected.moderator.userId,
    },
  });
  
  // Notify moderator
  await createNotification({
    userId: selected.moderator.userId,
    type: 'MODERATOR_ASSIGNMENT',
    title: 'New Warranty Claim to Review',
    message: 'You've been assigned a warranty claim to review',
    link: `/moderator/claims/${claimId}`,
  });
}
```

#### Moderator Review Interface

```typescript
// features/warranty/components/ModeratorReview.tsx
'use client'

import { useState } from 'react';
import { submitModeratorReview } from '../models/moderator.actions';

export function ModeratorReview({ claim }: { claim: WarrantyClaim }) {
  const [recommendation, setRecommendation] = useState<WarrantyResolution>('FULL_REFUND');
  const [notes, setNotes] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await submitModeratorReview(claim.id, recommendation, notes);
    
    // Show success message
  };
  
  return (
    <div className="moderator-review">
      <h2>Review Warranty Claim</h2>
      
      <div className="claim-details">
        <h3>Claim Information</h3>
        <p><strong>Type:</strong> {claim.claimType}</p>
        <p><strong>Description:</strong> {claim.description}</p>
        
        <div className="evidence-gallery">
          <h4>Evidence</h4>
          {claim.evidence.map((url, i) => (
            <img key={i} src={url} alt={`Evidence ${i + 1}`} />
          ))}
        </div>
        
        <div className="order-details">
          <h4>Order Details</h4>
          <p><strong>Drop:</strong> {claim.order.drop.title}</p>
          <p><strong>Price:</strong> ${claim.order.total}</p>
          <p><strong>Delivered:</strong> {claim.order.deliveredAt.toLocaleDateString()}</p>
        </div>
        
        <div className="curator-response">
          <h4>Curator Response</h4>
          {claim.order.drop.curator.response ? (
            <p>{claim.order.drop.curator.response}</p>
          ) : (
            <p><em>Curator has not responded yet</em></p>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <h3>Your Recommendation</h3>
        
        <div>
          <label>Recommended Resolution *</label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value as WarrantyResolution)}
            required
          >
            <option value="FULL_REFUND">Full Refund - Claim is valid</option>
            <option value="PARTIAL_REFUND">Partial Refund - Issue is minor</option>
            <option value="REPLACEMENT">Replacement - Curator should send new item</option>
            <option value="REPAIR_CREDIT">Repair Credit - Buyer can fix the issue</option>
            <option value="NO_ACTION">No Action - Claim doesn't meet warranty criteria</option>
          </select>
        </div>
        
        <div>
          <label>Your Notes *</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain your reasoning. What evidence supports your recommendation? What expertise are you applying?"
            minLength={100}
            maxLength={1000}
            required
            rows={6}
          />
          <small>{notes.length}/1000 characters (minimum 100)</small>
        </div>
        
        <div className="moderator-guidelines">
          <h4>Moderation Guidelines</h4>
          <ul>
            <li>Be objective and fair to both buyer and curator</li>
            <li>Base your decision on evidence, not assumptions</li>
            <li>Apply your domain expertise to technical issues</li>
            <li>Consider if the issue is reasonable vs. buyer's remorse</li>
            <li>Remember: Your recommendation helps but admin makes final decision</li>
          </ul>
        </div>
        
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}
```

#### Submit Moderator Review

```typescript
// features/warranty/models/moderator.actions.ts
'use server'

export async function submitModeratorReview(
  claimId: string,
  recommendation: WarrantyResolution,
  notes: string
) {
  const session = await requireAuth();
  
  const claim = await db.warrantyClaim.findUnique({
    where: { id: claimId },
    include: { order: true },
  });
  
  if (!claim) {
    throw new NotFoundError('Claim not found');
  }
  
  // Check if assigned to this moderator
  if (claim.moderatorId !== session.user.id) {
    throw new ForbiddenError('Not assigned to you');
  }
  
  // Update claim with moderator recommendation
  await db.warrantyClaim.update({
    where: { id: claimId },
    data: {
      moderatorRecommendation: recommendation,
      moderatorNotes: notes,
      moderatedAt: new Date(),
      status: 'ADMIN_REVIEW',
    },
  });
  
  // Update moderator stats
  await db.communityModerator.update({
    where: { userId: session.user.id },
    data: {
      totalCases: { increment: 1 },
    },
  });
  
  // Notify admin team
  await notifyAdminTeam('MODERATOR_REVIEW_COMPLETE', {
    claimId,
    moderatorId: session.user.id,
    recommendation,
  });
  
  // Notify buyer
  await createNotification({
    userId: claim.order.buyerId,
    type: 'CLAIM_UPDATE',
    title: 'Warranty Claim Update',
    message: 'A community expert has reviewed your claim',
    link: `/warranty/${claimId}`,
  });
  
  return { success: true };
}
```

#### Resolve Warranty Claim (Admin)

```typescript
// features/warranty/models/warranty.actions.ts
'use server'

export async function resolveWarrantyClaim(
  claimId: string,
  resolution: WarrantyResolution,
  resolutionNote: string,
  refundAmount?: number
) {
  const session = await requireAuth();
  
  // Only admins can resolve
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError('Only admins can resolve warranty claims');
  }
  
  const claim = await db.warrantyClaim.findUnique({
    where: { id: claimId },
    include: {
      order: {
        include: {
          drop: { include: { curator: true } },
        },
      },
      moderator: true,
    },
  });
  
  if (!claim) {
    throw new NotFoundError('Claim not found');
  }
  
  // Update claim
  await db.warrantyClaim.update({
    where: { id: claimId },
    data: {
      status: 'RESOLVED',
      resolution,
      resolutionNote,
      resolvedBy: session.user.id,
      resolvedAt: new Date(),
      refundAmount,
    },
  });
  
  // Update moderator accuracy if they provided recommendation
  if (claim.moderatorId && claim.moderatorRecommendation) {
    const wasAccurate = claim.moderatorRecommendation === resolution;
    
    const moderator = await db.communityModerator.findUnique({
      where: { userId: claim.moderatorId },
    });
    
    const newAccuracy = moderator.accuracyRate
      ? (moderator.accuracyRate * (moderator.totalCases - 1) + (wasAccurate ? 100 : 0)) / moderator.totalCases
      : (wasAccurate ? 100 : 0);
    
    await db.communityModerator.update({
      where: { userId: claim.moderatorId },
      data: {
        accuracyRate: newAccuracy,
        reputationScore: { increment: wasAccurate ? 10 : -5 },
      },
    });
  }
  
  // Process refund if applicable
  if (resolution === 'FULL_REFUND' || resolution === 'PARTIAL_REFUND') {
    const amount = resolution === 'FULL_REFUND'
      ? claim.order.total
      : refundAmount;
    
    await processRefund(claim.orderId, amount, resolutionNote);
    
    await db.escrow.update({
      where: { orderId: claim.orderId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    });
  } else {
    // Release funds to curator
    await releaseEscrow(claim.orderId);
  }
  
  // Notify buyer
  await createNotification({
    userId: claim.order.buyerId,
    type: 'WARRANTY_RESOLVED',
    title: 'Warranty Claim Resolved',
    message: `Your warranty claim has been resolved: ${resolution}`,
    link: `/warranty/${claimId}`,
  });
  
  // Notify curator
  await createNotification({
    userId: claim.order.drop.curator.userId,
    type: 'WARRANTY_RESOLVED',
    title: 'Warranty Claim Resolved',
    message: `Warranty claim resolved: ${resolution}`,
    link: `/curator/warranty/${claimId}`,
  });
  
  return { success: true };
}
```

### Warranty Best Practices

**For Buyers:**
- File claims within 14 days of delivery
- Provide clear photos/videos showing the issue
- Be specific about what's wrong
- Be honest and fair in your description
- Understand what's covered vs. not covered

**For Curators:**
- Describe items accurately and honestly
- Use "as-is" or "for parts" labels when appropriate
- Respond to warranty claims promptly
- Provide your perspective with evidence
- Learn from claims to improve quality

**For Community Moderators:**
- Be objective and fair to both parties
- Apply your domain expertise
- Base decisions on evidence
- Explain your reasoning clearly
- Maintain confidentiality

**For Platform:**
- Review claims within 24 hours
- Consider moderator recommendations seriously
- Make fair, evidence-based decisions
- Handle disputes graciously
- Track patterns to improve quality

## Dispute Resolution

### File Dispute

```typescript
// features/disputes/models/dispute.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function fileDispute(
  orderId: string,
  reason: DisputeReason,
  description: string,
  evidence?: string[] // URLs to uploaded evidence
) {
  const session = await requireAuth();
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { escrow: true },
  });
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  // Check if buyer owns this order
  if (order.buyerId !== session.user.id) {
    throw new ForbiddenError('Not your order');
  }
  
  // Check if order is delivered
  if (order.status !== 'DELIVERED') {
    throw new ValidationError('Order must be delivered to file dispute');
  }
  
  // Check dispute window (7 days after delivery)
  const daysSinceDelivery = Math.floor(
    (Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceDelivery > 7) {
    throw new ValidationError('Dispute window closed (7 days after delivery)');
  }
  
  // Check if dispute already exists
  const existingDispute = await db.dispute.findFirst({
    where: { orderId },
  });
  
  if (existingDispute) {
    throw new ValidationError('Dispute already filed for this order');
  }
  
  // Create dispute
  const dispute = await db.dispute.create({
    data: {
      orderId,
      initiatedBy: session.user.id,
      reason,
      description,
      evidence: evidence || [],
      status: 'OPEN',
    },
  });
  
  // Update escrow status
  await db.escrow.update({
    where: { orderId },
    data: { status: 'DISPUTED' },
  });
  
  // Notify curator
  await createNotification({
    userId: order.drop.curatorId,
    type: 'DISPUTE_FILED',
    title: 'Dispute Filed',
    message: `A buyer filed a dispute for order ${orderId}`,
    link: `/curator/disputes/${dispute.id}`,
  });
  
  // Notify admin team
  await notifyAdminTeam('NEW_DISPUTE', {
    disputeId: dispute.id,
    orderId,
    reason,
  });
  
  return { success: true, disputeId: dispute.id };
}
```

### Dispute Form

```typescript
// features/disputes/components/DisputeForm.tsx
'use client'

import { useState } from 'react';
import { fileDispute } from '../models/dispute.actions';

export function DisputeForm({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState<DisputeReason>('ITEM_NOT_AS_DESCRIBED');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await fileDispute(orderId, reason, description, evidence);
    
    if (result.success) {
      // Show success message
      // Redirect to dispute page
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>File a Dispute</h2>
      
      <p>
        We're sorry you're having an issue with your order. Please provide
        details so we can help resolve this.
      </p>
      
      <div>
        <label>What's the issue? *</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as DisputeReason)}
          required
        >
          <option value="ITEM_NOT_RECEIVED">Item not received</option>
          <option value="ITEM_NOT_AS_DESCRIBED">Item not as described</option>
          <option value="ITEM_DAMAGED">Item arrived damaged</option>
          <option value="WRONG_ITEM">Wrong item received</option>
          <option value="MISSING_ITEMS">Missing items</option>
          <option value="COUNTERFEIT">Counterfeit or fake item</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      
      <div>
        <label>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe the issue in detail..."
          minLength={50}
          maxLength={2000}
          required
          rows={5}
        />
        <small>{description.length}/2000 characters</small>
      </div>
      
      <div>
        <label>Evidence (photos, screenshots)</label>
        <PhotoUpload
          onUpload={(urls) => setEvidence(urls)}
          maxFiles={5}
        />
        <small>Upload up to 5 photos showing the issue</small>
      </div>
      
      <div className="dispute-policy">
        <h4>What happens next?</h4>
        <ul>
          <li>Our team will review your dispute within 24 hours</li>
          <li>We may request additional evidence</li>
          <li>The curator will be notified and can respond</li>
          <li>We'll make a decision within 3-5 business days</li>
          <li>Funds are held in escrow until resolution</li>
        </ul>
        
        <h4>Possible Outcomes:</h4>
        <ul>
          <li><strong>Full Refund:</strong> Complete reimbursement to your original payment method</li>
          <li><strong>Partial Refund:</strong> Partial reimbursement based on the issue severity</li>
          <li><strong>Replacement:</strong> Curator sends a replacement item</li>
          <li><strong>No Refund:</strong> Dispute doesn't meet criteria for refund</li>
        </ul>
        
        <p><small>Refunds are processed via Stripe within 5-7 business days and returned to your original payment method.</small></p>
      </div>
      
      <button type="submit">Submit Dispute</button>
    </form>
  );
}
```

### Resolve Dispute

```typescript
// features/disputes/models/dispute.actions.ts
'use server'

export async function resolveDispute(
  disputeId: string,
  resolution: DisputeResolution,
  resolutionNote: string,
  refundAmount?: number
) {
  const session = await requireAuth();
  
  // Only admins can resolve disputes
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError('Only admins can resolve disputes');
  }
  
  const dispute = await db.dispute.findUnique({
    where: { id: disputeId },
    include: {
      order: {
        include: {
          escrow: true,
          drop: { include: { curator: true } },
        },
      },
    },
  });
  
  if (!dispute) {
    throw new NotFoundError('Dispute not found');
  }
  
  // Update dispute
  await db.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      resolution,
      resolutionNote,
      refundAmount,
      resolvedBy: session.user.id,
      resolvedAt: new Date(),
    },
  });
  
  // Process refund if applicable
  if (resolution === 'REFUND_FULL' || resolution === 'REFUND_PARTIAL') {
    const amount = resolution === 'REFUND_FULL'
      ? dispute.order.total
      : refundAmount;
    
    await processRefund(dispute.order.id, amount, resolutionNote);
    
    // Update escrow
    await db.escrow.update({
      where: { orderId: dispute.orderId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    });
  } else {
    // Release funds to curator
    await releaseEscrow(dispute.orderId);
  }
  
  // Notify buyer
  await createNotification({
    userId: dispute.order.buyerId,
    type: 'DISPUTE_RESOLVED',
    title: 'Dispute Resolved',
    message: `Your dispute has been resolved: ${resolution}`,
    link: `/orders/${dispute.orderId}`,
  });
  
  // Notify curator
  await createNotification({
    userId: dispute.order.drop.curator.userId,
    type: 'DISPUTE_RESOLVED',
    title: 'Dispute Resolved',
    message: `Dispute resolved: ${resolution}`,
    link: `/curator/disputes/${disputeId}`,
  });
  
  return { success: true };
}

async function processRefund(
  orderId: string,
  amount: number,
  reason: string
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
  });
  
  // Refund via Stripe
  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentIntentId,
    amount: Math.round(amount * 100), // Convert to cents
    reason: 'requested_by_customer',
    metadata: {
      orderId,
      reason,
    },
  });
  
  // Update order
  await db.order.update({
    where: { id: orderId },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
      refundAmount: amount,
    },
  });
  
  return refund;
}
```

## Fraud Prevention

### Payment Fraud Detection

```typescript
// lib/fraud/payment.ts
import { stripe } from '@/lib/stripe';

export async function checkPaymentFraud(paymentIntentId: string): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  shouldBlock: boolean;
  reasons: string[];
}> {
  // Get Stripe Radar risk score
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const charge = paymentIntent.latest_charge;
  
  if (!charge) {
    return { riskLevel: 'low', shouldBlock: false, reasons: [] };
  }
  
  const outcome = charge.outcome;
  const reasons: string[] = [];
  
  // Check Stripe Radar risk score
  if (outcome.risk_level === 'highest') {
    reasons.push('High fraud risk score');
    return { riskLevel: 'high', shouldBlock: true, reasons };
  }
  
  if (outcome.risk_level === 'elevated') {
    reasons.push('Elevated fraud risk');
  }
  
  // Check for suspicious patterns
  const buyer = await db.user.findUnique({
    where: { id: paymentIntent.metadata.buyerId },
    include: {
      orders: {
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
    },
  });
  
  // Multiple orders in 24 hours
  if (buyer.orders.length > 5) {
    reasons.push('Multiple orders in 24 hours');
  }
  
  // New account with large purchase
  const accountAge = Date.now() - buyer.createdAt.getTime();
  const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000; // 7 days
  const isLargePurchase = paymentIntent.amount > 50000; // $500
  
  if (isNewAccount && isLargePurchase) {
    reasons.push('New account with large purchase');
  }
  
  const riskLevel = reasons.length > 2 ? 'high' : reasons.length > 0 ? 'medium' : 'low';
  const shouldBlock = riskLevel === 'high';
  
  return { riskLevel, shouldBlock, reasons };
}
```

### Create Fraud Alert

```typescript
// lib/fraud/alerts.ts
'use server'

export async function createFraudAlert(
  userId: string,
  type: FraudType,
  severity: FraudSeverity,
  description: string,
  metadata?: any
) {
  const alert = await db.fraudAlert.create({
    data: {
      userId,
      type,
      severity,
      description,
      metadata,
      status: 'PENDING',
    },
  });
  
  // Notify admin team for high/critical severity
  if (severity === 'HIGH' || severity === 'CRITICAL') {
    await notifyAdminTeam('FRAUD_ALERT', {
      alertId: alert.id,
      userId,
      type,
      severity,
    });
  }
  
  // Auto-suspend for critical fraud
  if (severity === 'CRITICAL') {
    await db.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });
  }
  
  return alert;
}
```

### Chargeback Handling

```typescript
// lib/webhooks/stripe.ts
import { stripe } from '@/lib/stripe';

export async function handleChargeback(event: any) {
  const dispute = event.data.object;
  
  // Find order
  const order = await db.order.findFirst({
    where: { stripePaymentIntentId: dispute.payment_intent },
    include: { drop: { include: { curator: true } } },
  });
  
  if (!order) {
    console.error('Order not found for chargeback');
    return;
  }
  
  // Create fraud alert
  await createFraudAlert(
    order.buyerId,
    'CHARGEBACK_ABUSE',
    'HIGH',
    `Chargeback filed for order ${order.id}`,
    { disputeId: dispute.id, amount: dispute.amount }
  );
  
  // Notify curator
  await createNotification({
    userId: order.drop.curator.userId,
    type: 'CHARGEBACK',
    title: 'Chargeback Filed',
    message: `A chargeback was filed for order ${order.id}`,
    link: `/curator/orders/${order.id}`,
  });
  
  // Submit evidence to Stripe
  await submitChargebackEvidence(dispute.id, order);
}

async function submitChargebackEvidence(disputeId: string, order: Order) {
  await stripe.disputes.update(disputeId, {
    evidence: {
      customer_name: order.buyer.name,
      customer_email_address: order.buyer.email,
      shipping_tracking_number: order.trackingNumber,
      shipping_carrier: order.shippingCarrier,
      shipping_date: order.shippedAt?.toISOString(),
      product_description: order.drop.description,
    },
  });
}
```

## Best Practices

- Hold funds in escrow until delivery confirmed
- Auto-release after 7 days if no dispute
- Allow manual release by buyer
- Require evidence for disputes and warranty claims
- Resolve disputes within 3-5 business days
- Support partial refunds for partial issues
- Use community moderators for domain expertise
- Track moderator accuracy and reputation
- Handle warranty claims graciously
- Use Stripe Radar for fraud detection
- Monitor suspicious activity patterns
- Verify curator identity before approval
- Handle chargebacks with evidence submission
- Notify both parties of dispute status
- Keep conversation history for evidence
- Prevent external contact sharing
- Track fraud alerts and patterns
- Auto-suspend for critical fraud
- Provide clear warranty terms to buyers
- Educate curators on quality standards

## Refund Summary

### When Refunds Are Issued

**Full Refunds:**
- Item not received (lost package confirmed)
- Item significantly not as described
- Severe damage making item unusable
- Warranty claim for major quality defects
- Counterfeit or fake items

**Partial Refunds:**
- Minor damage or defects
- Missing items from bundle
- Item partially matches description
- Repairable quality issues
- Wrong item but still usable

**No Refunds:**
- Tracking shows delivery to correct address
- Item matches description accurately
- Damage caused by buyer misuse
- Buyer's remorse (change of mind)
- Subjective preferences when accurately described
- Claims filed outside dispute window

### Refund Processing

**Timeline:**
- Admin decision: 3-5 business days
- Stripe processing: 5-7 business days
- Total: 8-12 business days to see funds

**Method:**
- All refunds processed via Stripe
- Funds returned to original payment method
- Escrow releases funds to buyer
- Order status updated to "REFUNDED"
- Email confirmation sent to buyer

**Partial Refund Amounts:**
- Determined by admin based on evidence
- Considers severity of issue
- Accounts for item usability
- May include shipping cost refund
- Curator receives remaining amount

### Impact on Curators

**Full Refund:**
- Curator receives no payment
- Escrow returns full amount to buyer
- May affect curator rating if pattern emerges
- Curator should file carrier claim if applicable

**Partial Refund:**
- Curator receives reduced payment
- Difference refunded to buyer
- Less impact on curator rating
- Encourages accurate descriptions

**No Refund:**
- Curator receives full payment
- Escrow releases to curator
- Positive impact on curator reputation
- Validates accurate listing practices

## Common Mistakes to Avoid

- Releasing funds immediately without escrow
- No dispute resolution process
- Allowing disputes after long periods
- Not requiring evidence for claims
- Biased dispute resolution
- No fraud detection
- Allowing external communication
- Not handling chargebacks properly
- No buyer protection policies
- No curator protection from false claims
- Slow dispute resolution
- No appeal process
- Unclear warranty terms
- Not leveraging community expertise
- Punishing curators for honest mistakes
- Allowing frivolous warranty claims
- No moderator accountability
- Ignoring moderator recommendations without reason
