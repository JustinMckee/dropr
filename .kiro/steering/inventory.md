---
inclusion: manual
---
# Inventory Management

## Philosophy

Prevent overselling at all costs. Inventory is the foundation of trust—if a buyer purchases a drop, they must receive it. Use pessimistic locking during checkout, real-time updates during drops, and clear communication when inventory is low. Curators should always know their inventory status, and buyers should never experience the disappointment of a failed purchase due to stock issues.

## Inventory Checklist

**Core Features:**
- [ ] Real-time inventory tracking
- [ ] Pessimistic locking during checkout
- [ ] Inventory reservation system (5-minute hold)
- [ ] Automatic reservation expiration
- [ ] Overselling prevention (race condition handling)
- [ ] Low inventory warnings (curators)
- [ ] Sold out detection and display
- [ ] Inventory analytics and reporting

**Buyer Experience:**
- [ ] Real-time inventory display on drop page
- [ ] "Only X left" urgency messaging
- [ ] Sold out badge and messaging
- [ ] Waitlist option for sold out drops
- [ ] Inventory check before payment
- [ ] Clear error if sold out during checkout

**Curator Experience:**
- [ ] Inventory management in drop creation
- [ ] Real-time inventory dashboard
- [ ] Low stock alerts (email + in-app)
- [ ] Inventory adjustment capability
- [ ] Sold out notifications
- [ ] Inventory history and audit log

## Inventory States

### Drop Inventory Lifecycle

```
AVAILABLE → RESERVED → SOLD
    ↓          ↓
RELEASED ← EXPIRED
```

**States:**
1. **AVAILABLE** - Inventory ready for purchase
2. **RESERVED** - Temporarily held during checkout (5 minutes)
3. **SOLD** - Successfully purchased and paid
4. **RELEASED** - Reservation expired, returned to available
5. **EXPIRED** - Reservation timeout, inventory freed

## Preventing Overselling

### Race Condition Scenario

```
Time    Buyer A              Buyer B              Inventory
----    -------              -------              ---------
T0      Views drop (1 left)  Views drop (1 left)  1
T1      Clicks "Buy Now"     Clicks "Buy Now"     1
T2      Checks inventory ✓   Checks inventory ✓   1
T3      Proceeds to payment  Proceeds to payment  1
T4      Completes payment ✓  Completes payment ✓  -1 ❌ OVERSOLD!
```

### Solution: Pessimistic Locking

```typescript
// features/checkout/models/checkout.actions.ts
'use server'

import { db } from '@/lib/db';

export async function reserveInventory(dropId: string, quantity: number) {
  const session = await requireAuth();
  
  // Use database transaction with row-level locking
  return await db.$transaction(async (tx) => {
    // Lock the drop row for update (prevents concurrent modifications)
    const drop = await tx.drop.findUnique({
      where: { id: dropId },
      // SELECT ... FOR UPDATE (PostgreSQL row lock)
    });
    
    if (!drop) {
      throw new NotFoundError('Drop not found');
    }
    
    // Check available inventory (accounting for active reservations)
    const activeReservations = await tx.inventoryReservation.aggregate({
      where: {
        dropId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      _sum: { quantity: true },
    });
    
    const reservedQuantity = activeReservations._sum.quantity || 0;
    const availableInventory = drop.inventory - reservedQuantity;
    
    if (availableInventory < quantity) {
      throw new InsufficientInventoryError(
        `Only ${availableInventory} items available`
      );
    }
    
    // Create reservation (5-minute hold)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const reservation = await tx.inventoryReservation.create({
      data: {
        dropId,
        userId: session.user.id,
        quantity,
        status: 'ACTIVE',
        expiresAt,
      },
    });
    
    return {
      reservationId: reservation.id,
      expiresAt,
    };
  });
}
```

### Database Schema

```prisma
model Drop {
  id        String   @id @default(cuid())
  inventory Int      @default(0)
  soldCount Int      @default(0)
  
  reservations InventoryReservation[]
  
  @@index([id, inventory])
}

model InventoryReservation {
  id        String              @id @default(cuid())
  dropId    String
  drop      Drop                @relation(fields: [dropId], references: [id])
  userId    String
  user      User                @relation(fields: [userId], references: [id])
  quantity  Int
  status    ReservationStatus   @default(ACTIVE)
  expiresAt DateTime
  createdAt DateTime            @default(now())
  
  @@index([dropId, status, expiresAt])
}

enum ReservationStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED
}
```

## Checkout Flow with Inventory

### Step 1: Reserve Inventory

```typescript
// When user clicks "Buy Now"
const { reservationId, expiresAt } = await reserveInventory(dropId, quantity);

// Store reservation in session or state
// Show countdown timer: "Complete checkout in 4:59"
```

### Step 2: Complete Purchase

```typescript
// features/checkout/models/payment.actions.ts
'use server'

export async function completePurchase(reservationId: string, paymentIntentId: string) {
  return await db.$transaction(async (tx) => {
    // Get reservation
    const reservation = await tx.inventoryReservation.findUnique({
      where: { id: reservationId },
      include: { drop: true },
    });
    
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    if (reservation.status !== 'ACTIVE') {
      throw new Error('Reservation is no longer active');
    }
    
    if (reservation.expiresAt < new Date()) {
      throw new Error('Reservation has expired');
    }
    
    // Mark reservation as completed
    await tx.inventoryReservation.update({
      where: { id: reservationId },
      data: { status: 'COMPLETED' },
    });
    
    // Decrement inventory
    await tx.drop.update({
      where: { id: reservation.dropId },
      data: {
        inventory: { decrement: reservation.quantity },
        soldCount: { increment: reservation.quantity },
      },
    });
    
    // Create order
    const order = await tx.order.create({
      data: {
        userId: reservation.userId,
        dropId: reservation.dropId,
        quantity: reservation.quantity,
        total: reservation.drop.price * reservation.quantity,
        paymentIntentId,
        status: 'COMPLETED',
      },
    });
    
    return order;
  });
}
```

### Step 3: Handle Expiration

```typescript
// lib/cron/expire-reservations.ts
export async function expireReservations() {
  const expired = await db.inventoryReservation.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: new Date() },
    },
  });
  
  for (const reservation of expired) {
    await db.inventoryReservation.update({
      where: { id: reservation.id },
      data: { status: 'EXPIRED' },
    });
    
    // Inventory automatically available (not decremented)
    console.log(`Reservation ${reservation.id} expired`);
  }
}

// Run every minute via cron job or Vercel Cron
```

## Real-Time Inventory Updates

### Server-Sent Events (SSE)

```typescript
// app/api/drops/[id]/inventory/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        const drop = await db.drop.findUnique({
          where: { id: params.id },
          select: { inventory: true, soldCount: true },
        });
        
        if (!drop) {
          controller.close();
          return;
        }
        
        // Calculate available inventory (minus active reservations)
        const activeReservations = await db.inventoryReservation.aggregate({
          where: {
            dropId: params.id,
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
          },
          _sum: { quantity: true },
        });
        
        const reserved = activeReservations._sum.quantity || 0;
        const available = drop.inventory - reserved;
        
        const data = {
          inventory: drop.inventory,
          soldCount: drop.soldCount,
          available,
          reserved,
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      // Send initial update
      await sendUpdate();
      
      // Poll for changes every 5 seconds
      const interval = setInterval(sendUpdate, 5000);
      
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

### Client-Side Updates

```typescript
// features/drops/components/DropInventory.tsx
'use client'

import { useState, useEffect } from 'react';

export function DropInventory({ dropId, initialInventory }: DropInventoryProps) {
  const [inventory, setInventory] = useState(initialInventory);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/drops/${dropId}/inventory`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setInventory(data);
    };
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [dropId]);
  
  const percentSold = (inventory.soldCount / (inventory.inventory + inventory.soldCount)) * 100;
  
  return (
    <div className="inventory-status">
      {inventory.available > 0 ? (
        <>
          <div className="inventory-count">
            {inventory.available} available
            {inventory.reserved > 0 && (
              <span className="reserved"> ({inventory.reserved} in carts)</span>
            )}
          </div>
          
          {inventory.available <= 5 && (
            <div className="low-stock-warning">
              ⚠️ Only {inventory.available} left!
            </div>
          )}
          
          <div className="progress-bar">
            <div className="progress" style={{ width: `${percentSold}%` }} />
          </div>
          
          <div className="sold-count">
            {inventory.soldCount} sold
          </div>
        </>
      ) : (
        <div className="sold-out">
          <span className="badge">Sold Out</span>
          <button onClick={handleJoinWaitlist}>Join Waitlist</button>
        </div>
      )}
    </div>
  );
}
```

## Curator Inventory Management

### Low Stock Alerts

```typescript
// lib/notifications/inventory-alerts.ts
export async function checkLowInventory() {
  const lowStockDrops = await db.drop.findMany({
    where: {
      status: 'LIVE',
      inventory: { lte: 5 },
      inventory: { gt: 0 },
    },
    include: {
      curator: { include: { user: true } },
    },
  });
  
  for (const drop of lowStockDrops) {
    // Send notification to curator
    await queueNotification({
      userId: drop.curator.userId,
      type: 'LOW_INVENTORY',
      channel: 'email',
      data: {
        dropId: drop.id,
        dropTitle: drop.title,
        inventory: drop.inventory,
      },
    });
  }
}
```

### Inventory Adjustment

```typescript
// features/curator/models/inventory.actions.ts
'use server'

export async function adjustInventory(dropId: string, adjustment: number, reason: string) {
  const session = await requireAuth();
  
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    include: { curator: true },
  });
  
  if (!drop || drop.curator.userId !== session.user.id) {
    throw new ForbiddenError('Not authorized');
  }
  
  const newInventory = drop.inventory + adjustment;
  
  if (newInventory < 0) {
    throw new ValidationError('Inventory cannot be negative');
  }
  
  await db.$transaction([
    // Update inventory
    db.drop.update({
      where: { id: dropId },
      data: { inventory: newInventory },
    }),
    
    // Log adjustment
    db.inventoryAdjustment.create({
      data: {
        dropId,
        adjustment,
        reason,
        previousInventory: drop.inventory,
        newInventory,
        adjustedBy: session.user.id,
      },
    }),
  ]);
  
  return { success: true, newInventory };
}
```

## Sold Out Handling

### Sold Out Detection

```typescript
// Automatically detect when drop sells out
export async function checkSoldOut(dropId: string) {
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    select: { inventory: true, status: true },
  });
  
  if (drop && drop.inventory === 0 && drop.status === 'LIVE') {
    await db.drop.update({
      where: { id: dropId },
      data: { status: 'SOLD_OUT' },
    });
    
    // Notify curator
    await notifyCuratorSoldOut(dropId);
  }
}
```

### Waitlist Feature

```typescript
// features/drops/models/waitlist.actions.ts
'use server'

export async function joinWaitlist(dropId: string) {
  const session = await requireAuth();
  
  const drop = await db.drop.findUnique({
    where: { id: dropId },
  });
  
  if (!drop || drop.inventory > 0) {
    throw new ValidationError('Drop is not sold out');
  }
  
  await db.waitlist.create({
    data: {
      dropId,
      userId: session.user.id,
    },
  });
  
  return { success: true };
}

// Notify waitlist when inventory added
export async function notifyWaitlist(dropId: string) {
  const waitlist = await db.waitlist.findMany({
    where: { dropId },
    include: { user: true },
  });
  
  for (const entry of waitlist) {
    await queueNotification({
      userId: entry.userId,
      type: 'WAITLIST_AVAILABLE',
      channel: 'email',
      data: {
        dropId,
        dropTitle: entry.drop.title,
      },
    });
  }
}
```

## Inventory Analytics

### Curator Dashboard Metrics

```typescript
// features/curator/models/inventory-analytics.actions.ts
'use server'

export async function getInventoryAnalytics(curatorId: string) {
  const drops = await db.drop.findMany({
    where: { curator: { userId: curatorId } },
    select: {
      id: true,
      title: true,
      inventory: true,
      soldCount: true,
      status: true,
      createdAt: true,
    },
  });
  
  return drops.map(drop => ({
    ...drop,
    totalInventory: drop.inventory + drop.soldCount,
    sellThroughRate: ((drop.soldCount / (drop.inventory + drop.soldCount)) * 100).toFixed(1),
    remainingInventory: drop.inventory,
  }));
}
```

## Best Practices

- Use pessimistic locking to prevent race conditions
- Reserve inventory during checkout (5-minute hold)
- Expire reservations automatically
- Show real-time inventory updates
- Alert curators when inventory is low (≤ 5 items)
- Provide waitlist for sold out drops
- Log all inventory adjustments with audit trail
- Never allow negative inventory
- Test concurrent purchase scenarios
- Monitor for overselling in production
- Provide clear error messages when sold out

## Common Mistakes to Avoid

- Optimistic inventory checks (race conditions)
- No reservation system (overselling risk)
- Not expiring reservations (inventory locked forever)
- Allowing negative inventory
- No real-time updates (stale data)
- No low stock warnings
- Not logging inventory changes
- Ignoring concurrent purchase testing
- Poor sold out messaging
- No waitlist option

## Future Enhancements

- Inventory forecasting based on demand
- Dynamic pricing based on inventory levels
- Bulk inventory management
- Inventory import/export
- Multi-warehouse support
- Inventory allocation rules
- Pre-order and backorder support
- Inventory bundling (kits)
- Real-time inventory sync with external systems
