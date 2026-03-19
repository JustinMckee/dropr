# Dispute Resolution

## Overview
Structured dispute process for handling order issues, protecting buyers while ensuring fair treatment of makers.

## Requirements

### Dispute Types
- **Item Not Received**: Order not delivered within expected timeframe
- **Item Not as Described**: Product doesn't match listing
- **Damaged in Transit**: Item arrived damaged
- **Wrong Item**: Incorrect product shipped
- **Quality Issue**: Product defective or poor quality

### Dispute Process
1. **Member Opens Dispute**: Within 48 hours of delivery (or expected delivery date)
2. **Evidence Submission**: Both parties upload photos, messages, tracking info
3. **Maker Response**: 48 hours to respond with resolution offer
4. **Arbitration**: All negotiation facilitated by platform arbitrator (specialized admin role)
5. **Arbitrator Review**: Arbitrator reviews evidence and facilitates resolution
6. **Resolution**: Refund, partial refund, replacement, or dispute closed

### Dispute States
- **Open**: Newly filed, awaiting maker response
- **Under Arbitration**: Assigned to arbitrator, facilitated negotiation in progress
- **Resolved**: Agreement reached or arbitrator decision made
- **Closed**: Completed with outcome recorded

### Resolution Options
- Full refund (funds returned to member)
- Partial refund (agreed amount)
- Replacement shipment (new tracking required)
- Dispute rejected (no action, funds released to maker)

### Impact on Reputation
- Resolved disputes: Minimal impact if maker responds promptly
- Arbitrator-decided disputes: Impact based on outcome and maker responsiveness
- Member-fault disputes: No impact on maker
- Repeated disputes: Maker account review

## Design

### Data Models

```typescript
Dispute {
  id: string
  orderId: string (FK)
  memberId: string (FK)
  makerId: string (FK)
  arbitratorId: string? (FK to User with arbitrator role)
  
  type: 'not_received' | 'not_as_described' | 'damaged' | 'wrong_item' | 'quality_issue'
  status: 'open' | 'under_arbitration' | 'resolved' | 'closed'
  
  memberDescription: string
  memberEvidence: string[] // photo URLs
  
  makerResponse: string?
  makerEvidence: string[]?
  makerRespondedAt: datetime?
  
  arbitratorNotes: string?
  arbitratorDecision: string?
  arbitratorDecidedAt: datetime?
  assignedToArbitratorAt: datetime?
  
  resolution: 'full_refund' | 'partial_refund' | 'replacement' | 'rejected'?
  refundAmount: decimal?
  
  createdAt: datetime
  updatedAt: datetime
  resolvedAt: datetime?
}

DisputeMessage {
  id: string
  disputeId: string (FK)
  senderId: string (FK)
  senderRole: 'member' | 'maker' | 'arbitrator'
  recipientRole: 'arbitrator' | 'all' // arbitrator sees all, parties only see their own + arbitrator messages
  
  message: string
  attachments: string[]?
  
  createdAt: datetime
}
```

### Business Rules

1. **Filing Deadlines**
   - Item not received: Within 7 days of expected delivery
   - Other disputes: Within 48 hours of delivery confirmation
   - Cannot dispute after leaving 4-5 star review

2. **Arbitration Process**
   - Maker must respond within 48 hours or dispute auto-assigned to arbitrator
   - All communication goes through arbitrator (no direct member-maker messaging)
   - Arbitrator facilitates negotiation and proposes resolutions
   - Arbitrator makes final decision if parties cannot agree within 5 days

3. **Refund Processing**
   - Full refund: Entire amount returned, maker receives nothing
   - Partial refund: Agreed split, remainder to maker
   - Replacement: Original funds held until new delivery confirmed

4. **Reputation Impact**
   - Resolved without arbitrator decision: -2 reputation points
   - Arbitrator decides in member's favor: -10 reputation points
   - Arbitrator decides in maker's favor: No impact
   - Multiple disputes (3+ in 30 days): Account review

### Server Actions & Routes

**Dispute Routes & Actions:**
- `app/(users)/disputes/` - List user disputes (SSR)
- `app/(users)/disputes/[id]/` - Dispute detail page (SSR)
  - `actions.ts`: `createDisputeAction()` - File new dispute
  - `actions.ts`: `respondToDisputeAction()` - Maker response
  - `actions.ts`: `sendDisputeMessageAction()` - Send message
- `app/(makers)/disputes/` - Maker disputes dashboard (SSR)
- `app/(admin)/disputes/` - Admin dispute management (SSR)
  - `actions.ts`: `assignArbitratorAction()` - Assign arbitrator
  - `actions.ts`: `proposeResolutionAction()` - Arbitrator proposes resolution
  - `actions.ts`: `acceptResolutionAction()` - Accept proposed resolution
  - `actions.ts`: `resolveDisputeAction()` - Finalize dispute

**Webhook:**
- `app/api/webhooks/disputes/route.ts` - External dispute notifications (if needed)

## Implementation Tasks

- [ ] Create Dispute and DisputeMessage schemas
- [ ] Build dispute filing form for members
- [ ] Implement evidence upload (photos)
- [ ] Create dispute detail page with timeline
- [ ] Build maker response form
- [ ] Implement arbitrator-mediated messaging system
- [ ] Create arbitrator assignment logic (auto-assign on maker response or timeout)
- [ ] Build arbitrator dispute dashboard
- [ ] Create resolution proposal flow (arbitrator-initiated)
- [ ] Implement automated arbitrator assignment (cron job)
- [ ] Add refund processing for disputes
- [ ] Create dispute notification system (email)
- [ ] Build dispute history views
- [ ] Implement reputation impact calculation
- [ ] Add dispute analytics for makers and arbitrators
- [ ] Create dispute status tracking

## Acceptance Criteria

- Members can file disputes within deadline
- Evidence uploads work correctly
- Makers notified immediately of new disputes
- Maker response deadline enforced (48 hours)
- Arbitrator auto-assigned after maker response or timeout
- All messaging goes through arbitrator (no direct member-maker contact)
- Arbitrator can propose resolutions
- Parties can accept or reject arbitrator proposals
- Arbitrator makes final decision if no agreement
- Refunds process correctly based on resolution
- Reputation scores update after dispute
- Email notifications sent at each stage
- Dispute history accessible to both parties
- Arbitrators can view assigned disputes only

## Out of Scope for MVP

- Dispute mediation chat (real-time)
- Member dispute history score
- Automated dispute resolution (AI)
- Dispute templates for common issues
- Dispute appeal process
- Third-party arbitration
- Chargeback handling
