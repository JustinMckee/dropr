---
inclusion: manual
---
# Payment Processing

## Philosophy

Handle money with extreme care. Never store credit card data, always verify amounts server-side, and use Stripe for all payment processing. Verify user accounts in database before processing payments (JWT alone is not sufficient). Log all payment events and handle failures gracefully with clear user messaging.

## Payment Security Checklist

- [ ] Never expose secret key to client
- [ ] Always verify webhook signatures
- [ ] Use HTTPS in production
- [ ] Validate amounts server-side
- [ ] Check inventory before payment
- [ ] Verify user exists in database before creating payment intent
- [ ] Check user account status (not banned/suspended)
- [ ] Use idempotency keys for retries
- [ ] Log all payment events
- [ ] Handle failed payments gracefully
- [ ] Implement proper error messages
- [ ] Test refund flow thoroughly

## Payment Provider

Use Stripe for all payment processing. Never store credit card information directly.

## Stripe Setup

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

## Payment Flow

### 1. Create Payment Intent (Server Action)

```typescript
// features/checkout/models/payment.actions.ts
'use server'

import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function createPaymentIntent(dropId: string, quantity: number) {
  const session = await requireAuth();
  
  // CRITICAL: Verify user exists in database for financial transactions
  // JWT alone is not sufficient for payment operations
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, status: true }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
    throw new Error('Account is not active');
  }
  
  // Fetch drop details
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    include: { curator: true }
  });
  
  if (!drop) {
    throw new Error('Drop not found');
  }
  
  // Verify inventory
  if (drop.inventory < quantity) {
    throw new Error('Insufficient inventory');
  }
  
  const amount = Math.round(drop.price * quantity * 100); // Convert to cents
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      userId: session.user.id,
      dropId: drop.id,
      quantity: quantity.toString(),
    },
    // Stripe Connect: Transfer to curator (implement later)
    // transfer_data: {
    //   destination: drop.curator.stripeAccountId,
    // },
  });
  
  // Create pending order
  await db.order.create({
    data: {
      userId: session.user.id,
      dropId: drop.id,
      quantity,
      total: drop.price * quantity,
      status: 'PENDING',
      paymentIntentId: paymentIntent.id,
    }
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    amount,
  };
}
```

### 2. Client-Side Payment Form

```typescript
// features/checkout/components/CheckoutForm.tsx
'use client'

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
}

export function CheckoutForm({ clientSecret, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/confirmation`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {error && (
        <div className="text-destructive mt-4">{error}</div>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-6"
      >
        {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
}
```

### 3. Checkout Page

```typescript
// app/checkout/[dropId]/page.tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from '@/features/checkout/models/payment.actions';
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { dropId: string };
  searchParams: { quantity?: string };
}) {
  const quantity = parseInt(searchParams.quantity || '1');
  const { clientSecret, amount } = await createPaymentIntent(params.dropId, quantity);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>
      
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#262083',
            },
          },
        }}
      >
        <CheckoutForm clientSecret={clientSecret} amount={amount} />
      </Elements>
    </div>
  );
}
```

## Webhook Handling

### 1. Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle events
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, dropId, quantity } = paymentIntent.metadata;

  // Update order status
  await db.order.update({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
    }
  });

  // Decrement inventory
  await db.drop.update({
    where: { id: dropId },
    data: {
      inventory: { decrement: parseInt(quantity) },
      soldCount: { increment: parseInt(quantity) },
    }
  });

  // Send confirmation email
  // await sendOrderConfirmationEmail(userId, paymentIntent.id);
  
  console.log(`Payment succeeded: ${paymentIntent.id}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  await db.order.update({
    where: { paymentIntentId: paymentIntent.id },
    data: { status: 'FAILED' }
  });
  
  console.log(`Payment failed: ${paymentIntent.id}`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  
  const order = await db.order.findUnique({
    where: { paymentIntentId }
  });
  
  if (order) {
    await db.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED' }
    });
    
    // Restore inventory
    await db.drop.update({
      where: { id: order.dropId },
      data: {
        inventory: { increment: order.quantity },
        soldCount: { decrement: order.quantity },
      }
    });
  }
  
  console.log(`Refund processed: ${charge.id}`);
}
```

### 2. Webhook Configuration

Set up webhook in Stripe Dashboard:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Get webhook secret and add to `.env.local`

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Refunds

```typescript
// features/orders/models/refund.actions.ts
'use server'

import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function refundOrder(orderId: string, reason?: string) {
  const session = await requireAuth();
  
  // Verify order ownership or admin role
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { drop: true }
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Check authorization (curator or admin)
  if (order.drop.curatorId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  
  if (order.status !== 'COMPLETED') {
    throw new Error('Can only refund completed orders');
  }
  
  // Create refund in Stripe
  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
  });
  
  // Webhook will handle order status update and inventory restoration
  
  return { success: true, refundId: refund.id };
}
```

## Stripe Connect (Curator Payouts)

For marketplace functionality where curators receive payments:

```typescript
// features/curator/models/stripe-connect.actions.ts
'use server'

import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function createConnectAccount() {
  const session = await requireAuth();
  
  if (session.user.role !== 'CURATOR') {
    throw new Error('Only curators can create Connect accounts');
  }
  
  // Create Stripe Connect account
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: session.user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  
  // Save account ID
  await db.curator.update({
    where: { userId: session.user.id },
    data: { stripeAccountId: account.id }
  });
  
  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/curator/stripe/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/curator/stripe/return`,
    type: 'account_onboarding',
  });
  
  return { url: accountLink.url };
}

export async function createPayoutTransfer(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { drop: { include: { curator: true } } }
  });
  
  if (!order || !order.drop.curator.stripeAccountId) {
    throw new Error('Invalid order or curator not connected');
  }
  
  // Calculate platform fee (e.g., 10%)
  const platformFee = Math.round(order.total * 0.1 * 100);
  const curatorAmount = Math.round(order.total * 100) - platformFee;
  
  // Create transfer to curator
  await stripe.transfers.create({
    amount: curatorAmount,
    currency: 'usd',
    destination: order.drop.curator.stripeAccountId,
    transfer_group: order.id,
  });
}
```

## Testing Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Test webhook locally with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Security Checklist

- [ ] Never expose secret key to client
- [ ] Always verify webhook signatures
- [ ] Use HTTPS in production
- [ ] Validate amounts server-side
- [ ] Check inventory before payment
- [ ] Verify user exists in database before creating payment intent (JWT not sufficient)
- [ ] Check user account status (not banned/suspended) before payment
- [ ] Use idempotency keys for retries
- [ ] Log all payment events
- [ ] Handle failed payments gracefully
- [ ] Implement proper error messages
- [ ] Test refund flow thoroughly

## Payment Security Best Practices

### Why Database Verification for Payments

While JWT sessions are fine for general authentication, financial transactions require additional verification:

1. **User Account Status**: Check if user is banned, suspended, or deleted
2. **Fraud Prevention**: Verify user hasn't been flagged for fraudulent activity
3. **Account Integrity**: Ensure account still exists and is in good standing
4. **Audit Trail**: Database query creates a record of who initiated the payment

### Implementation Pattern

```typescript
// lib/auth.ts - Add payment-specific auth helper
export async function requireAuthForPayment() {
  const session = await requireAuth(); // Verify JWT
  
  // Additional database verification for payments
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      status: true,
      isBanned: true,
      // Add any fraud-related fields
    }
  });
  
  if (!user) {
    throw new Error('User account not found');
  }
  
  if (user.status !== 'ACTIVE') {
    throw new Error('Account is not active');
  }
  
  if (user.isBanned) {
    throw new Error('Account has been suspended');
  }
  
  return { session, user };
}
```

Use this helper in all payment-related Server Actions:
- Creating payment intents
- Processing refunds
- Updating payment methods
- Any financial transaction

## Error Handling

```typescript
// Common Stripe errors
try {
  await stripe.paymentIntents.create({...});
} catch (error) {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card declined
    return { error: 'Your card was declined' };
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    // Invalid parameters
    return { error: 'Invalid payment request' };
  } else if (error instanceof Stripe.errors.StripeAPIError) {
    // Stripe API error
    return { error: 'Payment service unavailable' };
  } else {
    // Unknown error
    return { error: 'An unexpected error occurred' };
  }
}
```
