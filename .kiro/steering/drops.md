---
inclusion: manual
---

# Drops

## Philosophy

Drops are time-limited events that create excitement, urgency, and discovery. Every drop is a curated experience—mystery boxes, themed bundles, or surplus from verified makers. Drops have clear lifecycles (draft → scheduled → live → ended), transparent inventory, and countdown timers that build anticipation. Curators control pricing, inventory, and timing. Buyers get curated surprises with guaranteed minimum value. The drop model creates scarcity without artificial manipulation.

## Drops Checklist

**Drop Types:**
- [ ] Mystery boxes (themed surprise items with guaranteed min value)
- [ ] Surplus drops (excess inventory, discounted)
- [ ] Limited editions (small batch, exclusive)

**Drop Lifecycle:**
- [ ] Draft (curator creating)
- [ ] Scheduled (countdown active)
- [ ] Live (accepting orders)
- [ ] Sold out (inventory depleted)
- [ ] Ended (time expired)
- [ ] Archived (historical record)

**Drop Configuration:**
- [ ] Title and description
- [ ] Cover image (required)
- [ ] Category/specialties
- [ ] Price and minimum value
- [ ] Inventory count
- [ ] Start time (countdown)
- [ ] Duration (24h, 48h, 72h, 1 week)
- [ ] Shipping settings

**Drop Features:**
- [ ] Real-time countdown timer
- [ ] Live inventory updates
- [ ] Sold percentage indicator
- [ ] Curator profile link
- [ ] Social sharing
- [ ] Wishlist/save for later
- [ ] Drop performance analytics (curator)

**Drop Discovery:**
- [ ] Featured drops (admin curated)
- [ ] Category browsing
- [ ] Curator following
- [ ] Search functionality
- [ ] Trending drops
- [ ] Ending soon section
- [ ] New drops section


## Drop Types

### Mystery Box

**Description:** Themed curated surprise items with guaranteed minimum value. Buyers know the theme/category but not exact contents. The theme creates context and trust—buyers understand what type of items to expect.

**Use Cases:**
- "Mechanical Keyboard Enthusiast" mystery box (switches, keycaps, cables)
- "Retro Gaming - 16-bit Era" mystery box (NES/SNES items)
- "Beginner Electronics" mystery box (starter components for Arduino projects)
- "Warhammer 40K - Space Marines" mystery box (paints, bits, accessories)
- "Keycap Artisan - Ocean Theme" mystery box (blue/teal artisan keycaps)

**Requirements:**
- Clear theme/category description
- Minimum value guarantee (e.g., $75 value for $49.99 price)
- General item types listed (e.g., "includes switches, keycaps, and accessories")
- Curator reputation/verification
- Clear exclusions (no damaged/defective items)

**Example:**
```
Title: Mechanical Keyboard Mystery Box - Enthusiast Tier
Theme: Mechanical Keyboards
Price: $49.99
Minimum Value: $75
Description: Hand-picked switches and keycaps from my personal collection. 
Every box includes at least 70 switches (mix of linear, tactile, or clicky), 
1-2 artisan keycaps, and surprise extras from recent group buys. Perfect for 
keyboard enthusiasts looking to try new switches or expand their collection.
```

### Surplus Drop

**Description:** Excess inventory from curator's projects or group buys. Known items at discounted prices. Transparent about what's included and why it's available.

**Use Cases:**
- Extra keycaps from group buy
- Leftover PCBs from production run
- Excess miniatures from Kickstarter
- Overstock components

**Requirements:**
- Specific item description
- Reason for surplus (transparency)
- Discount percentage vs. original price
- Condition clearly stated (new, opened, etc.)

**Example:**
```
Title: GMK Keycap Set Extras - Botanical
Price: $89.99 (40% off retail)
Description: Leftover sets from group buy. Brand new, sealed. 
Base kit only. Original retail $149.99. Limited to 20 sets.
```

### Limited Edition

**Description:** Small batch exclusive items created specifically for the drop. Not mystery—buyers know exactly what they're getting, but it's exclusive and won't be restocked.

**Use Cases:**
- Custom keycap colorway (limited run)
- Exclusive miniature sculpt
- Custom PCB design
- Collaborative project

**Requirements:**
- Edition size clearly stated
- Exclusivity guarantee (won't be restocked)
- Creator/collaborator attribution
- Higher price point justified

**Example:**
```
Title: Custom Artisan Keycap - "Midnight Ocean"
Price: $65.00
Description: Exclusive colorway created for this drop. Hand-cast resin, 
MX stem compatible. Limited to 50 units. Will not be restocked.
```


## Drop Lifecycle

### 1. Draft

**Status:** Curator is creating the drop, not visible to buyers.

**Actions Available:**
- Edit all drop details
- Upload/change images
- Set pricing and inventory
- Preview drop page
- Save as draft
- Schedule or publish

**Validation:**
- Title (10-200 characters)
- Description (100-5000 characters)
- Cover image (required, min 800x600px)
- Price (min $5, max $10,000)
- Inventory (min 1, max 1000)
- Category selected
- Shipping settings configured

**UI Indicators:**
- "Draft" badge
- "Not visible to buyers" message
- "Complete profile" warnings if needed

### 2. Scheduled

**Status:** Drop is scheduled with countdown active, visible to buyers but not purchasable yet.

**Actions Available (Curator):**
- Edit drop details (limited)
- Cancel/reschedule (if no followers)
- View follower count
- Promote drop

**Actions Available (Buyer):**
- View drop details
- Follow/save drop
- Set reminder
- Share drop
- Follow curator

**Countdown Display:**
- Days, hours, minutes, seconds
- "Goes live in X" messaging
- Timezone-aware
- Real-time updates via SSE

**UI Indicators:**
- Countdown timer prominent
- "Notify me" button
- Follower count
- "Scheduled" badge

### 3. Live

**Status:** Drop is accepting orders, countdown complete.

**Actions Available (Curator):**
- View real-time sales
- Monitor inventory
- Respond to questions (via support, not direct messaging)
- Promote drop
- End early (if needed)

**Actions Available (Buyer):**
- Purchase drop
- View remaining inventory
- See time remaining
- Share drop
- Add to cart

**Real-Time Updates:**
- Inventory count
- Sold percentage
- "X remaining" messaging
- "Selling fast" indicators
- Time remaining

**UI Indicators:**
- "Live" badge (green)
- Inventory bar/percentage
- Time remaining
- "Add to cart" button active

### 4. Sold Out

**Status:** All inventory purchased, drop may still have time remaining.

**Actions Available (Curator):**
- View final sales
- Fulfill orders
- View analytics

**Actions Available (Buyer):**
- Join waitlist (future feature)
- View similar drops
- Follow curator for future drops

**UI Indicators:**
- "Sold Out" badge (red)
- "Join waitlist" button
- "View similar drops" CTA
- Final sold count

### 5. Ended

**Status:** Time expired, no longer accepting orders.

**Actions Available (Curator):**
- View final analytics
- Fulfill remaining orders
- Archive drop

**Actions Available (Buyer):**
- View drop details (historical)
- See final stats
- Follow curator for future drops

**UI Indicators:**
- "Ended" badge (gray)
- Final stats (sold count, duration)
- "Drop has ended" message
- Related drops suggestions

### 6. Archived

**Status:** Historical record, minimal visibility.

**Purpose:**
- Curator portfolio
- Platform analytics
- Buyer order history
- Review history

**Visibility:**
- Curator profile (past drops section)
- Buyer order history
- Not in main discovery/search
- Direct link access only


## Database Schema

```prisma
// prisma/schema.prisma
model Drop {
  id          String   @id @default(cuid())
  curatorId   String
  curator     Curator  @relation(fields: [curatorId], references: [id])
  
  // Basic info
  title       String
  slug        String   @unique
  description String
  coverImage  String
  images      Json?    // Array of additional image URLs
  
  // Type and category
  type        DropType
  category    String
  tags        String[]
  
  // Pricing
  price       Decimal  @db.Decimal(10, 2)
  minValue    Decimal? @db.Decimal(10, 2) // For mystery boxes
  
  // Inventory
  inventory   Int
  sold        Int      @default(0)
  reserved    Int      @default(0) // Items in carts
  
  // Timing
  status      DropStatus @default(DRAFT)
  startTime   DateTime?
  duration    Int?     // Hours
  endTime     DateTime?
  
  // Settings
  shippingConfig Json?
  
  // Analytics
  views       Int      @default(0)
  saves       Int      @default(0)
  shares      Int      @default(0)
  
  // Moderation
  featured    Boolean  @default(false)
  featuredAt  DateTime?
  moderationStatus ModerationStatus @default(APPROVED)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  orders      Order[]
  reviews     Review[]
  
  @@index([curatorId])
  @@index([status])
  @@index([category])
  @@index([startTime])
  @@index([featured])
  @@index([slug])
}

enum DropType {
  MYSTERY_BOX
  SURPLUS
  LIMITED_EDITION
}

enum DropStatus {
  DRAFT
  SCHEDULED
  LIVE
  SOLD_OUT
  ENDED
  ARCHIVED
  CANCELLED
}

enum ModerationStatus {
  PENDING
  APPROVED
  FLAGGED
  REJECTED
}

model DropView {
  id        String   @id @default(cuid())
  dropId    String
  drop      Drop     @relation(fields: [dropId], references: [id])
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  
  // Analytics
  source    String?  // 'search', 'featured', 'curator', 'category'
  referrer  String?
  
  createdAt DateTime @default(now())
  
  @@index([dropId])
  @@index([userId])
}

model DropSave {
  id        String   @id @default(cuid())
  dropId    String
  drop      Drop     @relation(fields: [dropId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  notifyOnLive Boolean @default(true)
  
  createdAt DateTime @default(now())
  
  @@unique([dropId, userId])
  @@index([userId])
}
```


## Create Drop Flow

### Curator Create Drop Form

```typescript
// features/drops/components/CreateDropForm.tsx
'use client'

import { useState } from 'react';
import { createDrop } from '../models/drop.actions';
import { useRouter } from 'next/navigation';

export function CreateDropForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'MYSTERY_BOX',
    title: '',
    description: '',
    coverImage: '',
    category: '',
    price: '',
    minValue: '',
    inventory: '',
    startTime: '',
    duration: 48,
  });
  
  const handleSubmit = async (action: 'draft' | 'schedule') => {
    const result = await createDrop({
      ...formData,
      status: action === 'draft' ? 'DRAFT' : 'SCHEDULED',
    });
    
    if (result.success) {
      router.push(`/curator/drops/${result.dropId}`);
    }
  };
  
  return (
    <form>
      <h1>Create New Drop</h1>
      
      {/* Step 1: Drop Type */}
      {step === 1 && (
        <div>
          <h2>Choose Drop Type</h2>
          <DropTypeSelector
            value={formData.type}
            onChange={(type) => setFormData({ ...formData, type })}
          />
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      
      {/* Step 2: Basic Info */}
      {step === 2 && (
        <div>
          <h2>Drop Details</h2>
          
          <label>
            Title *
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Mechanical Keyboard Mystery Box"
              minLength={10}
              maxLength={200}
              required
            />
          </label>
          
          <label>
            Description *
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included, quality tier, and what makes this drop special..."
              minLength={100}
              maxLength={5000}
              rows={8}
              required
            />
          </label>
          
          <label>
            Cover Image *
            <ImageUpload
              onUpload={(url) => setFormData({ ...formData, coverImage: url })}
              aspectRatio="16:9"
              minWidth={800}
              minHeight={600}
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
              <option value="keycaps">Keycaps</option>
              <option value="switches">Switches</option>
              <option value="pc-mods">PC Mods</option>
              <option value="diy-electronics">DIY Electronics</option>
              <option value="3d-printing">3D Printing</option>
              <option value="miniatures">Miniatures</option>
            </select>
          </label>
          
          <button onClick={() => setStep(1)}>Back</button>
          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}
      
      {/* Step 3: Pricing & Inventory */}
      {step === 3 && (
        <div>
          <h2>Pricing & Inventory</h2>
          
          <label>
            Price *
            <input
              type="number"
              step="0.01"
              min="5"
              max="10000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </label>
          
          {formData.type === 'MYSTERY_BOX' && (
            <label>
              Minimum Value Guarantee *
              <input
                type="number"
                step="0.01"
                value={formData.minValue}
                onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                required
              />
              <small>Must be higher than price to show value</small>
            </label>
          )}
          
          <label>
            Inventory Count *
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.inventory}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              required
            />
          </label>
          
          <button onClick={() => setStep(2)}>Back</button>
          <button onClick={() => setStep(4)}>Next</button>
        </div>
      )}
      
      {/* Step 4: Schedule */}
      {step === 4 && (
        <div>
          <h2>Schedule Drop</h2>
          
          <label>
            Start Time *
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </label>
          
          <label>
            Duration *
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              required
            >
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
              <option value="168">1 week</option>
            </select>
          </label>
          
          <div className="actions">
            <button onClick={() => setStep(3)}>Back</button>
            <button onClick={() => handleSubmit('draft')} type="button">
              Save as Draft
            </button>
            <button onClick={() => handleSubmit('schedule')} type="submit">
              Schedule Drop
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
```

### Create Drop Server Action

```typescript
// features/drops/models/drop.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const createDropSchema = z.object({
  type: z.enum(['MYSTERY_BOX', 'SURPLUS', 'LIMITED_EDITION']),
  title: z.string().min(10).max(200),
  description: z.string().min(100).max(5000),
  coverImage: z.string().url(),
  category: z.string(),
  price: z.number().min(5).max(10000),
  minValue: z.number().optional(),
  inventory: z.number().int().min(1).max(1000),
  startTime: z.string().datetime(),
  duration: z.number().int(),
  status: z.enum(['DRAFT', 'SCHEDULED']),
});

export async function createDrop(data: z.infer<typeof createDropSchema>) {
  const session = await requireAuth();
  
  // Check if user is a curator
  const curator = await db.curator.findUnique({
    where: { userId: session.user.id },
  });
  
  if (!curator) {
    throw new ForbiddenError('Only curators can create drops');
  }
  
  // Validate minimum value for mystery boxes
  if (data.type === 'MYSTERY_BOX') {
    if (!data.minValue || data.minValue <= data.price) {
      throw new ValidationError('Minimum value must be higher than price');
    }
  }
  
  // Generate slug
  const slug = generateSlug(data.title);
  
  // Calculate end time
  const startTime = new Date(data.startTime);
  const endTime = new Date(startTime.getTime() + data.duration * 60 * 60 * 1000);
  
  // Create drop
  const drop = await db.drop.create({
    data: {
      curatorId: curator.id,
      type: data.type,
      title: data.title,
      slug,
      description: data.description,
      coverImage: data.coverImage,
      category: data.category,
      price: data.price,
      minValue: data.minValue,
      inventory: data.inventory,
      status: data.status,
      startTime: data.status === 'SCHEDULED' ? startTime : null,
      duration: data.duration,
      endTime: data.status === 'SCHEDULED' ? endTime : null,
    },
  });
  
  // Update curator stats
  await db.curator.update({
    where: { id: curator.id },
    data: {
      totalDrops: { increment: 1 },
    },
  });
  
  // Send notification if scheduled
  if (data.status === 'SCHEDULED') {
    await notifyFollowers(curator.id, drop.id);
  }
  
  revalidateTag('drops');
  revalidateTag(`curator-${curator.id}`);
  
  return { success: true, dropId: drop.id };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}
```


## Drop Display Components

### Drop Card (List View)

```typescript
// features/drops/components/DropCard.tsx
import { formatDistanceToNow } from 'date-fns';
import { DropCountdown } from './DropCountdown';

interface DropCardProps {
  drop: Drop;
  variant?: 'default' | 'compact';
}

export function DropCard({ drop, variant = 'default' }: DropCardProps) {
  const soldPercentage = (drop.sold / drop.inventory) * 100;
  const isLive = drop.status === 'LIVE';
  const isScheduled = drop.status === 'SCHEDULED';
  const isSoldOut = drop.status === 'SOLD_OUT';
  
  return (
    <article className={`drop-card drop-card-${variant}`}>
      <div className="drop-image">
        <img src={drop.coverImage} alt={drop.title} />
        
        {drop.featured && (
          <span className="badge badge-featured">Featured</span>
        )}
        
        <span className={`badge badge-status badge-${drop.status.toLowerCase()}`}>
          {drop.status === 'LIVE' && 'Live'}
          {drop.status === 'SCHEDULED' && 'Upcoming'}
          {drop.status === 'SOLD_OUT' && 'Sold Out'}
        </span>
      </div>
      
      <div className="drop-content">
        <div className="drop-header">
          <h3>{drop.title}</h3>
          <p className="drop-curator">
            by <a href={`/curators/${drop.curator.slug}`}>
              {drop.curator.businessName}
            </a>
          </p>
        </div>
        
        <div className="drop-meta">
          <span className="drop-price">${drop.price}</span>
          {drop.minValue && (
            <span className="drop-value">
              ${drop.minValue} value
            </span>
          )}
        </div>
        
        {isScheduled && drop.startTime && (
          <DropCountdown startTime={drop.startTime} />
        )}
        
        {isLive && (
          <div className="drop-inventory">
            <div className="inventory-bar">
              <div
                className="inventory-fill"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <span className="inventory-text">
              {drop.inventory - drop.sold} of {drop.inventory} remaining
            </span>
          </div>
        )}
        
        {isSoldOut && (
          <div className="drop-sold-out">
            <p>Sold out in {formatDistanceToNow(drop.startTime)}</p>
          </div>
        )}
        
        <a href={`/drops/${drop.slug}`} className="drop-link">
          {isScheduled && 'Set Reminder'}
          {isLive && 'View Drop'}
          {isSoldOut && 'View Details'}
        </a>
      </div>
    </article>
  );
}
```

### Drop Countdown Component

```typescript
// features/drops/components/DropCountdown.tsx
'use client'

import { useState, useEffect } from 'react';

interface DropCountdownProps {
  startTime: Date;
  onComplete?: () => void;
}

export function DropCountdown({ startTime, onComplete }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTime));
  
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(startTime);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, onComplete]);
  
  if (timeLeft.total <= 0) {
    return <div className="countdown-complete">Drop is live!</div>;
  }
  
  return (
    <div className="countdown">
      <span className="countdown-label">Goes live in</span>
      <div className="countdown-time">
        {timeLeft.days > 0 && (
          <div className="countdown-unit">
            <span className="countdown-value">{timeLeft.days}</span>
            <span className="countdown-label">days</span>
          </div>
        )}
        <div className="countdown-unit">
          <span className="countdown-value">{timeLeft.hours}</span>
          <span className="countdown-label">hrs</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">{timeLeft.minutes}</span>
          <span className="countdown-label">min</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">{timeLeft.seconds}</span>
          <span className="countdown-label">sec</span>
        </div>
      </div>
    </div>
  );
}

function calculateTimeLeft(targetDate: Date) {
  const total = targetDate.getTime() - Date.now();
  
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { total, days, hours, minutes, seconds };
}
```

### Drop Detail Page

```typescript
// app/drops/[slug]/page.tsx
import { getDropBySlug } from '@/features/drops/models/drop.actions';
import { DropCountdown } from '@/features/drops/components/DropCountdown';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';
import { SaveDropButton } from '@/features/drops/components/SaveDropButton';
import { ShareDropButton } from '@/features/drops/components/ShareDropButton';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const drop = await getDropBySlug(params.slug);
  
  return {
    title: `${drop.title} - Dropr`,
    description: drop.description,
    openGraph: {
      images: [drop.coverImage],
    },
  };
}

export default async function DropPage({ params }: { params: { slug: string } }) {
  const drop = await getDropBySlug(params.slug);
  
  const isLive = drop.status === 'LIVE';
  const isScheduled = drop.status === 'SCHEDULED';
  const isSoldOut = drop.status === 'SOLD_OUT';
  const soldPercentage = (drop.sold / drop.inventory) * 100;
  
  return (
    <div className="drop-page">
      <div className="drop-hero">
        <img src={drop.coverImage} alt={drop.title} />
      </div>
      
      <div className="drop-main">
        <div className="drop-info">
          <div className="drop-header">
            <h1>{drop.title}</h1>
            
            <div className="drop-curator">
              <img src={drop.curator.user.avatar} alt={drop.curator.businessName} />
              <div>
                <span>Curated by</span>
                <a href={`/curators/${drop.curator.slug}`}>
                  {drop.curator.businessName}
                </a>
              </div>
            </div>
          </div>
          
          <div className="drop-description">
            <p>{drop.description}</p>
          </div>
          
          <div className="drop-details">
            <div className="detail">
              <span className="label">Type</span>
              <span className="value">{formatDropType(drop.type)}</span>
            </div>
            <div className="detail">
              <span className="label">Category</span>
              <span className="value">{drop.category}</span>
            </div>
            {drop.minValue && (
              <div className="detail">
                <span className="label">Minimum Value</span>
                <span className="value">${drop.minValue}</span>
              </div>
            )}
          </div>
        </div>
        
        <aside className="drop-sidebar">
          <div className="drop-purchase-card">
            <div className="price">
              <span className="price-amount">${drop.price}</span>
              {drop.minValue && (
                <span className="price-value">${drop.minValue} value</span>
              )}
            </div>
            
            {isScheduled && drop.startTime && (
              <>
                <DropCountdown startTime={drop.startTime} />
                <SaveDropButton dropId={drop.id} />
              </>
            )}
            
            {isLive && (
              <>
                <div className="inventory-status">
                  <div className="inventory-bar">
                    <div
                      className="inventory-fill"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                  <span className="inventory-text">
                    {drop.inventory - drop.sold} of {drop.inventory} remaining
                  </span>
                </div>
                
                <AddToCartButton dropId={drop.id} price={drop.price} />
              </>
            )}
            
            {isSoldOut && (
              <div className="sold-out-message">
                <p>This drop sold out</p>
                <button>Join Waitlist</button>
              </div>
            )}
            
            <div className="drop-actions">
              <ShareDropButton drop={drop} />
              <SaveDropButton dropId={drop.id} />
            </div>
          </div>
          
          <div className="drop-stats">
            <div className="stat">
              <span className="stat-value">{drop.views}</span>
              <span className="stat-label">Views</span>
            </div>
            <div className="stat">
              <span className="stat-value">{drop.saves}</span>
              <span className="stat-label">Saves</span>
            </div>
            <div className="stat">
              <span className="stat-value">{drop.sold}</span>
              <span className="stat-label">Sold</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
```


## Drop Discovery

### Featured Drops

**Purpose:** Admin-curated drops showcased on homepage and category pages.

**Selection Criteria:**
- High-quality curator with good reputation
- Interesting/unique drop concept
- Good imagery and description
- Diverse categories represented
- New curator promotion

**Implementation:**
```typescript
// features/drops/models/drop.actions.ts
'use server'

export async function featureDrop(dropId: string) {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError('Only admins can feature drops');
  }
  
  await db.drop.update({
    where: { id: dropId },
    data: {
      featured: true,
      featuredAt: new Date(),
    },
  });
  
  revalidateTag('featured-drops');
  
  return { success: true };
}

export async function getFeaturedDrops() {
  return await db.drop.findMany({
    where: {
      featured: true,
      status: { in: ['SCHEDULED', 'LIVE'] },
    },
    include: {
      curator: {
        include: { user: true },
      },
    },
    orderBy: {
      featuredAt: 'desc',
    },
    take: 6,
  });
}
```

### Category Browsing

**Categories:**
- Mechanical Keyboards
- Keycaps
- Switches
- PC Mods
- Gaming Peripherals
- DIY Electronics
- 3D Printing
- Modular Synth
- Miniatures
- Model Kits
- Painting Supplies

**Category Page:**
```typescript
// app/drops/category/[category]/page.tsx
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { sort?: string; status?: string };
}) {
  const drops = await getDropsByCategory(params.category, {
    sort: searchParams.sort || 'newest',
    status: searchParams.status,
  });
  
  return (
    <div className="category-page">
      <header>
        <h1>{formatCategory(params.category)}</h1>
        
        <div className="filters">
          <select name="status">
            <option value="">All Drops</option>
            <option value="LIVE">Live Now</option>
            <option value="SCHEDULED">Upcoming</option>
          </select>
          
          <select name="sort">
            <option value="newest">Newest</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </header>
      
      <div className="drops-grid">
        {drops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  );
}
```

### Search

**Search Implementation:**
```typescript
// features/drops/models/drop.actions.ts
'use server'

export async function searchDrops(query: string, filters?: {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  status?: DropStatus;
}) {
  return await db.drop.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query.toLowerCase() } },
          ],
        },
        filters?.category ? { category: filters.category } : {},
        filters?.priceMin ? { price: { gte: filters.priceMin } } : {},
        filters?.priceMax ? { price: { lte: filters.priceMax } } : {},
        filters?.status ? { status: filters.status } : { status: { in: ['SCHEDULED', 'LIVE'] } },
      ],
    },
    include: {
      curator: {
        include: { user: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

### Trending Drops

**Algorithm:**
- Views in last 24 hours
- Sales velocity
- Save rate
- Share count
- Weighted by recency

```typescript
export async function getTrendingDrops() {
  // Get drops with recent activity
  const drops = await db.drop.findMany({
    where: {
      status: 'LIVE',
      startTime: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    include: {
      curator: { include: { user: true } },
      _count: {
        select: {
          views: {
            where: {
              createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
          },
          orders: true,
        },
      },
    },
  });
  
  // Calculate trending score
  const scored = drops.map((drop) => {
    const recentViews = drop._count.views;
    const salesVelocity = drop.sold / ((Date.now() - drop.startTime.getTime()) / (1000 * 60 * 60));
    const saveRate = drop.saves / Math.max(drop.views, 1);
    
    const score = (recentViews * 1) + (salesVelocity * 10) + (saveRate * 100);
    
    return { drop, score };
  });
  
  // Sort by score and return top 10
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => item.drop);
}
```

### Ending Soon

```typescript
export async function getEndingSoonDrops() {
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  
  return await db.drop.findMany({
    where: {
      status: 'LIVE',
      endTime: {
        gte: now,
        lte: sixHoursFromNow,
      },
      sold: {
        lt: db.drop.fields.inventory, // Still has inventory
      },
    },
    include: {
      curator: { include: { user: true } },
    },
    orderBy: {
      endTime: 'asc',
    },
    take: 10,
  });
}
```


## Real-Time Updates

### Server-Sent Events (SSE) for Drop Updates

```typescript
// app/api/drops/[id]/stream/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const drop = await db.drop.findUnique({
        where: { id: params.id },
      });
      
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({
          inventory: drop.inventory - drop.sold - drop.reserved,
          sold: drop.sold,
          status: drop.status,
        })}\n\n`)
      );
      
      // Poll for updates every 5 seconds
      const interval = setInterval(async () => {
        try {
          const updated = await db.drop.findUnique({
            where: { id: params.id },
          });
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              inventory: updated.inventory - updated.sold - updated.reserved,
              sold: updated.sold,
              status: updated.status,
            })}\n\n`)
          );
          
          // Close stream if drop ended
          if (updated.status === 'ENDED' || updated.status === 'SOLD_OUT') {
            clearInterval(interval);
            controller.close();
          }
        } catch (error) {
          console.error('SSE error:', error);
          clearInterval(interval);
          controller.close();
        }
      }, 5000);
      
      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Client-Side SSE Consumer

```typescript
// features/drops/hooks/useDropUpdates.ts
'use client'

import { useEffect, useState } from 'react';

interface DropUpdate {
  inventory: number;
  sold: number;
  status: string;
}

export function useDropUpdates(dropId: string) {
  const [data, setData] = useState<DropUpdate | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/drops/${dropId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setData(update);
      } catch (err) {
        setError(err as Error);
      }
    };
    
    eventSource.onerror = () => {
      setError(new Error('Connection lost'));
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [dropId]);
  
  return { data, error };
}

// Usage in component
export function LiveDropCard({ drop }: { drop: Drop }) {
  const updates = useDropUpdates(drop.id);
  
  const inventory = updates.data?.inventory ?? (drop.inventory - drop.sold);
  const sold = updates.data?.sold ?? drop.sold;
  
  return (
    <div>
      <p>{inventory} remaining</p>
      <p>{sold} sold</p>
    </div>
  );
}
```

## Drop Analytics (Curator Dashboard)

### Analytics Dashboard

```typescript
// features/curator/components/DropAnalytics.tsx
import { getDropAnalytics } from '../models/curator.actions';

export async function DropAnalytics({ dropId }: { dropId: string }) {
  const analytics = await getDropAnalytics(dropId);
  
  return (
    <div className="drop-analytics">
      <h2>Drop Performance</h2>
      
      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-value">{analytics.views}</span>
          <span className="metric-label">Total Views</span>
        </div>
        
        <div className="metric">
          <span className="metric-value">{analytics.saves}</span>
          <span className="metric-label">Saves</span>
        </div>
        
        <div className="metric">
          <span className="metric-value">{analytics.sold}</span>
          <span className="metric-label">Units Sold</span>
        </div>
        
        <div className="metric">
          <span className="metric-value">${analytics.revenue}</span>
          <span className="metric-label">Revenue</span>
        </div>
        
        <div className="metric">
          <span className="metric-value">
            {((analytics.sold / analytics.inventory) * 100).toFixed(1)}%
          </span>
          <span className="metric-label">Sell-Through Rate</span>
        </div>
        
        <div className="metric">
          <span className="metric-value">
            {((analytics.saves / analytics.views) * 100).toFixed(1)}%
          </span>
          <span className="metric-label">Save Rate</span>
        </div>
      </div>
      
      <div className="charts">
        <div className="chart">
          <h3>Sales Over Time</h3>
          <SalesChart data={analytics.salesByHour} />
        </div>
        
        <div className="chart">
          <h3>Traffic Sources</h3>
          <SourcesChart data={analytics.sourceBreakdown} />
        </div>
      </div>
      
      <div className="top-performers">
        <h3>Similar Drops Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Drop</th>
              <th>Sold</th>
              <th>Revenue</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {analytics.similarDrops.map((drop) => (
              <tr key={drop.id}>
                <td>{drop.title}</td>
                <td>{drop.sold}/{drop.inventory}</td>
                <td>${drop.revenue}</td>
                <td>{drop.duration}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Best Practices

- Create compelling drop titles (10-200 characters)
- Write detailed descriptions (100-5000 characters)
- Use high-quality cover images (min 800x600px, 16:9 aspect ratio)
- Set realistic minimum values for mystery boxes (at least 50% above price)
- Start with smaller inventory to test demand
- Schedule drops during peak hours (evenings, weekends)
- Use 48-72 hour durations for optimal engagement
- Promote drops on social media before they go live
- Respond to questions promptly (via support)
- Fulfill orders within stated handling time
- Track analytics to improve future drops
- Feature diverse items in mystery boxes
- Be transparent about surplus/as-is items
- Use clear, honest descriptions
- Price competitively but fairly

## Common Mistakes to Avoid

- Vague or misleading descriptions
- Poor quality images
- Overpricing mystery boxes
- Setting minimum value too close to price
- Too much inventory (creates FOMO loss)
- Too little inventory (sells out too fast)
- Scheduling during off-hours
- Not promoting before launch
- Ignoring analytics
- Inconsistent drop quality
- Not fulfilling orders promptly
- Overpromising in descriptions
- Using clickbait titles
- Not testing drop concepts
- Ignoring buyer feedback

## Future Enhancements

- Drop templates (save and reuse configurations)
- Bulk drop creation
- Drop series (recurring themed drops)
- Collaborative drops (multiple curators)
- Drop bundles (buy multiple drops together)
- Early access for followers
- Tiered pricing (quantity discounts)
- Auction-style drops
- Blind box reveals (gamification)
- Drop analytics export
- A/B testing drop descriptions
- Automated repricing based on demand
- Drop recommendations for buyers
- Waitlist with automatic notifications
- Drop scheduling optimization (AI-suggested times)
