# Pre-orders

## Overview
Pre-order system for products not yet ready to ship, with escrow-based payment holding, estimated ship dates, and maker accountability for delivery timelines.

## Requirements

### Pre-order Mechanics
- **Estimated Ship Date**: Future date when product will be ready (max 90 days out)
- **Payment Upfront**: Full payment collected at time of order
- **Escrow Holding**: Funds held until shipment confirmation
- **Quantity Limits**: Optional inventory caps for pre-orders
- **Ship Date Updates**: Maker can update once with member notification

### Pre-order States
- **Draft**: Being created, not visible to public
- **Pending Approval**: Submitted for admin review
- **Active**: Approved and accepting pre-orders
- **Closed**: No longer accepting orders (reached limit or maker closed)
- **In Production**: Maker preparing products for shipment
- **Shipping**: Orders being fulfilled
- **Completed**: All pre-orders shipped and delivered

### Member Experience
- Browse active pre-orders
- See estimated ship date clearly displayed
- Receive updates on ship date changes
- Track order once shipped
- Request refund if ship date exceeded by 7+ days

### Maker Experience
- Create pre-order in draft state
- Submit for admin approval
- Cannot delete active pre-orders (platform rating penalty)
- Set optional quantity limits
- Update ship date once (with notification to all pre-order members)
- Mark when production begins
- Fulfill orders and upload tracking
- View pre-order analytics (total orders, revenue held in escrow)
- Past pre-orders visible on maker profile (builds trust)

## Design

### Data Models

```typescript
Preorder {
  id: string
  slug: string // unique URL slug, locked once approved
  productId: string (FK)
  makerId: string (FK to User)
  
  estimatedShipDate: date
  originalEstimatedShipDate: date // track if changed
  shipDateUpdated: boolean
  shipDateUpdatedAt: datetime?
  
  maxQuantity: int? // optional cap
  currentOrders: int
  
  status: 'draft' | 'pending_approval' | 'active' | 'closed' | 'in_production' | 'shipping' | 'completed'
  
  // Admin approval
  approvedBy: string? (FK to User with admin role)
  approvedAt: datetime?
  rejectionReason: string?
  
  // Media
  images: string[] // URLs
  videoUrl: string? // uploaded video
  
  createdAt: datetime
  updatedAt: datetime
}

PreorderOrder {
  id: string
  preorderId: string (FK)
  orderId: string (FK)
  memberId: string (FK)
  
  orderDate: datetime
  estimatedShipDateAtOrder: date // snapshot of ship date when ordered
  actualShipDate: date?
  
  status: 'pending' | 'in_production' | 'shipped' | 'delivered' | 'refunded'
  
  createdAt: datetime
  updatedAt: datetime
}
```

### Business Rules

1. **Draft & Approval**
   - Pre-orders created in draft state
   - Maker submits for admin approval
   - Admin approves or rejects with reason
   - Once approved, URL (slug) is locked and cannot change
   - Deleting active pre-orders incurs platform rating penalty

2. **Ship Date Constraints**
   - Estimated ship date must be within 90 days of pre-order creation
   - Maker can update ship date once (max 30 days extension)
   - All pre-order members notified of ship date changes
   - Auto-refund if maker doesn't ship within estimated date + 7 days grace period

3. **Payment & Escrow**
   - Full payment collected at time of pre-order
   - Funds held in escrow until shipment
   - Funds released 7 days after delivery confirmation
   - Member can request refund if ship date exceeded

4. **Status Transitions**
   - `draft` → `pending_approval` (maker submits)
   - `pending_approval` → `active` (admin approves)
   - `pending_approval` → `draft` (admin rejects)
   - `active` → `closed` (max quantity reached or maker closes)
   - `closed` → `in_production` (maker marks production started)
   - `in_production` → `shipping` (first order ships)
   - `shipping` → `completed` (all orders delivered)

5. **Quantity Management**
   - Optional max quantity (unlimited if not set)
   - Pre-orders close when max reached
   - No inventory reservation timeout (committed purchase)

6. **Completed Pre-order Pages**
   - Completed pre-orders remain accessible (archived state)
   - Past pre-orders visible on maker profile
   - SEO: archived content approach

7. **Rating Systems**
   - **Seller Rating**: Public, based on reviews and fulfillment
   - **Platform Rating**: Internal, affects maker privileges (pre-order deletion penalty)

### Server Actions & Routes

**Pre-order Routes & Actions:**
- `app/(makers)/preorders/` - Maker pre-orders dashboard (SSR)
- `app/(makers)/preorders/create/` - Create new pre-order
  - `actions.ts`: `createPreorderAction()` - Create pre-order in draft
  - `actions.ts`: `submitForApprovalAction()` - Submit for admin review
- `app/(makers)/preorders/[id]/edit/` - Edit draft pre-order
  - `actions.ts`: `updatePreorderAction()` - Update pre-order details
  - `actions.ts`: `deletePreorderAction()` - Delete pre-order (with penalty if active)
  - `actions.ts`: `updateShipDateAction()` - Update ship date (once only)
  - `actions.ts`: `updateStatusAction()` - Update pre-order status
- `app/preorders/` - Browse pre-orders (SSR)
- `app/preorders/[slug]/` - Pre-order detail page (SSR)
  - `actions.ts`: `placePreorderAction()` - Purchase pre-order
  - `actions.ts`: `requestRefundAction()` - Request refund for late pre-order
- `app/(admin)/preorders/pending/` - Admin approval queue (SSR)
  - `actions.ts`: `approvePreorderAction()` - Approve pre-order
  - `actions.ts`: `rejectPreorderAction()` - Reject pre-order
- `app/(users)/preorders/` - Member pre-order tracking (SSR)

**Automated Actions:**
- Cron job for auto-refund on missed ship dates

## Implementation Tasks

- [ ] Create Preorder and PreorderOrder schemas with approval fields
- [ ] Build pre-order creation form for makers (draft state)
- [ ] Implement image and video upload for pre-orders
- [ ] Add unique slug generation (locked once approved)
- [ ] Build admin approval queue and interface
- [ ] Create approval/rejection workflow
- [ ] Implement platform rating system (shared with drops)
- [ ] Add penalty logic for pre-order deletion
- [ ] Implement ship date validation (90 day max)
- [ ] Create pre-orders listing page
- [ ] Build pre-order detail page with ship date prominence
- [ ] Implement pre-order purchase flow
- [ ] Add ship date update functionality (one-time only)
- [ ] Create notification system for ship date changes
- [ ] Build maker pre-order dashboard
- [ ] Implement status management (production, shipping)
- [ ] Add automated refund for missed ship dates (cron job)
- [ ] Create pre-order analytics for makers
- [ ] Build member pre-order tracking page
- [ ] Implement refund request flow
- [ ] Create past pre-orders section on maker profile
- [ ] Implement completed pre-order archive pages
- [ ] Add SEO handling for completed pre-orders
- [ ] Add email notifications for status changes and approvals

## Acceptance Criteria

- Makers can create pre-orders in draft state
- Pre-orders support image and video uploads
- Makers can submit pre-orders for admin approval
- Admins can approve or reject pre-orders
- Unique slug generated and locked once approved
- Approved pre-orders cannot have URL changed
- Deleting active pre-orders incurs platform rating penalty
- Makers can create pre-orders with ship dates up to 90 days out
- Ship date prominently displayed on pre-order pages
- Members can purchase pre-orders with full payment
- Funds held in escrow until shipment
- Makers can update ship date once (max 30 day extension)
- All pre-order members notified of ship date changes
- Auto-refund triggers if ship date + 7 days exceeded
- Members can request refunds for late pre-orders
- Maker dashboard shows escrow balance
- Status transitions work correctly
- Pre-orders close when max quantity reached
- Past pre-orders visible on maker profile page
- Completed pre-orders show archived page
- SEO properly handled for completed pre-orders
- Email notifications sent for all status changes and approvals

## Out of Scope for MVP

- Partial pre-order fulfillment (waves)
- Pre-order deposits (partial payment)
- Pre-order cancellation by maker (with refunds)
- Pre-order waitlist
- Tiered pre-order pricing (early bird discounts)
- Pre-order exclusive perks or bonuses
