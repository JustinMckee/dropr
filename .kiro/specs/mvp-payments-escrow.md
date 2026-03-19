# Payments & Escrow System

## Overview
Integrated payment processing with escrow-like funds holding for pre-orders and drops, ensuring member protection and maker accountability.

## Requirements

### Payment Processing
- Stripe integration for card payments
- Support one-time purchases
- Support pre-order payments (funds held)
- Platform fee calculation (e.g., 5-10% + Stripe fees)
- Automatic payout to makers

### Escrow Mechanics
- **Standard Products**: Immediate payout to maker (minus fees)
- **Pre-orders/Drops**: Funds held until delivery confirmed
- **Funds Release Triggers**:
  - Member confirms delivery
  - Auto-release after 7 days of delivery confirmation
  - Maker provides tracking + 7 days elapsed

### Transaction States
- **Pending**: Payment authorized, not captured
- **Held**: Payment captured, held in escrow
- **Released**: Funds transferred to maker
- **Refunded**: Full or partial refund issued
- **Disputed**: Under dispute resolution

### Member Protection
- Refund requests within 48 hours of delivery
- Dispute filing if item not as described
- Automatic refund if maker doesn't ship within promised timeframe + 7 days grace period

### Maker Payouts
- Stripe Connect for maker accounts
- Weekly payout schedule (or on-demand for established makers)
- Payout dashboard showing pending/released funds
- Transaction history with fees breakdown

## Design

### Data Models

```typescript
Transaction {
  id: string
  orderId: string (FK)
  memberId: string (FK)
  makerId: string (FK)
  
  amount: decimal // total paid by member
  platformFee: decimal
  stripeFee: decimal
  makerPayout: decimal // amount - fees
  
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  
  stripePaymentIntentId: string
  stripeTransferId: string? // when released to maker
  
  heldAt: datetime?
  releasedAt: datetime?
  refundedAt: datetime?
  
  createdAt: datetime
  updatedAt: datetime
}

MakerStripeAccount {
  userId: string (FK)
  stripeAccountId: string
  onboardingComplete: boolean
  payoutsEnabled: boolean
  createdAt: datetime
}

Payout {
  id: string
  makerId: string (FK)
  amount: decimal
  transactionIds: string[] // transactions included
  stripePayoutId: string
  status: 'pending' | 'paid' | 'failed'
  paidAt: datetime?
  createdAt: datetime
}
```

### Business Rules

1. **Platform Fee Structure**
   - 8% platform fee + Stripe fees (~2.9% + $0.30)
   - Calculated at checkout
   - Deducted before maker payout

2. **Escrow Release Conditions**
   - Standard products: Immediate release
   - Pre-orders/Drops with tracking:
     - Maker uploads tracking number
     - Auto-release 7 days after delivery confirmation
   - Pre-orders/Drops without tracking:
     - Member confirms receipt → immediate release
     - Auto-release 7 days after member confirmation
     - If no confirmation: auto-release 14 days after estimated delivery date

3. **Refund Policy**
   - Full refund if maker doesn't ship within (estimated days + 7 days grace)
   - Member can request refund within 48 hours of delivery
   - Disputed items: funds held until resolution

### Server Actions & Routes

**Payment Routes & Actions:**
- `app/checkout/` - Checkout page (SSR)
  - `actions.ts`: `createPaymentIntentAction()` - Initialize Stripe payment
  - `actions.ts`: `confirmPaymentAction()` - Confirm payment completion
- `app/(makers)/payouts/` - Maker payout dashboard (SSR)
- `app/(makers)/payouts/connect-stripe/` - Stripe Connect onboarding
  - `actions.ts`: `connectStripeAction()` - Initialize Stripe Connect
- `app/(users)/transactions/` - Transaction history (SSR)
- `app/(makers)/transactions/` - Maker transaction history (SSR)

**Admin Actions:**
- `app/(admin)/transactions/[id]/` - Transaction management
  - `actions.ts`: `releaseEscrowAction()` - Manually release funds
  - `actions.ts`: `refundTransactionAction()` - Process refund

**Webhooks:**
- `app/api/webhooks/stripe/route.ts` - Stripe webhook events

## Implementation Tasks

- [ ] Set up Stripe account and API keys
- [ ] Implement Stripe Connect for maker accounts
- [ ] Create Transaction, MakerStripeAccount, Payout schemas
- [ ] Build checkout flow with Stripe Payment Intents
- [ ] Implement platform fee calculation
- [ ] Create escrow holding logic for pre-orders/drops
- [ ] Build automated funds release system (cron job)
- [ ] Implement manual release for delivery confirmation
- [ ] Create refund processing functionality
- [ ] Build maker Stripe onboarding flow
- [ ] Create maker payout dashboard
- [ ] Build transaction history views (member and maker)
- [ ] Add webhook handlers for Stripe events
- [ ] Implement payout scheduling system

## Acceptance Criteria

- Members can complete checkout with credit card
- Platform fee correctly calculated and displayed
- Standard product payments immediately released to maker
- Pre-order payments held in escrow
- Funds auto-release 7 days after delivery confirmation
- Makers can connect Stripe account
- Makers see pending vs released funds
- Refunds process correctly
- Transaction history accurate for both parties
- Stripe webhooks handled properly
- Payouts scheduled and executed weekly

## Out of Scope for MVP

- Multiple payment methods (PayPal, crypto)
- Installment payments
- Maker subscription fees (platform is transaction-fee based)
- Member payment methods saved for future use
- Split payments for bundles
- Dynamic pricing or discounts
