---
inclusion: always
---
# Code Conventions

## Philosophy

Consistency enables collaboration. Follow established patterns for naming, formatting, and organization. Use TypeScript strictly, prefer named exports, and write self-documenting code. When in doubt, follow Next.js and React conventions. Code should be readable by humans first, machines second.

## Conventions Checklist

**Naming:**
- [ ] PascalCase for components and types
- [ ] camelCase for functions and variables
- [ ] kebab-case for directories and routes
- [ ] UPPER_SNAKE_CASE for constants
- [ ] Prefix booleans with is/has/should/can
- [ ] Prefix event handlers with handle/on
- [ ] Prefix custom hooks with use

**Files:**
- [ ] Named exports (except Next.js pages)
- [ ] Co-located tests (.test.ts next to source)
- [ ] Component folders for complex components
- [ ] TypeScript strict mode enabled

**Code Style:**
- [ ] 2 spaces indentation
- [ ] Single quotes for strings
- [ ] Trailing commas
- [ ] Semicolons required
- [ ] Max line length 100 characters (soft limit)
- [ ] Prettier for formatting
- [ ] ESLint for linting

**Git:**
- [ ] Conventional Commits format
- [ ] Descriptive branch names (feature/, fix/, etc.)
- [ ] Small, focused commits
- [ ] PR titles match commit format

## File Naming

### Components
- PascalCase for component files: `DropCard.tsx`, `UserProfile.tsx`
- Match component name to file name
- Skeleton files: `ComponentName.skeleton.tsx`
- Test files: `ComponentName.test.tsx`
- Story files: `ComponentName.stories.tsx`
- Type files: `ComponentName.types.ts`
- CSS files: `ComponentName.module.scss`

### Non-Components
- camelCase for utilities, hooks, actions: `useDrop.ts`, `formatDate.ts`, `drop.actions.ts`
- Match hook name to file name
- utilities grouped in files by functionality: `utils/auth.utils.ts`, `utils/date.utils.ts`
- Routes: kebab-case for folders: `app/user-profile/[id]/page.tsx`

### Directories
- kebab-case: `features/drop-management/`, `components/user-profile/`
- Route groups kebab case: `(marketing)`, `(user-preferences)`

## Variable and Function Naming
- camelCase for variables and functions
- PascalCase for components and types
- Prefix booleans with `is`, `has`, `should`, `can`
- Prefix event handlers with `handle` or `on`
- Prefix custom hooks with `use`

### TypeScript/JavaScript
```typescript
// Variables: camelCase
const dropCount = 10;
const isActive = true;

// Functions: camelCase, verb-first
function fetchDrops() {}
function calculatePrice() {}
async function createDrop() {}

// Components: PascalCase
function DropCard() {}
const UserProfile = () => {}

// Constants: UPPER_SNAKE_CASE
const MAX_DROPS_PER_PAGE = 20;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types/Interfaces: PascalCase
interface Drop {}
type DropStatus = 'upcoming' | 'live' | 'ended';

// Enums: PascalCase for enum, UPPER_SNAKE_CASE for values
enum DropStatus {
  UPCOMING = 'UPCOMING',
  LIVE = 'LIVE',
  ENDED = 'ENDED'
}
```

### Boolean Variables
- Prefix with `is`, `has`, `should`, `can`
- Examples: `isLoading`, `hasPermission`, `shouldRender`, `canEdit`

### Event Handlers
- Prefix with `handle` or `on`
- Examples: `handleClick`, `handleSubmit`, `onDropSelect`

### Custom Hooks
- Prefix with `use`
- Examples: `useDrop`, `useAuth`, `useDropCountdown`

## Code Style

### Imports
```typescript
// 1. External dependencies
import { useState } from 'react';
import { create } from 'zustand';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { fetchDrops } from '@/features/drops/models/drop.actions';

// 3. Relative imports
import { DropCard } from './DropCard';
import type { Drop } from './drop.types';
```

### Component Structure
```typescript
'use client' // or 'use server' if needed

// 1. Imports
import { useState } from 'react';

// 2. Types
interface DropCardProps {
  drop: Drop;
  onSelect?: (id: string) => void;
}

// 3. Component
export function DropCard({ drop, onSelect }: DropCardProps) {
  // 3a. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 3b. Event handlers
  const handleClick = () => {
    onSelect?.(drop.id);
  };
  
  // 3c. Render helpers (if needed)
  const renderStatus = () => {
    // ...
  };
  
  // 3d. Return JSX
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### TypeScript
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and primitives
- Avoid `any` - use `unknown` if type is truly unknown
- Use optional chaining: `user?.profile?.name`
- Use nullish coalescing: `value ?? defaultValue`

## Git Conventions

### Branch Naming
```
feature/drop-countdown
fix/inventory-update-bug
refactor/drop-store
chore/update-dependencies
docs/api-documentation
```

### Commit Messages
Follow Conventional Commits:
```
feat: add drop countdown component
fix: resolve inventory sync issue
refactor: simplify drop store logic
chore: update dependencies
docs: add API documentation
test: add drop card tests
style: format code with prettier
```

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `perf`: Performance improvements

### Pull Request Titles
Same format as commits:
```
feat: implement drop countdown feature
fix: resolve inventory synchronization bug
```

## Comments

### When to Comment
- Complex business logic
- Non-obvious workarounds
- TODO items with context: `@TODO: Implement fallback UI`
- Public API documentation (JSDoc)

### When NOT to Comment
- Obvious code (let the code speak)
- Redundant explanations
- Commented-out code (leave it)

### JSDoc for Public APIs
```typescript
/**
 * Fetches all active drops for a given curator
 * @param curatorId - The unique identifier of the curator
 * @param options - Optional filtering and pagination options
 * @returns Promise resolving to an array of Drop objects
 * @throws {NotFoundError} If curator doesn't exist
 */
export async function fetchCuratorDrops(
  curatorId: string,
  options?: FetchOptions
): Promise<Drop[]> {
  // ...
}
```

## Code Organization

### Exports
- Prefer named exports over default exports
- Exception: Next.js pages/layouts require default exports
- Export components from index files for cleaner imports

```typescript
// ✅ Good
export function DropCard() {}

// ❌ Avoid (except for Next.js pages)
export default function DropCard() {}

// Index file pattern
// components/drops/index.ts
export { DropCard } from './DropCard';
export { DropList } from './DropList';
```

### File Length
- Components: Aim for < 200 lines
- If longer, consider splitting into smaller components
- Extract complex logic into custom hooks or utilities

## Formatting

- Use Prettier for automatic formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multi-line objects/arrays
- Semicolons required
- Max line length: 100 characters (soft limit)


## Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)

## Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const drop = await fetchDrop(id);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found
  } else if (error instanceof ValidationError) {
    // Handle validation
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}

// ❌ Avoid: Silent failures
try {
  await fetchDrop(id);
} catch (error) {
  // Nothing
}
```
