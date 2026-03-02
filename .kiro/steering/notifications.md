---
inclusion: manual
---
# Notifications Strategy

## Philosophy

Notify with purpose, not noise. Every notification should provide value and drive action. Respect user preferences and attention. Use the right channel for the right message—email for important updates, in-app for real-time events, push for urgent actions. Make notifications actionable, timely, and easy to manage. Users should feel informed, not overwhelmed.

## Notifications Checklist

**Core Notifications:**
- [ ] Drop going live alerts (countdown complete)
- [ ] Drop sold out notifications
- [ ] Order confirmation and updates
- [ ] Curator application status
- [ ] New follower notifications (curators)
- [ ] Drop performance updates (curators)

**Channels:**
- [ ] Email notifications configured
- [ ] In-app notification center
- [ ] Push notifications (future)
- [ ] SMS notifications (future, opt-in only)

**User Controls:**
- [ ] Notification preferences page
- [ ] Granular opt-in/opt-out per type
- [ ] Frequency controls (instant, daily digest, weekly)
- [ ] Quiet hours support
- [ ] One-click unsubscribe in emails

**Technical:**
- [ ] Notification queue system
- [ ] Delivery tracking and analytics
- [ ] Failed delivery retry logic
- [ ] Rate limiting per user
- [ ] Notification templates
- [ ] A/B testing framework

## Notification Types

### Buyer Notifications

**Drop Alerts**
- **Trigger**: Drop goes live (countdown reaches zero)
- **Channel**: Email + In-app
- **Priority**: High
- **Timing**: Immediate
- **Content**: Drop title, image, price, curator, CTA to view
- **Frequency**: Per drop (user can follow specific curators/categories)

**Drop Sold Out**
- **Trigger**: Drop inventory reaches zero
- **Channel**: In-app only
- **Priority**: Medium
- **Timing**: Immediate
- **Content**: "Drop sold out. Join waitlist for similar drops."
- **Frequency**: Once per drop

**Order Confirmation**
- **Trigger**: Payment successful
- **Channel**: Email
- **Priority**: Critical
- **Timing**: Immediate
- **Content**: Order details, tracking info, estimated delivery
- **Frequency**: Once per order

**Order Shipped**
- **Trigger**: Curator marks order as shipped
- **Channel**: Email + In-app
- **Priority**: High
- **Timing**: Immediate
- **Content**: Tracking number, carrier, estimated delivery
- **Frequency**: Once per order

**Order Delivered**
- **Trigger**: Tracking shows delivered
- **Channel**: Email + In-app
- **Priority**: Medium
- **Timing**: Immediate
- **Content**: Confirmation, request for review
- **Frequency**: Once per order

**Drop Reminder**
- **Trigger**: 24 hours before drop goes live
- **Channel**: Email (opt-in)
- **Priority**: Medium
- **Timing**: 24 hours before
- **Content**: Drop preview, countdown, CTA to set reminder
- **Frequency**: Once per followed drop

### Curator Notifications

**Application Approved**
- **Trigger**: Admin approves curator application
- **Channel**: Email
- **Priority**: Critical
- **Timing**: Immediate
- **Content**: Welcome message, next steps, CTA to create first drop
- **Frequency**: Once

**Application Rejected**
- **Trigger**: Admin rejects curator application
- **Channel**: Email
- **Priority**: High
- **Timing**: Immediate
- **Content**: Reason for rejection, appeal process
- **Frequency**: Once

**New Order**
- **Trigger**: Buyer purchases from curator's drop
- **Channel**: Email + In-app
- **Priority**: High
- **Timing**: Immediate
- **Content**: Order details, buyer info, fulfillment instructions
- **Frequency**: Per order

**Drop Performance Update**
- **Trigger**: Drop reaches 50%, 75%, 90% sold
- **Channel**: In-app
- **Priority**: Medium
- **Timing**: Immediate
- **Content**: Percentage sold, remaining inventory, time left
- **Frequency**: Per milestone

**Drop Ending Soon**
- **Trigger**: 24 hours before drop ends
- **Channel**: Email + In-app
- **Priority**: Medium
- **Timing**: 24 hours before
- **Content**: Current sales, remaining inventory, CTA to promote
- **Frequency**: Once per drop

**Payout Processed**
- **Trigger**: Stripe payout completed
- **Channel**: Email
- **Priority**: High
- **Timing**: Immediate
- **Content**: Payout amount, date, bank account last 4 digits
- **Frequency**: Per payout

**New Follower**
- **Trigger**: Buyer follows curator
- **Channel**: In-app
- **Priority**: Low
- **Timing**: Batched (daily digest)
- **Content**: Follower count, follower name
- **Frequency**: Daily digest

**Review Received**
- **Trigger**: Buyer leaves review on drop
- **Channel**: In-app
- **Priority**: Medium
- **Timing**: Immediate
- **Content**: Review text, rating, drop name
- **Frequency**: Per review

## Notification Channels

### Email Notifications

**Use for:**
- Critical updates (order confirmation, payment)
- Important status changes (application approved, drop live)
- Periodic summaries (weekly performance)
- Marketing (opt-in only)

**Best Practices:**
- Clear subject lines (< 50 characters)
- Mobile-friendly design
- Single clear CTA
- Unsubscribe link in footer
- Plain text fallback
- Personalization (user name, drop name)

**Template Structure:**
```
Subject: [Action Required] Your Drop "Keyboard Mystery Box" is Live

Hi [Curator Name],

Your drop "Mechanical Keyboard Mystery Box" just went live!

[Drop Image]

Current Status:
- 0 of 50 sold
- $0 revenue
- 48 hours remaining

[View Drop Performance] [Promote Drop]

Good luck!
- The Dropr Team

---
Unsubscribe | Notification Preferences
```

### In-App Notifications

In-app notifications come in two forms: **Notification Center** (persistent history) and **Toast Notifications** (transient alerts).

#### Notification Center (Persistent History)

**Use for:**
- Historical record of all notifications
- Notifications that require action
- Updates user might want to reference later
- Low-priority updates (new follower, review received)

**UI Components:**
- Notification bell icon with badge count (unread)
- Dropdown notification center
- Unread indicator (dot or highlight)
- Mark as read functionality
- Clear all option
- Link to notification preferences
- Pagination or infinite scroll for history

**Location:** Header navigation (bell icon)

**Notification Center Design:**
```
┌─────────────────────────────────────┐
│ Notifications                    ⚙️ │
├─────────────────────────────────────┤
│ 🔴 New Order                   [•]  │
│    Keyboard Mystery Box - $49.99    │
│    2 minutes ago                    │
├─────────────────────────────────────┤
│ 📊 Drop Milestone                   │
│    50% sold! 25 of 50 remaining     │
│    1 hour ago                       │
├─────────────────────────────────────┤
│ ✅ Order Shipped                    │
│    Order #12345 is on its way       │
│    Yesterday                        │
├─────────────────────────────────────┤
│ 👤 New Follower                     │
│    @maker123 followed you           │
│    2 days ago                       │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
// components/notifications/NotificationCenter.tsx
'use client'

import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '@/features/notifications/models/notification.actions';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };
  
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    loadNotifications();
  };
  
  return (
    <div className="notification-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="header">
            <h3>Notifications</h3>
            <button onClick={() => {/* settings */}}>
              <SettingsIcon />
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Toast Notifications (Transient Alerts)

**Use for:**
- Immediate feedback on user actions
- Success confirmations (order placed, drop created)
- Error messages (payment failed, form validation)
- Contextual alerts (drop sold out while viewing)
- System messages (connection lost, auto-saved)

**Characteristics:**
- Auto-dismiss after 3-5 seconds (or user dismisses)
- Non-blocking (doesn't prevent interaction)
- Stackable (multiple toasts can appear)
- Positioned consistently (lower right corner)
- Not stored in notification history

**Location:** Lower right corner of screen (above any chat widgets)

**Toast Types:**
- **Success** (green): Positive confirmations
- **Error** (red): Failures and errors
- **Warning** (orange): Cautions and warnings
- **Info** (blue): Informational messages

**Toast Design:**
```
┌─────────────────────────────────────┐
│ ✓ Order placed successfully!    [×]│
│   Order #12345 • View details       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠ Drop sold out                 [×]│
│   Join waitlist for similar drops   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✗ Payment failed                [×]│
│   Please check your card details    │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
// components/notifications/ToastProvider.tsx
'use client'

import { createContext, useContext, useState } from 'react';
import { Toast } from './Toast';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const ToastContext = createContext<{
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  };
  
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// components/notifications/Toast.tsx
export function Toast({
  type,
  title,
  message,
  action,
  onDismiss,
}: ToastMessage & { onDismiss: () => void }) {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };
  
  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-content">
        <span className="toast-icon">{icons[type]}</span>
        <div className="toast-text">
          <div className="toast-title">{title}</div>
          {message && <div className="toast-message">{message}</div>}
        </div>
      </div>
      
      {action && (
        <button onClick={action.onClick} className="toast-action">
          {action.label}
        </button>
      )}
      
      <button
        onClick={onDismiss}
        className="toast-dismiss"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
```

**Usage Examples:**
```typescript
// Success toast
const { showToast } = useToast();

showToast({
  type: 'success',
  title: 'Order placed successfully!',
  message: 'Order #12345',
  action: {
    label: 'View details',
    onClick: () => router.push('/orders/12345'),
  },
});

// Error toast
showToast({
  type: 'error',
  title: 'Payment failed',
  message: 'Please check your card details',
  duration: 7000, // Show longer for errors
});

// Warning toast
showToast({
  type: 'warning',
  title: 'Drop sold out',
  message: 'Join waitlist for similar drops',
});

// Info toast
showToast({
  type: 'info',
  title: 'Draft auto-saved',
  duration: 3000,
});
```

**Toast Styling:**
```css
/* app/globals.css */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-error {
  border-left: 4px solid var(--color-destructive);
}

.toast-warning {
  border-left: 4px solid var(--color-warning);
}

.toast-info {
  border-left: 4px solid var(--color-info);
}

.toast-dismiss {
  margin-left: auto;
  opacity: 0.5;
  cursor: pointer;
}

.toast-dismiss:hover {
  opacity: 1;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .toast-container {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
```

#### When to Use Each Type

**Notification Center:**
- New order received (curator)
- Drop milestone reached (curator)
- New follower (curator)
- Order shipped (buyer)
- Review received (curator)
- Application status update (curator)
- Any notification user might want to reference later

**Toast Notifications:**
- Order placed successfully (buyer)
- Drop created successfully (curator)
- Payment failed (buyer)
- Form validation errors
- Drop sold out (while viewing)
- Connection lost/restored
- Auto-save confirmations
- Copy to clipboard confirmations
- Any immediate feedback on user action

### Push Notifications (Future)

**Use for:**
- Time-sensitive alerts (drop going live in 5 minutes)
- Urgent actions (payment failed, retry needed)
- Re-engagement (drop from followed curator)

**Requirements:**
- User opt-in required
- Browser/device permission
- Service worker for web push
- APNs for iOS, FCM for Android (native apps)

**Best Practices:**
- Short message (< 100 characters)
- Clear action
- Deep link to relevant page
- Respect quiet hours
- Limit frequency (max 3 per day)

## Notification Preferences

### User Controls

**Granular Opt-In/Opt-Out:**
```typescript
interface NotificationPreferences {
  // Buyer preferences
  dropAlerts: {
    enabled: boolean;
    channels: ('email' | 'inApp' | 'push')[];
    frequency: 'instant' | 'daily' | 'weekly';
    categories: string[]; // Filter by category
    curators: string[]; // Filter by curator
  };
  orderUpdates: {
    enabled: boolean;
    channels: ('email' | 'inApp' | 'push')[];
  };
  marketing: {
    enabled: boolean;
    channels: ('email')[];
    frequency: 'weekly' | 'monthly';
  };
  
  // Curator preferences
  orderNotifications: {
    enabled: boolean;
    channels: ('email' | 'inApp' | 'push')[];
  };
  performanceUpdates: {
    enabled: boolean;
    channels: ('email' | 'inApp')[];
    frequency: 'instant' | 'daily';
  };
  
  // Global settings
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
    timezone: string;
  };
}
```

### Preferences UI

```typescript
// features/settings/components/NotificationPreferences.tsx
export function NotificationPreferences() {
  return (
    <div>
      <h2>Notification Preferences</h2>
      
      <section>
        <h3>Drop Alerts</h3>
        <Toggle
          label="Enable drop alerts"
          checked={preferences.dropAlerts.enabled}
          onChange={handleToggle}
        />
        
        {preferences.dropAlerts.enabled && (
          <>
            <CheckboxGroup
              label="Channels"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'inApp', label: 'In-app' },
                { value: 'push', label: 'Push (coming soon)', disabled: true },
              ]}
              value={preferences.dropAlerts.channels}
              onChange={handleChannelChange}
            />
            
            <Select
              label="Frequency"
              options={[
                { value: 'instant', label: 'Instant' },
                { value: 'daily', label: 'Daily digest' },
                { value: 'weekly', label: 'Weekly digest' },
              ]}
              value={preferences.dropAlerts.frequency}
              onChange={handleFrequencyChange}
            />
          </>
        )}
      </section>
      
      <section>
        <h3>Quiet Hours</h3>
        <Toggle
          label="Enable quiet hours"
          checked={preferences.quietHours.enabled}
          onChange={handleToggle}
        />
        
        {preferences.quietHours.enabled && (
          <>
            <TimeInput
              label="Start time"
              value={preferences.quietHours.start}
              onChange={handleStartTimeChange}
            />
            <TimeInput
              label="End time"
              value={preferences.quietHours.end}
              onChange={handleEndTimeChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
```

## Technical Implementation

### Notification Queue System

```typescript
// lib/notifications/queue.ts
import { db } from '@/lib/db';

interface NotificationJob {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  data: Record<string, any>;
  scheduledFor?: Date;
}

export async function queueNotification(job: NotificationJob) {
  // Check user preferences
  const preferences = await getUserPreferences(job.userId);
  
  if (!shouldSendNotification(preferences, job.type, job.channel)) {
    return { queued: false, reason: 'user_preferences' };
  }
  
  // Check quiet hours
  if (isQuietHours(preferences.quietHours)) {
    job.scheduledFor = getNextAvailableTime(preferences.quietHours);
  }
  
  // Add to queue
  await db.notificationQueue.create({
    data: {
      userId: job.userId,
      type: job.type,
      channel: job.channel,
      data: job.data,
      scheduledFor: job.scheduledFor || new Date(),
      status: 'PENDING',
    },
  });
  
  return { queued: true };
}

export async function processNotificationQueue() {
  const pending = await db.notificationQueue.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() },
    },
    take: 100,
  });
  
  for (const notification of pending) {
    try {
      await sendNotification(notification);
      
      await db.notificationQueue.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (error) {
      await db.notificationQueue.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          retryCount: { increment: 1 },
          lastError: error.message,
        },
      });
    }
  }
}
```

### Notification Templates

```typescript
// lib/notifications/templates.ts
export const notificationTemplates = {
  DROP_LIVE: {
    email: {
      subject: (data) => `🔥 ${data.dropTitle} is Live!`,
      body: (data) => `
        <h1>${data.dropTitle} is now live!</h1>
        <img src="${data.dropImage}" alt="${data.dropTitle}" />
        <p>Price: $${data.price}</p>
        <p>Curated by ${data.curatorName}</p>
        <a href="${data.dropUrl}">View Drop</a>
      `,
    },
    inApp: {
      title: (data) => `${data.dropTitle} is Live!`,
      body: (data) => `$${data.price} • ${data.curatorName}`,
      icon: (data) => data.dropImage,
      action: (data) => ({ type: 'navigate', url: `/drops/${data.dropId}` }),
    },
  },
  
  NEW_ORDER: {
    email: {
      subject: (data) => `New Order: ${data.dropTitle}`,
      body: (data) => `
        <h1>You have a new order!</h1>
        <p>Order #${data.orderId}</p>
        <p>Drop: ${data.dropTitle}</p>
        <p>Quantity: ${data.quantity}</p>
        <p>Total: $${data.total}</p>
        <a href="${data.orderUrl}">View Order Details</a>
      `,
    },
    inApp: {
      title: (data) => 'New Order',
      body: (data) => `${data.dropTitle} • $${data.total}`,
      action: (data) => ({ type: 'navigate', url: `/curator/orders/${data.orderId}` }),
    },
  },
};
```

### Rate Limiting

```typescript
// lib/notifications/rate-limit.ts
export async function checkRateLimit(userId: string, channel: NotificationChannel): Promise<boolean> {
  const limits = {
    email: { count: 10, window: 3600 }, // 10 per hour
    inApp: { count: 50, window: 3600 }, // 50 per hour
    push: { count: 3, window: 86400 }, // 3 per day
  };
  
  const limit = limits[channel];
  const windowStart = new Date(Date.now() - limit.window * 1000);
  
  const count = await db.notification.count({
    where: {
      userId,
      channel,
      createdAt: { gte: windowStart },
    },
  });
  
  return count < limit.count;
}
```

## Analytics and Monitoring

### Track Notification Performance

```typescript
// Track delivery
await db.notificationAnalytics.create({
  data: {
    notificationId: notification.id,
    userId: notification.userId,
    type: notification.type,
    channel: notification.channel,
    status: 'DELIVERED',
    deliveredAt: new Date(),
  },
});

// Track opens (email)
await db.notificationAnalytics.update({
  where: { notificationId: notification.id },
  data: {
    opened: true,
    openedAt: new Date(),
  },
});

// Track clicks
await db.notificationAnalytics.update({
  where: { notificationId: notification.id },
  data: {
    clicked: true,
    clickedAt: new Date(),
  },
});
```

### Key Metrics

- **Delivery rate**: Percentage of notifications successfully delivered
- **Open rate**: Percentage of email notifications opened
- **Click-through rate**: Percentage of notifications clicked
- **Unsubscribe rate**: Percentage of users who unsubscribe
- **Conversion rate**: Percentage of notifications that lead to desired action

## Best Practices

- Send notifications with purpose, not noise
- Respect user preferences and quiet hours
- Use the right channel for the right message
- Make notifications actionable with clear CTAs
- Personalize content (user name, drop name)
- Test notification copy and timing
- Monitor delivery rates and engagement
- Provide easy opt-out mechanisms
- Batch low-priority notifications into digests
- Rate limit to prevent notification fatigue
- A/B test notification strategies
- Track and optimize conversion rates

## Common Mistakes to Avoid

- Sending too many notifications (fatigue)
- Using generic, non-personalized content
- Not respecting user preferences
- Sending notifications at bad times (late night)
- Making it hard to unsubscribe
- Not testing across devices and email clients
- Ignoring delivery failures
- Not tracking engagement metrics
- Using unclear or clickbait subject lines
- Sending notifications without clear value

## Future Enhancements

- Push notifications (web and mobile)
- SMS notifications (opt-in, urgent only)
- Slack/Discord integrations for curators
- Advanced segmentation and targeting
- Predictive send time optimization
- Rich media notifications (video, carousel)
- Interactive notifications (quick actions)
- Notification scheduling (send later)
- A/B testing framework
- Machine learning for personalization
