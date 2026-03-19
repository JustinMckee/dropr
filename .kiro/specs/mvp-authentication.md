# Authentication & User Management

## Overview
User authentication system supporting makers and buyers with role-based access and profile management.

## Requirements

### User Roles
- **Member**: Can browse, purchase, review products
- **Maker**: Can create products, drops, manage inventory, view analytics
- **Admin**: Platform moderation and dispute resolution
- **Arbitrator**: Specialized admin role for facilitating dispute resolution (subset of admins)

### Authentication Features
- Email/password registration and login
- OAuth (Google, GitHub optional for MVP)
- Email verification
- Password reset flow
- Session management with secure tokens

### User Profiles
- Profile photo upload
- Bio/description (max 500 chars)
- Location (city, country)
- Social links (optional: website, Instagram, YouTube)
- Join date and member status

### Maker-Specific Profile Fields
- Shop name
- Shop banner image
- Maker category tags (Mechanical keyboard, 3D printing, synth, electronics, miniatures, etc.)
- Reputation score (calculated from reviews and fulfillment)
- Total sales count
- Response time average

## Design

### Data Models

```typescript
User {
  id: string
  email: string
  passwordHash: string
  role: 'member' | 'maker' | 'admin'
  isArbitrator: boolean // true if admin can handle disputes
  emailVerified: boolean
  createdAt: datetime
  updatedAt: datetime
}

Profile {
  userId: string (FK)
  displayName: string
  photoUrl: string?
  bio: string?
  location: string?
  socialLinks: json?
  
  // Maker-specific
  shopName: string?
  shopBanner: string?
  categories: string[]?
  reputationScore: float?
  totalSales: int?
  avgResponseTime: int? // in hours
}
```

### Server Actions & Routes

**Auth Routes & Actions:**
- `app/(auth)/register/` - Registration with email verification
  - `actions.ts`: `registerAction()` - Create user account
- `app/(auth)/login/` - User login
  - `actions.ts`: `loginAction()` - Authenticate user
- `app/(auth)/logout/` - User logout
  - `actions.ts`: `logoutAction()` - End session
- `app/(auth)/forgot-password/` - Password reset request
  - `actions.ts`: `forgotPasswordAction()` - Send reset email
- `app/(auth)/reset-password/` - Password reset
  - `actions.ts`: `resetPasswordAction()` - Update password
- `app/api/auth/verify-email/route.ts` - Email verification (API route for redirect)

**Profile Routes & Actions:**
- `app/(users)/profile/` - View own profile (SSR)
- `app/(users)/profile/edit/` - Edit profile
  - `actions.ts`: `updateProfileAction()` - Update profile data
- `app/(users)/profile/maker-setup/` - Upgrade to maker
  - `actions.ts`: `upgradeToMakerAction()` - Convert to maker account
- `app/(makers)/maker/[slug]/` - Public maker profile (SSR)

## Implementation Tasks

- [x] Set up NextAuth.js or Clerk for authentication
- [x] Create User and Profile database schemas
- [x] Implement registration flow with email verification
- [x] Implement login/logout functionality
- [x] Build password reset flow
- [x] Create profile edit page for buyers
- [x] Create maker profile setup flow
- [x] Add role-based middleware for protected routes
- [ ] Implement profile photo upload to S3/R2
- [x] Build public profile view pages

## Acceptance Criteria

- Users can register with email/password
- Email verification required before full access
- Users can log in and maintain session
- Password reset works via email link
- Members can edit their basic profile
- Makers can set up shop name, banner, and categories
- Profile pages are publicly viewable
- Role-based access control prevents unauthorized actions
- Profile photos upload and display correctly

## Out of Scope for MVP

- OAuth providers beyond email/password
- Two-factor authentication
- Account deletion (manual admin process for MVP)
- Profile privacy settings
