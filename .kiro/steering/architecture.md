---
inclusion: always
---
# Architecture Patterns

## Philosophy

Build thin, dumb components with fat domain logic. Business rules and state management live in ViewModels, making components easy to test and maintain. Use MVVM pattern for features with complex state, scoped Zustand stores with Context Providers for isolation, and Server Actions for all data mutations. Real-time updates via SSE, caching via Next.js built-in features.

## Architecture Checklist

**MVVM Pattern:**
- [ ] Models contain Server Actions and TypeScript types
- [ ] ViewModels are Zustand store factories
- [ ] Context Providers scope store instances
- [ ] Custom hooks expose stores with selectors
- [ ] Views are thin React components

**State Management:**
- [ ] Zustand stores scoped with Context (not global)
- [ ] React Context only for truly global state
- [ ] Server Actions for mutations
- [ ] Next.js caching with revalidateTag()

**Data Flow:**
- [ ] Server Actions marked with 'use server'
- [ ] ViewModels call Server Actions directly
- [ ] SSE for real-time updates (countdown, inventory)
- [ ] Client-side countdown calculation

**Testing:**
- [ ] Models tested with mocked database
- [ ] ViewModels tested with mocked Server Actions
- [ ] Views tested with mocked hooks
- [ ] Integration tests for full flows

## Design Philosophy

Build thin, dumb components with fat domain logic. Business rules and state management live in ViewModels, making components easy to test and maintain.

## MVVM Pattern

Use Model-View-ViewModel pattern for all features with state management needs.

### Pattern Overview

1. Model: Data layer (TypeScript types, Server Actions, data transformations)
2. ViewModel: Zustand store containing client-side business logic and state
3. Glue: Context Provider and custom hook to scope and expose the store
4. View: Thin React component that consumes the hook

**Important:** Models contain Server Actions (server-side) and TypeScript types. ViewModels call Server Actions directly - no client-side fetch wrappers needed.

### Benefits

- Thin components are easier to maintain and test
- Business logic is centralized and reusable
- ViewModels can be unit tested without React
- Clear separation of concerns
- Scales well as complexity grows
- Multiple developers can work on features independently
- Visual design changers are easier with isolated components
- Components are more portable and reusable

### When to Use

- Features with complex state (drop countdowns, cart management)
- Business logic that needs testing in isolation (pricing calculations, eligibility rules)
- State that needs to be shared across multiple components
- Real-time updates (drop availability, curator stats)

### When Not to Use

- Simple presentational components with no state
- One-off UI state (modal open/closed, form validation)
- Use React's built-in hooks (useState, useReducer) for simple cases

## State Management

### Zustand for Feature State

Use scoped Zustand stores with Context for feature-level state management. Each feature gets isolated store instances.

**Use scoped stores for:**
- Drop browsing and filtering
- Curator dashboard state
- Buyer cart and checkout flow
- Any feature state that should be isolated per component tree

**Pattern: Create store factory + Context Provider**
```typescript
// features/drops/stores/drop.store.ts
import { createStore } from 'zustand';

export type DropStore = {
  drops: Drop[];
  loading: boolean;
  loadDrops: () => Promise<void>;
};

export const createDropStore = () => {
  return createStore<DropStore>((set) => ({
    drops: [],
    loading: false,
    loadDrops: async () => {
      set({ loading: true });
      const drops = await fetchDrops();
      set({ drops, loading: false });
    },
  }));
};

// features/drops/hooks/useDrop.ts
import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createDropStore, DropStore } from '../stores/drop.store';

const DropStoreContext = createContext<ReturnType<typeof createDropStore> | null>(null);

export function DropStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createDropStore());
  
  return (
    <DropStoreContext.Provider value={storeRef.current}>
      {children}
    </DropStoreContext.Provider>
  );
}

export function useDrop<T>(selector: (state: DropStore) => T): T {
  const store = useContext(DropStoreContext);
  if (!store) {
    throw new Error('useDrop must be used within DropStoreProvider');
  }
  return useStore(store, selector);
}

// Usage in component tree
function DropsPage() {
  return (
    <DropStoreProvider>
      <DropList />
      <DropFilters />
    </DropStoreProvider>
  );
}

function DropList() {
  const drops = useDrop((state) => state.drops);
  const loadDrops = useDrop((state) => state.loadDrops);
  // Component has access to scoped store
}
```

**Benefits:**
- Isolated state per component tree
- Server-side safe (no shared state between requests)
- Easy to test with different store states
- Automatic cleanup when unmounted
- Can use same component multiple times with different data

### React Context for App-Wide State

Use React Context for truly global state (rare):
- Theme (dark/light mode)
- Authentication state
- User profile data
- Feature flags

**Only use global Context when state must be shared across the entire app.**

## Caching Strategy

Use Next.js built-in caching instead of external libraries:

```typescript
// Server Action with cache tags
'use server'

import { revalidateTag } from 'next/cache';

export async function fetchDrops() {
  const drops = await db.drops.findMany();
  return drops;
}

export async function createDrop(data: CreateDropInput) {
  const drop = await db.drops.create({ data });
  
  // Invalidate cache after mutation
  revalidateTag('drops');
  
  return drop;
}

// Use unstable_cache for expensive operations
import { unstable_cache } from 'next/cache';

export const getCachedDrops = unstable_cache(
  async () => db.drops.findMany(),
  ['drops'],
  { tags: ['drops'], revalidate: 60 }
);
```

## Data Flow

### Standard Flow (HTTP)
1. User interacts with View component
2. View calls ViewModel method via custom hook
3. ViewModel updates state and/or calls Server Action from Model
4. Server Action executes on server (database queries, validation, etc.)
5. Server Action returns data to ViewModel
6. ViewModel processes response and updates state
7. View re-renders with new state

### Real-Time Flow (SSE)
1. ViewModel subscribes to SSE endpoint on mount
2. Server streams updates (countdown, inventory, status changes)
3. ViewModel receives events and updates state
4. View re-renders with real-time data
5. ViewModel unsubscribes on unmount

**Use SSE for:**
- Drop countdowns (every second)
- Inventory updates (when purchases happen)
- Drop status changes (upcoming → live → sold out)
- Curator stats updates

## Models: Server Actions vs Types

### Server Actions (in Models)
- Database queries and mutations
- Server-side validation
- Authentication checks
- External API integrations
- Marked with `'use server'` directive
- Located in `features/*/models/`

### Types (in Models)
- TypeScript interfaces and types
- Shared between client and server
- Located in `features/*/models/`

### ViewModels (Client-Side)
- Client-side business logic (filtering, sorting, UI state)
- Zustand stores that call Server Actions
- State management and caching
- Located in `features/*/stores/`

**Example:**
```typescript
// Server-side: features/drops/models/drop.actions.ts
'use server'

export async function fetchDrops() {
  const drops = await db.drops.findMany();
  return drops;
}

export async function createDrop(data: CreateDropInput) {
  return await db.drops.create({ data });
}

// SSE Stream: app/api/drops/[id]/stream/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const drop = await db.drops.findUnique({ where: { id: params.id } });
        const data = {
          countdown: calculateCountdown(drop.startTime),
          inventory: drop.inventory,
          status: drop.status
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }, 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}

// Client-side: features/drops/stores/drop.store.ts
'use client'

import { createStore } from 'zustand';
import { fetchDrops } from '../models/drop.actions';

export type DropStore = {
  drops: Drop[];
  loading: boolean;
  eventSource: EventSource | null;
  loadDrops: () => Promise<void>;
  subscribeToDropUpdates: (dropId: string) => void;
  unsubscribe: () => void;
};

export const createDropStore = () => {
  return createStore<DropStore>((set, get) => ({
    drops: [],
    loading: false,
    eventSource: null,
    
    loadDrops: async () => {
      set({ loading: true });
      const drops = await fetchDrops();
      set({ drops, loading: false });
    },
    
    subscribeToDropUpdates: (dropId: string) => {
      const eventSource = new EventSource(`/api/drops/${dropId}/stream`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        set((state) => ({
          drops: state.drops.map(drop => 
            drop.id === dropId ? { ...drop, ...data } : drop
          )
        }));
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        // Optionally retry connection
      };
      
      set({ eventSource });
    },
    
    unsubscribe: () => {
      const { eventSource } = get();
      if (eventSource) {
        eventSource.close();
        set({ eventSource: null });
      }
    }
  }));
};

// Client-side: features/drops/hooks/useDrop.ts
'use client'

import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createDropStore, DropStore } from '../stores/drop.store';

const DropStoreContext = createContext<ReturnType<typeof createDropStore> | null>(null);

export function DropStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createDropStore());
  
  return (
    <DropStoreContext.Provider value={storeRef.current}>
      {children}
    </DropStoreContext.Provider>
  );
}

export function useDrop<T>(selector: (state: DropStore) => T): T {
  const store = useContext(DropStoreContext);
  if (!store) {
    throw new Error('useDrop must be used within DropStoreProvider');
  }
  return useStore(store, selector);
}

// Usage in page
function DropsPage() {
  return (
    <DropStoreProvider>
      <DropList />
    </DropStoreProvider>
  );
}

function DropList() {
  const drops = useDrop((state) => state.drops);
  const loadDrops = useDrop((state) => state.loadDrops);
  
  useEffect(() => {
    loadDrops();
  }, [loadDrops]);
  
  return <div>{/* render drops */}</div>;
}
```

## Error Handling

- Models throw errors for API failures
- ViewModels catch and transform errors into user-friendly messages
- ViewModels expose error state to Views
- Views display errors using consistent error components

## Testing Strategy

- Models (Server Actions): Test with mocked database calls
- ViewModels: Test business logic and state transitions with mocked Server Actions
- Views: Test rendering and user interactions with mocked hooks
- Integration: Test full flow with Playwright

## Code Organization

See structure.md for physical file organization. Architecture focuses on how components interact, not where files live.
