---
inclusion: manual
---
# Email Communication

## Philosophy

Email is a critical touchpoint. Use transactional emails only (no marketing without consent), provide clear unsubscribe options, and ensure emails are accessible and mobile-friendly. Test across email clients and respect user preferences. Never fail an order because email sending failed—queue for retry instead.

## Email Checklist

- [ ] Resend configured with API key
- [ ] React Email templates created
- [ ] Order confirmation email
- [ ] Drop alert email
- [ ] Welcome email
- [ ] Password reset email
- [ ] All emails have unsubscribe link
- [ ] Alt text on all images
- [ ] Responsive design (mobile-friendly)
- [ ] Plain text fallback
- [ ] Subject lines under 50 characters
- [ ] Tested across email clients (Gmail, Outlook, Apple Mail)
- [ ] Email preferences page implemented
- [ ] Error handling with retry queue
- [ ] CAN-SPAM compliance (company address in footer)

## Email Service Provider

Use Resend for transactional emails. It's developer-friendly, has a generous free tier, and integrates well with React.

## Setup

```bash
npm install resend react-email @react-email/components
```

```typescript
// lib/email.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'Dropr <noreply@dropr.com>';
```

```env
# .env.local
RESEND_API_KEY=re_...
```

## Email Templates

Use React Email for type-safe, component-based email templates.

### Template Structure

```
emails/
├── components/
│   ├── EmailLayout.tsx
│   ├── Button.tsx
│   └── Footer.tsx
├── OrderConfirmation.tsx
├── DropAlert.tsx
├── WelcomeEmail.tsx
└── PasswordReset.tsx
```

### Base Layout

```typescript
// emails/components/EmailLayout.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
} from '@react-email/components';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://dropr.com/logo.png"
              width="120"
              height="40"
              alt="Dropr"
            />
          </Section>
          
          <Section style={content}>
            {children}
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 Dropr. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://dropr.com/unsubscribe">Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 48px',
};

const content = {
  padding: '0 48px',
};

const footer = {
  padding: '32px 48px',
  borderTop: '1px solid #e6ebf1',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
```

### Order Confirmation Email

```typescript
// emails/OrderConfirmation.tsx
import {
  Text,
  Heading,
  Button,
  Section,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface OrderConfirmationProps {
  orderId: string;
  dropTitle: string;
  quantity: number;
  total: number;
  orderDate: Date;
}

export function OrderConfirmation({
  orderId,
  dropTitle,
  quantity,
  total,
  orderDate,
}: OrderConfirmationProps) {
  return (
    <EmailLayout preview="Your order has been confirmed">
      <Heading style={h1}>Order Confirmed!</Heading>
      
      <Text style={text}>
        Thank you for your purchase. Your order has been confirmed and will be
        processed shortly.
      </Text>
      
      <Section style={orderDetails}>
        <Row>
          <Column>
            <Text style={label}>Order Number</Text>
            <Text style={value}>{orderId}</Text>
          </Column>
          <Column>
            <Text style={label}>Order Date</Text>
            <Text style={value}>{orderDate.toLocaleDateString()}</Text>
          </Column>
        </Row>
      </Section>
      
      <Section style={itemSection}>
        <Text style={itemTitle}>{dropTitle}</Text>
        <Text style={itemDetails}>Quantity: {quantity}</Text>
        <Text style={itemPrice}>${total.toFixed(2)}</Text>
      </Section>
      
      <Button
        href={`https://dropr.com/orders/${orderId}`}
        style={button}
      >
        View Order Details
      </Button>
      
      <Text style={text}>
        You'll receive a shipping notification once your order ships.
      </Text>
    </EmailLayout>
  );
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 16px',
};

const text = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const value = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 16px',
};

const orderDetails = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const itemSection = {
  borderTop: '1px solid #e5e7eb',
  borderBottom: '1px solid #e5e7eb',
  padding: '16px 0',
  margin: '24px 0',
};

const itemTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const itemDetails = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px',
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '8px 0 0',
};

const button = {
  backgroundColor: '#262083',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
};
```

### Drop Alert Email

```typescript
// emails/DropAlert.tsx
import {
  Text,
  Heading,
  Button,
  Img,
  Section,
} from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface DropAlertProps {
  dropTitle: string;
  dropDescription: string;
  dropImage: string;
  price: number;
  startTime: Date;
  dropUrl: string;
}

export function DropAlert({
  dropTitle,
  dropDescription,
  dropImage,
  price,
  startTime,
  dropUrl,
}: DropAlertProps) {
  const timeUntilDrop = Math.floor(
    (startTime.getTime() - Date.now()) / (1000 * 60 * 60)
  );
  
  return (
    <EmailLayout preview={`New drop: ${dropTitle}`}>
      <Heading style={h1}>New Drop Alert! 🎉</Heading>
      
      <Text style={text}>
        A new drop you might be interested in is starting soon.
      </Text>
      
      <Section style={dropCard}>
        <Img
          src={dropImage}
          alt={dropTitle}
          width="100%"
          style={dropImage}
        />
        
        <Heading style={dropTitle}>{dropTitle}</Heading>
        
        <Text style={dropDescription}>{dropDescription}</Text>
        
        <Section style={dropMeta}>
          <Text style={price}>${price.toFixed(2)}</Text>
          <Text style={countdown}>
            Starts in {timeUntilDrop} hours
          </Text>
        </Section>
      </Section>
      
      <Button href={dropUrl} style={button}>
        View Drop
      </Button>
      
      <Text style={text}>
        Don't miss out on this limited drop!
      </Text>
    </EmailLayout>
  );
}

// Styles omitted for brevity (similar to OrderConfirmation)
```

### Welcome Email

```typescript
// emails/WelcomeEmail.tsx
import { Text, Heading, Button } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Dropr!">
      <Heading style={h1}>Welcome to Dropr, {name}! 👋</Heading>
      
      <Text style={text}>
        We're excited to have you join our community of makers, modders, and collectors.
      </Text>
      
      <Text style={text}>
        Dropr is your marketplace for curated drops of mechanical keyboards, PC mods,
        DIY electronics, and miniatures.
      </Text>
      
      <Button href="https://dropr.com/drops" style={button}>
        Browse Drops
      </Button>
      
      <Text style={text}>
        Want to become a curator and sell your own drops?
      </Text>
      
      <Button href="https://dropr.com/curator/apply" style={secondaryButton}>
        Apply to Become a Curator
      </Button>
    </EmailLayout>
  );
}
```

### Password Reset Email

```typescript
// emails/PasswordReset.tsx
import { Text, Heading, Button } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface PasswordResetProps {
  resetUrl: string;
}

export function PasswordReset({ resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={h1}>Reset Your Password</Heading>
      
      <Text style={text}>
        You requested to reset your password. Click the button below to create
        a new password.
      </Text>
      
      <Button href={resetUrl} style={button}>
        Reset Password
      </Button>
      
      <Text style={text}>
        This link will expire in 1 hour.
      </Text>
      
      <Text style={text}>
        If you didn't request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
```

## Sending Emails

### Email Service

```typescript
// lib/email-service.ts
'use server'

import { resend, EMAIL_FROM } from './email';
import { OrderConfirmation } from '@/emails/OrderConfirmation';
import { DropAlert } from '@/emails/DropAlert';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { PasswordReset } from '@/emails/PasswordReset';

export async function sendOrderConfirmation(
  to: string,
  orderData: {
    orderId: string;
    dropTitle: string;
    quantity: number;
    total: number;
    orderDate: Date;
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Order Confirmation - ${orderData.orderId}`,
      react: OrderConfirmation(orderData),
    });

    if (error) {
      console.error('Failed to send order confirmation:', error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendDropAlert(
  to: string,
  dropData: {
    dropTitle: string;
    dropDescription: string;
    dropImage: string;
    price: number;
    startTime: Date;
    dropUrl: string;
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `New Drop: ${dropData.dropTitle}`,
      react: DropAlert(dropData),
    });

    if (error) {
      console.error('Failed to send drop alert:', error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Welcome to Dropr!',
      react: WelcomeEmail({ name }),
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Reset Your Password',
      react: PasswordReset({ resetUrl }),
    });

    if (error) {
      console.error('Failed to send password reset:', error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
```

## Email Notifications

### Notification Triggers

**Buyer Notifications:**
- Order confirmation (immediate)
- Order shipped (when curator marks as shipped)
- Drop alert (when subscribed drop goes live)
- Welcome email (on registration)
- Password reset (on request)

**Curator Notifications:**
- New order received
- Payout processed
- Drop approved/rejected (if moderation exists)
- Low inventory alert

### Batch Email Sending

For drop alerts to multiple users:

```typescript
// lib/batch-email.ts
'use server'

import { resend } from './email';
import { db } from './db';
import { DropAlert } from '@/emails/DropAlert';

export async function sendDropAlertBatch(dropId: string) {
  // Get all users subscribed to this drop's category
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    include: { category: { include: { subscribers: true } } }
  });

  if (!drop) {
    throw new Error('Drop not found');
  }

  const subscribers = drop.category.subscribers;

  // Batch send (Resend supports up to 100 recipients per batch)
  const batchSize = 100;
  
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    await resend.batch.send(
      batch.map(subscriber => ({
        from: 'Dropr <noreply@dropr.com>',
        to: subscriber.email,
        subject: `New Drop: ${drop.title}`,
        react: DropAlert({
          dropTitle: drop.title,
          dropDescription: drop.description,
          dropImage: drop.imageUrl,
          price: drop.price,
          startTime: drop.startTime,
          dropUrl: `${process.env.NEXT_PUBLIC_APP_URL}/drops/${drop.id}`,
        }),
      }))
    );
  }
}
```

## Email Preferences

Allow users to manage email preferences:

```typescript
// features/user/models/email-preferences.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function updateEmailPreferences(preferences: {
  orderUpdates: boolean;
  dropAlerts: boolean;
  curatorUpdates: boolean;
  marketing: boolean;
}) {
  const session = await requireAuth();
  
  await db.user.update({
    where: { id: session.user.id },
    data: { emailPreferences: preferences }
  });
  
  return { success: true };
}

export async function unsubscribeFromAll(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      emailPreferences: {
        orderUpdates: true, // Always keep order updates
        dropAlerts: false,
        curatorUpdates: false,
        marketing: false,
      }
    }
  });
  
  return { success: true };
}
```

## Testing Emails

### Development Preview

```typescript
// app/api/emails/preview/route.ts
import { OrderConfirmation } from '@/emails/OrderConfirmation';
import { render } from '@react-email/render';

export async function GET() {
  const html = render(
    OrderConfirmation({
      orderId: 'ORD-12345',
      dropTitle: 'Mechanical Keyboard Mystery Box',
      quantity: 1,
      total: 49.99,
      orderDate: new Date(),
    })
  );

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

Visit `http://localhost:3000/api/emails/preview` to preview emails.

### Test Email Sending

```typescript
// Use Resend test mode in development
if (process.env.NODE_ENV === 'development') {
  // Emails won't actually send, but you'll see them in Resend dashboard
}
```

## Best Practices

- Use transactional emails only (no marketing without consent)
- Include unsubscribe link in all emails
- Keep subject lines under 50 characters
- Use plain text fallback for all HTML emails
- Test emails across different clients (Gmail, Outlook, Apple Mail)
- Include alt text for all images
- Use responsive design (mobile-friendly)
- Avoid spam trigger words
- Include company address in footer (CAN-SPAM compliance)
- Rate limit email sending to prevent abuse
- Log all email sends for debugging
- Handle bounces and complaints

## Error Handling

```typescript
try {
  await sendOrderConfirmation(email, orderData);
} catch (error) {
  // Log error but don't fail the order
  console.error('Failed to send confirmation email:', error);
  
  // Optionally queue for retry
  await db.emailQueue.create({
    data: {
      to: email,
      type: 'ORDER_CONFIRMATION',
      data: orderData,
      retryCount: 0,
    }
  });
}
```
