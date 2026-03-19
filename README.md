# dropr

A curated, event-based marketplace where indie brands and trusted curators launch limited mystery drops and small-batch subscription boxes to engaged hobbyist communities.


## Vision

Dropr unifies the fragmented maker ecosystem into a single community-driven marketplace. Today, makers juggle Etsy for sales, Patreon for supporters, Discord/Reddit for community, Kickstarter for launches, and Gumroad for digital goods. Dropr brings it all together.

## Core Features

### For Makers
- **Product Drops**: Launch limited-run pre-orders with countdown timers and scarcity mechanics
- **Subscription Boxes**: Create small-batch themed boxes at your own cadence (weekly, monthly, quarterly)
- **Surplus Marketplace**: Monetize excess inventory and materials
- **Digital Goods**: Sell project plans, templates, and tutorials alongside physical products
- **Maker Profiles**: Build your brand with portfolios, project showcases, and community engagement
- **Revenue Dashboard**: Track sales, subscriptions, and community growth

### For Members
- **Curated Discovery**: Find unique projects from trusted makers and curators
- **Community Engagement**: Connect with makers and fellow hobbyists
- **Pre-order Participation**: Get early access to limited drops
- **Subscription Management**: Manage multiple maker subscriptions in one place
- **Reputation System**: Trust signals for delivery accountability and product quality

### Platform Features
- **Reputation System**: Verified reviews, shipment tracking, and maker accountability scores
- **Community Tools**: Discussion forums, project galleries, and maker-to-member messaging
- **Payment Processing**: Integrated checkout with support for pre-orders and subscriptions
- **Fulfillment Support**: Shipping label generation and inventory management

## Target Users

1. **Indie Makers**: mechanical keyboard designers, modular synthesizer builders, electronics hobbyists, hardware hackers, bio hackers, miniature sculptors and painters, PC modders, 3D printing designers, DIY hardware engineers
2. **Trusted Curators**: Established creators who curate themed boxes for niche communities
3. **Aspiring Makers**: Hobbyists testing the market with small batches
4. **Engaged Members**: DIY enthusiasts, collectors, and community members

## Key Differentiators

- **Event-Driven Commerce**: Drops and limited runs create excitement and urgency
- **Community-First**: Built-in forums and engagement tools, not just transactions
- **Flexible Monetization**: Hardware and product Pre-orders, themed subscriptions, surplus sales, and digital goods
- **Maker Accountability**: Reputation system builds trust in a fragmented market
- **All-in-One Platform**: Eliminates the need for 5+ separate services

## Technical Architecture

### Tech Stack (Proposed)
- **Frontend**: Next.js 14+ (App Router), React + TypeScript, shadcn design system + Tailwind CSS
- **Backend**: Next.js API routes or separate Node.js/Express API
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js or Clerk
- **Payments**: Stripe (subscriptions, pre-orders, marketplace)
- **File Storage**: AWS S3 or Cloudflare R2
- **Email**: Resend or SendGrid
- **Hosting**: Vercel (frontend) + Railway/Render (database)

### Core Data Models
- Users (makers, buyers, admin)
- Products (physical, digital, subscription boxes)
- Pre-Orders (Upfront orders for limited runs without public drops)
- Drops (Surprise limited-run launches with inventory and timing)
- Subscriptions (recurring box deliveries)
- Orders & Transactions
- Reviews & Reputation Scores
- Communities & Forums
- Inventory Management

## Development Roadmap

### Phase 1: MVP (Months 1-3)
- User authentication
- User (buyers) dashboards
- Maker (sellers) dashboards and profiles
- Admin dashboard
- Basic product listings and marketplace
- Simple pre-order mechanics (timed, limited inventory)
- Simple drop mechanics (countdown, timed, limited inventory)
- Stripe integration for one-time purchases, pre-orders, and escrow-like funds release
- Reputation system (stars and reviews)
- Fulfillment tracking and funds release to makers upon delivery
- Dispute resolution feature
- Maker reputation features

### Phase 2: Subscriptions (Months 4-5)
- Subscription box creation and management
- Recurring billing with Stripe
- User, Maker, and admin dashboard scaling for subscriptions
- Discussion forums and project galleries
- Maker-to-member messaging
- Social sharing and discovery

### Phase 3: Community (Months 6-7)
- Advanced analytics for makers
- Mobile app (React Native)
- API for third-party integrations


## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/dropr.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Contributing

We welcome contributions from the maker community! Please read our contributing guidelines before submitting PRs.

## License

TBD
