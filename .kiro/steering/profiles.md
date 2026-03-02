---
inclusion: manual
---

# User and Curator Profiles

## Philosophy

Profiles build trust and community through authentic self-expression. Buyer profiles enable personalized experiences and order history tracking. Curator profiles showcase expertise, build credibility, and attract followers. Balance privacy with transparency—allow customization while requiring verification for trust signals. Rich curator profiles with portfolios, stats, and social proof drive buyer confidence and repeat purchases.

## Profiles Checklist

**Buyer Profiles:**
- [ ] Basic info (name, username, avatar)
- [ ] Email and password management
- [ ] Shipping addresses (multiple)
- [ ] Payment methods (multiple)
- [ ] Order history with status
- [ ] Wishlist/favorites
- [ ] Following curators list
- [ ] Review history
- [ ] Privacy settings
- [ ] Notification preferences

**Curator Profiles:**
- [ ] Public profile page with custom URL
- [ ] Business name and bio
- [ ] Avatar and banner image
- [ ] Social media links
- [ ] Portfolio/previous work
- [ ] Stats (drops created, sales, rating)
- [ ] Active drops showcase
- [ ] Past drops archive
- [ ] Follower count
- [ ] Verification badge
- [ ] About section with rich text
- [ ] Specialties/categories

**Privacy Controls:**
- [ ] Profile visibility (public/private)
- [ ] Hide real name option
- [ ] Anonymous review option
- [ ] Order history visibility
- [ ] Following list visibility
- [ ] Email privacy settings

**Verification:**
- [ ] Email verification required
- [ ] Curator identity verification
- [ ] Social media verification (optional)
- [ ] Verification badge display
- [ ] Verification status visible

**Customization:**
- [ ] Custom profile URL (username)
- [ ] Theme/color preferences
- [ ] Bio with markdown support
- [ ] Custom banner image
- [ ] Portfolio image gallery
- [ ] Featured drops section

## Database Schema

```prisma
// prisma/schema.prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  username    String?  @unique
  avatar      String?
  
  role        UserRole @default(BUYER)
  status      UserStatus @default(ACTIVE)
  
  // Privacy settings
  profileVisibility ProfileVisibility @default(PUBLIC)
  showRealName      Boolean @default(true)
  showOrderHistory  Boolean @default(false)
  showFollowing     Boolean @default(true)
  
  // Verification
  emailVerified     Boolean @default(false)
  emailVerifiedAt   DateTime?
  
  // Relationships
  curator           Curator?
  addresses         Address[]
  paymentMethods    PaymentMethod[]
  orders            Order[]
  reviews           Review[]
  following         Follow[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([username])
  @@index([email])
}

enum UserRole {
  BUYER
  CURATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

enum ProfileVisibility {
  PUBLIC
  PRIVATE
  FOLLOWERS_ONLY
}

model Curator {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Public profile
  businessName      String
  slug              String   @unique // Custom URL
  bio               String?
  bannerImage       String?
  
  // Social links
  website           String?
  twitter           String?
  instagram         String?
  discord           String?
  
  // Portfolio
  portfolio         Json?    // Array of { title, description, imageUrl, link }
  
  // Specialties
  specialties       String[] // Array of category slugs
  
  // Stats
  totalDrops        Int      @default(0)
  totalSales        Int      @default(0)
  totalRevenue      Decimal  @db.Decimal(10, 2) @default(0)
  averageRating     Float?
  totalReviews      Int      @default(0)
  followerCount     Int      @default(0)
  responseRate      Float?   // % of messages responded to
  responseTime      Int?     // Average hours to respond
  
  // Verification
  verified          Boolean  @default(false)
  verifiedAt        DateTime?
  
  // Stripe Connect
  stripeAccountId   String?
  stripeOnboarded   Boolean  @default(false)
  
  // Settings
  shippingConfig    Json?    // ShippingConfig type
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([slug])
  @@index([verified])
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  name        String
  line1       String
  line2       String?
  city        String
  state       String
  zip         String
  country     String   @default("US")
  
  isDefault   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  follower    User     @relation("Follower", fields: [followerId], references: [id])
  curatorId   String
  curator     Curator  @relation(fields: [curatorId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@unique([followerId, curatorId])
  @@index([followerId])
  @@index([curatorId])
}
```

## Buyer Profile

### Profile Settings Page

```typescript
// features/profile/components/ProfileSettings.tsx
'use client'

import { useState } from 'react';
import { updateProfile } from '../models/profile.actions';

export function ProfileSettings({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || '');
  const [avatar, setAvatar] = useState(user.avatar);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateProfile({
      name,
      username: username || null,
      avatar,
    });
    
    // Show success toast
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Profile Settings</h2>
      
      <div>
        <label>Profile Photo</label>
        <AvatarUpload
          currentAvatar={avatar}
          onUpload={(url) => setAvatar(url)}
        />
      </div>
      
      <div>
        <label>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Username (optional)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a unique username"
          pattern="[a-zA-Z0-9_-]+"
          minLength={3}
          maxLength={30}
        />
        <small>Letters, numbers, underscores, and hyphens only</small>
      </div>
      
      <div>
        <label>Email</label>
        <input
          type="email"
          value={user.email}
          disabled
        />
        <small>Contact support to change your email</small>
      </div>
      
      <button type="submit">Save Changes</button>
    </form>
  );
}
```

### Privacy Settings

```typescript
// features/profile/components/PrivacySettings.tsx
'use client'

import { useState } from 'react';
import { updatePrivacySettings } from '../models/profile.actions';

export function PrivacySettings({ user }: { user: User }) {
  const [settings, setSettings] = useState({
    profileVisibility: user.profileVisibility,
    showRealName: user.showRealName,
    showOrderHistory: user.showOrderHistory,
    showFollowing: user.showFollowing,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePrivacySettings(settings);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Privacy Settings</h2>
      
      <div>
        <label>Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => setSettings({
            ...settings,
            profileVisibility: e.target.value as ProfileVisibility
          })}
        >
          <option value="PUBLIC">Public - Anyone can view</option>
          <option value="FOLLOWERS_ONLY">Followers Only</option>
          <option value="PRIVATE">Private - Only you</option>
        </select>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showRealName}
            onChange={(e) => setSettings({
              ...settings,
              showRealName: e.target.checked
            })}
          />
          Show real name on profile
        </label>
        <small>If unchecked, only your username will be visible</small>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showOrderHistory}
            onChange={(e) => setSettings({
              ...settings,
              showOrderHistory: e.target.checked
            })}
          />
          Show order history on profile
        </label>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showFollowing}
            onChange={(e) => setSettings({
              ...settings,
              showFollowing: e.target.checked
            })}
          />
          Show who I'm following
        </label>
      </div>
      
      <button type="submit">Save Privacy Settings</button>
    </form>
  );
}
```

### Shipping Addresses

```typescript
// features/profile/components/AddressManager.tsx
'use client'

import { useState } from 'react';
import { addAddress, updateAddress, deleteAddress } from '../models/address.actions';

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  return (
    <div>
      <div className="header">
        <h2>Shipping Addresses</h2>
        <button onClick={() => setShowForm(true)}>Add Address</button>
      </div>
      
      <div className="address-list">
        {addresses.map((address) => (
          <div key={address.id} className="address-card">
            {address.isDefault && <span className="badge">Default</span>}
            
            <p>
              <strong>{address.name}</strong><br>
              {address.line1}<br>
              {address.line2 && <>{address.line2}<br></>}
              {address.city}, {address.state} {address.zip}<br>
              {address.country}
            </p>
            
            <div className="actions">
              <button onClick={() => setEditingId(address.id)}>Edit</button>
              <button onClick={() => deleteAddress(address.id)}>Delete</button>
              {!address.isDefault && (
                <button onClick={() => setDefaultAddress(address.id)}>
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <AddressForm
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            addAddress(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
```

## Curator Profile

### Public Curator Profile Page

```typescript
// app/curators/[slug]/page.tsx
import { getCuratorBySlug } from '@/features/curator/models/curator.actions';
import { CuratorHeader } from '@/features/curator/components/CuratorHeader';
import { CuratorStats } from '@/features/curator/components/CuratorStats';
import { CuratorDrops } from '@/features/curator/components/CuratorDrops';
import { CuratorAbout } from '@/features/curator/components/CuratorAbout';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const curator = await getCuratorBySlug(params.slug);
  
  return {
    title: `${curator.businessName} - Dropr`,
    description: curator.bio,
    openGraph: {
      images: [curator.bannerImage || curator.user.avatar],
    },
  };
}

export default async function CuratorProfilePage({
  params
}: {
  params: { slug: string }
}) {
  const curator = await getCuratorBySlug(params.slug);
  
  return (
    <div className="curator-profile">
      <CuratorHeader curator={curator} />
      <CuratorStats curator={curator} />
      
      <div className="curator-content">
        <div className="main">
          <CuratorDrops curatorId={curator.id} />
        </div>
        
        <aside>
          <CuratorAbout curator={curator} />
        </aside>
      </div>
    </div>
  );
}
```

### Curator Header Component

```typescript
// features/curator/components/CuratorHeader.tsx
'use client'

import { useState } from 'react';
import { followCurator, unfollowCurator } from '../models/follow.actions';

export function CuratorHeader({ curator, isFollowing }: {
  curator: Curator;
  isFollowing: boolean;
}) {
  const [following, setFollowing] = useState(isFollowing);
  
  const handleFollow = async () => {
    if (following) {
      await unfollowCurator(curator.id);
      setFollowing(false);
    } else {
      await followCurator(curator.id);
      setFollowing(true);
    }
  };
  
  return (
    <div className="curator-header">
      {curator.bannerImage && (
        <img
          src={curator.bannerImage}
          alt={curator.businessName}
          className="banner"
        />
      )}
      
      <div className="curator-info">
        <img
          src={curator.user.avatar}
          alt={curator.businessName}
          className="avatar"
        />
        
        <div className="details">
          <h1>
            {curator.businessName}
            {curator.verified && (
              <span className="verified-badge" title="Verified Curator">
                ✓
              </span>
            )}
          </h1>
          
          <p className="username">@{curator.slug}</p>
          
          <p className="bio">{curator.bio}</p>
          
          <div className="social-links">
            {curator.website && (
              <a href={curator.website} target="_blank" rel="noopener">
                Website
              </a>
            )}
            {curator.twitter && (
              <a href={curator.twitter} target="_blank" rel="noopener">
                Twitter
              </a>
            )}
            {curator.instagram && (
              <a href={curator.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
            )}
            {curator.discord && (
              <span>Discord: {curator.discord}</span>
            )}
          </div>
        </div>
        
        <div className="actions">
          <button
            onClick={handleFollow}
            className={following ? 'following' : 'follow'}
          >
            {following ? 'Following' : 'Follow'}
          </button>
          
          <button onClick={() => shareProfile(curator.slug)}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Curator Stats Component

```typescript
// features/curator/components/CuratorStats.tsx
export function CuratorStats({ curator }: { curator: Curator }) {
  return (
    <div className="curator-stats">
      <div className="stat">
        <span className="value">{curator.totalDrops}</span>
        <span className="label">Drops</span>
      </div>
      
      <div className="stat">
        <span className="value">{curator.totalSales}</span>
        <span className="label">Sales</span>
      </div>
      
      <div className="stat">
        <span className="value">{curator.followerCount}</span>
        <span className="label">Followers</span>
      </div>
      
      {curator.averageRating && (
        <div className="stat">
          <span className="value">
            {curator.averageRating.toFixed(1)} ⭐
          </span>
          <span className="label">
            {curator.totalReviews} reviews
          </span>
        </div>
      )}
      
      {curator.responseRate && (
        <div className="stat">
          <span className="value">{Math.round(curator.responseRate)}%</span>
          <span className="label">Response Rate</span>
        </div>
      )}
    </div>
  );
}
```

### Curator About Section

```typescript
// features/curator/components/CuratorAbout.tsx
export function CuratorAbout({ curator }: { curator: Curator }) {
  return (
    <div className="curator-about">
      <h3>About</h3>
      
      {curator.specialties && curator.specialties.length > 0 && (
        <div className="specialties">
          <h4>Specialties</h4>
          <div className="tags">
            {curator.specialties.map((specialty) => (
              <span key={specialty} className="tag">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {curator.portfolio && curator.portfolio.length > 0 && (
        <div className="portfolio">
          <h4>Portfolio</h4>
          <div className="portfolio-grid">
            {curator.portfolio.map((item, i) => (
              <div key={i} className="portfolio-item">
                <img src={item.imageUrl} alt={item.title} />
                <h5>{item.title}</h5>
                <p>{item.description}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener">
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="member-since">
        <p>Member since {curator.createdAt.getFullYear()}</p>
      </div>
    </div>
  );
}
```

### Edit Curator Profile

```typescript
// features/curator/components/EditCuratorProfile.tsx
'use client'

import { useState } from 'react';
import { updateCuratorProfile } from '../models/curator.actions';

export function EditCuratorProfile({ curator }: { curator: Curator }) {
  const [businessName, setBusinessName] = useState(curator.businessName);
  const [slug, setSlug] = useState(curator.slug);
  const [bio, setBio] = useState(curator.bio || '');
  const [bannerImage, setBannerImage] = useState(curator.bannerImage);
  const [website, setWebsite] = useState(curator.website || '');
  const [twitter, setTwitter] = useState(curator.twitter || '');
  const [instagram, setInstagram] = useState(curator.instagram || '');
  const [discord, setDiscord] = useState(curator.discord || '');
  const [specialties, setSpecialties] = useState(curator.specialties || []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateCuratorProfile(curator.id, {
      businessName,
      slug,
      bio,
      bannerImage,
      website,
      twitter,
      instagram,
      discord,
      specialties,
    });
    
    // Show success toast
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>
      
      <div>
        <label>Banner Image</label>
        <ImageUpload
          currentImage={bannerImage}
          onUpload={(url) => setBannerImage(url)}
          aspectRatio="16:9"
        />
      </div>
      
      <div>
        <label>Business Name *</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Custom URL *</label>
        <div className="input-group">
          <span>dropr.com/curators/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9-]+"
            required
          />
        </div>
        <small>Lowercase letters, numbers, and hyphens only</small>
      </div>
      
      <div>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tell buyers about yourself and what you curate..."
        />
        <small>{bio.length}/500 characters</small>
      </div>
      
      <fieldset>
        <legend>Social Links</legend>
        
        <label>
          Website
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </label>
        
        <label>
          Twitter
          <input
            type="url"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/username"
          />
        </label>
        
        <label>
          Instagram
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/username"
          />
        </label>
        
        <label>
          Discord Username
          <input
            type="text"
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="username#1234"
          />
        </label>
      </fieldset>
      
      <div>
        <label>Specialties</label>
        <SpecialtySelector
          selected={specialties}
          onChange={setSpecialties}
        />
      </div>
      
      <button type="submit">Save Profile</button>
    </form>
  );
}
```

## Follow System

### Follow/Unfollow Actions

```typescript
// features/curator/models/follow.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function followCurator(curatorId: string) {
  const session = await requireAuth();
  
  // Check if already following
  const existing = await db.follow.findUnique({
    where: {
      followerId_curatorId: {
        followerId: session.user.id,
        curatorId,
      },
    },
  });
  
  if (existing) {
    return { success: true, alreadyFollowing: true };
  }
  
  // Create follow
  await db.follow.create({
    data: {
      followerId: session.user.id,
      curatorId,
    },
  });
  
  // Increment follower count
  await db.curator.update({
    where: { id: curatorId },
    data: {
      followerCount: { increment: 1 },
    },
  });
  
  // Notify curator
  const curator = await db.curator.findUnique({
    where: { id: curatorId },
  });
  
  await createNotification({
    userId: curator.userId,
    type: 'NEW_FOLLOWER',
    title: 'New Follower',
    message: `${session.user.name} started following you`,
    link: `/curator/followers`,
  });
  
  revalidateTag(`curator-${curatorId}`);
  
  return { success: true };
}

export async function unfollowCurator(curatorId: string) {
  const session = await requireAuth();
  
  await db.follow.delete({
    where: {
      followerId_curatorId: {
        followerId: session.user.id,
        curatorId,
      },
    },
  });
  
  // Decrement follower count
  await db.curator.update({
    where: { id: curatorId },
    data: {
      followerCount: { decrement: 1 },
    },
  });
  
  revalidateTag(`curator-${curatorId}`);
  
  return { success: true };
}
```

## Best Practices

- Require email verification for all users
- Allow username customization for personalization
- Support multiple shipping addresses
- Enable privacy controls for sensitive data
- Display verification badges prominently
- Show curator stats to build credibility
- Allow rich curator bios with markdown
- Support portfolio/previous work showcase
- Enable social media linking
- Track and display response rates
- Allow custom profile URLs (slugs)
- Support banner images for branding
- Enable follow/unfollow functionality
- Show follower counts
- Display order history for buyers
- Allow anonymous reviews
- Support profile visibility settings

## Common Mistakes to Avoid

- No email verification
- Forcing real names publicly
- No privacy controls
- Poor curator profile customization
- No verification badges
- Hiding important stats
- No social media integration
- No portfolio showcase
- Generic profile URLs
- No follow system
- Poor mobile profile experience
- No profile editing
- Exposing sensitive data
- No username support
