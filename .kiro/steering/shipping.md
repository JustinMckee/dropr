---
inclusion: manual
---

# Shipping and Fulfillment

## Philosophy

Empower curators with clear shipping guidance while protecting buyers through tracking requirements and delivery confirmation. Shipping is the curator's responsibility, but we provide tools, templates, and best practices to ensure smooth fulfillment. Transparent tracking, realistic delivery estimates, and clear communication build trust. Standardize shipping options while allowing curator flexibility for special cases.

## Shipping Checklist

**Curator Responsibilities:**
- [ ] Ship within stated timeframe (1-3 business days)
- [ ] Provide tracking number for all orders
- [ ] Use appropriate packaging for item protection
- [ ] Include packing slip with order details
- [ ] Mark order as shipped in dashboard
- [ ] Respond to shipping inquiries within 24 hours

**Shipping Options:**
- [ ] Standard shipping (5-7 business days)
- [ ] Expedited shipping (2-3 business days)
- [ ] Express shipping (1-2 business days)
- [ ] International shipping (future)
- [ ] Local pickup (optional)

**Tracking Requirements:**
- [ ] Tracking number required for all orders
- [ ] Tracking updates synced automatically
- [ ] Delivery confirmation captured
- [ ] Buyer notified of shipping status
- [ ] Tracking visible in buyer dashboard

**Packaging Guidelines:**
- [ ] Use appropriate box/envelope size
- [ ] Include bubble wrap or padding for fragile items
- [ ] Seal securely with packing tape
- [ ] Include packing slip inside
- [ ] Add "Fragile" label if needed
- [ ] No external branding required (curator choice)

**Shipping Disputes:**
- [ ] Lost package process defined
- [ ] Damaged in transit process defined
- [ ] Delivery confirmation required for disputes
- [ ] Insurance recommendations provided
- [ ] Refund/replacement policy clear

**International Shipping (future):**
- [ ] Customs forms required
- [ ] Duties/taxes buyer responsibility
- [ ] Longer delivery times communicated
- [ ] Restricted items list provided
- [ ] Currency conversion handled

## Database Schema

```prisma
// prisma/schema.prisma
model Order {
  id          String   @id @default(cuid())
  
  // Shipping details
  shippingMethod    ShippingMethod
  shippingCost      Decimal @db.Decimal(10, 2)
  trackingNumber    String?
  shippingCarrier   String?
  
  shippedAt         DateTime?
  estimatedDelivery DateTime?
  deliveredAt       DateTime?
  
  // Shipping address
  shippingAddress   Json // { name, line1, line2, city, state, zip, country }
  
  // Status tracking
  status            OrderStatus @default(PENDING)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([trackingNumber])
}

enum ShippingMethod {
  STANDARD
  EXPEDITED
  EXPRESS
  INTERNATIONAL
  LOCAL_PICKUP
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED_DELIVERY
  RETURNED
  CANCELLED
  REFUNDED
}

model ShippingLabel {
  id          String   @id @default(cuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  
  carrier     String
  service     String
  trackingNumber String
  labelUrl    String
  cost        Decimal @db.Decimal(10, 2)
  
  createdAt   DateTime @default(now())
  
  @@index([trackingNumber])
}
```

## Shipping Configuration

### Drop Shipping Settings

```typescript
// features/drops/models/drop.types.ts
export interface ShippingConfig {
  methods: {
    standard: {
      enabled: boolean;
      cost: number;
      estimatedDays: number;
    };
    expedited: {
      enabled: boolean;
      cost: number;
      estimatedDays: number;
    };
    express: {
      enabled: boolean;
      cost: number;
      estimatedDays: number;
    };
    localPickup: {
      enabled: boolean;
      location?: string;
      instructions?: string;
    };
  };
  handlingTime: number; // Days to ship after order
  freeShippingThreshold?: number; // Free shipping over this amount
}
```

### Curator Shipping Settings Form

```typescript
// features/curator/components/ShippingSettingsForm.tsx
'use client'

import { useState } from 'react';
import { updateShippingSettings } from '../models/curator.actions';

export function ShippingSettingsForm({ curatorId, initialSettings }: {
  curatorId: string;
  initialSettings: ShippingConfig;
}) {
  const [settings, setSettings] = useState(initialSettings);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShippingSettings(curatorId, settings);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Shipping Settings</h2>
      
      <div>
        <label>Handling Time (days to ship after order)</label>
        <select
          value={settings.handlingTime}
          onChange={(e) => setSettings({
            ...settings,
            handlingTime: parseInt(e.target.value)
          })}
        >
          <option value="1">1 business day</option>
          <option value="2">2 business days</option>
          <option value="3">3 business days</option>
          <option value="5">5 business days</option>
        </select>
      </div>
      
      <fieldset>
        <legend>Standard Shipping</legend>
        <label>
          <input
            type="checkbox"
            checked={settings.methods.standard.enabled}
            onChange={(e) => setSettings({
              ...settings,
              methods: {
                ...settings.methods,
                standard: {
                  ...settings.methods.standard,
                  enabled: e.target.checked
                }
              }
            })}
          />
          Enable Standard Shipping
        </label>
        
        {settings.methods.standard.enabled && (
          <>
            <label>
              Cost
              <input
                type="number"
                step="0.01"
                value={settings.methods.standard.cost}
                onChange={(e) => setSettings({
                  ...settings,
                  methods: {
                    ...settings.methods,
                    standard: {
                      ...settings.methods.standard,
                      cost: parseFloat(e.target.value)
                    }
                  }
                })}
              />
            </label>
            
            <label>
              Estimated Delivery (days)
              <input
                type="number"
                value={settings.methods.standard.estimatedDays}
                onChange={(e) => setSettings({
                  ...settings,
                  methods: {
                    ...settings.methods,
                    standard: {
                      ...settings.methods.standard,
                      estimatedDays: parseInt(e.target.value)
                    }
                  }
                })}
              />
            </label>
          </>
        )}
      </fieldset>
      
      {/* Similar fieldsets for expedited, express, international, localPickup */}
      
      <div>
        <label>
          Free Shipping Threshold (optional)
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 100.00"
            value={settings.freeShippingThreshold || ''}
            onChange={(e) => setSettings({
              ...settings,
              freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : undefined
            })}
          />
        </label>
        <small>Offer free shipping for orders over this amount</small>
      </div>
      
      <button type="submit">Save Shipping Settings</button>
    </form>
  );
}
```

## Order Fulfillment

### Mark Order as Shipped

```typescript
// features/orders/models/order.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function markOrderShipped(
  orderId: string,
  trackingNumber: string,
  carrier: string
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
  if (order.drop.curator.userId !== session.user.id) {
    throw new ForbiddenError('Not your order');
  }
  
  // Validate tracking number format
  if (!trackingNumber || trackingNumber.length < 5) {
    throw new ValidationError('Invalid tracking number');
  }
  
  // Calculate estimated delivery
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(
    estimatedDelivery.getDate() + order.shippingMethod === 'STANDARD' ? 7 : 3
  );
  
  // Update order
  await db.order.update({
    where: { id: orderId },
    data: {
      status: 'SHIPPED',
      trackingNumber,
      shippingCarrier: carrier,
      shippedAt: new Date(),
      estimatedDelivery,
    },
  });
  
  // Send notification to buyer
  await createNotification({
    userId: order.buyerId,
    type: 'ORDER_SHIPPED',
    title: 'Order Shipped',
    message: `Your order has been shipped. Tracking: ${trackingNumber}`,
    link: `/orders/${orderId}`,
  });
  
  // Send email with tracking
  await sendEmail(order.buyer.email, {
    subject: 'Your Order Has Shipped',
    template: 'order-shipped',
    data: {
      orderNumber: order.orderNumber,
      trackingNumber,
      carrier,
      trackingUrl: getTrackingUrl(carrier, trackingNumber),
      estimatedDelivery,
    },
  });
  
  revalidateTag(`order-${orderId}`);
  
  return { success: true };
}

function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const carriers: Record<string, string> = {
    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };
  
  return carriers[carrier] || '#';
}
```

### Shipping Dashboard

```typescript
// features/curator/components/ShippingDashboard.tsx
import { getOrdersToShip } from '../models/curator.actions';

export async function ShippingDashboard({ curatorId }: { curatorId: string }) {
  const orders = await getOrdersToShip(curatorId);
  
  return (
    <div className="shipping-dashboard">
      <h2>Orders to Ship</h2>
      
      {orders.length === 0 ? (
        <p>No orders to ship. You're all caught up!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Buyer</th>
              <th>Drop</th>
              <th>Paid</th>
              <th>Ship By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.buyer.name}</td>
                <td>{order.drop.title}</td>
                <td>{order.createdAt.toLocaleDateString()}</td>
                <td>
                  {getShipByDate(order.createdAt, order.drop.handlingTime)}
                </td>
                <td>
                  <button onClick={() => openShippingModal(order.id)}>
                    Mark as Shipped
                  </button>
                  <button onClick={() => printPackingSlip(order.id)}>
                    Print Packing Slip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function getShipByDate(orderDate: Date, handlingTime: number): string {
  const shipBy = new Date(orderDate);
  shipBy.setDate(shipBy.getDate() + handlingTime);
  return shipBy.toLocaleDateString();
}
```

### Mark as Shipped Modal

```typescript
// features/curator/components/MarkShippedModal.tsx
'use client'

import { useState } from 'react';
import { markOrderShipped } from '@/features/orders/models/order.actions';

export function MarkShippedModal({ orderId, onClose }: {
  orderId: string;
  onClose: () => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('USPS');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await markOrderShipped(orderId, trackingNumber, carrier);
    
    // Show success toast
    onClose();
  };
  
  return (
    <dialog open>
      <form onSubmit={handleSubmit}>
        <h3>Mark Order as Shipped</h3>
        
        <div>
          <label>Shipping Carrier *</label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            required
          >
            <option value="USPS">USPS</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
            <option value="DHL">DHL</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label>Tracking Number *</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            required
            minLength={5}
          />
        </div>
        
        <div className="shipping-tips">
          <h4>Shipping Tips</h4>
          <ul>
            <li>Double-check tracking number for accuracy</li>
            <li>Use appropriate packaging to prevent damage</li>
            <li>Include packing slip inside package</li>
            <li>Ship within your stated handling time</li>
          </ul>
        </div>
        
        <div className="modal-actions">
          <button type="submit">Mark as Shipped</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
}
```

## Tracking Updates

### Sync Tracking Status

```typescript
// lib/shipping/tracking.ts
import { db } from '@/lib/db';

export async function syncTrackingStatus(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
  });
  
  if (!order || !order.trackingNumber) {
    return;
  }
  
  // Call carrier API to get tracking status
  const trackingData = await getTrackingData(
    order.shippingCarrier,
    order.trackingNumber
  );
  
  // Update order status based on tracking
  let newStatus = order.status;
  
  if (trackingData.status === 'in_transit') {
    newStatus = 'IN_TRANSIT';
  } else if (trackingData.status === 'out_for_delivery') {
    newStatus = 'OUT_FOR_DELIVERY';
  } else if (trackingData.status === 'delivered') {
    newStatus = 'DELIVERED';
    
    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        deliveredAt: new Date(trackingData.deliveredAt),
      },
    });
    
    // Notify buyer of delivery
    await createNotification({
      userId: order.buyerId,
      type: 'ORDER_DELIVERED',
      title: 'Order Delivered',
      message: 'Your order has been delivered',
      link: `/orders/${orderId}`,
    });
    
    return;
  } else if (trackingData.status === 'failed_delivery') {
    newStatus = 'FAILED_DELIVERY';
  }
  
  if (newStatus !== order.status) {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }
}

async function getTrackingData(carrier: string, trackingNumber: string) {
  // Integration with carrier APIs (EasyPost, Shippo, etc.)
  // For MVP, return mock data or use webhook from carrier
  return {
    status: 'in_transit',
    deliveredAt: null,
    events: [],
  };
}
```

### Tracking Webhook Handler

```typescript
// app/api/webhooks/shipping/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncTrackingStatus } from '@/lib/shipping/tracking';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Verify webhook signature
  // ...
  
  // Extract tracking number and status
  const { trackingNumber, status } = body;
  
  // Find order by tracking number
  const order = await db.order.findFirst({
    where: { trackingNumber },
  });
  
  if (order) {
    await syncTrackingStatus(order.id);
  }
  
  return NextResponse.json({ received: true });
}
```

## Packing Slip

### Generate Packing Slip

```typescript
// features/orders/models/packing-slip.ts
export function generatePackingSlip(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { border-bottom: 2px solid #000; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Packing Slip</h1>
        <p>Order #${order.orderNumber}</p>
        <p>Date: ${order.createdAt.toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Ship To:</h2>
        <p>
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.line1}<br>
          ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
      
      <div class="section">
        <h2>Items:</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.drop.title}</td>
              <td>1</td>
              <td>$${order.subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</p>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      </div>
      
      <div class="section">
        <p>Thank you for your purchase!</p>
        <p>Questions? Contact us at support@dropr.com</p>
      </div>
    </body>
    </html>
  `;
}
```

## Shipping Guidelines for Curators

### Packaging Best Practices

```markdown
# Packaging Guidelines

## Box Selection
- Use a box that fits your items with 2-3 inches of padding space
- Avoid oversized boxes that increase shipping costs
- Use padded envelopes for small, non-fragile items

## Protection
- Wrap fragile items in bubble wrap (at least 2 layers)
- Fill empty space with packing peanuts or crumpled paper
- Use cardboard dividers for multiple items
- Double-box extremely fragile items

## Sealing
- Use strong packing tape (not masking or scotch tape)
- Tape all seams and edges
- Reinforce bottom of box with extra tape
- Cover any existing labels or barcodes

## Labeling
- Print shipping label clearly
- Place label on largest flat surface
- Don't place label over seams or tape
- Add "Fragile" or "This Side Up" labels if needed

## Packing Slip
- Print packing slip from dashboard
- Place inside package (not on outside)
- Include your contact info for questions

## What NOT to Do
- Don't reuse damaged boxes
- Don't use string or twine instead of tape
- Don't leave items loose in box
- Don't forget to include packing slip
- Don't ship without tracking number
```

## Shipping Disputes

### Lost Package Process

```typescript
// features/disputes/models/shipping-dispute.actions.ts
'use server'

export async function reportLostPackage(orderId: string) {
  const session = await requireAuth();
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { drop: { include: { curator: true } } },
  });
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  if (order.buyerId !== session.user.id) {
    throw new ForbiddenError('Not your order');
  }
  
  // Check if enough time has passed
  const daysSinceShipped = Math.floor(
    (Date.now() - order.shippedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const minDays = order.shippingMethod === 'STANDARD' ? 10 : 5;
  
  if (daysSinceShipped < minDays) {
    throw new ValidationError(
      `Please wait ${minDays} days before reporting lost package`
    );
  }
  
  // Create dispute
  const dispute = await db.dispute.create({
    data: {
      orderId,
      initiatedBy: session.user.id,
      reason: 'ITEM_NOT_RECEIVED',
      description: 'Package not received after expected delivery date',
      status: 'OPEN',
    },
  });
  
  // Notify curator to file claim with carrier
  await createNotification({
    userId: order.drop.curator.userId,
    type: 'LOST_PACKAGE',
    title: 'Lost Package Reported',
    message: `Buyer reports package not received for order ${order.orderNumber}`,
    link: `/curator/disputes/${dispute.id}`,
  });
  
  return { success: true, disputeId: dispute.id };
}
```

### Lost Package Resolution Process

When a lost package is reported:

1. **Dispute Created** - Buyer files "Item Not Received" dispute
2. **Curator Notified** - Curator has 48 hours to respond with:
   - Proof of shipment (tracking shows delivered)
   - Carrier claim filing (if package truly lost)
   - Alternative resolution offer
3. **Admin Review** - Platform reviews evidence from both parties
4. **Possible Outcomes:**
   - **Full Refund** - If package confirmed lost and no delivery proof
   - **Replacement** - Curator sends replacement item (if available)
   - **No Refund** - If tracking shows delivered to correct address
   - **Partial Refund** - If curator can prove partial delivery

**Refund Processing:**
- Refunds processed via Stripe within 5-7 business days
- Funds returned to original payment method
- Escrow releases refund to buyer, curator receives nothing
- Order status updated to "REFUNDED"

### Damaged in Transit

```typescript
// features/disputes/models/shipping-dispute.actions.ts
'use server'

export async function reportDamagedPackage(
  orderId: string,
  description: string,
  evidence: string[] // Photos of damage
) {
  const session = await requireAuth();
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { drop: { include: { curator: true } } },
  });
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  if (order.buyerId !== session.user.id) {
    throw new ForbiddenError('Not your order');
  }
  
  // Must report within 48 hours of delivery
  const hoursSinceDelivery = Math.floor(
    (Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60)
  );
  
  if (hoursSinceDelivery > 48) {
    throw new ValidationError(
      'Damage must be reported within 48 hours of delivery'
    );
  }
  
  // Require evidence
  if (!evidence || evidence.length === 0) {
    throw new ValidationError('Photos of damage required');
  }
  
  // Create dispute
  const dispute = await db.dispute.create({
    data: {
      orderId,
      initiatedBy: session.user.id,
      reason: 'ITEM_DAMAGED',
      description,
      evidence,
      status: 'OPEN',
    },
  });
  
  // Notify curator
  await createNotification({
    userId: order.drop.curator.userId,
    type: 'DAMAGE_REPORTED',
    title: 'Damage Reported',
    message: `Buyer reports item arrived damaged for order ${order.orderNumber}`,
    link: `/curator/disputes/${dispute.id}`,
  });
  
  return { success: true, disputeId: dispute.id };
}
```

### Damaged Package Resolution Process

When damage is reported:

1. **Dispute Created** - Buyer files "Item Damaged" dispute with photos
2. **48-Hour Window** - Must be reported within 48 hours of delivery
3. **Curator Review** - Curator reviews photos and responds with:
   - Acknowledgment of inadequate packaging
   - Evidence of proper packaging (if damage is carrier's fault)
   - Offer of partial refund or replacement
4. **Admin Decision** - Platform determines fault and resolution
5. **Possible Outcomes:**
   - **Full Refund** - If damage is severe and item unusable
   - **Partial Refund** - If item partially usable or repairable
   - **Replacement** - Curator sends replacement (if available and curator at fault)
   - **No Refund** - If damage is minor or buyer caused
   - **Carrier Claim** - Curator files claim with carrier, buyer receives refund once approved

**Refund Processing:**
- Same process as lost packages
- Refunds issued via Stripe to original payment method
- Curator may be required to improve packaging for future orders
- Repeated damage claims may affect curator standing

### Insurance Recommendations

**For Curators:**
- Consider shipping insurance for items over $100
- Insurance costs typically 1-3% of item value
- Protects against loss and damage claims
- Speeds up refund process (claim filed with carrier)
- Reduces financial impact of shipping issues

**Insurance Providers:**
- USPS Insurance (built into Priority Mail)
- UPS Insurance
- FedEx Insurance
- Third-party: Shipsurance, U-PIC

## Best Practices

- Ship within stated handling time (1-3 business days)
- Always provide tracking numbers
- Use appropriate packaging to prevent damage
- Include packing slip with order details
- Respond to shipping inquiries within 24 hours
- Mark orders as shipped promptly
- Use delivery confirmation for high-value items
- Consider insurance for expensive items
- Communicate delays proactively
- Keep shipping supplies stocked
- Print labels clearly and accurately
- Take photos of packaged items before shipping
- Save shipping receipts for records

## Common Mistakes to Avoid

- Shipping without tracking number
- Using inadequate packaging
- Not including packing slip
- Shipping late without communication
- Incorrect shipping address
- Not marking order as shipped in system
- Using damaged or reused boxes
- Insufficient padding for fragile items
- Not responding to shipping questions
- Forgetting to update tracking status
- No insurance on high-value items
- Poor label placement
