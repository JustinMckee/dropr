---
inclusion: fileMatch
fileMatchPattern: '**/*.test.{ts,tsx}'
---
# Testing Strategy

## Philosophy

Write tests that provide confidence without slowing down development. Focus on testing behavior, not implementation details. Co-locate tests with code for easy maintenance. Use unit tests for logic, integration tests for flows, and e2e tests for critical user journeys. Aim for high coverage on critical paths (auth, payments, inventory).

## Testing Checklist

- [ ] Unit tests for utilities and Server Actions
- [ ] Integration tests for Zustand stores
- [ ] Component tests with React Testing Library
- [ ] E2E tests for critical flows (signup, purchase, drop creation)
- [ ] Storybook stories for UI components
- [ ] Tests co-located with source files
- [ ] Mocks for external dependencies
- [ ] Test coverage > 70% on critical paths
- [ ] Accessibility tests with jest-axe
- [ ] Tests run in CI/CD pipeline
- [ ] Property-based tests for complex logic (optional)

## Testing Philosophy

Write tests that provide confidence without slowing down development. Focus on testing behavior, not implementation details.

## Testing Stack

- **Jest**: Unit and integration tests
- **React Testing Library**: Component testing
- **Playwright**: End-to-end tests
- **Storybook**: Component development and visual testing

## Test Organization

### Co-located Tests

Unit and integration tests should live next to the code they test. Only e2e tests go in a separate directory.

```
lib/
├── password.ts
├── password.test.ts
├── stripe.ts
└── stripe.test.ts

features/
├── drops/
│   ├── models/
│   │   ├── drop.actions.ts
│   │   └── drop.actions.test.ts
│   ├── stores/
│   │   ├── drop.store.ts
│   │   └── drop.store.test.ts
│   └── components/
│       ├── DropCard.tsx
│       ├── DropCard.test.tsx
│       └── DropCard.stories.tsx
└── checkout/
    ├── models/
    │   ├── payment.actions.ts
    │   └── payment.actions.test.ts
    └── components/
        ├── CheckoutForm.tsx
        └── CheckoutForm.test.tsx

app/
└── api/
    └── webhooks/
        └── stripe/
            ├── route.ts
            └── route.test.ts

__tests__/
└── e2e/
    ├── buyer-journey.spec.ts
    ├── curator-journey.spec.ts
    └── checkout.spec.ts
```

**Benefits of co-located tests:**
- Easy to find tests for a given file
- Tests move with the code during refactoring
- Clear what's tested and what's not
- Encourages writing tests as you code

## Unit Tests

### Testing Utilities

```typescript
// lib/password.test.ts
import { hashPassword, verifyPassword } from './password';

describe('Password utilities', () => {
  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60); // bcrypt hash length
    });
    
    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
    
    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });
});
```

### Testing Date Utilities

```typescript
// lib/utils/date.test.ts
import { formatDate, calculateCountdown } from './date';

describe('Date utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-03-15T10:30:00Z');
      expect(formatDate(date)).toBe('March 15, 2026');
    });
  });
  
  describe('calculateCountdown', () => {
    it('should calculate time remaining', () => {
      const future = new Date(Date.now() + 3600000); // 1 hour from now
      const countdown = calculateCountdown(future);
      
      expect(countdown.hours).toBe(1);
      expect(countdown.minutes).toBeLessThanOrEqual(60);
    });
    
    it('should return zero for past dates', () => {
      const past = new Date(Date.now() - 3600000);
      const countdown = calculateCountdown(past);
      
      expect(countdown.hours).toBe(0);
      expect(countdown.minutes).toBe(0);
    });
  });
});
```

## Testing Server Actions

Mock database calls and test business logic:

```typescript
// features/drops/models/drop.actions.test.ts
import { createDrop, fetchDrops } from './drop.actions';
import { db } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  db: {
    drop: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(() => ({
    user: { id: 'user-123', role: 'CURATOR' }
  })),
}));

describe('Drop Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createDrop', () => {
    it('should create drop with valid data', async () => {
      const dropData = {
        title: 'Test Drop',
        description: 'Test description',
        price: 49.99,
        inventory: 50,
        startTime: new Date(Date.now() + 86400000),
      };
      
      const mockDrop = { id: 'drop-123', ...dropData };
      (db.drop.create as jest.Mock).mockResolvedValue(mockDrop);
      
      const result = await createDrop(dropData);
      
      expect(db.drop.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: dropData.title,
          curatorId: 'user-123',
        }),
      });
      expect(result).toEqual(mockDrop);
    });
    
    it('should throw error for invalid price', async () => {
      const dropData = {
        title: 'Test Drop',
        description: 'Test description',
        price: -10,
        inventory: 50,
        startTime: new Date(),
      };
      
      await expect(createDrop(dropData)).rejects.toThrow();
    });
  });
  
  describe('fetchDrops', () => {
    it('should fetch active drops', async () => {
      const mockDrops = [
        { id: 'drop-1', title: 'Drop 1', status: 'LIVE' },
        { id: 'drop-2', title: 'Drop 2', status: 'LIVE' },
      ];
      
      (db.drop.findMany as jest.Mock).mockResolvedValue(mockDrops);
      
      const result = await fetchDrops({ status: 'LIVE' });
      
      expect(db.drop.findMany).toHaveBeenCalledWith({
        where: { status: 'LIVE' },
        orderBy: { startTime: 'desc' },
      });
      expect(result).toEqual(mockDrops);
    });
  });
});
```

## Testing Zustand Stores

Test ViewModels in isolation:

```typescript
// features/drops/stores/drop.store.test.ts
import { createDropStore } from './drop.store';
import { fetchDrops } from '../models/drop.actions';

// Mock Server Actions
jest.mock('../models/drop.actions');

describe('Drop Store', () => {
  let store: ReturnType<typeof createDropStore>;
  
  beforeEach(() => {
    store = createDropStore();
    jest.clearAllMocks();
  });
  
  describe('loadDrops', () => {
    it('should load drops and update state', async () => {
      const mockDrops = [
        { id: 'drop-1', title: 'Drop 1' },
        { id: 'drop-2', title: 'Drop 2' },
      ];
      
      (fetchDrops as jest.Mock).mockResolvedValue(mockDrops);
      
      // Initial state
      expect(store.getState().drops).toEqual([]);
      expect(store.getState().loading).toBe(false);
      
      // Load drops
      await store.getState().loadDrops();
      
      // Verify state updated
      expect(store.getState().drops).toEqual(mockDrops);
      expect(store.getState().loading).toBe(false);
      expect(fetchDrops).toHaveBeenCalledTimes(1);
    });
    
    it('should set loading state during fetch', async () => {
      (fetchDrops as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const loadPromise = store.getState().loadDrops();
      
      // Check loading state
      expect(store.getState().loading).toBe(true);
      
      await loadPromise;
      
      expect(store.getState().loading).toBe(false);
    });
    
    it('should handle errors', async () => {
      const error = new Error('Failed to fetch');
      (fetchDrops as jest.Mock).mockRejectedValue(error);
      
      await expect(store.getState().loadDrops()).rejects.toThrow('Failed to fetch');
      expect(store.getState().loading).toBe(false);
    });
  });
  
  describe('SSE subscription', () => {
    it('should subscribe to drop updates', () => {
      const dropId = 'drop-123';
      
      store.getState().subscribeToDropUpdates(dropId);
      
      expect(store.getState().eventSource).toBeTruthy();
    });
    
    it('should unsubscribe and close connection', () => {
      const dropId = 'drop-123';
      
      store.getState().subscribeToDropUpdates(dropId);
      const eventSource = store.getState().eventSource;
      
      const closeSpy = jest.spyOn(eventSource!, 'close');
      
      store.getState().unsubscribe();
      
      expect(closeSpy).toHaveBeenCalled();
      expect(store.getState().eventSource).toBeNull();
    });
  });
});
```

## Testing React Components

Test components using React Testing Library:

```typescript
// features/drops/components/DropCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DropCard } from './DropCard';

describe('DropCard', () => {
  const mockDrop = {
    id: 'drop-123',
    title: 'Mechanical Keyboard Mystery Box',
    description: 'Curated selection of switches and keycaps',
    price: 49.99,
    imageUrl: '/images/drop.jpg',
    status: 'LIVE',
    inventory: 50,
  };
  
  it('should render drop information', () => {
    render(<DropCard drop={mockDrop} />);
    
    expect(screen.getByText(mockDrop.title)).toBeInTheDocument();
    expect(screen.getByText(mockDrop.description)).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });
  
  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<DropCard drop={mockDrop} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onSelect).toHaveBeenCalledWith(mockDrop.id);
  });
  
  it('should show sold out badge when inventory is zero', () => {
    const soldOutDrop = { ...mockDrop, inventory: 0 };
    render(<DropCard drop={soldOutDrop} />);
    
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });
  
  it('should be accessible', () => {
    const { container } = render(<DropCard drop={mockDrop} />);
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    
    // Check for alt text on image
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', mockDrop.title);
  });
});
```

### Testing with Context Providers

```typescript
// features/drops/components/DropList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DropStoreProvider } from '../hooks/useDrop';
import { DropList } from './DropList';
import { fetchDrops } from '../models/drop.actions';

jest.mock('../models/drop.actions');

describe('DropList', () => {
  it('should load and display drops', async () => {
    const mockDrops = [
      { id: 'drop-1', title: 'Drop 1', price: 29.99 },
      { id: 'drop-2', title: 'Drop 2', price: 39.99 },
    ];
    
    (fetchDrops as jest.Mock).mockResolvedValue(mockDrops);
    
    render(
      <DropStoreProvider>
        <DropList />
      </DropStoreProvider>
    );
    
    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for drops to load
    await waitFor(() => {
      expect(screen.getByText('Drop 1')).toBeInTheDocument();
      expect(screen.getByText('Drop 2')).toBeInTheDocument();
    });
  });
});
```

## Testing API Routes

```typescript
// app/api/webhooks/stripe/route.test.ts
import { POST } from './route';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

jest.mock('@/lib/stripe');
jest.mock('@/lib/db');

describe('Stripe Webhook', () => {
  it('should handle payment_intent.succeeded', async () => {
    const mockEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          metadata: {
            userId: 'user-123',
            dropId: 'drop-123',
            quantity: '1',
          },
        },
      },
    };
    
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
    
    const request = new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'test-signature',
      },
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(db.order.update).toHaveBeenCalledWith({
      where: { paymentIntentId: 'pi_123' },
      data: expect.objectContaining({ status: 'COMPLETED' }),
    });
  });
});
```

## End-to-End Tests (Playwright)

```typescript
// __tests__/e2e/buyer-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Buyer Journey', () => {
  test('should complete purchase flow', async ({ page }) => {
    // Navigate to drops page
    await page.goto('/drops');
    
    // Find and click on a drop
    await page.click('text=Mechanical Keyboard Mystery Box');
    
    // Verify drop details page
    await expect(page.locator('h1')).toContainText('Mechanical Keyboard Mystery Box');
    await expect(page.locator('text=$49.99')).toBeVisible();
    
    // Add to cart
    await page.click('button:has-text("Buy Now")');
    
    // Should redirect to checkout
    await expect(page).toHaveURL(/\/checkout/);
    
    // Fill in payment details (use Stripe test card)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/30');
    await page.fill('[name="cardCvc"]', '123');
    await page.fill('[name="billingName"]', 'Test User');
    
    // Submit payment
    await page.click('button:has-text("Pay")');
    
    // Wait for confirmation
    await expect(page).toHaveURL(/\/orders\/confirmation/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
  
  test('should handle sold out drops', async ({ page }) => {
    await page.goto('/drops/sold-out-drop');
    
    // Buy button should be disabled
    const buyButton = page.locator('button:has-text("Buy Now")');
    await expect(buyButton).toBeDisabled();
    
    // Should show sold out message
    await expect(page.locator('text=Sold Out')).toBeVisible();
  });
});
```

### Curator Journey E2E Test

```typescript
// __tests__/e2e/curator-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Curator Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as curator
    await page.goto('/login');
    await page.fill('[name="email"]', 'curator@test.com');
    await page.fill('[name="password"]', 'testPassword123');
    await page.click('button:has-text("Sign In")');
  });
  
  test('should create new drop', async ({ page }) => {
    // Navigate to curator dashboard
    await page.goto('/curator/dashboard');
    
    // Click create drop
    await page.click('button:has-text("Create Drop")');
    
    // Fill in drop details
    await page.fill('[name="title"]', 'New Test Drop');
    await page.fill('[name="description"]', 'This is a test drop description');
    await page.fill('[name="price"]', '59.99');
    await page.fill('[name="inventory"]', '25');
    
    // Upload image
    await page.setInputFiles('[name="image"]', 'test-fixtures/drop-image.jpg');
    
    // Set start time (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('[name="startTime"]', tomorrow.toISOString().slice(0, 16));
    
    // Submit
    await page.click('button:has-text("Create Drop")');
    
    // Should redirect to drop page
    await expect(page).toHaveURL(/\/drops\//);
    await expect(page.locator('h1')).toContainText('New Test Drop');
  });
});
```

## Storybook for Component Development

```typescript
// features/drops/components/DropCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DropCard } from './DropCard';

const meta: Meta<typeof DropCard> = {
  title: 'Features/Drops/DropCard',
  component: DropCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropCard>;

export const Default: Story = {
  args: {
    drop: {
      id: 'drop-123',
      title: 'Mechanical Keyboard Mystery Box',
      description: 'Curated selection of switches and keycaps',
      price: 49.99,
      imageUrl: '/images/drop.jpg',
      status: 'LIVE',
      inventory: 50,
    },
  },
};

export const SoldOut: Story = {
  args: {
    drop: {
      ...Default.args.drop!,
      inventory: 0,
    },
  },
};

export const Upcoming: Story = {
  args: {
    drop: {
      ...Default.args.drop!,
      status: 'UPCOMING',
    },
  },
};
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'features/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Testing Best Practices

- Write tests that test behavior, not implementation
- Use descriptive test names that explain what is being tested
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies (database, APIs, third-party services)
- Test edge cases and error conditions
- Keep tests fast and independent
- Use test data builders for complex objects
- Don't test third-party libraries
- Aim for high coverage on critical paths (auth, payments, inventory)
- Run tests in CI/CD pipeline
- Use Playwright for critical user journeys
- Use Storybook for component development and visual regression testing

## Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e

# Run e2e tests in UI mode
npm run test:e2e:ui

# Run Storybook
npm run storybook
```
