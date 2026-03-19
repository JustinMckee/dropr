# Fulfillment & Shipment Tracking

## Overview
Order fulfillment system with shipment tracking, delivery confirmation, and automated funds release tied to delivery status.

## Requirements

### Order Management
- Order creation on successful payment
- Order status tracking
- Shipping address management
- Order history for buyers and makers
- Order details (items, quantities, prices)

### Order States
- **Pending**: Payment complete, awaiting maker action
- **Processing**: Maker preparing shipment
- **Shipped**: Tracking number provided, in transit
- **Delivered**: Confirmed delivery
- **Completed**: Funds released, order closed
- **Cancelled**: Order cancelled (pre-shipment only)
- **Disputed**: Under dispute resolution

### Fulfillment Features
- Maker marks order as processing
- Maker uploads tracking number
- Automatic tracking status updates (via shipping API)
- Delivery confirmation (automatic or buyer-confirmed)
- Estimated delivery date calculation
- Late shipment warnings

### Member Experience
- View order status in real-time
- Track shipment with carrier link
- Confirm delivery manually
- Request refund if not delivered on time
- View order history with filters

### Maker Experience
- View pending orders dashboard
- Mark orders as processing
- Add tracking numbers (bulk or individual)
- View fulfillment metrics (on-time %, avg ship time)
- Download shipping labels (future: integrate with ShipStation)

## Design

### Data Models

```typescript
Order {
  id: string
  memberId: string (FK)
  makerId: string (FK)
  productId: string (FK)
  transactionId: string (FK)
  
  quantity: int
  totalAmount: decimal
  
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
  
  shippingAddress: json {
    name: string
    line1: string
    line2: string?
    city: string
    state: string
    postalCode: string
    country: string
  }
  
  estimatedShipDate: date
  estimatedDeliveryDate: date?
  
  createdAt: datetime
  updatedAt: datetime
}

Shipment {
  id: string
  orderId: string (FK, unique)
  
  carrier: string // USPS, UPS, FedEx, etc.
  trackingNumber: string
  trackingUrl: string
  
  shippedAt: datetime
  estimatedDeliveryDate: date?
  deliveredAt: datetime?
  
  lastTrackingUpdate: datetime?
  trackingStatus: string? // in_transit, out_for_delivery, delivered, etc.
  
  createdAt: datetime
  updatedAt: datetime
}

FulfillmentMetrics {
  makerId: string (FK, unique)
  
  totalOrders: int
  pendingOrders: int
  shippedOrders: int
  deliveredOrders: int
  
  avgShipTimeHours: float
  onTimeShipmentRate: float // % shipped by estimated date
  
  updatedAt: datetime
}
```

### Business Rules

1. **Shipment Deadlines**
   - Maker must ship within estimated ship days + 7 day grace period
   - Late shipment triggers member notification
   - Automatic refund if not shipped within deadline + 3 days

2. **Delivery Confirmation**
   - Automatic via carrier tracking API (preferred)
   - Manual member confirmation (if tracking unavailable)
   - Auto-confirm 7 days after estimated delivery if no disputes

3. **Funds Release Triggers** (ties to payment spec)
   - Delivered status confirmed → 7 day hold → release
   - Member confirms delivery → immediate release
   - No tracking + 14 days after estimated delivery → release

### Server Actions & Routes

**Order Routes & Actions:**
- `app/(users)/orders/` - Member order history (SSR)
- `app/(users)/orders/[id]/` - Order detail page (SSR)
  - `actions.ts`: `confirmDeliveryAction()` - Manually confirm delivery
  - `actions.ts`: `cancelOrderAction()` - Cancel pre-shipment order
- `app/(makers)/orders/` - Maker orders dashboard (SSR)
- `app/(makers)/orders/[id]/` - Order management (SSR)
  - `actions.ts`: `updateOrderStatusAction()` - Update order status
  - `actions.ts`: `addTrackingAction()` - Add tracking number
  - `actions.ts`: `bulkAddTrackingAction()` - Bulk tracking upload

**Webhooks:**
- `app/api/webhooks/tracking/route.ts` - Tracking status updates from carrier API

## Implementation Tasks

- [ ] Create Order, Shipment, FulfillmentMetrics schemas
- [ ] Build order creation flow (post-payment)
- [ ] Create maker orders dashboard
- [ ] Implement order status updates
- [ ] Build tracking number upload form
- [ ] Integrate tracking API (EasyPost or AfterShip)
- [ ] Create tracking status display for members
- [ ] Implement delivery confirmation (auto and manual)
- [ ] Build automated late shipment detection (cron job)
- [ ] Create fulfillment metrics calculation
- [ ] Add order history pages (member and maker)
- [ ] Implement order cancellation (pre-shipment)
- [ ] Build tracking webhook handler
- [ ] Create email notifications for status changes
- [ ] Add bulk tracking upload for makers

## Acceptance Criteria

- Orders created automatically on payment success
- Makers can update order status to processing
- Makers can add tracking numbers
- Tracking status updates automatically via API
- Members see real-time tracking information
- Delivery confirmation triggers funds release
- Late shipments detected and flagged
- Members notified of status changes via email
- Order history displays correctly
- Fulfillment metrics calculate accurately
- Members can confirm delivery manually
- Pre-shipment cancellations process refunds

## Out of Scope for MVP

- Shipping label generation
- Multi-package orders
- Partial shipments
- International customs forms
- Shipping insurance
- Return/exchange management
- Bulk order management tools
