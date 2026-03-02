---
inclusion: fileMatch
fileMatchPattern: '**/*.{ts,tsx}'
---
# Error Handling

## Error Handling Philosophy

- Fail gracefully with helpful user-facing messages
- Log detailed errors for debugging
- Never expose sensitive information in errors
- Provide actionable recovery steps
- Use type-safe error handling

## Error Types

### Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429);
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR', 402);
  }
}
```

## Server Action Error Handling

### Throwing Errors

```typescript
// features/drops/models/drop.actions.ts
'use server'

import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function createDrop(data: CreateDropInput) {
  const session = await requireAuth();
  
  // Validate input
  if (!data.title || data.title.length < 3) {
    throw new ValidationError('Title must be at least 3 characters', 'title');
  }
  
  if (data.price <= 0) {
    throw new ValidationError('Price must be positive', 'price');
  }
  
  // Check authorization
  if (session.user.role !== 'CURATOR') {
    throw new ForbiddenError('Only curators can create drops');
  }
  
  try {
    const drop = await db.drop.create({ data });
    return { success: true, drop };
  } catch (error) {
    console.error('Failed to create drop:', error);
    throw new AppError('Failed to create drop', 'DATABASE_ERROR');
  }
}

export async function updateDrop(dropId: string, data: UpdateDropInput) {
  const session = await requireAuth();
  
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    select: { curatorId: true }
  });
  
  if (!drop) {
    throw new NotFoundError('Drop');
  }
  
  if (drop.curatorId !== session.user.id) {
    throw new ForbiddenError('You can only update your own drops');
  }
  
  try {
    const updated = await db.drop.update({
      where: { id: dropId },
      data,
    });
    return { success: true, drop: updated };
  } catch (error) {
    console.error('Failed to update drop:', error);
    throw new AppError('Failed to update drop', 'DATABASE_ERROR');
  }
}
```

### Catching Errors in Components

```typescript
// features/drops/components/CreateDropForm.tsx
'use client'

import { useState } from 'react';
import { createDrop } from '../models/drop.actions';
import { AppError } from '@/lib/errors';

export function CreateDropForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setFieldErrors({});
    
    try {
      const result = await createDrop({
        title: formData.get('title') as string,
        price: parseFloat(formData.get('price') as string),
        // ... other fields
      });
      
      if (result.success) {
        // Redirect or show success
      }
    } catch (err) {
      if (err instanceof AppError) {
        // Handle known errors
        if (err.code === 'VALIDATION_ERROR' && 'field' in err) {
          setFieldErrors({ [err.field as string]: err.message });
        } else {
          setError(err.message);
        }
      } else {
        // Handle unknown errors
        setError('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', err);
      }
    }
  };
  
  return (
    <form action={handleSubmit}>
      {error && (
        <div role="alert" className="error-message">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" />
        {fieldErrors.title && (
          <span className="field-error">{fieldErrors.title}</span>
        )}
      </div>
      
      {/* More fields */}
      
      <button type="submit">Create Drop</button>
    </form>
  );
}
```

## Error Boundaries

### Root Error Boundary

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>We're sorry, but something unexpected happened.</p>
      
      {process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Error details</summary>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </details>
      )}
      
      <Button onClick={reset}>Try again</Button>
      <Button variant="outline" onClick={() => window.location.href = '/'}>
        Go home
      </Button>
    </div>
  );
}
```

### Feature-Specific Error Boundary

```typescript
// app/drops/error.tsx
'use client'

export default function DropsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Failed to load drops</h2>
      <p>We couldn't load the drops. This might be a temporary issue.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Component Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <p>Something went wrong. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<DropCardSkeleton />}>
  <DropCard drop={drop} />
</ErrorBoundary>
```

## API Route Error Handling

```typescript
// app/api/drops/route.ts
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const drops = await db.drop.findMany();
    return NextResponse.json(drops);
  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate
    if (!body.title) {
      throw new ValidationError('Title is required', 'title');
    }
    
    const drop = await db.drop.create({ data: body });
    return NextResponse.json(drop, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Logging Strategy

### Structured Logging

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    log('info', message, context);
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    log('warn', message, context);
  },
  
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    log('error', message, context, error);
  },
  
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, context);
    }
  },
};

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error
) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
  
  if (error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
      code: error instanceof AppError ? error.code : undefined,
    };
  }
  
  const logFn = level === 'error' ? console.error : 
                level === 'warn' ? console.warn : 
                console.log;
  
  logFn(JSON.stringify(entry));
}
```

### Usage

```typescript
// Log info
logger.info('Drop created', { dropId: drop.id, curatorId: curator.id });

// Log warning
logger.warn('Low inventory', { dropId: drop.id, inventory: drop.inventory });

// Log error
try {
  await processPayment(orderId);
} catch (error) {
  logger.error('Payment processing failed', error as Error, { orderId });
  throw error;
}
```

## Error Monitoring

### Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

### Manual Error Reporting

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'drops',
      action: 'create',
    },
    extra: {
      dropData: sanitizedData,
    },
  });
  throw error;
}
```

## User-Facing Error Messages

### Error Message Guidelines

- Be specific but not technical
- Provide actionable next steps
- Don't expose system details
- Be empathetic and helpful

```typescript
// ✅ Good: Helpful and actionable
"We couldn't process your payment. Please check your card details and try again."

// ❌ Avoid: Technical and unhelpful
"Payment intent creation failed: stripe_error_card_declined"

// ✅ Good: Clear and specific
"This drop is sold out. Sign up for notifications when similar drops become available."

// ❌ Avoid: Vague
"Error occurred"
```

### Error Message Component

```typescript
// components/ErrorMessage.tsx
interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorMessage({ title, message, action }: ErrorMessageProps) {
  return (
    <div role="alert" className="error-message">
      {title && <h3>{title}</h3>}
      <p>{message}</p>
      {action && (
        <button onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

// Usage
<ErrorMessage
  title="Payment Failed"
  message="We couldn't process your payment. Please check your card details and try again."
  action={{
    label: "Update Payment Method",
    onClick: () => router.push('/settings/payment')
  }}
/>
```

## Retry Logic

### Exponential Backoff

```typescript
// lib/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Usage
const drop = await retryWithBackoff(
  () => db.drop.findUnique({ where: { id: dropId } }),
  3,
  1000
);
```

### SSE Reconnection

```typescript
// features/drops/stores/drop.store.ts
subscribeToDropUpdates: (dropId: string) => {
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  
  const connect = () => {
    const eventSource = new EventSource(`/api/drops/${dropId}/stream`);
    
    eventSource.onmessage = (event) => {
      reconnectAttempts = 0; // Reset on successful message
      const data = JSON.parse(event.data);
      set((state) => ({
        drops: state.drops.map(drop => 
          drop.id === dropId ? { ...drop, ...data } : drop
        )
      }));
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        setTimeout(() => {
          connect();
        }, delay);
      } else {
        logger.error('Max SSE reconnection attempts reached', undefined, { dropId });
      }
    };
    
    set({ eventSource });
  };
  
  connect();
},
```

## Error Handling Checklist

- [ ] Custom error classes defined
- [ ] Server Actions throw typed errors
- [ ] Error boundaries at app and feature level
- [ ] API routes return proper status codes
- [ ] Structured logging implemented
- [ ] Error monitoring configured (Sentry)
- [ ] User-facing messages are helpful
- [ ] Sensitive data not exposed in errors
- [ ] Retry logic for transient failures
- [ ] SSE reconnection implemented
- [ ] Form validation errors displayed
- [ ] Network errors handled gracefully
- [ ] Payment errors handled properly
- [ ] Database errors logged and handled
- [ ] 404 pages for missing resources

## Common Error Scenarios

### Network Errors

```typescript
try {
  const response = await fetch('/api/drops');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
} catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    throw new AppError('Network error. Please check your connection.', 'NETWORK_ERROR');
  }
  throw error;
}
```

### Database Errors

```typescript
try {
  await db.drop.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    throw new ConflictError('A drop with this title already exists');
  }
  throw new AppError('Database error', 'DATABASE_ERROR');
}
```

### Payment Errors

```typescript
try {
  await stripe.paymentIntents.create({ amount, currency: 'usd' });
} catch (error) {
  if (error instanceof Stripe.errors.StripeCardError) {
    throw new PaymentError('Your card was declined');
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    throw new PaymentError('Invalid payment request');
  }
  throw new PaymentError('Payment processing failed');
}
```
