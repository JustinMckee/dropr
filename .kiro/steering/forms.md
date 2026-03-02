---
inclusion: fileMatch
fileMatchPattern: '**/*Form*.{tsx,ts}'
---
# Form Patterns and Behavior

**Note:** This guide uses React 19+ APIs. Key changes from React 18:
- `useFormState` → `useActionState`
- `useFormStatus` moved from `react-dom` to `react`
- `useOptimistic` for optimistic UI updates

## Philosophy

Forms are conversations with users. Design for progressive enhancement, validate early and often, provide clear feedback, and make errors recoverable. Accessibility is non-negotiable — every form must work with keyboard and screen readers. Use Server Actions for mutations, validate on both client and server, and handle loading states gracefully. Forms should feel responsive and forgiving.

## Forms Checklist

**Validation:**
- [ ] Client-side validation with Zod schemas
- [ ] Server-side validation in Server Actions
- [ ] Real-time validation on blur (not on every keystroke)
- [ ] Clear, actionable error messages
- [ ] Field-level error display
- [ ] Form-level error summary

**Accessibility:**
- [ ] Labels associated with inputs (implicit preferred)
- [ ] Required fields indicated
- [ ] Error messages linked with aria-describedby
- [ ] Focus management (first error on submit)
- [ ] Keyboard navigation works
- [ ] Screen reader tested

**User Experience:**
- [ ] Loading states during submission
- [ ] Disabled state prevents double-submit
- [ ] Success feedback after submission
- [ ] Unsaved changes warning (if applicable)
- [ ] Auto-save for long forms (if applicable)
- [ ] Progressive disclosure for complex forms

**Technical:**
- [ ] Server Actions for form submission
- [ ] useActionState for form state (React 19+)
- [ ] useFormStatus for pending states
- [ ] useOptimistic for optimistic updates
- [ ] File uploads handled securely
- [ ] Form data sanitized
- [ ] CSRF protection (built-in with Server Actions)

## Form Architecture

### Server Actions Pattern

Use Server Actions for all form submissions:

```typescript
// features/drops/models/drop.actions.ts
'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const createDropSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(100).max(5000),
  price: z.number().positive().max(10000),
  inventory: z.number().int().positive().max(1000),
  imageUrl: z.string().url(),
});

export async function createDrop(formData: FormData) {
  const session = await requireAuth();
  
  // Parse and validate
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    price: parseFloat(formData.get('price') as string),
    inventory: parseInt(formData.get('inventory') as string),
    imageUrl: formData.get('imageUrl'),
  };
  
  const result = createDropSchema.safeParse(rawData);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  // Create drop
  const drop = await db.drop.create({
    data: {
      ...result.data,
      curatorId: session.user.id,
    },
  });
  
  revalidatePath('/drops');
  
  return {
    success: true,
    drop,
  };
}
```


### Client Component with useActionState

```typescript
// features/drops/components/CreateDropForm.tsx
'use client'

import { useActionState, useFormStatus } from 'react';
import { createDrop } from '../models/drop.actions';

const initialState = {
  success: false,
  errors: {},
};

export function CreateDropForm() {
  const [state, formAction] = useActionState(createDrop, initialState);
  
  return (
    <form action={formAction}>
      <div>
        <label>
          Title
          <input
            name="title"
            type="text"
            required
            aria-invalid={!!state.errors?.title}
            aria-describedby={state.errors?.title ? 'title-error' : undefined}
          />
        </label>
        {state.errors?.title && (
          <span id="title-error" role="alert">
            {state.errors.title[0]}
          </span>
        )}
      </div>
      
      <div>
        <label>
          Description
          <textarea
            name="description"
            required
            minLength={100}
            maxLength={5000}
            aria-invalid={!!state.errors?.description}
            aria-describedby={state.errors?.description ? 'description-error' : undefined}
          />
        </label>
        {state.errors?.description && (
          <span id="description-error" role="alert">
            {state.errors.description[0]}
          </span>
        )}
      </div>
      
      <div>
        <label>
          Price ($)
          <input
            name="price"
            type="number"
            step="0.01"
            min="5"
            max="10000"
            required
            aria-invalid={!!state.errors?.price}
            aria-describedby={state.errors?.price ? 'price-error' : undefined}
          />
        </label>
        {state.errors?.price && (
          <span id="price-error" role="alert">
            {state.errors.price[0]}
          </span>
        )}
      </div>
      
      <SubmitButton />
      
      {state.success && (
        <div role="status" aria-live="polite">
          Drop created successfully!
        </div>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Drop'}
    </button>
  );
}
```

## Validation Patterns

### Zod Schema Definition

Define validation schemas in a shared location:

```typescript
// features/drops/models/drop.schema.ts
import { z } from 'zod';

export const createDropSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters')
    .refine(
      (title) => !title.match(/\b(free|win|click here)\b/i),
      'Title contains prohibited words'
    ),
  
  description: z.string()
    .min(100, 'Description must be at least 100 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  
  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number',
  })
    .positive('Price must be positive')
    .max(10000, 'Price cannot exceed $10,000'),
  
  inventory: z.number({
    required_error: 'Inventory is required',
    invalid_type_error: 'Inventory must be a number',
  })
    .int('Inventory must be a whole number')
    .positive('Inventory must be at least 1')
    .max(1000, 'Inventory cannot exceed 1000'),
  
  imageUrl: z.string()
    .url('Must be a valid URL')
    .refine(
      (url) => url.match(/\.(jpg|jpeg|png|webp)$/i),
      'Image must be JPG, PNG, or WebP'
    ),
  
  category: z.enum([
    'mechanical-keyboards',
    'keycaps',
    'switches',
    'pc-mods',
    'diy-electronics',
    'miniatures',
  ], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  
  startTime: z.date()
    .min(new Date(), 'Start time must be in the future'),
});

export type CreateDropInput = z.infer<typeof createDropSchema>;
```

### Client-Side Validation

Add client-side validation for immediate feedback:

```typescript
// features/drops/components/CreateDropForm.tsx
'use client'

import { useState } from 'react';
import { createDropSchema } from '../models/drop.schema';

export function CreateDropForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleBlur = (field: string, value: any) => {
    // Validate single field on blur
    const fieldSchema = createDropSchema.shape[field];
    const result = fieldSchema.safeParse(value);
    
    if (!result.success) {
      setErrors(prev => ({
        ...prev,
        [field]: result.error.errors[0].message,
      }));
    } else {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  
  return (
    <form>
      <label>
        Title
        <input
          name="title"
          onBlur={(e) => handleBlur('title', e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
      </label>
      {errors.title && (
        <span id="title-error" role="alert">
          {errors.title}
        </span>
      )}
      
      {/* More fields */}
    </form>
  );
}
```

## Error Handling

### Field-Level Errors

Display errors next to the relevant field:

```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export function FormField({
  label,
  name,
  type = 'text',
  error,
  required,
  children,
}: FormFieldProps) {
  const errorId = `${name}-error`;
  
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      )}
      
      {error && (
        <span id={errorId} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

// Usage
<FormField
  label="Email Address"
  name="email"
  type="email"
  error={state.errors?.email?.[0]}
  required
/>
```

### Form-Level Error Summary

Provide a summary of all errors at the top of the form:

```typescript
// components/forms/ErrorSummary.tsx
interface ErrorSummaryProps {
  errors: Record<string, string[]>;
}

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) return null;
  
  return (
    <div role="alert" aria-labelledby="error-summary-title">
      <h2 id="error-summary-title">
        There {errorEntries.length === 1 ? 'is' : 'are'} {errorEntries.length} error
        {errorEntries.length === 1 ? '' : 's'} with your submission
      </h2>
      
      <ul>
        {errorEntries.map(([field, messages]) => (
          <li key={field}>
            <a href={`#${field}`}>
              {field}: {messages[0]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Focus Management

Focus the first error field on submit:

```typescript
'use client'

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';

export function CreateDropForm() {
  const [state, formAction] = useActionState(createDrop, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (state.errors && Object.keys(state.errors).length > 0) {
      // Focus first error field
      const firstErrorField = Object.keys(state.errors)[0];
      const element = formRef.current?.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      element?.focus();
    }
  }, [state.errors]);
  
  return (
    <form ref={formRef} action={formAction}>
      {/* fields */}
    </form>
  );
}
```

## Loading States

### Submit Button States

```typescript
// components/forms/SubmitButton.tsx
'use client'

import { useFormStatus } from 'react';

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
}

export function SubmitButton({ children, pendingText }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (pendingText || 'Submitting...') : children}
    </button>
  );
}

// Usage
<SubmitButton pendingText="Creating Drop...">
  Create Drop
</SubmitButton>
```

### Form-Wide Loading State

```typescript
'use client'

import { useActionState, useFormStatus } from 'react';

export function CreateDropForm() {
  const [state, formAction] = useActionState(createDrop, initialState);
  const { pending } = useFormStatus();
  
  return (
    <form action={formAction} aria-busy={pending}>
      <fieldset disabled={pending}>
        {/* All fields disabled during submission */}
        <input name="title" />
        <input name="price" />
        <button type="submit">Submit</button>
      </fieldset>
      
      {pending && (
        <div role="status" aria-live="polite">
          Submitting form...
        </div>
      )}
    </form>
  );
}
```

## File Upload Patterns

### Image Upload with Preview

```typescript
// components/forms/ImageUpload.tsx
'use client'

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  name: string;
  label: string;
  error?: string;
  maxSize?: number; // bytes
  accept?: string;
}

export function ImageUpload({
  name,
  label,
  error,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return;
    }
    
    // Validate file type
    if (!accept.split(',').includes(file.type)) {
      setUploadError('Invalid file type. Use JPG, PNG, or WebP');
      return;
    }
    
    setUploadError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={handleChange}
        aria-invalid={!!(error || uploadError)}
        aria-describedby={error || uploadError ? `${name}-error` : undefined}
      />
      
      {preview && (
        <div className="preview">
          <Image
            src={preview}
            alt="Upload preview"
            width={200}
            height={200}
          />
        </div>
      )}
      
      {(error || uploadError) && (
        <span id={`${name}-error`} role="alert">
          {error || uploadError}
        </span>
      )}
    </div>
  );
}
```

### Upload to Cloud Storage

```typescript
// features/drops/models/upload.actions.ts
'use server'

import { put } from '@vercel/blob';

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;
  
  if (!file) {
    return { success: false, error: 'No file provided' };
  }
  
  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File too large' };
  }
  
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { success: false, error: 'Invalid file type' };
  }
  
  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
  });
  
  return {
    success: true,
    url: blob.url,
  };
}
```

## Multi-Step Forms

### Wizard Pattern

```typescript
// features/curator/components/CuratorApplicationWizard.tsx
'use client'

import { useState } from 'react';

type Step = 'personal' | 'business' | 'portfolio' | 'review';

export function CuratorApplicationWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [formData, setFormData] = useState({
    personal: {},
    business: {},
    portfolio: [],
  });
  
  const steps: Step[] = ['personal', 'business', 'portfolio', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);
  
  const handleNext = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      [currentStep]: stepData,
    }));
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };
  
  return (
    <div>
      <ProgressIndicator
        steps={steps}
        currentStep={currentStep}
      />
      
      {currentStep === 'personal' && (
        <PersonalInfoStep
          data={formData.personal}
          onNext={handleNext}
        />
      )}
      
      {currentStep === 'business' && (
        <BusinessInfoStep
          data={formData.business}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      
      {currentStep === 'portfolio' && (
        <PortfolioStep
          data={formData.portfolio}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      
      {currentStep === 'review' && (
        <ReviewStep
          data={formData}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
```

### Progress Indicator

```typescript
// components/forms/ProgressIndicator.tsx
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: string;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);
  
  return (
    <nav aria-label="Form progress">
      <ol>
        {steps.map((step, index) => (
          <li
            key={step}
            aria-current={step === currentStep ? 'step' : undefined}
          >
            <span className={index <= currentIndex ? 'completed' : 'pending'}>
              {index + 1}. {step}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

## Auto-Save Pattern

### Draft Auto-Save

```typescript
// features/drops/components/CreateDropForm.tsx
'use client'

import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function CreateDropForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const saveDraft = useDebouncedCallback(async () => {
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData);
    
    // Save to localStorage or server
    localStorage.setItem('drop-draft', JSON.stringify(data));
    setLastSaved(new Date());
  }, 2000); // Save 2 seconds after user stops typing
  
  useEffect(() => {
    // Load draft on mount
    const draft = localStorage.getItem('drop-draft');
    if (draft) {
      const data = JSON.parse(draft);
      // Populate form with draft data
    }
  }, []);
  
  return (
    <form ref={formRef} onChange={saveDraft}>
      {/* fields */}
      
      {lastSaved && (
        <div role="status" aria-live="polite">
          Draft saved at {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </form>
  );
}
```

## Success Feedback

### Success Message

```typescript
// components/forms/SuccessMessage.tsx
interface SuccessMessageProps {
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export function SuccessMessage({ title, message, action }: SuccessMessageProps) {
  return (
    <div role="status" aria-live="polite">
      <h2>{title}</h2>
      <p>{message}</p>
      
      {action && (
        <a href={action.href}>{action.label}</a>
      )}
    </div>
  );
}

// Usage
{state.success && (
  <SuccessMessage
    title="Drop Created!"
    message="Your drop has been created and is pending review."
    action={{
      label: "View Drop",
      href: `/drops/${state.drop.id}`
    }}
  />
)}
```

### Redirect After Success

```typescript
// features/drops/models/drop.actions.ts
'use server'

import { redirect } from 'next/navigation';

export async function createDrop(formData: FormData) {
  // ... validation and creation
  
  const drop = await db.drop.create({ data });
  
  // Redirect to drop page
  redirect(`/drops/${drop.id}`);
}
```

## Unsaved Changes Warning

### Warn Before Navigation

```typescript
// components/forms/UnsavedChangesWarning.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function UnsavedChangesWarning({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) {
  const router = useRouter();
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  
  return null;
}

// Usage in form
export function CreateDropForm() {
  const [hasChanges, setHasChanges] = useState(false);
  
  return (
    <>
      <UnsavedChangesWarning hasUnsavedChanges={hasChanges} />
      
      <form onChange={() => setHasChanges(true)}>
        {/* fields */}
      </form>
    </>
  );
}
```

## Accessibility Requirements

### Labels

Always use labels with inputs. Implicit labels are preferred:

```typescript
// ✅ Good: Implicit label (preferred)
<label>
  Email Address
  <input type="email" name="email" required />
</label>

// ✅ Good: Explicit label (fallback)
<label htmlFor="email">Email Address</label>
<input id="email" type="email" name="email" required />

// ❌ Avoid: No label
<input type="email" placeholder="Email" />
```

### Required Fields

Indicate required fields clearly:

```typescript
<label>
  Email Address <span aria-label="required">*</span>
  <input type="email" name="email" required aria-required="true" />
</label>
```

### Error Messages

Link errors to fields with aria-describedby:

```typescript
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  name="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <span id="email-error" role="alert">
    {error}
  </span>
)}
```

### Keyboard Navigation

Ensure all form controls are keyboard accessible:

```typescript
// Custom controls need keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

## Testing Forms

### Unit Tests

Test validation logic:

```typescript
// features/drops/models/drop.schema.test.ts
import { createDropSchema } from './drop.schema';

describe('createDropSchema', () => {
  it('should validate valid drop data', () => {
    const validData = {
      title: 'Mechanical Keyboard Mystery Box',
      description: 'A curated selection of switches and keycaps for mechanical keyboard enthusiasts.',
      price: 49.99,
      inventory: 50,
      imageUrl: 'https://example.com/image.jpg',
      category: 'mechanical-keyboards',
      startTime: new Date(Date.now() + 86400000),
    };
    
    const result = createDropSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should reject title that is too short', () => {
    const invalidData = {
      title: 'Short',
      // ... other fields
    };
    
    const result = createDropSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('at least 10 characters');
  });
});
```

### Component Tests

Test form rendering and interaction:

```typescript
// features/drops/components/CreateDropForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDropForm } from './CreateDropForm';
import { createDrop } from '../models/drop.actions';

jest.mock('../models/drop.actions');

describe('CreateDropForm', () => {
  it('should render all form fields', () => {
    render(<CreateDropForm />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create drop/i })).toBeInTheDocument();
  });
  
  it('should display validation errors', async () => {
    (createDrop as jest.Mock).mockResolvedValue({
      success: false,
      errors: {
        title: ['Title is too short'],
      },
    });
    
    render(<CreateDropForm />);
    
    const submitButton = screen.getByRole('button', { name: /create drop/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title is too short/i)).toBeInTheDocument();
    });
  });
  
  it('should submit form with valid data', async () => {
    (createDrop as jest.Mock).mockResolvedValue({
      success: true,
      drop: { id: 'drop-123' },
    });
    
    render(<CreateDropForm />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Mechanical Keyboard Mystery Box' },
    });
    
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '49.99' },
    });
    
    const submitButton = screen.getByRole('button', { name: /create drop/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createDrop).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests

Test complete form flows:

```typescript
// __tests__/e2e/create-drop.spec.ts
import { test, expect } from '@playwright/test';

test('should create drop with valid data', async ({ page }) => {
  await page.goto('/curator/drops/new');
  
  // Fill form
  await page.fill('[name="title"]', 'Mechanical Keyboard Mystery Box');
  await page.fill('[name="description"]', 'A curated selection of switches and keycaps for mechanical keyboard enthusiasts. Perfect for beginners and experts alike.');
  await page.fill('[name="price"]', '49.99');
  await page.fill('[name="inventory"]', '50');
  await page.selectOption('[name="category"]', 'mechanical-keyboards');
  
  // Upload image
  await page.setInputFiles('[name="image"]', 'test-fixtures/drop-image.jpg');
  
  // Submit
  await page.click('button:has-text("Create Drop")');
  
  // Verify redirect to drop page
  await expect(page).toHaveURL(/\/drops\/.+/);
  await expect(page.locator('h1')).toContainText('Mechanical Keyboard Mystery Box');
});
```

## Best Practices

- Validate on both client and server (never trust client)
- Use Zod schemas for consistent validation
- Provide real-time feedback on blur, not on every keystroke
- Display errors next to relevant fields
- Focus first error field on submit
- Disable form during submission to prevent double-submit
- Use Server Actions for all mutations
- Handle loading states gracefully
- Provide clear success feedback
- Make forms keyboard accessible
- Test with screen readers
- Use semantic HTML elements
- Auto-save long forms to prevent data loss
- Warn before navigating away from unsaved changes

## Common Mistakes to Avoid

- Client-side validation only (security risk)
- No loading states (confusing UX)
- Generic error messages ("Something went wrong")
- Errors not linked to fields (accessibility issue)
- No keyboard support (accessibility violation)
- Missing labels (accessibility violation)
- Validating on every keystroke (annoying)
- Not disabling submit during submission (double-submit risk)
- No success feedback (user uncertainty)
- Losing form data on error (frustrating)
- Not testing with keyboard and screen reader
- Using placeholder as label (accessibility anti-pattern)

## Resources

- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- ARIA Authoring Practices (Forms): https://www.w3.org/WAI/ARIA/apg/patterns/
- WebAIM Form Accessibility: https://webaim.org/techniques/forms/
