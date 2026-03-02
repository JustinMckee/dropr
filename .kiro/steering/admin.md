---
inclusion: manual
---

# Admin

## Philosophy

Admin functionality lives within the main Next.js app using protected routes and role-based access control. Admins manage curator applications, moderate content, resolve disputes, and monitor platform health. Admin interfaces should be functional over flashy—clear data tables, efficient workflows, and quick actions. Build for the MVP scale (hundreds of curators, thousands of drops) with patterns that can scale to thousands of curators and millions of drops.

## Admin Checklist

**Access Control:**
- [ ] Role-based middleware (ADMIN role required)
- [ ] Protected route group `(admin)/`
- [ ] Admin navigation layout
- [ ] Audit logging for admin actions

**Curator Management:**
- [ ] Application review queue
- [ ] Approve/reject with reasons
- [ ] Curator search and filtering
- [ ] Suspend/ban curators
- [ ] View curator analytics
- [ ] Manual verification

**Content Moderation:**
- [ ] Flagged drops queue
- [ ] Image moderation review
- [ ] Approve/reject drops
- [ ] Feature/unfeature drops
- [ ] Remove inappropriate content

**Dispute Resolution:**
- [ ] Dispute queue (FIFO)
- [ ] View evidence and conversation
- [ ] Resolve with refund options
- [ ] Warranty claim review
- [ ] Community moderator oversight

**Platform Analytics:**
- [ ] Dashboard overview
- [ ] GMV (Gross Merchandise Value)
- [ ] Active users/curators
- [ ] Drop performance metrics
- [ ] Revenue and fees
- [ ] Growth trends

**User Management:**
- [ ] Search users
- [ ] View user details
- [ ] Suspend/ban users
- [ ] Reset passwords
- [ ] View order history


## Route Structure

```
app/(admin)/
├── layout.tsx              # Admin layout with navigation
├── page.tsx                # Dashboard overview
├── applications/
│   ├── page.tsx           # Curator applications queue
│   └── [id]/page.tsx      # Application detail
├── drops/
│   ├── page.tsx           # All drops with filters
│   ├── flagged/page.tsx   # Flagged drops queue
│   └── [id]/page.tsx      # Drop detail with moderation
├── disputes/
│   ├── page.tsx           # Dispute queue
│   └── [id]/page.tsx      # Dispute resolution
├── users/
│   ├── page.tsx           # User search
│   └── [id]/page.tsx      # User detail
├── analytics/
│   └── page.tsx           # Platform analytics
└── settings/
    └── page.tsx           # Platform settings
```

## Admin Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

## Admin Dashboard

```typescript
// app/(admin)/page.tsx
import { getAdminStats } from '@/features/admin/models/admin.actions';

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  
  return (
    <div className="admin-dashboard">
      <h1>Platform Overview</h1>
      
      <div className="stats-grid">
        <StatCard
          title="GMV (30 days)"
          value={`$${stats.gmv30d.toLocaleString()}`}
          change={stats.gmvChange}
        />
        <StatCard
          title="Active Drops"
          value={stats.activeDrops}
          subtitle={`${stats.scheduledDrops} scheduled`}
        />
        <StatCard
          title="Total Curators"
          value={stats.totalCurators}
          subtitle={`${stats.pendingApplications} pending`}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="Last 30 days"
        />
      </div>
      
      <div className="admin-queues">
        <QueueCard
          title="Curator Applications"
          count={stats.pendingApplications}
          link="/admin/applications"
        />
        <QueueCard
          title="Flagged Drops"
          count={stats.flaggedDrops}
          link="/admin/drops/flagged"
        />
        <QueueCard
          title="Open Disputes"
          count={stats.openDisputes}
          link="/admin/disputes"
        />
        <QueueCard
          title="Warranty Claims"
          count={stats.warrantyClaims}
          link="/admin/warranty"
        />
      </div>
    </div>
  );
}
```

## Curator Application Review

```typescript
// app/(admin)/applications/[id]/page.tsx
import { getCuratorApplication } from '@/features/admin/models/admin.actions';
import { ApproveRejectButtons } from '@/features/admin/components/ApproveRejectButtons';

export default async function ApplicationPage({ params }: { params: { id: string } }) {
  const application = await getCuratorApplication(params.id);
  
  return (
    <div className="application-review">
      <h1>Curator Application Review</h1>
      
      <div className="applicant-info">
        <h2>{application.user.name}</h2>
        <p>{application.user.email}</p>
        <p>Account created: {application.user.createdAt.toLocaleDateString()}</p>
      </div>
      
      <div className="application-details">
        <h3>Business Information</h3>
        <p><strong>Business Name:</strong> {application.businessName}</p>
        <p><strong>Bio:</strong> {application.bio}</p>
        <p><strong>Website:</strong> {application.website}</p>
        
        <h3>Social Links</h3>
        <ul>
          {application.socialLinks.twitter && <li>Twitter: {application.socialLinks.twitter}</li>}
          {application.socialLinks.instagram && <li>Instagram: {application.socialLinks.instagram}</li>}
          {application.socialLinks.discord && <li>Discord: {application.socialLinks.discord}</li>}
        </ul>
        
        <h3>Portfolio</h3>
        <div className="portfolio-grid">
          {application.portfolio.map((item, i) => (
            <div key={i} className="portfolio-item">
              <img src={item.imageUrl} alt={item.title} />
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <ApproveRejectButtons applicationId={application.id} />
    </div>
  );
}
```

## Best Practices

- Use server components for admin pages (no client-side data fetching)
- Implement audit logging for all admin actions
- Show clear timestamps and admin names on actions
- Provide undo functionality where possible
- Use optimistic UI updates for quick actions
- Implement keyboard shortcuts for common actions
- Show loading states for slow operations
- Provide bulk actions for efficiency
- Export data as CSV for analysis
- Use data tables with sorting and filtering
- Implement pagination for large datasets
- Show clear success/error messages
- Require confirmation for destructive actions
- Log all admin actions for accountability

## Common Mistakes to Avoid

- Building separate admin application too early
- No audit logging
- No role-based access control
- Slow admin interfaces
- No bulk actions
- Poor search and filtering
- No data export
- Unclear action outcomes
- No confirmation for destructive actions
- Exposing sensitive data unnecessarily
