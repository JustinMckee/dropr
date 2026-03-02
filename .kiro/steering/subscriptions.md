---
inclusion: manual
---

# Subscriptions (Phase 2 - Future)

> **Note:** This document describes Phase 2 functionality planned after MVP validation. Subscriptions will be built after achieving product-market fit with one-time drops (Phase 1). See growth.md for rollout strategy and success criteria.

## Philosophy

Subscriptions transform one-time transactions into ongoing relationships. Curators gain predictable recurring revenue and deeper customer connections. Buyers receive regular curated shipments aligned with their making and modding timelines. Subscriptions should feel like joining a curator's inner circle—exclusive, personal, and consistently valuable. Balance flexibility (pause, cancel) with commitment (defined durations). Make subscription management effortless for both curators and buyers.

## Subscriptions Checklist

**Curator Eligibility:**
- [ ] Completed at least one successful drop
- [ ] Maintains acceptable curator score (4.0+)
- [ ] Below dispute threshold (< 5% dispute rate)
- [ ] Approved subscription application
- [ ] Active curator status (not suspended)
- [ ] Stripe Connect onboarded

**Subscription Creation (Curator):**
- [ ] Cadence selection (monthly/quarterly)
- [ ] Duration options (3, 6, 9, 12 months)
- [ ] Tier configuration (Starter, Enthusiast, Premium)
- [ ] Pricing per tier
- [ ] Value expectations per shipment
- [ ] Shipment schedule planning
- [ ] Preview and publish

**Subscription Management (Curator):**
- [ ] View active subscribers
- [ ] Plan upcoming shipments
- [ ] Track inventory per shipment
- [ ] View churn and retention metrics
- [ ] Communicate with subscribers
- [ ] Pause/cancel subscriptions (admin)

**Subscription Discovery (Buyer):**
- [ ] Browse available subscriptions
- [ ] Filter by category and cadence
- [ ] View tier comparisons
- [ ] See curator reputation
- [ ] Read subscriber reviews
- [ ] Preview past shipments

**Subscription Management (Buyer):**
- [ ] View active subscriptions
- [ ] Track upcoming shipments
- [ ] Pause subscription (1-2 months)
- [ ] Cancel subscription
- [ ] Upgrade/downgrade tiers
- [ ] Update payment method
- [ ] View shipment history

**Billing:**
- [ ] Stripe Subscriptions integration
- [ ] Recurring billing automation
- [ ] Failed payment retry (3 attempts)
- [ ] Proration for tier changes
- [ ] Refund handling
- [ ] Invoice generation

**Payouts:**
- [ ] Monthly payout schedule
- [ ] Subscription revenue tracking
- [ ] Churn deductions
- [ ] Payout history


## Subscription Model

### Curator Eligibility Requirements

Before a curator can create subscriptions, they must meet strict eligibility criteria to ensure subscriber trust and quality:

**Required Criteria:**

1. **Completed Drop History**
   - At least 1 successful drop completed
   - Drop must have been fulfilled (all orders shipped)
   - No outstanding disputes from that drop

2. **Curator Score**
   - Minimum 4.0 average rating
   - Based on buyer reviews and platform performance
   - Calculated from all completed drops

3. **Dispute Threshold**
   - Less than 5% dispute rate
   - Calculated as: (disputes / total orders) × 100
   - Includes warranty claims and standard disputes
   - Resolved disputes count toward threshold

4. **Account Standing**
   - Active curator status (not suspended or banned)
   - No outstanding warnings
   - Stripe Connect fully onboarded
   - Email verified

5. **Subscription Application**
   - Separate application process (similar to curator application)
   - Explain subscription concept and commitment
   - Demonstrate ability to fulfill recurring shipments
   - Provide sample shipment plan
   - Admin review and approval required

**Eligibility Check:**
```typescript
// features/subscriptions/models/eligibility.ts
export async function checkSubscriptionEligibility(curatorId: string): Promise<{
  eligible: boolean;
  reasons: string[];
}> {
  const curator = await db.curator.findUnique({
    where: { id: curatorId },
    include: {
      user: true,
      drops: {
        include: {
          orders: true,
          disputes: true,
        },
      },
    },
  });
  
  const reasons: string[] = [];
  
  // Check completed drops
  const completedDrops = curator.drops.filter(d => d.status === 'ENDED' || d.status === 'SOLD_OUT');
  if (completedDrops.length === 0) {
    reasons.push('Must complete at least one successful drop');
  }
  
  // Check curator score
  if (!curator.averageRating || curator.averageRating < 4.0) {
    reasons.push('Curator rating must be 4.0 or higher');
  }
  
  // Check dispute rate
  const totalOrders = curator.drops.reduce((sum, drop) => sum + drop.orders.length, 0);
  const totalDisputes = curator.drops.reduce((sum, drop) => sum + drop.disputes.length, 0);
  const disputeRate = totalOrders > 0 ? (totalDisputes / totalOrders) * 100 : 0;
  
  if (disputeRate >= 5) {
    reasons.push(`Dispute rate too high (${disputeRate.toFixed(1)}%, must be below 5%)`);
  }
  
  // Check account standing
  if (curator.user.status !== 'ACTIVE') {
    reasons.push('Account must be in good standing');
  }
  
  // Check Stripe onboarding
  if (!curator.stripeOnboarded) {
    reasons.push('Stripe Connect must be fully onboarded');
  }
  
  // Check subscription application
  const subscriptionApp = await db.subscriptionApplication.findUnique({
    where: { curatorId },
  });
  
  if (!subscriptionApp || subscriptionApp.status !== 'APPROVED') {
    reasons.push('Must apply and be approved for subscriptions');
  }
  
  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
```

### Subscription Application Process

**Application Requirements:**

1. **Subscription Concept**
   - Clear description of subscription theme
   - Target audience and value proposition
   - Differentiation from one-time drops

2. **Fulfillment Plan**
   - Detailed shipment schedule
   - Sample contents for first 3 shipments
   - Inventory sourcing strategy
   - Backup plan for supply issues

3. **Commitment Demonstration**
   - Explanation of how you'll maintain quality
   - Communication plan with subscribers
   - Handling of subscriber feedback
   - Contingency plans for delays

**Application Form:**
```typescript
// features/subscriptions/components/SubscriptionApplicationForm.tsx
'use client'

export function SubscriptionApplicationForm({ curatorId }: { curatorId: string }) {
  const [formData, setFormData] = useState({
    subscriptionConcept: '',
    targetAudience: '',
    valueProposition: '',
    shipmentSchedule: '',
    sampleShipments: '',
    inventorySourcing: '',
    qualityCommitment: '',
    communicationPlan: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitSubscriptionApplication(curatorId, formData);
    
    if (result.success) {
      // Show success message
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Apply for Subscription Creation</h2>
      
      <div className="eligibility-status">
        <h3>Eligibility Check</h3>
        <EligibilityChecklist curatorId={curatorId} />
      </div>
      
      <div>
        <label>
          Subscription Concept *
          <textarea
            value={formData.subscriptionConcept}
            onChange={(e) => setFormData({ ...formData, subscriptionConcept: e.target.value })}
            placeholder="Describe your subscription concept, theme, and what makes it unique..."
            minLength={200}
            maxLength={2000}
            rows={6}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Target Audience *
          <textarea
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="Who is this subscription for? What problems does it solve?"
            minLength={100}
            maxLength={1000}
            rows={4}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Value Proposition *
          <textarea
            value={formData.valueProposition}
            onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
            placeholder="Why should buyers subscribe? What value do they get?"
            minLength={100}
            maxLength={1000}
            rows={4}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Shipment Schedule *
          <textarea
            value={formData.shipmentSchedule}
            onChange={(e) => setFormData({ ...formData, shipmentSchedule: e.target.value })}
            placeholder="When will shipments go out? How will you plan and prepare?"
            minLength={100}
            maxLength={1000}
            rows={4}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Sample Shipments (First 3) *
          <textarea
            value={formData.sampleShipments}
            onChange={(e) => setFormData({ ...formData, sampleShipments: e.target.value })}
            placeholder="Describe what would be in the first 3 shipments. Be specific about items and value."
            minLength={200}
            maxLength={2000}
            rows={6}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Inventory Sourcing Strategy *
          <textarea
            value={formData.inventorySourcing}
            onChange={(e) => setFormData({ ...formData, inventorySourcing: e.target.value })}
            placeholder="How will you source items consistently? What's your backup plan?"
            minLength={100}
            maxLength={1000}
            rows={4}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Quality Commitment *
          <textarea
            value={formData.qualityCommitment}
            onChange={(e) => setFormData({ ...formData, qualityCommitment: e.target.value })}
            placeholder="How will you maintain quality across all shipments?"
            minLength={100}
            maxLength={1000}
            rows={4}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Communication Plan *
          <textarea
            value={formData.communicationPlan}
            onChange={(e) => setFormData({ ...formData, communicationPlan: e.target.value })}
            placeholder="How will you communicate with subscribers? How often?"
            minLength={100}
            maxLength={1000}
            rows={4}
            required
          />
        </label>
      </div>
      
      <button type="submit">Submit Application</button>
    </form>
  );
}
```

**Admin Review Process:**
```typescript
// features/subscriptions/models/subscription-application.actions.ts
'use server'

export async function submitSubscriptionApplication(
  curatorId: string,
  data: {
    subscriptionConcept: string;
    targetAudience: string;
    valueProposition: string;
    shipmentSchedule: string;
    sampleShipments: string;
    inventorySourcing: string;
    qualityCommitment: string;
    communicationPlan: string;
  }
) {
  const session = await requireAuth();
  
  // Verify user is a curator
  const curator = await db.curator.findUnique({
    where: { id: curatorId, userId: session.user.id },
  });
  
  if (!curator) {
    throw new ForbiddenError('Only curators can apply for subscriptions');
  }
  
  // Check if already applied
  const existing = await db.subscriptionApplication.findUnique({
    where: { curatorId },
  });
  
  if (existing && existing.status === 'PENDING') {
    throw new ValidationError('You already have a pending application');
  }
  
  if (existing && existing.status === 'APPROVED') {
    throw new ValidationError('You are already approved for subscriptions');
  }
  
  // Check eligibility
  const eligibility = await checkSubscriptionEligibility(curatorId);
  if (!eligibility.eligible) {
    throw new ValidationError(
      `Not eligible for subscriptions: ${eligibility.reasons.join(', ')}`
    );
  }
  
  // Create application
  const application = await db.subscriptionApplication.create({
    data: {
      curatorId,
      ...data,
      status: 'PENDING',
    },
  });
  
  // Notify admins
  await createNotification({
    role: 'ADMIN',
    type: 'NEW_SUBSCRIPTION_APPLICATION',
    title: 'New Subscription Application',
    message: `${curator.businessName || curator.user.name} applied for subscriptions`,
    link: `/admin/subscription-applications/${application.id}`,
  });
  
  return { success: true, applicationId: application.id };
}

export async function reviewSubscriptionApplication(
  applicationId: string,
  decision: 'APPROVED' | 'REJECTED',
  feedback?: string
) {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError('Only admins can review applications');
  }
  
  const application = await db.subscriptionApplication.update({
    where: { id: applicationId },
    data: {
      status: decision,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      feedback,
    },
    include: {
      curator: { include: { user: true } },
    },
  });
  
  // Send notification
  await sendEmail(application.curator.user.email, {
    subject: decision === 'APPROVED' 
      ? 'Subscription Application Approved!' 
      : 'Subscription Application Update',
    template: decision === 'APPROVED' 
      ? 'subscription-approved' 
      : 'subscription-rejected',
    data: { feedback },
  });
  
  return { success: true };
}
```

### Ongoing Eligibility Monitoring

Curators must maintain eligibility standards while offering subscriptions:

**Automatic Suspension Triggers:**
- Curator rating drops below 4.0
- Dispute rate exceeds 5%
- Account suspended or banned
- Multiple late shipments (3+ in a row)
- Subscriber complaints exceed threshold

**What Happens When Curator Loses Eligibility:**

1. **Warning Phase (First Violation):**
   - Curator receives warning notification
   - 7-day grace period to resolve issues
   - Subscriptions remain active
   - No new subscriptions can be created

2. **Suspension Phase (Continued Violation):**
   - All subscriptions automatically paused
   - Active subscribers notified of pause
   - Subscribers can cancel for full refund of remaining period
   - Curator has 30 days to regain eligibility
   - Shipments on hold during suspension

3. **Termination Phase (30+ Days):**
   - All subscriptions cancelled
   - Subscribers receive prorated refunds
   - Curator cannot create new subscriptions
   - Must reapply if eligibility restored

**Subscriber Protection:**
- Subscribers notified immediately of any curator issues
- Option to cancel with full refund during suspension
- Automatic refund if curator terminated
- No penalty for subscriber cancellation during curator issues

**Warning System:**
```typescript
// lib/cron/monitor-subscription-eligibility.ts
export async function monitorSubscriptionEligibility() {
  const curators = await db.curator.findMany({
    where: {
      subscriptions: {
        some: { status: 'ACTIVE' },
      },
    },
    include: {
      subscriptions: true,
      drops: {
        include: {
          orders: true,
          disputes: true,
        },
      },
    },
  });
  
  for (const curator of curators) {
    const eligibility = await checkSubscriptionEligibility(curator.id);
    
    if (!eligibility.eligible) {
      // Send warning
      await createNotification({
        userId: curator.userId,
        type: 'SUBSCRIPTION_ELIGIBILITY_WARNING',
        title: 'Subscription Eligibility Warning',
        message: `Your subscription eligibility is at risk: ${eligibility.reasons.join(', ')}`,
        link: '/curator/subscriptions/eligibility',
      });
      
      // If critical issues, pause subscriptions
      if (curator.averageRating < 3.5 || curator.user.status !== 'ACTIVE') {
        await pauseAllSubscriptions(curator.id);
      }
    }
  }
}
```

### Cadence Options

**Monthly Subscriptions:**
- For frequent makers/modders who consume materials regularly
- Consistent monthly shipments
- Higher engagement, more touchpoints
- Better for consumables (paints, filament, components)

**Quarterly Subscriptions:**
- Aligned with "time to make" and "time to mod"
- Gives buyers time to use items before next shipment
- Better for larger projects
- Reduces subscription fatigue
- Better for collectibles and tools

### Duration Options

**3 Months (Trial Commitment):**
- Lowest barrier to entry
- Test curator relationship
- Good for new subscribers
- Higher churn risk

**6 Months (Standard Commitment):**
- Balanced commitment level
- 2 quarters or 6 months
- Most popular option
- Good retention rates

**9 Months (Extended Commitment):**
- 3 quarters
- For quarterly subscriptions
- Shows strong commitment
- Better for curators

**12 Months (Annual Commitment):**
- Highest commitment
- Best value for buyers (discount)
- Predictable revenue for curators
- Lowest churn

### Pricing Tiers

**Starter Tier:**
- Monthly: $25-35/month
- Quarterly: $75-100/quarter
- Entry-level items
- 2-3 items per shipment
- Good for beginners

**Enthusiast Tier:**
- Monthly: $40-60/month
- Quarterly: $120-180/quarter
- Mid-tier items
- 3-5 items per shipment
- Most popular tier

**Premium Tier:**
- Monthly: $75-100/month
- Quarterly: $225-300/quarter
- High-end items
- 5-7 items per shipment
- Exclusive access

### Value Expectations

Each tier should clearly communicate:
- Number of items per shipment
- Estimated retail value
- Types of items included
- Exclusivity level
- Surprise elements

**Example:**
```
Enthusiast Tier - Mechanical Keyboards
$50/month • 6-month commitment

What's Included:
- 3-5 curated items per month
- $75+ retail value guaranteed
- Mix of switches, keycaps, accessories
- At least 1 exclusive item per shipment
- Early access to limited drops
```


## Database Schema

```prisma
// prisma/schema.prisma
model SubscriptionApplication {
  id          String   @id @default(cuid())
  curatorId   String   @unique
  curator     Curator  @relation(fields: [curatorId], references: [id])
  
  // Application details
  subscriptionConcept String   // 200-2000 chars
  targetAudience      String   // 100-1000 chars
  valueProposition    String   // 100-1000 chars
  shipmentSchedule    String   // 100-1000 chars
  sampleShipments     String   // 200-2000 chars
  inventorySourcing   String   // 100-1000 chars
  qualityCommitment   String   // 100-1000 chars
  communicationPlan   String   // 100-1000 chars
  
  // Review
  status          ApplicationStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  feedback        String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([curatorId])
  @@index([status])
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}

model Subscription {
  id          String   @id @default(cuid())
  curatorId   String
  curator     Curator  @relation(fields: [curatorId], references: [id])
  
  // Basic info
  title       String
  slug        String   @unique
  description String
  coverImage  String
  category    String
  
  // Configuration
  cadence     SubscriptionCadence
  status      SubscriptionStatus @default(DRAFT)
  
  // Tiers
  tiers       Json     // Array of tier configurations
  
  // Analytics
  subscriberCount Int   @default(0)
  churnRate       Float?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  subscriptions SubscriptionMembership[]
  shipments     Shipment[]
  
  @@index([curatorId])
  @@index([status])
  @@index([category])
}

enum SubscriptionCadence {
  MONTHLY
  QUARTERLY
}

enum SubscriptionStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

model SubscriptionTier {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  
  name            String   // "Starter", "Enthusiast", "Premium"
  description     String
  
  // Pricing by duration
  price3Month     Decimal  @db.Decimal(10, 2)
  price6Month     Decimal  @db.Decimal(10, 2)
  price9Month     Decimal  @db.Decimal(10, 2)
  price12Month    Decimal  @db.Decimal(10, 2)
  
  // Value expectations
  itemCount       String   // "2-3 items", "3-5 items"
  minValue        Decimal  @db.Decimal(10, 2)
  
  // Stripe
  stripePriceIds  Json     // Map of duration to Stripe Price IDs
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([subscriptionId])
}

model SubscriptionMembership {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  tierId          String
  tier            SubscriptionTier @relation(fields: [tierId], references: [id])
  buyerId         String
  buyer           User     @relation(fields: [buyerId], references: [id])
  
  // Billing
  duration        Int      // 3, 6, 9, or 12 months
  pricePerPeriod  Decimal  @db.Decimal(10, 2)
  
  // Stripe
  stripeSubscriptionId String @unique
  stripeCustomerId     String
  
  // Status
  status          MembershipStatus @default(ACTIVE)
  
  // Dates
  startDate       DateTime
  endDate         DateTime
  nextBillingDate DateTime?
  cancelledAt     DateTime?
  pausedAt        DateTime?
  pausedUntil     DateTime?
  
  // Shipments
  shipmentsReceived Int @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([subscriptionId])
  @@index([buyerId])
  @@index([status])
  @@index([stripeSubscriptionId])
}

enum MembershipStatus {
  ACTIVE
  PAUSED
  CANCELLED
  EXPIRED
  PAYMENT_FAILED
}

model Shipment {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  membershipId    String
  membership      SubscriptionMembership @relation(fields: [membershipId], references: [id])
  
  // Shipment details
  shipmentNumber  Int      // 1, 2, 3, etc.
  scheduledDate   DateTime
  shippedDate     DateTime?
  deliveredDate   DateTime?
  
  // Contents
  contents        Json     // Array of items included
  
  // Shipping
  trackingNumber  String?
  carrier         String?
  
  // Status
  status          ShipmentStatus @default(PENDING)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([subscriptionId])
  @@index([membershipId])
  @@index([status])
}

enum ShipmentStatus {
  PENDING
  PREPARING
  SHIPPED
  DELIVERED
  FAILED
}
```

## Create Subscription Flow (Curator)

### Subscription Creation Form

```typescript
// features/subscriptions/components/CreateSubscriptionForm.tsx
'use client'

import { useState } from 'react';
import { createSubscription } from '../models/subscription.actions';

export function CreateSubscriptionForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    category: '',
    cadence: 'MONTHLY',
    tiers: [
      {
        name: 'Starter',
        description: '',
        price3Month: '',
        price6Month: '',
        price9Month: '',
        price12Month: '',
        itemCount: '2-3 items',
        minValue: '',
      },
    ],
  });
  
  const handleSubmit = async (action: 'draft' | 'publish') => {
    const result = await createSubscription({
      ...formData,
      status: action === 'draft' ? 'DRAFT' : 'ACTIVE',
    });
    
    if (result.success) {
      router.push(`/curator/subscriptions/${result.subscriptionId}`);
    }
  };
  
  return (
    <form>
      <h1>Create Subscription</h1>
      
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div>
          <h2>Subscription Details</h2>
          
          <label>
            Title *
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Mechanical Keyboard Monthly Box"
              required
            />
          </label>
          
          <label>
            Description *
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what subscribers can expect each month/quarter..."
              rows={6}
              required
            />
          </label>
          
          <label>
            Cover Image *
            <ImageUpload
              onUpload={(url) => setFormData({ ...formData, coverImage: url })}
            />
          </label>
          
          <label>
            Category *
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              <option value="mechanical-keyboards">Mechanical Keyboards</option>
              <option value="pc-mods">PC Mods</option>
              <option value="diy-electronics">DIY Electronics</option>
              <option value="miniatures">Miniatures</option>
            </select>
          </label>
          
          <label>
            Cadence *
            <select
              value={formData.cadence}
              onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
              required
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </label>
          
          <button onClick={() => setStep(2)}>Next: Configure Tiers</button>
        </div>
      )}
      
      {/* Step 2: Tier Configuration */}
      {step === 2 && (
        <div>
          <h2>Subscription Tiers</h2>
          
          {formData.tiers.map((tier, index) => (
            <div key={index} className="tier-config">
              <h3>{tier.name} Tier</h3>
              
              <label>
                Description
                <textarea
                  value={tier.description}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].description = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                  placeholder="What's included in this tier?"
                  rows={3}
                />
              </label>
              
              <label>
                Item Count per Shipment
                <input
                  type="text"
                  value={tier.itemCount}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].itemCount = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                  placeholder="e.g., 3-5 items"
                />
              </label>
              
              <label>
                Minimum Value per Shipment
                <input
                  type="number"
                  step="0.01"
                  value={tier.minValue}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].minValue = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                />
              </label>
              
              <h4>Pricing by Duration</h4>
              
              <label>
                3-Month Price (per {formData.cadence === 'MONTHLY' ? 'month' : 'quarter'})
                <input
                  type="number"
                  step="0.01"
                  value={tier.price3Month}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].price3Month = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                  required
                />
              </label>
              
              <label>
                6-Month Price (per {formData.cadence === 'MONTHLY' ? 'month' : 'quarter'})
                <input
                  type="number"
                  step="0.01"
                  value={tier.price6Month}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].price6Month = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                  required
                />
                <small>Recommended: 5-10% discount vs 3-month</small>
              </label>
              
              <label>
                9-Month Price (per {formData.cadence === 'MONTHLY' ? 'month' : 'quarter'})
                <input
                  type="number"
                  step="0.01"
                  value={tier.price9Month}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].price9Month = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                  required
                />
                <small>Recommended: 10-15% discount vs 3-month</small>
              </label>
              
              <label>
                12-Month Price (per {formData.cadence === 'MONTHLY' ? 'month' : 'quarter'})
                <input
                  type="number"
                  step="0.01"
                  value={tier.price12Month}
                  onChange={(e) => {
                    const newTiers = [...formData.tiers];
                    newTiers[index].price12Month = e.target.value;
                    setFormData({ ...formData, tiers: newTiers });
                  }}
                  required
                />
                <small>Recommended: 15-20% discount vs 3-month</small>
              </label>
            </div>
          ))}
          
          <button onClick={() => setStep(1)}>Back</button>
          <button onClick={() => handleSubmit('draft')}>Save as Draft</button>
          <button onClick={() => handleSubmit('publish')}>Publish Subscription</button>
        </div>
      )}
    </form>
  );
}
```


## Stripe Subscriptions Integration

### Create Subscription Products

```typescript
// features/subscriptions/models/subscription.actions.ts
'use server'

import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function createSubscription(data: CreateSubscriptionInput) {
  const session = await requireAuth();
  
  const curator = await db.curator.findUnique({
    where: { userId: session.user.id },
  });
  
  if (!curator) {
    throw new ForbiddenError('Only curators can create subscriptions');
  }
  
  // Create Stripe products and prices for each tier
  const tiersWithStripe = await Promise.all(
    data.tiers.map(async (tier) => {
      // Create Stripe product
      const product = await stripe.products.create({
        name: `${data.title} - ${tier.name}`,
        description: tier.description,
        metadata: {
          curatorId: curator.id,
          tierName: tier.name,
        },
      });
      
      // Create Stripe prices for each duration
      const prices = {
        '3': await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(tier.price3Month * 100),
          currency: 'usd',
          recurring: {
            interval: data.cadence === 'MONTHLY' ? 'month' : 'month',
            interval_count: data.cadence === 'MONTHLY' ? 1 : 3,
          },
          metadata: { duration: '3' },
        }),
        '6': await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(tier.price6Month * 100),
          currency: 'usd',
          recurring: {
            interval: data.cadence === 'MONTHLY' ? 'month' : 'month',
            interval_count: data.cadence === 'MONTHLY' ? 1 : 3,
          },
          metadata: { duration: '6' },
        }),
        '9': await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(tier.price9Month * 100),
          currency: 'usd',
          recurring: {
            interval: data.cadence === 'MONTHLY' ? 'month' : 'month',
            interval_count: data.cadence === 'MONTHLY' ? 1 : 3,
          },
          metadata: { duration: '9' },
        }),
        '12': await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(tier.price12Month * 100),
          currency: 'usd',
          recurring: {
            interval: data.cadence === 'MONTHLY' ? 'month' : 'month',
            interval_count: data.cadence === 'MONTHLY' ? 1 : 3,
          },
          metadata: { duration: '12' },
        }),
      };
      
      return {
        ...tier,
        stripeProductId: product.id,
        stripePriceIds: {
          '3': prices['3'].id,
          '6': prices['6'].id,
          '9': prices['9'].id,
          '12': prices['12'].id,
        },
      };
    })
  );
  
  // Create subscription in database
  const subscription = await db.subscription.create({
    data: {
      curatorId: curator.id,
      title: data.title,
      slug: generateSlug(data.title),
      description: data.description,
      coverImage: data.coverImage,
      category: data.category,
      cadence: data.cadence,
      status: data.status,
      tiers: tiersWithStripe,
    },
  });
  
  return { success: true, subscriptionId: subscription.id };
}
```

### Subscribe (Buyer)

```typescript
// features/subscriptions/models/subscription.actions.ts
'use server'

export async function subscribe(
  subscriptionId: string,
  tierId: string,
  duration: number // 3, 6, 9, or 12
) {
  const session = await requireAuth();
  
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { tiers: true },
  });
  
  const tier = subscription.tiers.find(t => t.id === tierId);
  if (!tier) {
    throw new NotFoundError('Tier not found');
  }
  
  // Get Stripe price ID for duration
  const stripePriceId = tier.stripePriceIds[duration.toString()];
  
  // Create or get Stripe customer
  let stripeCustomerId = await getStripeCustomerId(session.user.id);
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    });
    stripeCustomerId = customer.id;
  }
  
  // Create Stripe subscription
  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: stripePriceId }],
    metadata: {
      subscriptionId,
      tierId,
      duration: duration.toString(),
      buyerId: session.user.id,
    },
    // Cancel at end of commitment period
    cancel_at: Math.floor(
      (Date.now() + duration * 30 * 24 * 60 * 60 * 1000) / 1000
    ),
  });
  
  // Create membership in database
  const membership = await db.subscriptionMembership.create({
    data: {
      subscriptionId,
      tierId,
      buyerId: session.user.id,
      duration,
      pricePerPeriod: tier[`price${duration}Month`],
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
    },
  });
  
  // Update subscriber count
  await db.subscription.update({
    where: { id: subscriptionId },
    data: { subscriberCount: { increment: 1 } },
  });
  
  // Send confirmation email
  await sendEmail(session.user.email, {
    subject: `Subscription Confirmed: ${subscription.title}`,
    template: 'subscription-confirmed',
    data: { subscription, tier, duration },
  });
  
  return { success: true, membershipId: membership.id };
}
```

### Pause Subscription

```typescript
// features/subscriptions/models/subscription.actions.ts
'use server'

export async function pauseSubscription(
  membershipId: string,
  pauseMonths: number // 1 or 2
) {
  const session = await requireAuth();
  
  const membership = await db.subscriptionMembership.findUnique({
    where: { id: membershipId },
  });
  
  if (!membership || membership.buyerId !== session.user.id) {
    throw new ForbiddenError('Not your subscription');
  }
  
  if (membership.status !== 'ACTIVE') {
    throw new ValidationError('Can only pause active subscriptions');
  }
  
  // Pause in Stripe
  await stripe.subscriptions.update(membership.stripeSubscriptionId, {
    pause_collection: {
      behavior: 'void',
      resumes_at: Math.floor(
        (Date.now() + pauseMonths * 30 * 24 * 60 * 60 * 1000) / 1000
      ),
    },
  });
  
  // Update membership
  await db.subscriptionMembership.update({
    where: { id: membershipId },
    data: {
      status: 'PAUSED',
      pausedAt: new Date(),
      pausedUntil: new Date(Date.now() + pauseMonths * 30 * 24 * 60 * 60 * 1000),
    },
  });
  
  return { success: true };
}
```

### Cancel Subscription

```typescript
// features/subscriptions/models/subscription.actions.ts
'use server'

export async function cancelSubscription(membershipId: string) {
  const session = await requireAuth();
  
  const membership = await db.subscriptionMembership.findUnique({
    where: { id: membershipId },
  });
  
  if (!membership || membership.buyerId !== session.user.id) {
    throw new ForbiddenError('Not your subscription');
  }
  
  // Cancel in Stripe (at period end)
  await stripe.subscriptions.update(membership.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  
  // Update membership
  await db.subscriptionMembership.update({
    where: { id: membershipId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });
  
  // Update subscriber count
  await db.subscription.update({
    where: { id: membership.subscriptionId },
    data: { subscriberCount: { decrement: 1 } },
  });
  
  return { success: true };
}
```

## Shipment Management

### Subscriber Communication

Curators need tools to communicate with their subscribers:

**Communication Channels:**

1. **Shipment Updates (Automated):**
   - Shipment planned notification
   - Shipment preparing notification
   - Shipment shipped notification with tracking
   - Delivery confirmation

2. **Curator Announcements (Manual):**
   - Send updates to all subscribers
   - Announce delays or changes
   - Share behind-the-scenes content
   - Request feedback

3. **Individual Messages:**
   - Respond to subscriber questions
   - Handle special requests
   - Address concerns
   - Note: Not real-time chat, async messaging only

**Announcement System:**
```typescript
// features/subscriptions/models/communication.actions.ts
'use server'

export async function sendSubscriberAnnouncement(
  subscriptionId: string,
  announcement: {
    subject: string;
    message: string;
    includeInEmail: boolean;
  }
) {
  const session = await requireAuth();
  
  // Verify curator owns subscription
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      curator: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { buyer: true },
      },
    },
  });
  
  if (subscription.curator.userId !== session.user.id) {
    throw new ForbiddenError('Not your subscription');
  }
  
  // Create notifications for all active subscribers
  await Promise.all(
    subscription.subscriptions.map(async (membership) => {
      await createNotification({
        userId: membership.buyerId,
        type: 'SUBSCRIPTION_ANNOUNCEMENT',
        title: announcement.subject,
        message: announcement.message,
        link: `/subscriptions/${membership.id}`,
      });
      
      // Optionally send email
      if (announcement.includeInEmail) {
        await sendEmail(membership.buyer.email, {
          subject: `${subscription.title}: ${announcement.subject}`,
          template: 'subscription-announcement',
          data: {
            subscription,
            announcement,
          },
        });
      }
    })
  );
  
  return { success: true, recipientCount: subscription.subscriptions.length };
}
```

**Communication Best Practices:**
- Send monthly updates even when nothing changes
- Announce delays proactively (before scheduled date)
- Share curation process and sourcing stories
- Request feedback after each shipment
- Celebrate subscriber milestones
- Be transparent about challenges
- Respond to questions within 24 hours

### Plan Shipment (Curator)

```typescript
// features/subscriptions/models/shipment.actions.ts
'use server'

export async function planShipment(
  subscriptionId: string,
  shipmentNumber: number,
  scheduledDate: Date,
  contents: Array<{ name: string; description: string; value: number }>
) {
  const session = await requireAuth();
  
  // Get all active memberships
  const memberships = await db.subscriptionMembership.findMany({
    where: {
      subscriptionId,
      status: 'ACTIVE',
    },
  });
  
  // Create shipment records for each member
  await Promise.all(
    memberships.map((membership) =>
      db.shipment.create({
        data: {
          subscriptionId,
          membershipId: membership.id,
          shipmentNumber,
          scheduledDate,
          contents,
          status: 'PENDING',
        },
      })
    )
  );
  
  return { success: true, shipmentsCreated: memberships.length };
}
```

### Mark Shipment Shipped

```typescript
// features/subscriptions/models/shipment.actions.ts
'use server'

export async function markShipmentShipped(
  shipmentId: string,
  trackingNumber: string,
  carrier: string
) {
  const session = await requireAuth();
  
  const shipment = await db.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      membership: { include: { buyer: true } },
      subscription: true,
    },
  });
  
  // Update shipment
  await db.shipment.update({
    where: { id: shipmentId },
    data: {
      status: 'SHIPPED',
      shippedDate: new Date(),
      trackingNumber,
      carrier,
    },
  });
  
  // Increment shipments received
  await db.subscriptionMembership.update({
    where: { id: shipment.membershipId },
    data: {
      shipmentsReceived: { increment: 1 },
    },
  });
  
  // Notify buyer
  await createNotification({
    userId: shipment.membership.buyerId,
    type: 'SHIPMENT_SHIPPED',
    title: 'Subscription Shipment Shipped',
    message: `Your ${shipment.subscription.title} shipment #${shipment.shipmentNumber} has shipped`,
    link: `/subscriptions/${shipment.membershipId}/shipments/${shipmentId}`,
  });
  
  return { success: true };
}
```

## Best Practices

- Offer multiple tiers to capture different buyer segments
- Provide discounts for longer commitments (10-20% for 12 months)
- Clearly communicate value expectations per shipment
- Allow easy pause (1-2 months) to reduce churn
- Make cancellation easy (builds trust)
- Send shipment notifications with tracking
- Communicate with subscribers regularly
- Plan shipments in advance
- Track churn and retention metrics
- Survey cancelled subscribers for feedback
- Offer exclusive items to subscribers
- Give early access to limited drops
- Build community among subscribers
- Celebrate subscriber milestones
- Be transparent about shipment delays

## Common Mistakes to Avoid

- Unclear value expectations
- No pause option (forces cancellation)
- Difficult cancellation process
- Inconsistent shipment quality
- Poor communication with subscribers
- Not tracking churn reasons
- Overpricing tiers
- Too many tiers (confusing)
- No discount for longer commitments
- Ignoring subscriber feedback
- Late shipments without communication
- Not planning shipments in advance
- No exclusive benefits for subscribers
- Treating subscriptions like one-time drops

## Success Metrics

**Curator Metrics:**
- 30%+ of curators offer subscriptions
- $500+ average monthly recurring revenue per curator
- 70%+ subscription retention after 3 months
- 4.5+ subscriber satisfaction rating

**Buyer Metrics:**
- 20%+ of buyers subscribe
- 60%+ renewal rate after initial commitment
- 3x higher LTV for subscribers vs. one-time buyers
- Low churn rate (< 10% monthly)

**Platform Metrics:**
- 40%+ of revenue from subscriptions
- Positive contribution margin
- Strong retention rates
- Growing MRR (Monthly Recurring Revenue)

## Rollout Strategy

See growth.md for detailed rollout strategy:
1. Closed beta with 5-10 power curators (2-3 months)
2. Open to all verified curators (3-6 months)
3. Scale and optimize (6+ months)
