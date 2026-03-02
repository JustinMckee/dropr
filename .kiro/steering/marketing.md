---
inclusion: manual
---

# Marketing

## Philosophy

Marketing for Dropr focuses on community-driven growth, curator empowerment, and authentic discovery. Leverage email for drop announcements and engagement, social media for community building, and referrals for organic growth. Marketing should feel like curation, not advertising—highlight real drops, real curators, and real community members. Measure what matters: curator applications, drop participation, and repeat purchases.

## Marketing Checklist

**Email Marketing:**
- [ ] Welcome email series (buyer and curator)
- [ ] Drop announcement emails
- [ ] Weekly digest (personalized)
- [ ] Abandoned cart recovery
- [ ] Re-engagement campaigns
- [ ] Curator milestone emails
- [ ] Unsubscribe management

**Social Media:**
- [ ] Drop announcements (Twitter, Instagram)
- [ ] Curator spotlights
- [ ] Unboxing content (user-generated)
- [ ] Behind-the-scenes (curator stories)
- [ ] Community highlights
- [ ] Platform updates

**Referral Program:**
- [ ] Buyer referral rewards ($10 credit)
- [ ] Curator referral rewards (fee discount)
- [ ] Unique referral links
- [ ] Referral tracking
- [ ] Reward fulfillment

**Promotional Codes:**
- [ ] First-time buyer discounts
- [ ] Curator-specific codes
- [ ] Seasonal promotions
- [ ] Influencer partnerships
- [ ] Abandoned cart codes

**Content Marketing:**
- [ ] Curator interviews
- [ ] Drop creation guides
- [ ] Community spotlights
- [ ] Category deep-dives
- [ ] Platform updates blog

**Paid Acquisition:**
- [ ] Google Ads (search)
- [ ] Facebook/Instagram Ads
- [ ] Reddit Ads (targeted communities)
- [ ] Influencer partnerships
- [ ] Retargeting campaigns


## Email Marketing

### Welcome Email Series

**Buyer Welcome (3 emails):**

1. **Email 1: Welcome + Browse** (Immediate)
   - Subject: "Welcome to Dropr—Discover Curated Drops"
   - Content: Platform intro, how drops work, featured drops
   - CTA: Browse drops

2. **Email 2: How It Works** (Day 2)
   - Subject: "How Dropr Works: Mystery Boxes, Curated Bundles, and More"
   - Content: Drop types explained, curator verification, buyer protection
   - CTA: Follow favorite curators

3. **Email 3: First Purchase Incentive** (Day 5)
   - Subject: "Get $10 Off Your First Drop"
   - Content: Promo code, trending drops, testimonials
   - CTA: Use promo code

**Curator Welcome (3 emails):**

1. **Email 1: Welcome + Next Steps** (Immediate)
   - Subject: "Welcome to Dropr—Let's Create Your First Drop"
   - Content: Approval confirmation, platform overview, success tips
   - CTA: Create first drop

2. **Email 2: Drop Creation Guide** (Day 2)
   - Subject: "How to Create a Successful Drop"
   - Content: Best practices, pricing guide, examples
   - CTA: Start creating

3. **Email 3: Promotion Tips** (Day 5)
   - Subject: "How to Promote Your Drops"
   - Content: Social media tips, email templates, community engagement
   - CTA: Schedule first drop

### Drop Announcement Emails

```typescript
// lib/email/templates/drop-announcement.tsx
export function DropAnnouncementEmail({ drop, user }: {
  drop: Drop;
  user: User;
}) {
  return (
    <Email>
      <Head>
        <title>{drop.title} is Live!</title>
      </Head>
      <Body>
        <Container>
          <Heading>🔥 {drop.title} is Live!</Heading>
          
          <Img
            src={drop.coverImage}
            alt={drop.title}
            width="600"
            height="400"
          />
          
          <Text>
            {drop.curator.businessName} just launched a new drop you might like.
          </Text>
          
          <Section>
            <Row>
              <Column>
                <Text><strong>Price:</strong> ${drop.price}</Text>
              </Column>
              <Column>
                <Text><strong>Inventory:</strong> {drop.inventory} units</Text>
              </Column>
            </Row>
          </Section>
          
          {drop.minValue && (
            <Text>
              <strong>Minimum Value:</strong> ${drop.minValue}
            </Text>
          )}
          
          <Button href={`https://dropr.com/drops/${drop.slug}`}>
            View Drop
          </Button>
          
          <Text>
            This drop ends in {drop.duration} hours or when sold out.
          </Text>
          
          <Hr />
          
          <Text>
            <Link href="https://dropr.com/settings/notifications">
              Manage notification preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Email>
  );
}
```

### Weekly Digest

```typescript
// Send personalized weekly digest
export async function sendWeeklyDigest(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      following: {
        include: {
          curator: {
            include: {
              drops: {
                where: {
                  status: { in: ['SCHEDULED', 'LIVE'] },
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  
  const followedCuratorDrops = user.following.flatMap(f => f.curator.drops);
  const trendingDrops = await getTrendingDrops();
  const endingSoon = await getEndingSoonDrops();
  
  await sendEmail(user.email, {
    subject: 'Your Weekly Dropr Digest',
    template: 'weekly-digest',
    data: {
      userName: user.name,
      followedCuratorDrops,
      trendingDrops,
      endingSoon,
    },
  });
}
```

## Referral Program

### Database Schema

```prisma
model Referral {
  id          String   @id @default(cuid())
  referrerId  String
  referrer    User     @relation("Referrer", fields: [referrerId], references: [id])
  referredId  String   @unique
  referred    User     @relation("Referred", fields: [referredId], references: [id])
  
  code        String   @unique
  
  // Rewards
  referrerReward  Decimal? @db.Decimal(10, 2)
  referredReward  Decimal? @db.Decimal(10, 2)
  rewardClaimed   Boolean  @default(false)
  claimedAt       DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([referrerId])
  @@index([code])
}
```

### Referral Implementation

```typescript
// features/referrals/models/referral.actions.ts
'use server'

export async function generateReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId } });
  
  // Generate unique code from username or random
  const code = user.username
    ? `${user.username}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase()
    : Math.random().toString(36).substr(2, 8).toUpperCase();
  
  return code;
}

export async function applyReferralCode(code: string, newUserId: string) {
  const referrer = await db.user.findFirst({
    where: {
      referrals: {
        some: { code },
      },
    },
  });
  
  if (!referrer) {
    throw new NotFoundError('Invalid referral code');
  }
  
  // Create referral record
  await db.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: newUserId,
      code,
      referrerReward: 10.00, // $10 credit
      referredReward: 10.00, // $10 credit
    },
  });
  
  // Add credits to both users
  await db.user.update({
    where: { id: referrer.id },
    data: { credits: { increment: 10.00 } },
  });
  
  await db.user.update({
    where: { id: newUserId },
    data: { credits: { increment: 10.00 } },
  });
  
  return { success: true };
}
```

## Promotional Codes

```prisma
model PromoCode {
  id          String   @id @default(cuid())
  code        String   @unique
  
  type        PromoType
  value       Decimal  @db.Decimal(10, 2) // Amount or percentage
  
  // Restrictions
  minPurchase Decimal? @db.Decimal(10, 2)
  maxUses     Int?
  usesCount   Int      @default(0)
  perUser     Int      @default(1)
  
  // Validity
  validFrom   DateTime
  validUntil  DateTime
  active      Boolean  @default(true)
  
  // Targeting
  curatorId   String?  // Curator-specific code
  category    String?  // Category-specific
  
  createdAt   DateTime @default(now())
  
  @@index([code])
  @@index([active])
}

enum PromoType {
  FIXED_AMOUNT
  PERCENTAGE
  FREE_SHIPPING
}
```

## Social Media Strategy

### Drop Announcements

**Twitter/X:**
```
🔥 NEW DROP ALERT

[Drop Title] by @CuratorHandle

💰 $[Price] ([MinValue] value)
📦 [Inventory] units
⏰ Live for [Duration] hours

[Short description]

🔗 [Link]

#Dropr #[Category] #LimitedDrop
```

**Instagram:**
- Post: Drop cover image
- Caption: Drop details + curator tag
- Stories: Countdown sticker + swipe up
- Reels: Unboxing content (user-generated)

### Curator Spotlights

**Format:**
- Curator photo/workspace
- Brief bio and expertise
- Notable drops
- Social links
- "Follow on Dropr" CTA

**Frequency:** 2-3 per week

### User-Generated Content

**Encourage:**
- Unboxing photos/videos
- Drop reviews
- Curator testimonials
- Community builds/projects

**Incentivize:**
- Feature on official accounts
- Monthly UGC contest
- Credit rewards for best content

## Content Marketing

### Blog Topics

**For Buyers:**
- "How to Find the Best Mystery Boxes"
- "Meet the Curator: [Name]"
- "What's in a [Category] Drop?"
- "Dropr vs. Traditional Marketplaces"

**For Curators:**
- "How to Create Your First Drop"
- "Pricing Your Mystery Boxes"
- "Building Your Curator Brand"
- "Success Stories: [Curator Name]"

**Platform Updates:**
- New features announcements
- Category expansions
- Community milestones
- Transparency reports

## Paid Acquisition

### Google Ads

**Search Campaigns:**
- "mechanical keyboard mystery box"
- "miniature painting supplies"
- "diy electronics kit"
- "[category] curated box"

**Display Campaigns:**
- Retargeting (viewed drops, abandoned cart)
- Lookalike audiences
- Interest targeting (maker communities)

### Facebook/Instagram Ads

**Audiences:**
- Interest: Mechanical keyboards, 3D printing, miniatures, etc.
- Lookalike: Based on purchasers
- Retargeting: Website visitors, engaged users

**Creative:**
- Carousel: Multiple drop examples
- Video: Unboxing content
- Stories: Countdown timers

### Reddit Ads

**Subreddits:**
- r/MechanicalKeyboards
- r/3Dprinting
- r/Warhammer40k
- r/minipainting
- r/arduino

**Format:**
- Promoted posts (native)
- Authentic tone (not salesy)
- Community-focused messaging

## Analytics and Tracking

### Key Metrics

**Acquisition:**
- Traffic sources
- Conversion rate by source
- Cost per acquisition (CPA)
- Customer acquisition cost (CAC)

**Engagement:**
- Email open rates
- Click-through rates
- Social media engagement
- Referral conversion rate

**Retention:**
- Repeat purchase rate
- Email engagement over time
- Curator retention
- Churn rate

### UTM Parameters

```
https://dropr.com/drops/[slug]?utm_source=email&utm_medium=newsletter&utm_campaign=weekly-digest
```

## Best Practices

- Personalize email content based on user behavior
- A/B test subject lines and CTAs
- Segment email lists (buyers, curators, engaged, inactive)
- Use authentic, community-focused messaging
- Highlight real curators and real drops
- Leverage user-generated content
- Track referral sources with UTM parameters
- Monitor email deliverability
- Respect unsubscribe requests immediately
- Test promotional codes before launch
- Set clear expiration dates
- Limit promo code abuse (one per user)
- Feature diverse curators and categories
- Celebrate community milestones
- Be transparent about platform changes

## Common Mistakes to Avoid

- Generic, non-personalized emails
- Over-emailing (causing unsubscribes)
- Ignoring email deliverability
- No A/B testing
- Poor mobile email design
- Broken promo codes
- No referral tracking
- Inauthentic social media presence
- Ignoring user-generated content
- No clear attribution for paid campaigns
- Not segmenting audiences
- Sending emails at wrong times
- No re-engagement campaigns
- Overly salesy messaging
- Not celebrating community wins
