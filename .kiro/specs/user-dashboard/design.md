# User Dashboard - Design

## Overview

The User Dashboard is the authenticated user's central hub for managing their Dropr experience. It provides a unified interface for viewing and managing followed drops, tracking order history, managing profile and preferences, and receiving notifications about drops they care about. The dashboard emphasizes discovery and curation, helping users stay connected to the drops and curators that matter to them.

### Key Design Principles

- **MVVM Architecture**: Thin views with fat ViewModels using scoped Zustand stores
- **Real-Time Updates**: SSE-powered countdown timers and status updates for followed drops
- **Mobile-First**: Responsive design optimized for all viewport sizes (320px minimum)
- **Optimistic UI**: Immediate feedback for user actions with graceful error handling
- **Performance-Focused**: Core Web Vitals compliance with aggressive optimization
- **Integration**: Seamless integration with homepage follow functionality

### Integration with Homepage

The dashboard integrates with the homepage-drop-discovery feature (Requirement 24) where users can follow drops from drop cards. The dashboard provides:
- Management interface for followed drops
- Persistence of follow state across sessions
- Real-time updates for followed drop status changes
- Notification system for important drop events

## Architecture

### High-Level Component Structure

```
app/
├── dashboard/
│   ├── page.tsx                      # Main dashboard page
│   ├── followed/
│   │   └── page.tsx                  # Followed drops page
│   ├── orders/
│   │   ├── page.tsx                  # Order history page
│   │   └── [id]/
│   │       └── page.tsx              # Order details page
│   ├── profile/
│   │   └── page.tsx                  # Profile management page
│   ├── settings/
│   │   ├── page.tsx                  # Account settings page
│   │   └── email-preferences/
│   │       └── page.tsx              # Email preferences page
│   └── notifications/
│       └── page.tsx                  # Notification center page
├── api/
│   └── dashboard/
│       └── stream/
│           └── route.ts              # SSE endpoint for real-time updates
└── components/
    └── dashboard/
        ├── DashboardLayout.tsx
        ├── DashboardNav.tsx
        ├── FollowedDropsList.tsx
        ├── FollowedDropCard.tsx
        ├── OrderHistoryList.tsx
        ├── OrderCard.tsx
        ├── OrderDetails.tsx
        ├── ProfileForm.tsx
        ├── EmailPreferencesForm.tsx
        ├── AccountSettingsForm.tsx
        ├── NotificationCenter.tsx
        ├── NotificationItem.tsx
        ├── QuickActions.tsx
        └── shared/
            ├── EmptyState.tsx
            ├── LoadingSkeleton.tsx
            └── ErrorMessage.tsx

features/
└── dashboard/
    ├── models/
    │   ├── dashboard.types.ts
    │   ├── dashboard.actions.ts      # Server Actions
    │   ├── follow.actions.ts         # Follow/unfollow Server Actions
    │   └── order.actions.ts          # Order-related Server Actions
    ├── stores/
    │   └── dashboard.store.ts        # Zustand ViewModel
    └── hooks/
        └── useDashboard.ts           # Context Provider + hook
```


### MVVM Pattern Implementation

The dashboard follows the MVVM pattern with scoped Zustand stores:

**Model Layer** (features/dashboard/models/):
- TypeScript types for FollowedDrop, Order, UserProfile, Notification
- Server Actions for fetching/updating dashboard data
- Follow/unfollow operations
- Order history and details retrieval
- Profile and preferences updates

**ViewModel Layer** (features/dashboard/stores/):
- Zustand store factory for dashboard state management
- Client-side business logic (filtering, sorting, grouping)
- SSE subscription management for real-time updates
- Optimistic UI updates for follow/unfollow actions
- Notification state management

**Glue Layer** (features/dashboard/hooks/):
- Context Provider to scope store instances
- Custom hook to expose store with selectors
- Convenience hooks for common data access patterns

**View Layer** (app/components/dashboard/):
- Thin React components consuming the hook
- Presentational logic only
- No direct Server Action calls

### Authentication Flow

```typescript
// middleware.ts (existing)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token');
  const path = request.nextUrl.pathname;
  
  // Protect dashboard routes
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Components and Interfaces

### Core Components

#### 1. DashboardLayout

**Purpose**: Consistent layout wrapper for all dashboard pages

**Props**:
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
```

**Features**:
- Responsive navigation (sidebar on desktop, bottom nav on mobile)
- User profile header with avatar and name
- Quick actions menu
- Notification badge
- Breadcrumb navigation

**Layout Structure**:
- Desktop (>768px): Sidebar navigation + main content area
- Mobile (≤768px): Top header + main content + bottom navigation

#### 2. DashboardNav

**Purpose**: Navigation menu for dashboard sections

**Props**:
```typescript
interface DashboardNavProps {
  currentPath: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType;
  badge?: number;
}
```

**Navigation Items**:
- Overview (dashboard home)
- Followed Drops (with count badge)
- Orders (order history)
- Notifications (with unread count badge)
- Profile
- Settings

**Behavior**:
- Highlights current section
- Shows badge counts for followed drops and notifications
- Keyboard accessible
- Mobile: Collapses to bottom navigation bar


#### 3. FollowedDropsList

**Purpose**: Display and manage followed drops grouped by status

**Props**:
```typescript
interface FollowedDropsListProps {
  searchQuery?: string;
  statusFilter?: DropStatus[];
}
```

**Features**:
- Groups drops by status (upcoming, live, ended)
- Real-time countdown updates via SSE
- Search and filter functionality
- Empty state when no followed drops
- Skeleton loaders during initial load

**Grouping Logic**:
```typescript
interface GroupedDrops {
  upcoming: FollowedDrop[];
  live: FollowedDrop[];
  ended: FollowedDrop[];
}
```

**Display Order**:
1. Live drops (sorted by end time, soonest first)
2. Upcoming drops (sorted by start time, soonest first)
3. Ended drops (sorted by end time, most recent first)

#### 4. FollowedDropCard

**Purpose**: Display followed drop information with unfollow action

**Props**:
```typescript
interface FollowedDropCardProps {
  drop: FollowedDrop;
  onUnfollow: (dropId: string) => void;
  onCardClick: (dropId: string) => void;
}

interface FollowedDrop {
  id: string;
  title: string;
  coverImageUrl: string;
  price: number;
  inventory: number;
  status: 'upcoming' | 'live' | 'ended' | 'sold_out';
  startTime: Date;
  endTime: Date;
  dropType: 'mystery_box' | 'surplus' | 'limited_edition';
  collective: 'MOD' | 'MAKE' | 'MINI';
  curator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  followedAt: Date;
  hasNotification: boolean;
}
```

**Display Elements**:
- Cover image
- Title
- Curator name with verification badge
- Status badge (upcoming, live, ended, sold out)
- Countdown timer (for upcoming and live drops)
- Inventory status ("23 left" or "Sold Out")
- Price
- Unfollow button
- Notification indicator (if hasNotification is true)

**States**:
- Default: Standard display
- Hover: Show unfollow button prominently
- Ending Soon: Highlight with urgency color (< 1 hour remaining)
- Sold Out: Grayed out with overlay
- Loading: Skeleton placeholder

**Unfollow Behavior**:
- Optimistic UI update (immediately remove from list)
- If unfollow fails, restore to list and show error toast
- Confirmation dialog optional (can be added based on user feedback)


#### 5. OrderHistoryList

**Purpose**: Display paginated list of user's orders

**Props**:
```typescript
interface OrderHistoryListProps {
  page: number;
  pageSize: number;
}
```

**Features**:
- Paginated display (20 orders per page)
- Reverse chronological order
- Empty state for new users
- Skeleton loaders during fetch
- Click to view order details

#### 6. OrderCard

**Purpose**: Display order summary in list view

**Props**:
```typescript
interface OrderCardProps {
  order: OrderSummary;
  onClick: (orderId: string) => void;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  dropTitle: string;
  dropCoverImage: string;
  curatorName: string;
  purchaseDate: Date;
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemCount: number;
}
```

**Display Elements**:
- Order number
- Drop cover image (thumbnail)
- Drop title
- Curator name
- Purchase date
- Total amount
- Status badge
- Item count
- Arrow icon indicating clickable

**Status Colors**:
- Processing: Blue
- Shipped: Orange
- Delivered: Green
- Cancelled: Red

#### 7. OrderDetails

**Purpose**: Display comprehensive order information

**Props**:
```typescript
interface OrderDetailsProps {
  orderId: string;
}

interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  shippingAddress: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  notes?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

**Display Sections**:
1. Order header (number, date, status)
2. Drop information (title, curator, cover image)
3. Items list (name, quantity, price)
4. Shipping information (address, tracking)
5. Order total breakdown (subtotal, shipping, tax, total)

**Tracking Link**:
- If trackingNumber exists, display as clickable link
- Opens in new tab to carrier's tracking page


#### 8. ProfileForm

**Purpose**: Edit user profile information

**Props**:
```typescript
interface ProfileFormProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => Promise<void>;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
}
```

**Form Fields**:
- Name (required, 2-50 characters)
- Email (required, valid email format)
- Profile picture (image upload, max 5MB)
- Bio (optional, max 500 characters)

**Validation**:
- Client-side validation with Zod schema
- Server-side validation in Server Action
- Display field-specific error messages
- Disable submit button while saving

**Behavior**:
- Optimistic UI update on save
- Show success toast on successful save
- Revert changes and show error toast on failure
- Unsaved changes warning when navigating away

#### 9. EmailPreferencesForm

**Purpose**: Manage email notification preferences

**Props**:
```typescript
interface EmailPreferencesFormProps {
  initialPreferences: EmailPreferences;
  onSave: (preferences: EmailPreferences) => Promise<void>;
}

interface EmailPreferences {
  followedDropStatusChanges: boolean;
  newDropsFromFollowedCurators: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
}
```

**Form Fields**:
- Toggle switches for each preference type
- Description text explaining what each preference controls

**Behavior**:
- Optimistic UI update on toggle
- Auto-save on change (no submit button needed)
- Show success indicator briefly after save
- Revert and show error if save fails

#### 10. AccountSettingsForm

**Purpose**: Manage account security and settings

**Props**:
```typescript
interface AccountSettingsFormProps {
  user: User;
}

interface User {
  id: string;
  email: string;
  hasPassword: boolean;
  twoFactorEnabled: boolean;
  connectedAccounts: ConnectedAccount[];
}

interface ConnectedAccount {
  provider: 'google' | 'github' | 'discord';
  email: string;
  connectedAt: Date;
}
```

**Sections**:
1. Change Password (if hasPassword is true)
2. Two-Factor Authentication (enable/disable)
3. Connected Accounts (view and disconnect)
4. Delete Account (with confirmation)

**Change Password**:
- Current password field
- New password field (min 8 characters, complexity requirements)
- Confirm new password field
- Show password strength indicator

**Two-Factor Authentication**:
- Enable: Show QR code and backup codes
- Disable: Require password confirmation

**Delete Account**:
- Require password confirmation
- Show warning about data deletion
- Require typing "DELETE" to confirm


#### 11. NotificationCenter

**Purpose**: Display all user notifications

**Props**:
```typescript
interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

interface Notification {
  id: string;
  type: 'drop_live' | 'drop_ending_soon' | 'drop_sold_out' | 'order_shipped' | 'order_delivered';
  message: string;
  relatedDropId?: string;
  relatedOrderId?: string;
  createdAt: Date;
  read: boolean;
}
```

**Features**:
- Reverse chronological order
- Unread indicator (bold text, colored dot)
- "Mark all as read" button
- Click notification to navigate to related drop/order
- Empty state when no notifications

**Notification Types**:
- Drop Live: "Your followed drop [title] is now live!"
- Drop Ending Soon: "[title] ends in less than 1 hour!"
- Drop Sold Out: "[title] has sold out"
- Order Shipped: "Your order #[number] has shipped"
- Order Delivered: "Your order #[number] has been delivered"

#### 12. QuickActions

**Purpose**: Quick access menu for common actions

**Props**:
```typescript
interface QuickActionsProps {
  user: User;
  isCurator: boolean;
}
```

**Menu Items**:
- Browse All Drops (always visible)
- Become a Curator (if not curator)
- Curator Dashboard (if curator)
- Help & Documentation (always visible)

**Behavior**:
- Dropdown menu triggered by button click
- Keyboard accessible (tab, enter, escape)
- Closes on outside click
- Closes on item selection

#### 13. EmptyState

**Purpose**: Reusable empty state component

**Props**:
```typescript
interface EmptyStateProps {
  icon: React.ComponentType;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}
```

**Usage Examples**:
- No followed drops: "Start following drops to see them here"
- No orders: "You haven't made any purchases yet"
- No notifications: "You're all caught up!"


## Data Models

### TypeScript Types

```typescript
// features/dashboard/models/dashboard.types.ts

export type DropStatus = 'upcoming' | 'live' | 'ended' | 'sold_out';

export type DropType = 'mystery_box' | 'surplus' | 'limited_edition';

export type Collective = 'MOD' | 'MAKE' | 'MINI';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type NotificationType = 
  | 'drop_live' 
  | 'drop_ending_soon' 
  | 'drop_sold_out' 
  | 'order_shipped' 
  | 'order_delivered';

export interface FollowedDrop {
  id: string;
  title: string;
  coverImageUrl: string;
  price: number;
  inventory: number;
  status: DropStatus;
  startTime: Date;
  endTime: Date;
  dropType: DropType;
  collective: Collective;
  curator: CuratorSummary;
  followedAt: Date;
  hasNotification: boolean;
}

export interface CuratorSummary {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  dropTitle: string;
  dropCoverImage: string;
  curatorName: string;
  purchaseDate: Date;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  shippingAddress: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  notes?: string;
  subtotal: number;
  shipping: number;
  tax: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
}

export interface EmailPreferences {
  followedDropStatusChanges: boolean;
  newDropsFromFollowedCurators: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  relatedDropId?: string;
  relatedOrderId?: string;
  createdAt: Date;
  read: boolean;
}

export interface DashboardData {
  followedDrops: FollowedDrop[];
  recentOrders: OrderSummary[];
  notifications: Notification[];
  profile: UserProfile;
  emailPreferences: EmailPreferences;
  stats: DashboardStats;
}

export interface DashboardStats {
  followedDropsCount: number;
  totalOrdersCount: number;
  unreadNotificationsCount: number;
}

export interface FollowedDropsFilter {
  status?: DropStatus[];
  searchQuery?: string;
}
```


### Server Actions

```typescript
// features/dashboard/models/dashboard.actions.ts
'use server'

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';
import type { DashboardData, UserProfile, EmailPreferences } from './dashboard.types';

/**
 * Fetches all dashboard data for the authenticated user
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const [followedDrops, recentOrders, notifications, profile, emailPreferences, stats] = 
    await Promise.all([
      fetchFollowedDrops(session.user.id),
      fetchRecentOrders(session.user.id),
      fetchNotifications(session.user.id),
      fetchUserProfile(session.user.id),
      fetchEmailPreferences(session.user.id),
      fetchDashboardStats(session.user.id),
    ]);
  
  return {
    followedDrops,
    recentOrders,
    notifications,
    profile,
    emailPreferences,
    stats,
  };
}

/**
 * Fetches followed drops for the user
 */
async function fetchFollowedDrops(userId: string) {
  const follows = await db.dropFollow.findMany({
    where: { userId },
    include: {
      drop: {
        include: {
          curator: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return follows.map(follow => ({
    id: follow.drop.id,
    title: follow.drop.title,
    coverImageUrl: follow.drop.coverImageUrl,
    price: follow.drop.price,
    inventory: follow.drop.inventory,
    status: follow.drop.status,
    startTime: follow.drop.startTime,
    endTime: follow.drop.endTime,
    dropType: follow.drop.dropType,
    collective: follow.drop.collective,
    curator: {
      id: follow.drop.curator.id,
      name: follow.drop.curator.user.name,
      avatar: follow.drop.curator.user.image,
      verified: follow.drop.curator.verified,
    },
    followedAt: follow.createdAt,
    hasNotification: follow.hasUnreadNotification,
  }));
}

/**
 * Fetches recent orders for the user
 */
async function fetchRecentOrders(userId: string) {
  const orders = await db.order.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      drop: {
        include: {
          curator: {
            include: { user: true },
          },
        },
      },
      items: true,
    },
  });
  
  return orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    dropTitle: order.drop.title,
    dropCoverImage: order.drop.coverImageUrl,
    curatorName: order.drop.curator.user.name,
    purchaseDate: order.createdAt,
    totalAmount: order.totalAmount,
    status: order.status,
    itemCount: order.items.length,
  }));
}

/**
 * Fetches notifications for the user
 */
async function fetchNotifications(userId: string) {
  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  
  return notifications.map(n => ({
    id: n.id,
    type: n.type,
    message: n.message,
    relatedDropId: n.relatedDropId,
    relatedOrderId: n.relatedOrderId,
    createdAt: n.createdAt,
    read: n.read,
  }));
}

/**
 * Fetches user profile
 */
async function fetchUserProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image,
    bio: user.bio,
  };
}

/**
 * Fetches email preferences
 */
async function fetchEmailPreferences(userId: string) {
  const prefs = await db.emailPreferences.findUnique({
    where: { userId },
  });
  
  return {
    followedDropStatusChanges: prefs?.followedDropStatusChanges ?? true,
    newDropsFromFollowedCurators: prefs?.newDropsFromFollowedCurators ?? true,
    orderUpdates: prefs?.orderUpdates ?? true,
    marketingEmails: prefs?.marketingEmails ?? false,
  };
}

/**
 * Fetches dashboard statistics
 */
async function fetchDashboardStats(userId: string) {
  const [followedDropsCount, totalOrdersCount, unreadNotificationsCount] = await Promise.all([
    db.dropFollow.count({ where: { userId } }),
    db.order.count({ where: { userId } }),
    db.notification.count({ where: { userId, read: false } }),
  ]);
  
  return {
    followedDropsCount,
    totalOrdersCount,
    unreadNotificationsCount,
  };
}

/**
 * Updates user profile
 */
export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      bio: data.bio,
      image: data.avatar,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
    },
  });
  
  revalidateTag('dashboard');
  
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatar: updated.image,
    bio: updated.bio,
  };
}

/**
 * Updates email preferences
 */
export async function updateEmailPreferences(
  preferences: EmailPreferences
): Promise<EmailPreferences> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  await db.emailPreferences.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...preferences,
    },
    update: preferences,
  });
  
  revalidateTag('dashboard');
  
  return preferences;
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  await db.notification.update({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: { read: true },
  });
  
  revalidateTag('dashboard');
}

/**
 * Marks all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  await db.notification.updateMany({
    where: {
      userId: session.user.id,
      read: false,
    },
    data: { read: true },
  });
  
  revalidateTag('dashboard');
}
```


```typescript
// features/dashboard/models/follow.actions.ts
'use server'

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';

/**
 * Toggles follow status for a drop
 * Used by both homepage and dashboard
 */
export async function toggleDropFollow(dropId: string): Promise<{ followed: boolean }> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const existing = await db.dropFollow.findUnique({
    where: {
      userId_dropId: {
        userId: session.user.id,
        dropId,
      },
    },
  });
  
  if (existing) {
    // Unfollow
    await db.dropFollow.delete({
      where: {
        userId_dropId: {
          userId: session.user.id,
          dropId,
        },
      },
    });
    
    revalidateTag('dashboard');
    revalidateTag('homepage');
    
    return { followed: false };
  } else {
    // Follow
    await db.dropFollow.create({
      data: {
        userId: session.user.id,
        dropId,
      },
    });
    
    revalidateTag('dashboard');
    revalidateTag('homepage');
    
    return { followed: true };
  }
}

/**
 * Fetches followed drop IDs for the authenticated user
 * Used by homepage to show follow state on drop cards
 */
export async function fetchFollowedDropIds(): Promise<string[]> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }
  
  const follows = await db.dropFollow.findMany({
    where: { userId: session.user.id },
    select: { dropId: true },
  });
  
  return follows.map(f => f.dropId);
}
```

```typescript
// features/dashboard/models/order.actions.ts
'use server'

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { OrderSummary, OrderDetail } from './dashboard.types';

/**
 * Fetches paginated order history
 */
export async function fetchOrderHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<{ orders: OrderSummary[]; total: number }> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        drop: {
          include: {
            curator: {
              include: { user: true },
            },
          },
        },
        items: true,
      },
    }),
    db.order.count({ where: { userId: session.user.id } }),
  ]);
  
  return {
    orders: orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      dropTitle: order.drop.title,
      dropCoverImage: order.drop.coverImageUrl,
      curatorName: order.drop.curator.user.name,
      purchaseDate: order.createdAt,
      totalAmount: order.totalAmount,
      status: order.status,
      itemCount: order.items.length,
    })),
    total,
  };
}

/**
 * Fetches detailed order information
 */
export async function fetchOrderDetails(orderId: string): Promise<OrderDetail> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const order = await db.order.findUnique({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      drop: {
        include: {
          curator: {
            include: { user: true },
          },
        },
      },
      items: true,
      shippingAddress: true,
    },
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    dropTitle: order.drop.title,
    dropCoverImage: order.drop.coverImageUrl,
    curatorName: order.drop.curator.user.name,
    purchaseDate: order.createdAt,
    totalAmount: order.totalAmount,
    status: order.status,
    itemCount: order.items.length,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: {
      name: order.shippingAddress.name,
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zipCode: order.shippingAddress.zipCode,
      country: order.shippingAddress.country,
    },
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    estimatedDelivery: order.estimatedDelivery,
    notes: order.notes,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
  };
}
```


### Real-Time Updates via SSE

```typescript
// app/api/dashboard/stream/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for real-time dashboard updates
 * Streams followed drop status changes, countdown updates, and notifications
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const followedDrops = await fetchUserFollowedDrops(session.user.id);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(followedDrops)}\n\n`));
      
      // Update every second for countdowns
      const interval = setInterval(async () => {
        try {
          const drops = await fetchUserFollowedDrops(session.user.id);
          const data = drops.map(drop => ({
            id: drop.id,
            inventory: drop.inventory,
            status: drop.status,
            startTime: drop.startTime.toISOString(),
            endTime: drop.endTime.toISOString(),
          }));
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('SSE error:', error);
        }
      }, 1000);
      
      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function fetchUserFollowedDrops(userId: string) {
  const follows = await db.dropFollow.findMany({
    where: { userId },
    include: {
      drop: {
        select: {
          id: true,
          inventory: true,
          status: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
  
  return follows.map(f => f.drop);
}
```


### ViewModel: Zustand Store

```typescript
// features/dashboard/stores/dashboard.store.ts
'use client'

import { createStore } from 'zustand';
import {
  fetchDashboardData,
  updateUserProfile,
  updateEmailPreferences,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../models/dashboard.actions';
import { toggleDropFollow } from '../models/follow.actions';
import { fetchOrderHistory, fetchOrderDetails } from '../models/order.actions';
import type {
  DashboardData,
  FollowedDrop,
  OrderSummary,
  OrderDetail,
  Notification,
  UserProfile,
  EmailPreferences,
  FollowedDropsFilter,
} from '../models/dashboard.types';

export interface DashboardStore {
  // State
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  eventSource: EventSource | null;
  followedDropsFilter: FollowedDropsFilter;
  orderHistory: {
    orders: OrderSummary[];
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
  };
  selectedOrder: OrderDetail | null;
  
  // Actions
  loadDashboardData: () => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribe: () => void;
  updateDropFromSSE: (dropUpdate: Partial<FollowedDrop>) => void;
  
  // Follow actions
  unfollowDrop: (dropId: string) => Promise<void>;
  
  // Filter actions
  setFollowedDropsFilter: (filter: FollowedDropsFilter) => void;
  clearFollowedDropsFilter: () => void;
  
  // Order actions
  loadOrderHistory: (page: number) => Promise<void>;
  loadOrderDetails: (orderId: string) => Promise<void>;
  
  // Profile actions
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Preferences actions
  updatePreferences: (preferences: EmailPreferences) => Promise<void>;
  
  // Notification actions
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const createDashboardStore = () => {
  return createStore<DashboardStore>((set, get) => ({
    // Initial state
    data: null,
    loading: false,
    error: null,
    eventSource: null,
    followedDropsFilter: {},
    orderHistory: {
      orders: [],
      total: 0,
      page: 1,
      pageSize: 20,
      loading: false,
    },
    selectedOrder: null,
    
    // Load dashboard data
    loadDashboardData: async () => {
      set({ loading: true, error: null });
      
      try {
        const data = await fetchDashboardData();
        set({ data, loading: false });
        
        // Subscribe to real-time updates after initial load
        get().subscribeToUpdates();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load dashboard',
          loading: false,
        });
      }
    },
    
    // Subscribe to SSE for real-time updates
    subscribeToUpdates: () => {
      const eventSource = new EventSource('/api/dashboard/stream');
      
      eventSource.onmessage = (event) => {
        try {
          const updates = JSON.parse(event.data);
          
          // Update each followed drop with new data
          updates.forEach((update: any) => {
            get().updateDropFromSSE({
              id: update.id,
              inventory: update.inventory,
              status: update.status,
              startTime: new Date(update.startTime),
              endTime: new Date(update.endTime),
            });
          });
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        
        // Retry connection after 5 seconds
        setTimeout(() => {
          if (get().eventSource === eventSource) {
            get().subscribeToUpdates();
          }
        }, 5000);
      };
      
      set({ eventSource });
    },
    
    // Unsubscribe from SSE
    unsubscribe: () => {
      const { eventSource } = get();
      if (eventSource) {
        eventSource.close();
        set({ eventSource: null });
      }
    },
    
    // Update a single followed drop from SSE data
    updateDropFromSSE: (dropUpdate) => {
      set((state) => {
        if (!state.data) return state;
        
        const updatedFollowedDrops = state.data.followedDrops.map(drop =>
          drop.id === dropUpdate.id ? { ...drop, ...dropUpdate } : drop
        );
        
        return {
          data: {
            ...state.data,
            followedDrops: updatedFollowedDrops,
          },
        };
      });
    },
    
    // Unfollow a drop
    unfollowDrop: async (dropId: string) => {
      // Optimistic UI update
      set((state) => {
        if (!state.data) return state;
        
        return {
          data: {
            ...state.data,
            followedDrops: state.data.followedDrops.filter(drop => drop.id !== dropId),
            stats: {
              ...state.data.stats,
              followedDropsCount: state.data.stats.followedDropsCount - 1,
            },
          },
        };
      });
      
      try {
        await toggleDropFollow(dropId);
      } catch (error) {
        // Revert optimistic update on error
        await get().loadDashboardData();
        throw error;
      }
    },
    
    // Set followed drops filter
    setFollowedDropsFilter: (filter) => {
      set({ followedDropsFilter: filter });
    },
    
    // Clear followed drops filter
    clearFollowedDropsFilter: () => {
      set({ followedDropsFilter: {} });
    },
    
    // Load order history
    loadOrderHistory: async (page: number) => {
      set((state) => ({
        orderHistory: { ...state.orderHistory, loading: true },
      }));
      
      try {
        const { orders, total } = await fetchOrderHistory(page, get().orderHistory.pageSize);
        set((state) => ({
          orderHistory: {
            ...state.orderHistory,
            orders,
            total,
            page,
            loading: false,
          },
        }));
      } catch (error) {
        set((state) => ({
          orderHistory: { ...state.orderHistory, loading: false },
        }));
        throw error;
      }
    },
    
    // Load order details
    loadOrderDetails: async (orderId: string) => {
      try {
        const order = await fetchOrderDetails(orderId);
        set({ selectedOrder: order });
      } catch (error) {
        console.error('Failed to load order details:', error);
        throw error;
      }
    },
    
    // Update profile
    updateProfile: async (data: Partial<UserProfile>) => {
      // Optimistic UI update
      set((state) => {
        if (!state.data) return state;
        
        return {
          data: {
            ...state.data,
            profile: { ...state.data.profile, ...data },
          },
        };
      });
      
      try {
        const updated = await updateUserProfile(data);
        set((state) => {
          if (!state.data) return state;
          
          return {
            data: {
              ...state.data,
              profile: updated,
            },
          };
        });
      } catch (error) {
        // Revert optimistic update on error
        await get().loadDashboardData();
        throw error;
      }
    },
    
    // Update email preferences
    updatePreferences: async (preferences: EmailPreferences) => {
      // Optimistic UI update
      set((state) => {
        if (!state.data) return state;
        
        return {
          data: {
            ...state.data,
            emailPreferences: preferences,
          },
        };
      });
      
      try {
        await updateEmailPreferences(preferences);
      } catch (error) {
        // Revert optimistic update on error
        await get().loadDashboardData();
        throw error;
      }
    },
    
    // Mark notification as read
    markNotificationRead: async (notificationId: string) => {
      // Optimistic UI update
      set((state) => {
        if (!state.data) return state;
        
        const updatedNotifications = state.data.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        return {
          data: {
            ...state.data,
            notifications: updatedNotifications,
            stats: {
              ...state.data.stats,
              unreadNotificationsCount: unreadCount,
            },
          },
        };
      });
      
      try {
        await markNotificationAsRead(notificationId);
      } catch (error) {
        // Revert optimistic update on error
        await get().loadDashboardData();
        throw error;
      }
    },
    
    // Mark all notifications as read
    markAllNotificationsRead: async () => {
      // Optimistic UI update
      set((state) => {
        if (!state.data) return state;
        
        return {
          data: {
            ...state.data,
            notifications: state.data.notifications.map(n => ({ ...n, read: true })),
            stats: {
              ...state.data.stats,
              unreadNotificationsCount: 0,
            },
          },
        };
      });
      
      try {
        await markAllNotificationsAsRead();
      } catch (error) {
        // Revert optimistic update on error
        await get().loadDashboardData();
        throw error;
      }
    },
  }));
};
```


### Glue Layer: Context Provider and Hook

```typescript
// features/dashboard/hooks/useDashboard.ts
'use client'

import { createContext, useContext, useRef, useEffect } from 'react';
import { useStore } from 'zustand';
import { createDashboardStore, DashboardStore } from '../stores/dashboard.store';

const DashboardStoreContext = createContext<ReturnType<typeof createDashboardStore> | null>(null);

export function DashboardStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createDashboardStore());
  
  useEffect(() => {
    const store = storeRef.current;
    const state = store.getState();
    
    // Load data on mount
    state.loadDashboardData();
    
    // Cleanup on unmount
    return () => {
      state.unsubscribe();
    };
  }, []);
  
  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
}

export function useDashboard<T>(selector: (state: DashboardStore) => T): T {
  const store = useContext(DashboardStoreContext);
  if (!store) {
    throw new Error('useDashboard must be used within DashboardStoreProvider');
  }
  return useStore(store, selector);
}

// Convenience hooks for common selectors
export function useDashboardData() {
  return useDashboard((state) => state.data);
}

export function useDashboardLoading() {
  return useDashboard((state) => state.loading);
}

export function useDashboardError() {
  return useDashboard((state) => state.error);
}

export function useFollowedDrops() {
  const drops = useDashboard((state) => state.data?.followedDrops || []);
  const filter = useDashboard((state) => state.followedDropsFilter);
  
  // Apply filters
  let filtered = drops;
  
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      drop =>
        drop.title.toLowerCase().includes(query) ||
        drop.curator.name.toLowerCase().includes(query)
    );
  }
  
  if (filter.status && filter.status.length > 0) {
    filtered = filtered.filter(drop => filter.status!.includes(drop.status));
  }
  
  return filtered;
}

export function useGroupedFollowedDrops() {
  const drops = useFollowedDrops();
  
  return {
    live: drops.filter(d => d.status === 'live').sort((a, b) => 
      a.endTime.getTime() - b.endTime.getTime()
    ),
    upcoming: drops.filter(d => d.status === 'upcoming').sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    ),
    ended: drops.filter(d => d.status === 'ended' || d.status === 'sold_out').sort((a, b) => 
      b.endTime.getTime() - a.endTime.getTime()
    ),
  };
}

export function useRecentOrders() {
  return useDashboard((state) => state.data?.recentOrders || []);
}

export function useOrderHistory() {
  return useDashboard((state) => state.orderHistory);
}

export function useSelectedOrder() {
  return useDashboard((state) => state.selectedOrder);
}

export function useNotifications() {
  return useDashboard((state) => state.data?.notifications || []);
}

export function useUnreadNotifications() {
  const notifications = useNotifications();
  return notifications.filter(n => !n.read);
}

export function useUserProfile() {
  return useDashboard((state) => state.data?.profile);
}

export function useEmailPreferences() {
  return useDashboard((state) => state.data?.emailPreferences);
}

export function useDashboardStats() {
  return useDashboard((state) => state.data?.stats);
}

export function useUnfollowDrop() {
  return useDashboard((state) => state.unfollowDrop);
}

export function useSetFollowedDropsFilter() {
  return useDashboard((state) => state.setFollowedDropsFilter);
}

export function useClearFollowedDropsFilter() {
  return useDashboard((state) => state.clearFollowedDropsFilter);
}

export function useLoadOrderHistory() {
  return useDashboard((state) => state.loadOrderHistory);
}

export function useLoadOrderDetails() {
  return useDashboard((state) => state.loadOrderDetails);
}

export function useUpdateProfile() {
  return useDashboard((state) => state.updateProfile);
}

export function useUpdatePreferences() {
  return useDashboard((state) => state.updatePreferences);
}

export function useMarkNotificationRead() {
  return useDashboard((state) => state.markNotificationRead);
}

export function useMarkAllNotificationsRead() {
  return useDashboard((state) => state.markAllNotificationsRead);
}
```


## Error Handling

### Error Boundaries

```typescript
// components/dashboard/DashboardErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Dashboard error:', error, errorInfo);
    
    // Log to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>We're having trouble loading your dashboard. Please try refreshing.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Error Toast Notifications

```typescript
// lib/toast.ts
import { toast } from 'sonner';

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
}

export function showInfoToast(message: string) {
  toast.info(message, {
    duration: 4000,
    position: 'top-right',
  });
}
```

### Network Error Handling

```typescript
// lib/error-handling.ts
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AuthenticationError) {
    // Redirect to login
    window.location.href = '/auth/signin?callbackUrl=' + window.location.pathname;
    return 'Session expired. Please log in again.';
  }
  
  if (error instanceof NetworkError) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
```


## Testing Strategy

### Dual Testing Approach

The dashboard uses both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Component rendering with mocked data
- User interactions (clicks, form submissions)
- Error states and empty states
- Loading states and skeleton loaders
- Integration between components

**Property-Based Tests**: Verify universal properties across all inputs
- Filter and search operations
- Optimistic UI updates and rollbacks
- Data transformation utilities
- Countdown calculations
- Notification grouping logic

Both testing approaches are complementary and necessary for comprehensive coverage.

### Unit Testing

Unit tests focus on individual components and utility functions in isolation.

**Test Coverage**:
- Component rendering with various props
- User interaction handlers
- Form validation logic
- Data transformation utilities
- Error handling

**Example Unit Test**:
```typescript
// components/dashboard/FollowedDropCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FollowedDropCard } from './FollowedDropCard';

describe('FollowedDropCard', () => {
  const mockDrop = {
    id: '1',
    title: 'Mechanical Keyboard Mystery Box',
    coverImageUrl: '/images/drop.jpg',
    price: 49.99,
    inventory: 23,
    status: 'live' as const,
    startTime: new Date('2024-01-01'),
    endTime: new Date('2024-01-10'),
    dropType: 'mystery_box' as const,
    collective: 'MOD' as const,
    curator: {
      id: 'c1',
      name: 'KeycapKing',
      avatar: '/avatars/curator.jpg',
      verified: true,
    },
    followedAt: new Date('2023-12-15'),
    hasNotification: false,
  };
  
  it('should render drop information', () => {
    render(
      <FollowedDropCard 
        drop={mockDrop} 
        onUnfollow={jest.fn()} 
        onCardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Mechanical Keyboard Mystery Box')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('23 left')).toBeInTheDocument();
    expect(screen.getByText('KeycapKing')).toBeInTheDocument();
  });
  
  it('should call onUnfollow when unfollow button is clicked', () => {
    const handleUnfollow = jest.fn();
    render(
      <FollowedDropCard 
        drop={mockDrop} 
        onUnfollow={handleUnfollow} 
        onCardClick={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /unfollow/i }));
    
    expect(handleUnfollow).toHaveBeenCalledWith('1');
  });
  
  it('should show notification indicator when hasNotification is true', () => {
    const dropWithNotification = { ...mockDrop, hasNotification: true };
    render(
      <FollowedDropCard 
        drop={dropWithNotification} 
        onUnfollow={jest.fn()} 
        onCardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByLabelText(/new notification/i)).toBeInTheDocument();
  });
  
  it('should show sold out overlay when status is sold_out', () => {
    const soldOutDrop = { ...mockDrop, status: 'sold_out' as const };
    render(
      <FollowedDropCard 
        drop={soldOutDrop} 
        onUnfollow={jest.fn()} 
        onCardClick={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });
});
```

### Property-Based Testing Configuration

- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: user-dashboard, Property {number}: {property_text}`
- Use fast-check library for TypeScript

**Example Property Test**:
```typescript
// features/dashboard/models/dashboard.properties.test.ts
import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { filterFollowedDrops, groupDropsByStatus } from './dashboard.utils';

describe('Dashboard Property Tests', () => {
  /**
   * Feature: user-dashboard, Property 1: Filter preservation
   * For any list of followed drops and any search query, filtering should
   * return a subset of the original list
   */
  it('should preserve drop list subset when filtering', () => {
    fc.assert(
      fc.property(
        fc.array(followedDropArbitrary()),
        fc.string(),
        (drops, searchQuery) => {
          const filtered = filterFollowedDrops(drops, { searchQuery });
          
          // Every filtered drop should exist in original list
          filtered.every(drop => drops.some(d => d.id === drop.id));
          
          // Filtered list should be <= original list
          expect(filtered.length).toBeLessThanOrEqual(drops.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: user-dashboard, Property 2: Grouping completeness
   * For any list of followed drops, grouping by status should preserve
   * all drops (no drops lost or duplicated)
   */
  it('should preserve all drops when grouping by status', () => {
    fc.assert(
      fc.property(
        fc.array(followedDropArbitrary()),
        (drops) => {
          const grouped = groupDropsByStatus(drops);
          const totalGrouped = 
            grouped.live.length + 
            grouped.upcoming.length + 
            grouped.ended.length;
          
          expect(totalGrouped).toBe(drops.length);
          
          // No duplicates across groups
          const allIds = [
            ...grouped.live.map(d => d.id),
            ...grouped.upcoming.map(d => d.id),
            ...grouped.ended.map(d => d.id),
          ];
          const uniqueIds = new Set(allIds);
          expect(uniqueIds.size).toBe(allIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Arbitraries for generating test data
function followedDropArbitrary() {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    price: fc.float({ min: 5, max: 10000 }),
    inventory: fc.nat(1000),
    status: fc.constantFrom('upcoming', 'live', 'ended', 'sold_out'),
    dropType: fc.constantFrom('mystery_box', 'surplus', 'limited_edition'),
    collective: fc.constantFrom('MOD', 'MAKE', 'MINI'),
    startTime: fc.date(),
    endTime: fc.date(),
    followedAt: fc.date(),
    hasNotification: fc.boolean(),
  });
}
```

### Integration Testing

Integration tests verify full user flows with Playwright.

**Example Integration Test**:
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/auth/signin');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should display followed drops', async ({ page }) => {
    await page.goto('/dashboard/followed');
    
    // Wait for drops to load
    await expect(page.locator('.followed-drop-card').first()).toBeVisible();
    
    // Check grouping headers exist
    await expect(page.locator('h3:has-text("Live Drops")')).toBeVisible();
    await expect(page.locator('h3:has-text("Upcoming Drops")')).toBeVisible();
  });
  
  test('should unfollow a drop', async ({ page }) => {
    await page.goto('/dashboard/followed');
    
    const initialCount = await page.locator('.followed-drop-card').count();
    
    // Click unfollow on first drop
    await page.locator('.followed-drop-card').first().hover();
    await page.locator('.followed-drop-card').first().locator('button:has-text("Unfollow")').click();
    
    // Wait for optimistic update
    await page.waitForTimeout(500);
    
    const newCount = await page.locator('.followed-drop-card').count();
    expect(newCount).toBe(initialCount - 1);
  });
  
  test('should filter followed drops by search query', async ({ page }) => {
    await page.goto('/dashboard/followed');
    
    // Type in search box
    await page.fill('[placeholder="Search drops..."]', 'keyboard');
    
    // All visible drops should contain "keyboard" in title
    const dropTitles = await page.locator('.followed-drop-card h3').allTextContents();
    dropTitles.forEach(title => {
      expect(title.toLowerCase()).toContain('keyboard');
    });
  });
  
  test('should navigate to order details', async ({ page }) => {
    await page.goto('/dashboard/orders');
    
    // Click first order
    await page.locator('.order-card').first().click();
    
    // Should navigate to order details page
    await expect(page).toHaveURL(/\/dashboard\/orders\/.+/);
    
    // Should display order details
    await expect(page.locator('h2:has-text("Order Details")')).toBeVisible();
  });
  
  test('should update profile', async ({ page }) => {
    await page.goto('/dashboard/profile');
    
    // Update name
    await page.fill('[name="name"]', 'New Name');
    await page.click('button:has-text("Save Changes")');
    
    // Should show success message
    await expect(page.locator('.toast:has-text("Profile updated")')).toBeVisible();
  });
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified testable properties and eliminated redundancy:

**Redundant Properties Identified:**
- Properties 3.2, 3.3, 3.4 (unfollow optimistic UI) can be combined into one comprehensive property about optimistic updates with rollback
- Properties 8.3, 8.4 (preferences optimistic UI) follow the same pattern as unfollow - can use same comprehensive property
- Properties 12.5, 3.3, 8.4, 16.3 (error rollback) are all the same pattern - one property covers all
- Properties 2.3, 3.1, 5.2, 6.2, 16.5, 17.3 (required fields display) can be combined into properties about data completeness
- Properties 2.5, 5.3, 17.2 (reverse chronological order) follow the same sorting pattern
- Properties 12.1, 12.2, 12.3 (error handling) can be combined into one property about error display

**Unique Properties After Reflection:**
1. Authentication redirect for unauthenticated users (1.2)
2. Followed drops grouping preserves all drops (2.4)
3. Drops sorted correctly within groups (2.5)
4. Required fields present for followed drops (2.3)
5. Optimistic UI updates with rollback on error (3.2, 3.3, 3.4, 8.3, 8.4, 16.2, 16.3)
6. Notification creation on drop status changes (4.1)
7. Conditional indicators based on drop state (4.2, 4.3)
8. Unread notification count matches actual unread (4.4)
9. Viewing notification marks it as read (4.5)
10. Required fields present for orders (5.2)
11. Orders sorted in reverse chronological order (5.3, 17.2)
12. Pagination returns correct subset (5.5)
13. Required fields present for order details (6.2)
14. Conditional tracking link display (6.3)
15. Profile validation rejects invalid input (7.3, 7.4)
16. Search filter returns matching subset (15.2, 15.4)
17. URL state persistence (15.5)
18. Conditional curator follow button display (16.1)
19. Required fields present for curators (16.5)
20. Required fields present for notifications (17.3)
21. Notification navigation to related entity (17.4)
22. Mark all notifications as read updates all (17.5)
23. Conditional quick actions for curators (18.3)
24. Data export completeness (19.2, 19.4)
25. Export request logging (19.5)
26. Error handling displays appropriate messages (12.1, 12.2, 12.3)
27. Error logging to monitoring service (12.4)
28. SSE reconnection on connection loss (13.5)
29. ARIA labels present for interactive elements (20.3)


### Property 1: Authentication Redirect

*For any* unauthenticated request to a dashboard route, the system should redirect to the login page with the original URL as the callback parameter

**Validates: Requirements 1.2**

### Property 2: Followed Drops Grouping Completeness

*For any* list of followed drops, grouping by status (live, upcoming, ended) should preserve all drops with no drops lost or duplicated across groups

**Validates: Requirements 2.4**

### Property 3: Status Group Sorting

*For any* list of drops within a status group, they should be sorted in the correct chronological order (live by end time ascending, upcoming by start time ascending, ended by end time descending)

**Validates: Requirements 2.5**

### Property 4: Followed Drop Display Completeness

*For any* followed drop, the rendered card should include title, curator name, status, countdown (if applicable), thumbnail image, price, and inventory

**Validates: Requirements 2.3**

### Property 5: Optimistic UI Updates with Rollback

*For any* mutation operation (unfollow drop, update preferences, follow curator), the UI should update immediately (optimistically), and if the operation fails, the UI should revert to the previous state and display an error message

**Validates: Requirements 3.2, 3.3, 3.4, 8.3, 8.4, 16.2, 16.3**

### Property 6: Drop Status Change Notifications

*For any* followed drop that transitions from upcoming to live status, a notification should be created for the user

**Validates: Requirements 4.1**

### Property 7: Conditional Drop Indicators

*For any* followed drop, if it has less than 1 hour remaining, an urgency indicator should be displayed; if it has sold_out status, a sold-out indicator should be displayed

**Validates: Requirements 4.2, 4.3**

### Property 8: Unread Notification Count Accuracy

*For any* user's notification list, the displayed unread count should equal the actual number of notifications with read=false

**Validates: Requirements 4.4**

### Property 9: Notification Read State Update

*For any* notification, when a user views it, the notification's read property should be set to true

**Validates: Requirements 4.5**

### Property 10: Order Display Completeness

*For any* order in the order history list, the rendered card should include order number, drop title, curator name, purchase date, total amount, status, and item count

**Validates: Requirements 5.2**

### Property 11: Reverse Chronological Sorting

*For any* list of orders or notifications, they should be sorted in reverse chronological order (most recent first)

**Validates: Requirements 5.3, 17.2**

### Property 12: Pagination Subset Correctness

*For any* page number and page size, the returned orders should be the correct subset of the total orders, with no duplicates across pages and all orders represented across all pages

**Validates: Requirements 5.5**

### Property 13: Order Details Completeness

*For any* order details view, the display should include order number, purchase date, drop title, curator information, items list, shipping address, and tracking information (if available)

**Validates: Requirements 6.2**

### Property 14: Conditional Tracking Link Display

*For any* order with a non-null trackingNumber, the order details should display a clickable tracking link

**Validates: Requirements 6.3**

### Property 15: Profile Validation

*For any* profile update with invalid data (name too short, invalid email format, bio too long), validation should fail and display specific error messages for each invalid field

**Validates: Requirements 7.3, 7.4**

### Property 16: Search Filter Subset

*For any* search query applied to followed drops, the filtered results should be a subset of the original list, with every filtered drop matching the search query in either title or curator name

**Validates: Requirements 15.2, 15.4**

### Property 17: URL State Persistence

*For any* filter or search state applied to followed drops, the URL query parameters should reflect that state, and loading the page with those parameters should restore the filter state

**Validates: Requirements 15.5**

### Property 18: Conditional Curator Follow Button

*For any* followed drop where the user is not already following the curator, a "Follow Curator" button should be displayed

**Validates: Requirements 16.1**

### Property 19: Curator Display Completeness

*For any* followed curator, the rendered card should include the curator's name, profile picture, and active drop count

**Validates: Requirements 16.5**

### Property 20: Notification Display Completeness

*For any* notification, the rendered item should include notification type, message, timestamp, and related drop or order ID (if applicable)

**Validates: Requirements 17.3**

### Property 21: Notification Navigation

*For any* notification with a related drop or order, clicking the notification should navigate to the corresponding drop or order page

**Validates: Requirements 17.4**

### Property 22: Mark All Notifications Read

*For any* user's notification list, marking all as read should set the read property to true for every notification

**Validates: Requirements 17.5**

### Property 23: Conditional Curator Quick Actions

*For any* user with curator role, the quick actions menu should include a link to the curator dashboard

**Validates: Requirements 18.3**

### Property 24: Data Export Completeness

*For any* user data export, the generated JSON should include all followed drops, all orders, profile information, and timestamps for all activities

**Validates: Requirements 19.2, 19.4**

### Property 25: Export Request Audit Logging

*For any* data export request, an audit log entry should be created with the user ID, action type, and timestamp

**Validates: Requirements 19.5**

### Property 26: Error Message Display

*For any* error (server error, network error, authentication error), the dashboard should display an appropriate user-friendly error message

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 27: Error Monitoring Logging

*For any* error that occurs in the dashboard, an error log entry should be sent to the error monitoring service (Sentry)

**Validates: Requirements 12.4**

### Property 28: SSE Reconnection

*For any* SSE connection loss, the dashboard should attempt to reconnect automatically after a delay

**Validates: Requirements 13.5**

### Property 29: ARIA Label Presence

*For any* interactive element (button, link, input), an appropriate ARIA label should be present for screen reader accessibility

**Validates: Requirements 20.3**

