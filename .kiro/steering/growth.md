---
inclusion: manual
---
# Growth Strategy

## Philosophy

Grow thoughtfully by validating each phase before expanding. Start with one-time drops to prove the marketplace model, then layer in subscriptions to create recurring revenue. Prioritize curator success and buyer satisfaction over rapid growth. Each new feature should strengthen the core value proposition: curated quality, community trust, and maker empowerment.

## Growth Checklist

**Phase 1 (MVP - One-Time Drops):**
- [ ] Prove marketplace model with limited drops
- [ ] Validate curator verification process
- [ ] Establish trust mechanisms (escrow, ratings)
- [ ] Build initial community in 1-2 collectives
- [ ] Achieve product-market fit
- [ ] Reach profitability on drop transactions

**Phase 2 (Recurring Subscriptions):**
- [ ] Launch subscription creation for curators
- [ ] Implement recurring billing (Stripe Subscriptions)
- [ ] Build subscription management features
- [ ] Test with power curators first
- [ ] Validate subscription retention rates
- [ ] Expand to all verified curators

**Phase 3 (Future Considerations):**
- [ ] International expansion
- [ ] Additional payment methods
- [ ] Mobile apps
- [ ] Curator collaboration tools
- [ ] Advanced analytics and insights
- [ ] API for third-party integrations

## Phase 1: One-Time Drops (MVP)

### Goal
Validate the core marketplace model: Can we create a trusted platform where curators successfully sell limited drops to engaged buyers?

### Success Metrics
- 50+ verified curators
- 1,000+ active buyers
- 80%+ sell-through rate on drops
- 4.5+ average curator rating
- 30%+ repeat purchase rate
- Positive unit economics (profitable per transaction)

### Key Features
- Drop creation and management
- Countdown timers and real-time inventory
- Escrow-protected payments
- Curator verification and reputation
- Email notifications
- Basic analytics for curators

### Exit Criteria
Before moving to Phase 2, we must achieve:
1. Consistent sell-through rates (80%+)
2. Strong curator retention (70%+ create multiple drops)
3. Buyer satisfaction (4.5+ platform rating)
4. Profitable unit economics
5. Clear demand signals for subscriptions from curators

## Phase 2: Recurring Subscriptions

### Goal
Enable curators to build sustainable businesses with predictable recurring revenue while giving buyers regular curated shipments.

### Why Subscriptions?
- **For Curators:** Predictable revenue, deeper customer relationships, reduced marketing effort
- **For Buyers:** Regular discovery, better value over time, convenience
- **For Platform:** Recurring revenue, higher LTV, stronger retention

### Subscription Model

**Cadence Options:**
- Monthly subscriptions (for frequent makers/modders)
- Quarterly subscriptions (aligned with "time to make" and "time to mod")

**Duration Options:**
- 3 months (trial commitment)
- 6 months (standard commitment)
- 9 months (3 quarters, extended commitment)
- 12 months (annual commitment)

**Pricing Tiers:**
- Starter: $25-35/month or $75-100/quarter
- Enthusiast: $40-60/month or $120-180/quarter
- Premium: $75-100/month or $225-300/quarter

### Technical Requirements

**Curator Tools:**
- Subscription creation flow
- Cadence selection (monthly/quarterly)
- Duration definition (3, 6, 9, 12 months)
- Pricing per tier
- Inventory management per shipment
- Subscription analytics dashboard

**Buyer Experience:**
- Subscription browsing and filtering
- Clear value expectations per tier
- Subscription management (pause, cancel, upgrade)
- Shipment tracking
- Subscription history

**Payment Infrastructure:**
- Stripe Subscriptions integration
- Recurring billing automation
- Proration for upgrades/downgrades
- Cancellation and refund handling
- Failed payment retry logic

**Curator Payouts:**
- Monthly payout schedule
- Subscription revenue tracking
- Churn analytics
- Retention metrics

### Rollout Strategy

**Stage 1: Closed Beta (2-3 months)**
- Invite 5-10 power curators
- Test subscription creation and management
- Validate billing and payout flows
- Gather feedback and iterate
- Target: 50-100 subscribers

**Stage 2: Open to Verified Curators (3-6 months)**
- Open subscriptions to all verified curators
- Marketing push to existing buyer base
- Monitor retention and churn rates
- Optimize subscription tiers and pricing
- Target: 500+ active subscriptions

**Stage 3: Scale (6+ months)**
- Expand marketing to new buyers
- Add advanced features (gifting, pausing, etc.)
- Optimize for retention and LTV
- Target: 2,000+ active subscriptions

### Success Metrics

**Curator Metrics:**
- 30%+ of curators offer subscriptions
- 70%+ subscription retention after 3 months
- $500+ average monthly recurring revenue per curator

**Buyer Metrics:**
- 20%+ of buyers subscribe
- 60%+ renewal rate after initial commitment
- 4.5+ subscription satisfaction rating

**Platform Metrics:**
- 40%+ of revenue from subscriptions
- 3x higher LTV for subscribers vs. one-time buyers
- Positive contribution margin on subscriptions

### Exit Criteria

Before considering Phase 3:
1. Subscriptions represent 40%+ of platform revenue
2. Strong retention rates (60%+ renewal)
3. Curator satisfaction with subscription tools
4. Profitable subscription economics
5. Clear demand signals for next expansion

## Phase 3: Future Expansion (TBD)

### Potential Directions

**Geographic Expansion:**
- International shipping
- Multi-currency support
- Localized payment methods
- Regional curator networks

**Platform Features:**
- Mobile apps (iOS/Android)
- Curator collaboration tools
- Advanced analytics and insights
- API for third-party integrations
- White-label solutions for brands

**New Revenue Streams:**
- Premium curator accounts
- Featured placement marketplace
- Advertising for relevant brands
- Data insights for manufacturers

**Community Features:**
- Buyer forums and reviews
- Curator showcases and interviews
- Live drop events
- Community voting on future drops

### Decision Framework

Before pursuing any Phase 3 initiative, ask:
1. Does it strengthen the core value proposition?
2. Do curators and buyers want it?
3. Can we execute it well with current resources?
4. Will it improve unit economics?
5. Does it align with our brand and mission?

## Growth Principles

### 1. Curator-First Growth

Curators are the supply side. Their success determines platform success.

**Priorities:**
- Provide tools that make curation easier
- Ensure fair and transparent fees
- Offer analytics to improve performance
- Build community among curators
- Celebrate curator achievements

### 2. Quality Over Quantity

Don't sacrifice curation quality for growth.

**Guardrails:**
- Maintain strict curator verification
- Monitor drop quality and buyer satisfaction
- Remove low-performing curators
- Limit drop volume per curator
- Enforce content guidelines

### 3. Community-Driven Expansion

Let the community guide which collectives to expand into.

**Approach:**
- Start with 1-2 collectives (Mod, Make, or Mini)
- Validate product-market fit
- Expand to additional collectives based on demand
- Don't force expansion into unproven niches

### 4. Sustainable Economics

Ensure healthy unit economics at every phase.

**Metrics to Monitor:**
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- LTV:CAC ratio (target 3:1 minimum)
- Contribution margin per transaction
- Curator retention and repeat drops
- Buyer retention and repeat purchases

### 5. Technical Scalability

Build for current scale, plan for next scale.

**Infrastructure:**
- Optimize for current traffic (don't over-engineer)
- Monitor performance and bottlenecks
- Scale infrastructure as needed
- Maintain fast page loads and responsiveness
- Plan for 10x growth, not 100x

## Risk Mitigation

### Curator Churn Risk

**Risk:** Curators leave for other platforms or stop creating drops.

**Mitigation:**
- Competitive fee structure
- Superior tools and analytics
- Strong community and support
- Transparent communication
- Regular feedback loops

### Buyer Trust Risk

**Risk:** Quality issues or scams damage platform reputation.

**Mitigation:**
- Strict curator verification
- Escrow protection
- Clear value expectations
- Responsive customer support
- Transparent dispute resolution

### Subscription Fatigue Risk

**Risk:** Buyers cancel subscriptions due to fatigue or budget constraints.

**Mitigation:**
- Flexible pause options
- Easy cancellation (build trust)
- High-quality curation
- Surprise and delight elements
- Regular communication from curators

### Competition Risk

**Risk:** Larger platforms or new entrants compete for same audience.

**Mitigation:**
- Focus on niche communities
- Build strong curator relationships
- Maintain quality standards
- Innovate on features
- Strengthen brand identity

## Metrics Dashboard

### North Star Metric
**Gross Merchandise Value (GMV)** - Total value of all transactions (drops + subscriptions)

### Key Performance Indicators

**Curator Health:**
- Active curators (created drop in last 30 days)
- Average drops per curator per month
- Curator retention rate (90-day)
- Average curator revenue

**Buyer Health:**
- Active buyers (purchased in last 30 days)
- Repeat purchase rate
- Average order value
- Buyer retention rate (90-day)

**Marketplace Health:**
- Drop sell-through rate
- Average time to sell out
- Curator rating average
- Buyer satisfaction score

**Financial Health:**
- GMV growth rate
- Revenue (platform fees)
- Contribution margin
- CAC and LTV
- LTV:CAC ratio

**Subscription Health (Phase 2):**
- Active subscriptions
- Monthly recurring revenue (MRR)
- Churn rate
- Renewal rate
- Subscription LTV

## Resources and Team

### Phase 1 Team (MVP)
- 1 Product Manager
- 2 Full-Stack Engineers
- 1 Designer
- 1 Community Manager
- 1 Customer Support

### Phase 2 Team (Subscriptions)
- Add: 1 Backend Engineer (billing/subscriptions)
- Add: 1 Marketing Manager
- Add: 1 Data Analyst
- Expand: Customer Support to 2

### Phase 3 Team (Expansion)
- Scale based on specific initiatives
- Consider specialized roles (mobile, international, etc.)

## Timeline

**Phase 1 (Months 1-12):**
- Months 1-3: Build MVP
- Months 4-6: Launch and iterate
- Months 7-12: Achieve product-market fit

**Phase 2 (Months 13-24):**
- Months 13-15: Build subscription features
- Months 16-18: Closed beta with power curators
- Months 19-24: Open to all curators and scale

**Phase 3 (Months 25+):**
- Evaluate based on Phase 2 success
- Prioritize based on community feedback
- Expand thoughtfully

## Conclusion

Growing Dropr is about validating each phase before moving to the next. Start with one-time drops to prove the marketplace model, then layer in subscriptions to create recurring revenue. Always prioritize curator success, buyer satisfaction, and community trust over rapid growth. Build a sustainable business that serves maker communities for the long term.
