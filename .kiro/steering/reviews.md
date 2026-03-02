---
inclusion: manual
---

# Reviews and Ratings

## Philosophy

Build trust through transparent feedback. Reviews and ratings help buyers make informed decisions and incentivize curators to maintain quality. A fair review system balances buyer protection with curator reputation, prevents abuse through verification, and encourages constructive feedback. Verified purchase badges ensure authenticity, moderation prevents harassment, and curator responses demonstrate accountability.

## Reviews Checklist

**Review Submission:**
- [ ] Only verified buyers can review
- [ ] One review per purchase
- [ ] Review window defined (e.g., 7-30 days after delivery)
- [ ] Star rating (1-5) required
- [ ] Written review optional but encouraged
- [ ] Photo uploads supported
- [ ] Anonymous option available

**Rating Criteria:**
- [ ] Overall rating (1-5 stars)
- [ ] Value for money rating
- [ ] Item quality rating
- [ ] Curation quality rating
- [ ] Packaging/presentation rating

**Review Display:**
- [ ] Verified purchase badge shown
- [ ] Review date displayed
- [ ] Helpful votes enabled
- [ ] Curator response shown inline
- [ ] Photos displayed in gallery
- [ ] Sort by: recent, helpful, rating

**Moderation:**
- [ ] Automated profanity filter
- [ ] Report review button
- [ ] Manual review for flagged content
- [ ] Removal criteria documented
- [ ] Appeal process available

**Curator Response:**
- [ ] One response per review
- [ ] Response character limit (500)
- [ ] Response time tracked
- [ ] Professional tone encouraged
- [ ] No personal attacks allowed

**Analytics:**
- [ ] Average rating calculated
- [ ] Rating distribution shown
- [ ] Review count displayed
- [ ] Response rate tracked
- [ ] Helpful review highlights

## Database Schema

```prisma
// prisma/schema.prisma
model Review {
  id          String   @id @default(cuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  dropId      String
  drop        Drop     @relation(fields: [dropId], references: [id])
  curatorId   String
  curator     Curator  @relation(fields: [curatorId], references: [id])
  buyerId     String
  buyer       User     @relation(fields: [buyerId], references: [id])
  
  // Ratings (1-5 stars)
  overallRating     Int
  valueRating       Int?
  qualityRating     Int?
  curationRating    Int?
  packagingRating   Int?
  
  // Review content
  title             String?
  content           String?
  photos            Json?   // Array of photo URLs
  isAnonymous       Boolean @default(false)
  
  // Curator response
  curatorResponse   String?
  respondedAt       DateTime?
  
  // Engagement
  helpfulCount      Int     @default(0)
  reportCount       Int     @default(0)
  
  // Moderation
  status            ReviewStatus @default(PUBLISHED)
  moderationReason  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([dropId])
  @@index([curatorId])
  @@index([buyerId])
  @@index([status])
  @@index([overallRating])
}

enum ReviewStatus {
  PUBLISHED
  FLAGGED
  REMOVED
  PENDING
}

model ReviewHelpful {
  id        String   @id @default(cuid())
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
  
  @@unique([reviewId, userId])
  @@index([reviewId])
}

model ReviewReport {
  id          String   @id @default(cuid())
  reviewId    String
  review      Review   @relation(fields: [reviewId], references: [id])
  reporterId  String
  reporter    User     @relation(fields: [reporterId], references: [id])
  
  reason      ReviewReportReason
  description String?
  
  status      ReportStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([reviewId])
  @@index([status])
}

enum ReviewReportReason {
  SPAM
  HARASSMENT
  FAKE_REVIEW
  INAPPROPRIATE_CONTENT
  OFF_TOPIC
  OTHER
}
```

## Review Submission Flow

### Eligibility Check

```typescript
// features/reviews/models/review.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function canReview(orderId: string): Promise<{
  canReview: boolean;
  reason?: string;
}> {
  const session = await requireAuth();
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });
  
  if (!order) {
    return { canReview: false, reason: 'Order not found' };
  }
  
  if (order.buyerId !== session.user.id) {
    return { canReview: false, reason: 'Not your order' };
  }
  
  if (order.review) {
    return { canReview: false, reason: 'Already reviewed' };
  }
  
  if (order.status !== 'DELIVERED') {
    return { canReview: false, reason: 'Order not delivered yet' };
  }
  
  // Check review window (7-30 days after delivery)
  const deliveredAt = order.deliveredAt;
  const now = new Date();
  const daysSinceDelivery = Math.floor(
    (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceDelivery < 7) {
    return { canReview: false, reason: 'Wait 7 days after delivery' };
  }
  
  if (daysSinceDelivery > 30) {
    return { canReview: false, reason: 'Review window closed (30 days)' };
  }
  
  return { canReview: true };
}
```

### Review Form

```typescript
// features/reviews/components/ReviewForm.tsx
'use client'

import { useState } from 'react';
import { z } from 'zod';
import { submitReview } from '../models/review.actions';

const reviewSchema = z.object({
  overallRating: z.number().min(1).max(5),
  valueRating: z.number().min(1).max(5).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  curationRating: z.number().min(1).max(5).optional(),
  packagingRating: z.number().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  content: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  isAnonymous: z.boolean().default(false),
});

export function ReviewForm({ orderId, dropId }: {
  orderId: string;
  dropId: string;
}) {
  const [overallRating, setOverallRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const handleSubmit = async (data: z.infer<typeof reviewSchema>) => {
    const result = await submitReview(orderId, data);
    
    if (result.success) {
      // Show success toast
      // Redirect to drop page
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Review Your Drop</h2>
      
      <div>
        <label>Overall Rating *</label>
        <StarRating
          value={overallRating}
          onChange={setOverallRating}
          required
        />
      </div>
      
      <div>
        <label>Value for Money</label>
        <StarRating name="valueRating" />
      </div>
      
      <div>
        <label>Item Quality</label>
        <StarRating name="qualityRating" />
      </div>
      
      <div>
        <label>Curation Quality</label>
        <StarRating name="curationRating" />
      </div>
      
      <div>
        <label>Packaging/Presentation</label>
        <StarRating name="packagingRating" />
      </div>
      
      <div>
        <label>Review Title (optional)</label>
        <input
          name="title"
          maxLength={100}
          placeholder="Sum up your experience"
        />
      </div>
      
      <div>
        <label>Written Review (optional)</label>
        <textarea
          name="content"
          maxLength={2000}
          placeholder="Share your thoughts about this drop..."
          rows={5}
        />
      </div>
      
      <div>
        <label>Add Photos (optional, max 5)</label>
        <PhotoUpload name="photos" maxFiles={5} />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Post anonymously
        </label>
      </div>
      
      <button type="submit">Submit Review</button>
    </form>
  );
}
```

### Submit Review Action

```typescript
// features/reviews/models/review.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const reviewSchema = z.object({
  overallRating: z.number().min(1).max(5),
  valueRating: z.number().min(1).max(5).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  curationRating: z.number().min(1).max(5).optional(),
  packagingRating: z.number().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  content: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  isAnonymous: z.boolean().default(false),
});

export async function submitReview(
  orderId: string,
  data: z.infer<typeof reviewSchema>
) {
  const session = await requireAuth();
  
  // Validate eligibility
  const eligibility = await canReview(orderId);
  if (!eligibility.canReview) {
    throw new ValidationError(eligibility.reason);
  }
  
  // Get order details
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { drop: true },
  });
  
  // Moderate content
  const moderationResult = await moderateText(data.content || '');
  if (moderationResult.flagged) {
    throw new ValidationError('Review contains inappropriate content');
  }
  
  // Create review
  const review = await db.review.create({
    data: {
      orderId,
      dropId: order.dropId,
      curatorId: order.drop.curatorId,
      buyerId: session.user.id,
      ...data,
    },
  });
  
  // Update curator average rating
  await updateCuratorRating(order.drop.curatorId);
  
  // Invalidate cache
  revalidateTag(`drop-${order.dropId}`);
  revalidateTag(`curator-${order.drop.curatorId}`);
  
  // Send notification to curator
  await createNotification({
    userId: order.drop.curatorId,
    type: 'NEW_REVIEW',
    title: 'New Review',
    message: `You received a ${data.overallRating}-star review`,
    link: `/curator/reviews/${review.id}`,
  });
  
  return { success: true, reviewId: review.id };
}

async function updateCuratorRating(curatorId: string) {
  const reviews = await db.review.findMany({
    where: {
      curatorId,
      status: 'PUBLISHED',
    },
    select: { overallRating: true },
  });
  
  const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;
  
  await db.curator.update({
    where: { id: curatorId },
    data: {
      averageRating: avgRating,
      totalReviews: reviews.length,
    },
  });
}
```

## Review Display

### Review Card Component

```typescript
// features/reviews/components/ReviewCard.tsx
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  showCuratorResponse?: boolean;
}

export function ReviewCard({ review, showCuratorResponse = true }: ReviewCardProps) {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {review.isAnonymous ? (
            <span>Anonymous Buyer</span>
          ) : (
            <span>{review.buyer.name}</span>
          )}
          <span className="verified-badge">✓ Verified Purchase</span>
        </div>
        
        <div className="review-meta">
          <StarDisplay rating={review.overallRating} />
          <span className="review-date">
            {formatDistanceToNow(review.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>
      
      {review.title && (
        <h4 className="review-title">{review.title}</h4>
      )}
      
      {review.content && (
        <p className="review-content">{review.content}</p>
      )}
      
      {review.photos && review.photos.length > 0 && (
        <div className="review-photos">
          {review.photos.map((photo, i) => (
            <img key={i} src={photo} alt={`Review photo ${i + 1}`} />
          ))}
        </div>
      )}
      
      <div className="review-ratings">
        {review.valueRating && (
          <RatingBadge label="Value" rating={review.valueRating} />
        )}
        {review.qualityRating && (
          <RatingBadge label="Quality" rating={review.qualityRating} />
        )}
        {review.curationRating && (
          <RatingBadge label="Curation" rating={review.curationRating} />
        )}
        {review.packagingRating && (
          <RatingBadge label="Packaging" rating={review.packagingRating} />
        )}
      </div>
      
      <div className="review-actions">
        <button onClick={() => markHelpful(review.id)}>
          Helpful ({review.helpfulCount})
        </button>
        <button onClick={() => reportReview(review.id)}>
          Report
        </button>
      </div>
      
      {showCuratorResponse && review.curatorResponse && (
        <div className="curator-response">
          <div className="response-header">
            <strong>Response from {review.curator.businessName}</strong>
            <span className="response-date">
              {formatDistanceToNow(review.respondedAt, { addSuffix: true })}
            </span>
          </div>
          <p>{review.curatorResponse}</p>
        </div>
      )}
    </div>
  );
}
```

### Review List with Filters

```typescript
// features/reviews/components/ReviewList.tsx
'use client'

import { useState } from 'react';
import { ReviewCard } from './ReviewCard';

export function ReviewList({ dropId }: { dropId: string }) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  const reviews = useReviews(dropId, { sortBy, filterRating });
  
  return (
    <div className="review-list">
      <div className="review-header">
        <h3>Customer Reviews</h3>
        
        <div className="review-summary">
          <div className="average-rating">
            <span className="rating-number">{reviews.averageRating}</span>
            <StarDisplay rating={reviews.averageRating} />
            <span className="review-count">
              {reviews.totalCount} reviews
            </span>
          </div>
          
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setFilterRating(stars)}
                className={filterRating === stars ? 'active' : ''}
              >
                <span>{stars} stars</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{
                      width: `${(reviews.distribution[stars] / reviews.totalCount) * 100}%`
                    }}
                  />
                </div>
                <span>{reviews.distribution[stars]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="review-controls">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rating</option>
        </select>
        
        {filterRating && (
          <button onClick={() => setFilterRating(null)}>
            Clear filter
          </button>
        )}
      </div>
      
      <div className="reviews">
        {reviews.items.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
```

## Curator Response

```typescript
// features/reviews/models/review.actions.ts
'use server'

export async function respondToReview(
  reviewId: string,
  response: string
) {
  const session = await requireAuth();
  
  // Validate response length
  if (response.length > 500) {
    throw new ValidationError('Response must be 500 characters or less');
  }
  
  // Get review
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  // Check ownership
  if (review.curatorId !== session.user.curatorId) {
    throw new ForbiddenError('Not your review');
  }
  
  // Check if already responded
  if (review.curatorResponse) {
    throw new ValidationError('Already responded to this review');
  }
  
  // Moderate response
  const moderationResult = await moderateText(response);
  if (moderationResult.flagged) {
    throw new ValidationError('Response contains inappropriate content');
  }
  
  // Update review
  await db.review.update({
    where: { id: reviewId },
    data: {
      curatorResponse: response,
      respondedAt: new Date(),
    },
  });
  
  // Notify buyer
  await createNotification({
    userId: review.buyerId,
    type: 'CURATOR_RESPONSE',
    title: 'Curator Responded',
    message: 'The curator responded to your review',
    link: `/drops/${review.dropId}#review-${reviewId}`,
  });
  
  revalidateTag(`drop-${review.dropId}`);
  
  return { success: true };
}
```

## Review Moderation

### Automated Profanity Filter

```typescript
// lib/moderation/text.ts
import { moderateText as externalModerate } from '@/lib/external/moderation-api';

export async function moderateText(text: string): Promise<{
  flagged: boolean;
  reason?: string;
}> {
  // Check for profanity
  const profanityResult = await externalModerate(text);
  
  if (profanityResult.profanity > 0.7) {
    return { flagged: true, reason: 'Contains profanity' };
  }
  
  // Check for personal information (email, phone)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  
  if (emailRegex.test(text) || phoneRegex.test(text)) {
    return { flagged: true, reason: 'Contains personal information' };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /\b(click here|buy now|limited time|act now)\b/i,
    /\b(viagra|casino|lottery)\b/i,
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return { flagged: true, reason: 'Spam detected' };
    }
  }
  
  return { flagged: false };
}
```

### Report Review

```typescript
// features/reviews/models/review.actions.ts
'use server'

export async function reportReview(
  reviewId: string,
  reason: ReviewReportReason,
  description?: string
) {
  const session = await requireAuth();
  
  // Check if already reported by this user
  const existingReport = await db.reviewReport.findFirst({
    where: {
      reviewId,
      reporterId: session.user.id,
    },
  });
  
  if (existingReport) {
    throw new ValidationError('You already reported this review');
  }
  
  // Create report
  await db.reviewReport.create({
    data: {
      reviewId,
      reporterId: session.user.id,
      reason,
      description,
    },
  });
  
  // Increment report count
  await db.review.update({
    where: { id: reviewId },
    data: {
      reportCount: { increment: 1 },
    },
  });
  
  // Auto-flag if report count exceeds threshold
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  
  if (review.reportCount >= 3) {
    await db.review.update({
      where: { id: reviewId },
      data: { status: 'FLAGGED' },
    });
  }
  
  return { success: true };
}
```

## Best Practices

- Only allow verified buyers to review
- Enforce review window (7-30 days after delivery)
- Display verified purchase badge prominently
- Allow anonymous reviews for privacy
- Support photo uploads for authenticity
- Enable helpful votes to surface quality reviews
- Allow curator responses to show accountability
- Moderate content automatically and manually
- Prevent spam and fake reviews
- Track response rate as curator metric
- Highlight helpful reviews at the top
- Show rating distribution for transparency
- Allow filtering by star rating
- Update curator average rating in real-time

## Common Mistakes to Avoid

- Allowing reviews without purchase verification
- No time limit on review submission
- Allowing multiple reviews per purchase
- No moderation of inappropriate content
- Not allowing curator responses
- Hiding negative reviews
- Fake review detection not implemented
- No photo upload support
- Poor review sorting/filtering
- Not tracking helpful votes
