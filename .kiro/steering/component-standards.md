---
inclusion: always
---

# Component Standards

## File Naming Convention
- All component files MUST use PascalCase naming (e.g., `ProfileEditForm.tsx`, not `profile-edit-form.tsx`)
- Exception: shadcn/ui components in `components/ui/` can use kebab-case as they follow the library convention

## Export Convention
- All non-Next.js components MUST use named exports
- Next.js page components (page.tsx, layout.tsx, etc.) use default exports as required by Next.js
- Example: `export function ProfileEditForm() { ... }` not `export default function ProfileEditForm() { ... }`

## Server Actions Pattern
- Components MUST use `useActionState` hook with server actions instead of API fetch calls
- Server actions should be defined in a separate `actions.ts` file in the same directory
- Actions should follow the pattern:
  ```typescript
  'use server'
  
  export type ComponentState = {
    error?: string
    errors?: { [field: string]: string[] }
    success?: boolean
  }
  
  export async function componentAction(
    prevState: ComponentState,
    formData: FormData
  ): Promise<ComponentState> {
    // Implementation
  }
  ```
- Components use: `const [state, formAction, isPending] = useActionState(componentAction, {})`

## Server Actions vs API Routes
- **DEFAULT PATTERN**: Colocate server actions with routes (e.g., `app/(users)/profile/edit/actions.ts`)
- **DO NOT** create API routes (`app/api/*`) for internal application logic
- **ONLY use API routes for**:
  - NextAuth.js handler: `app/api/auth/[...nextauth]/route.ts` (required)
  - Email verification: `app/api/auth/verify-email/route.ts` (needs redirect from email links)
  - External webhooks (Stripe, etc.)
  - Third-party integrations
  - Mobile app endpoints (if needed)
- **For authentication flows**: Use Server Actions colocated with auth routes
  - Login: `app/(auth)/login/actions.ts`
  - Register: `app/(auth)/register/actions.ts`
  - Logout: `app/(auth)/logout/actions.ts`
  - Password reset: `app/(auth)/forgot-password/actions.ts` and `app/(auth)/reset-password/actions.ts`
- **For data mutations**: Use Server Actions colocated with the route
- **For data fetching**: Use direct Prisma calls in Server Components
- This pattern leverages Next.js App Router optimizations and keeps related code together

## Avatar Component Usage
- The Avatar component properly handles image loading failures and shows fallback
- Always provide both AvatarImage and AvatarFallback:
  ```tsx
  <Avatar>
    <AvatarImage src={photoUrl || undefined} alt={displayName} />
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  ```
- The fallback will automatically show when image fails to load or src is undefined

## Form Patterns
- Use `defaultValue` instead of `value` for form inputs with server actions
- Use `action={formAction}` on forms instead of `onSubmit`
- Display validation errors from state: `{state.errors?.fieldName && <p>{state.errors.fieldName[0]}</p>}`
- Use `isPending` from useActionState for loading states
