---
inclusion: always
---
# Content Moderation and Guidelines

## Philosophy

Build trust through quality control. Curate the marketplace by setting clear content standards, verifying curators, and moderating user-generated content. Balance openness with safety—enable creativity while preventing abuse. Transparent guidelines and fair enforcement build community trust. Automate where possible, but keep humans in the loop for nuanced decisions.

## Content Moderation Checklist

**Curator Verification:**
- [ ] Application review process defined
- [ ] Identity verification implemented
- [ ] Portfolio/social proof required
- [ ] Approval criteria documented
- [ ] Rejection reasons communicated clearly
- [ ] Appeal process available

**Drop Content:**
- [ ] Image requirements defined (size, format, dimensions)
- [ ] Description guidelines established (min/max length, prohibited content)
- [ ] Pricing limits set (min/max)
- [ ] Inventory limits defined
- [ ] Category restrictions documented
- [ ] Prohibited items list maintained

**Image Moderation:**
- [ ] Automated image scanning (NSFW, violence)
- [ ] Manual review for flagged content
- [ ] Image optimization enforced
- [ ] Watermark/logo guidelines
- [ ] Copyright verification process

**User Reports:**
- [ ] Report button on all drops
- [ ] Report categories defined
- [ ] Review queue for moderators
- [ ] Response time SLA defined
- [ ] Action log maintained

**Enforcement:**
- [ ] Warning system implemented
- [ ] Suspension criteria defined
- [ ] Ban process documented
- [ ] Appeal mechanism available
- [ ] Transparency report published

## Curator Verification

### Application Process

Curators must apply and be approved before creating drops:

```prisma
// prisma/schema.prisma
model CuratorApplication {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Application details
  businessName    String?
  bio             String
  website         String?
  socialLinks     Json    // { twitter, instagram, discord, etc. }
  portfolio       Json    // Array of previous work/drops
  
  // Verification
  status          ApplicationStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  rejectionReason String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  APPEALED
}
```

### Application Form

```typescript
// features/curator/components/CuratorApplicationForm.tsx
'use client'

import { z } from 'zod';

const applicationSchema = z.object({
  businessName: z.string().optional(),
  bio: z.string().min(100).max(1000),
  website: z.string().url().optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    discord: z.string().optional(),
  }),
  portfolio: z.array(z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().url(),
    link: z.string().url().optional(),
  })).min(1).max(5),
});

export function CuratorApplicationForm() {
  const handleSubmit = async (data: z.infer<typeof applicationSchema>) => {
    const result = await submitCuratorApplication(data);
    
    if (result.success) {
      // Show success message
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Apply to Become a Curator</h2>
      
      <label>
        Business Name (optional)
        <input name="businessName" />
      </label>
      
      <label>
        Bio (100-1000 characters)
        <textarea name="bio" minLength={100} maxLength={1000} required />
      </label>
      
      <label>
        Website
        <input type="url" name="website" />
      </label>
      
      <fieldset>
        <legend>Social Links</legend>
        <input type="url" name="socialLinks.twitter" placeholder="Twitter" />
        <input type="url" name="socialLinks.instagram" placeholder="Instagram" />
        <input name="socialLinks.discord" placeholder="Discord username" />
      </fieldset>
      
      <fieldset>
        <legend>Portfolio (1-5 examples of your work)</legend>
        {/* Portfolio item inputs */}
      </fieldset>
      
      <button type="submit">Submit Application</button>
    </form>
  );
}
```

### Review Process

```typescript
// features/admin/models/curator-review.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email-service';

export async function reviewCuratorApplication(
  applicationId: string,
  decision: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
) {
  const session = await requireAuth();
  
  // Only admins can review
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError('Only admins can review applications');
  }
  
  const application = await db.curatorApplication.update({
    where: { id: applicationId },
    data: {
      status: decision,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      rejectionReason,
    },
    include: { user: true },
  });
  
  if (decision === 'APPROVED') {
    // Upgrade user to curator
    await db.user.update({
      where: { id: application.userId },
      data: { role: 'CURATOR' },
    });
    
    // Send approval email
    await sendEmail(application.user.email, {
      subject: 'Your Curator Application Has Been Approved!',
      template: 'curator-approved',
    });
  } else {
    // Send rejection email
    await sendEmail(application.user.email, {
      subject: 'Curator Application Update',
      template: 'curator-rejected',
      data: { reason: rejectionReason },
    });
  }
  
  return { success: true };
}
```

### Approval Criteria

Curators should demonstrate:
- **Authenticity**: Real person/business with verifiable identity
- **Quality**: Portfolio shows attention to detail and curation skills
- **Community fit**: Aligns with one of the three culture clusters (Mod, Make, Mini)
- **Trustworthiness**: No red flags in social media presence
- **Commitment**: Clear plan for creating drops

## Drop Content Guidelines

### Image Requirements

```typescript
// lib/validation/image.ts
export const imageRequirements = {
  formats: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 5 * 1024 * 1024, // 5MB
  minDimensions: { width: 800, height: 600 },
  maxDimensions: { width: 4000, height: 4000 },
  aspectRatio: { min: 3/4, max: 16/9 },
};

export async function validateImage(file: File): Promise<ValidationResult> {
  // Check file type
  if (!imageRequirements.formats.includes(file.type)) {
    return { valid: false, error: 'Invalid file format. Use JPEG, PNG, or WebP.' };
  }
  
  // Check file size
  if (file.size > imageRequirements.maxSize) {
    return { valid: false, error: 'Image too large. Maximum size is 5MB.' };
  }
  
  // Check dimensions
  const dimensions = await getImageDimensions(file);
  
  if (dimensions.width < imageRequirements.minDimensions.width ||
      dimensions.height < imageRequirements.minDimensions.height) {
    return { valid: false, error: 'Image too small. Minimum 800x600px.' };
  }
  
  if (dimensions.width > imageRequirements.maxDimensions.width ||
      dimensions.height > imageRequirements.maxDimensions.height) {
    return { valid: false, error: 'Image too large. Maximum 4000x4000px.' };
  }
  
  // Check aspect ratio
  const aspectRatio = dimensions.width / dimensions.height;
  if (aspectRatio < imageRequirements.aspectRatio.min ||
      aspectRatio > imageRequirements.aspectRatio.max) {
    return { valid: false, error: 'Invalid aspect ratio. Use 3:4 to 16:9.' };
  }
  
  return { valid: true };
}
```

### Description Guidelines

```typescript
// lib/validation/drop.ts
import { z } from 'zod';

export const dropDescriptionSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters')
    .refine(
      (title) => !title.match(/\b(free|win|click here|buy now)\b/i),
      'Title contains prohibited spam words'
    ),
  
  description: z.string()
    .min(100, 'Description must be at least 100 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .refine(
      (desc) => !desc.match(/\b(viagra|casino|lottery)\b/i),
      'Description contains prohibited content'
    ),
  
  price: z.number()
    .min(5, 'Minimum price is $5')
    .max(10000, 'Maximum price is $10,000'),
  
  inventory: z.number()
    .int()
    .min(1, 'Minimum inventory is 1')
    .max(1000, 'Maximum inventory is 1000'),
});
```

### Prohibited Content

Drops cannot contain:
- **Illegal items**: Drugs, weapons, stolen goods, counterfeit items
- **Adult content**: NSFW imagery, adult products
- **Dangerous items**: Explosives, hazardous materials
- **Live animals**: No living creatures
- **Medical devices**: Prescription items, medical equipment
- **Tobacco/alcohol**: Regulated substances
- **Hate symbols**: Nazi imagery, hate group symbols
- **Copyrighted material**: Unauthorized reproductions

### Category Restrictions

```typescript
// lib/constants/categories.ts
export const allowedCategories = [
  'mechanical-keyboards',
  'keycaps',
  'switches',
  'pc-mods',
  'gaming-peripherals',
  'diy-electronics',
  '3d-printing',
  'modular-synth',
  'miniatures',
  'model-kits',
  'painting-supplies',
] as const;

export type DropCategory = typeof allowedCategories[number];
```

## Image Moderation

### Automated Scanning

Use image moderation API to detect inappropriate content:

```typescript
// lib/moderation/image.ts
import { moderateImage } from '@/lib/external/moderation-api';

export async function scanImage(imageUrl: string): Promise<ModerationResult> {
  const result = await moderateImage(imageUrl);
  
  return {
    safe: result.adult < 0.3 && result.violence < 0.3,
    scores: {
      adult: result.adult,
      violence: result.violence,
      racy: result.racy,
    },
    flagged: result.adult > 0.3 || result.violence > 0.3,
  };
}

// Usage in drop creation
export async function createDrop(data: CreateDropInput) {
  const session = await requireAuth();
  
  // Scan image
  const moderation = await scanImage(data.imageUrl);
  
  if (moderation.flagged) {
    throw new ValidationError('Image contains inappropriate content');
  }
  
  // Create drop
  return await db.drop.create({ data });
}
```

### Manual Review Queue

```typescript
// features/admin/models/moderation.actions.ts
'use server'

export async function getFlaggedContent() {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  
  return await db.drop.findMany({
    where: {
      moderationStatus: 'FLAGGED',
    },
    include: {
      curator: true,
      reports: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function moderateDrop(
  dropId: string,
  action: 'APPROVE' | 'REJECT' | 'REMOVE',
  reason?: string
) {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  
  if (action === 'REMOVE') {
    await db.drop.update({
      where: { id: dropId },
      data: {
        status: 'REMOVED',
        moderationStatus: 'REJECTED',
        moderationReason: reason,
      },
    });
    
    // Notify curator
    const drop = await db.drop.findUnique({
      where: { id: dropId },
      include: { curator: { include: { user: true } } },
    });
    
    await sendEmail(drop.curator.user.email, {
      subject: 'Drop Removed',
      template: 'drop-removed',
      data: { dropTitle: drop.title, reason },
    });
  } else if (action === 'APPROVE') {
    await db.drop.update({
      where: { id: dropId },
      data: {
        moderationStatus: 'APPROVED',
      },
    });
  }
  
  return { success: true };
}
```

## User Reports

### Report System

```prisma
// prisma/schema.prisma
model Report {
  id          String   @id @default(cuid())
  dropId      String
  drop        Drop     @relation(fields: [dropId], references: [id])
  reporterId  String
  reporter    User     @relation(fields: [reporterId], references: [id])
  
  category    ReportCategory
  description String
  
  status      ReportStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  resolution  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([dropId])
  @@index([status])
}

enum ReportCategory {
  INAPPROPRIATE_CONTENT
  MISLEADING_DESCRIPTION
  COUNTERFEIT
  COPYRIGHT_VIOLATION
  SPAM
  SCAM
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  DISMISSED
}
```

### Report Form

```typescript
// features/drops/components/ReportDropButton.tsx
'use client'

import { useState } from 'react';
import { reportDrop } from '../models/report.actions';

export function ReportDropButton({ dropId }: { dropId: string }) {
  const [showForm, setShowForm] = useState(false);
  
  const handleSubmit = async (data: ReportInput) => {
    await reportDrop(dropId, data);
    setShowForm(false);
    // Show success message
  };
  
  return (
    <>
      <button onClick={() => setShowForm(true)}>Report Drop</button>
      
      {showForm && (
        <dialog open>
          <form onSubmit={handleSubmit}>
            <h3>Report This Drop</h3>
            
            <label>
              Reason
              <select name="category" required>
                <option value="">Select a reason</option>
                <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
                <option value="MISLEADING_DESCRIPTION">Misleading Description</option>
                <option value="COUNTERFEIT">Counterfeit Item</option>
                <option value="COPYRIGHT_VIOLATION">Copyright Violation</option>
                <option value="SPAM">Spam</option>
                <option value="SCAM">Scam</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            
            <label>
              Additional Details
              <textarea name="description" required minLength={20} />
            </label>
            
            <button type="submit">Submit Report</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </dialog>
      )}
    </>
  );
}
```

### Report Review

```typescript
// features/admin/components/ReportQueue.tsx
import { getReports } from '../models/moderation.actions';

export async function ReportQueue() {
  const reports = await getReports();
  
  return (
    <div>
      <h2>Report Queue</h2>
      
      <table>
        <thead>
          <tr>
            <th>Drop</th>
            <th>Category</th>
            <th>Reporter</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.drop.title}</td>
              <td>{report.category}</td>
              <td>{report.reporter.name}</td>
              <td>{report.createdAt.toLocaleDateString()}</td>
              <td>{report.status}</td>
              <td>
                <button onClick={() => reviewReport(report.id)}>Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Enforcement Actions

### Warning System

```prisma
// prisma/schema.prisma
model Warning {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  reason      String
  severity    WarningSeverity
  issuedBy    String
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
}

enum WarningSeverity {
  LOW
  MEDIUM
  HIGH
}
```

### Suspension

```typescript
// features/admin/models/enforcement.actions.ts
'use server'

export async function suspendCurator(
  curatorId: string,
  reason: string,
  duration: number // days
) {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  
  const suspendUntil = new Date();
  suspendUntil.setDate(suspendUntil.getDate() + duration);
  
  await db.user.update({
    where: { id: curatorId },
    data: {
      status: 'SUSPENDED',
      suspendedUntil: suspendUntil,
      suspensionReason: reason,
    },
  });
  
  // Hide all active drops
  await db.drop.updateMany({
    where: {
      curator: { userId: curatorId },
      status: 'LIVE',
    },
    data: {
      status: 'SUSPENDED',
    },
  });
  
  // Notify curator
  const curator = await db.user.findUnique({ where: { id: curatorId } });
  await sendEmail(curator.email, {
    subject: 'Account Suspended',
    template: 'account-suspended',
    data: { reason, duration, suspendUntil },
  });
  
  return { success: true };
}
```

### Ban

```typescript
export async function banCurator(curatorId: string, reason: string) {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    throw new ForbiddenError();
  }
  
  await db.user.update({
    where: { id: curatorId },
    data: {
      status: 'BANNED',
      banReason: reason,
    },
  });
  
  // Remove all drops
  await db.drop.updateMany({
    where: { curator: { userId: curatorId } },
    data: { status: 'REMOVED' },
  });
  
  // Notify curator
  const curator = await db.user.findUnique({ where: { id: curatorId } });
  await sendEmail(curator.email, {
    subject: 'Account Banned',
    template: 'account-banned',
    data: { reason },
  });
  
  return { success: true };
}
```

## Appeal Process

```prisma
// prisma/schema.prisma
model Appeal {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  type        AppealType
  referenceId String   // ID of warning, suspension, or ban
  reason      String
  
  status      AppealStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  decision    String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum AppealType {
  WARNING
  SUSPENSION
  BAN
  DROP_REMOVAL
}

enum AppealStatus {
  PENDING
  REVIEWING
  APPROVED
  DENIED
}
```

## Transparency Report

Publish quarterly transparency reports:

```typescript
// lib/reports/transparency.ts
export async function generateTransparencyReport(quarter: number, year: number) {
  const startDate = new Date(year, (quarter - 1) * 3, 1);
  const endDate = new Date(year, quarter * 3, 0);
  
  const report = {
    period: `Q${quarter} ${year}`,
    
    applications: {
      submitted: await db.curatorApplication.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      approved: await db.curatorApplication.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'APPROVED',
        },
      }),
      rejected: await db.curatorApplication.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'REJECTED',
        },
      }),
    },
    
    reports: {
      submitted: await db.report.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      resolved: await db.report.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'RESOLVED',
        },
      }),
      dismissed: await db.report.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'DISMISSED',
        },
      }),
    },
    
    enforcement: {
      warnings: await db.warning.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      suspensions: await db.user.count({
        where: {
          status: 'SUSPENDED',
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
      bans: await db.user.count({
        where: {
          status: 'BANNED',
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
    },
    
    appeals: {
      submitted: await db.appeal.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      approved: await db.appeal.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'APPROVED',
        },
      }),
      denied: await db.appeal.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'DENIED',
        },
      }),
    },
  };
  
  return report;
}
```

## Best Practices

- Review curator applications within 48 hours
- Respond to reports within 24 hours
- Provide clear reasons for rejections and removals
- Allow appeals for all enforcement actions
- Publish transparency reports quarterly
- Train moderators on guidelines and bias
- Use automated tools to assist, not replace, human judgment
- Document all moderation decisions
- Regularly review and update guidelines
- Communicate policy changes to community

## Common Mistakes to Avoid

- Inconsistent enforcement of rules
- Vague or unclear guidelines
- No appeal process
- Automated moderation without human review
- Ignoring user reports
- Not communicating reasons for actions
- Bias in moderation decisions
- Slow response times
- No transparency about moderation
- Overly restrictive policies that stifle creativity
