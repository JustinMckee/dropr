---
inclusion: fileMatch
fileMatchPattern: '**/*.{tsx,jsx}'
---
# Accessibility Guidelines

## Philosophy

Build for everyone. Accessibility is not optional—it's a legal requirement and moral imperative. Target WCAG 2.1 Level AA compliance. Use semantic HTML, provide keyboard navigation, ensure sufficient contrast, and test with assistive technologies. Accessible design benefits all users.

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text on all images
- [ ] Form labels associated with inputs
- [ ] Error messages accessible
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] No color-only information
- [ ] ARIA attributes used correctly
- [ ] Live regions for dynamic content
- [ ] Skip links present
- [ ] Reduced motion respected
- [ ] Screen reader tested
- [ ] Keyboard navigation tested
- [ ] Automated tests passing (jest-axe)

## Accessibility Standard

Target WCAG 2.1 Level AA compliance for all features.

## Core Principles

1. **Perceivable**: Information must be presentable to users in ways they can perceive
2. **Operable**: Interface components must be operable by all users
3. **Understandable**: Information and operation must be understandable
4. **Robust**: Content must be robust enough to work with assistive technologies

## Semantic HTML

### Use Proper HTML Elements

```typescript
// ✅ Good: Semantic HTML
<nav>
  <ul>
    <li><a href="/drops">Drops</a></li>
    <li><a href="/curators">Curators</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Drop Title</h1>
    <p>Description</p>
  </article>
</main>

// ❌ Avoid: Divs for everything
<div className="nav">
  <div className="link">Drops</div>
  <div className="link">Curators</div>
</div>
```

### Heading Hierarchy

Maintain proper heading structure:

```typescript
// ✅ Good: Logical hierarchy
<h1>Dropr Marketplace</h1>
  <h2>Active Drops</h2>
    <h3>Mechanical Keyboards</h3>
    <h3>PC Mods</h3>
  <h2>Featured Curators</h2>

// ❌ Avoid: Skipping levels
<h1>Dropr Marketplace</h1>
  <h4>Active Drops</h4>  // Skipped h2 and h3
```

## Keyboard Navigation

### Focus Management

All interactive elements must be keyboard accessible:

```typescript
// ✅ Good: Keyboard accessible
<button onClick={handleClick}>Buy Now</button>

// ✅ Good: Custom interactive element with keyboard support
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

// ❌ Avoid: Click-only interactions
<div onClick={handleClick}>Not keyboard accessible</div>
```

### Focus Indicators

Provide visible focus indicators:

```css
/* app/globals.css */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Never remove focus indicators globally */
/* ❌ Avoid */
*:focus {
  outline: none;
}
```

### Tab Order

Ensure logical tab order:

```typescript
// Use tabIndex sparingly
// 0 = natural tab order
// -1 = programmatically focusable, not in tab order
// > 0 = avoid (disrupts natural order)

<button tabIndex={0}>First</button>
<button tabIndex={0}>Second</button>
<div tabIndex={-1} ref={modalRef}>Modal content</div>
```

### Focus Trapping

Trap focus in modals and dialogs:

```typescript
// components/ui/Dialog.tsx
import { useEffect, useRef } from 'react';

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    // Get all focusable elements
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element
    firstElement?.focus();
    
    // Trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    dialog.addEventListener('keydown', handleTab);
    return () => dialog.removeEventListener('keydown', handleTab);
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {children}
    </div>
  );
}
```

## ARIA Attributes

### ARIA Labels

Provide accessible names for elements:

```typescript
// ✅ Good: Descriptive labels
<button aria-label="Close dialog">
  <XIcon />
</button>

<input
  type="search"
  aria-label="Search drops"
  placeholder="Search..."
/>

// ✅ Good: aria-labelledby for complex labels
<section aria-labelledby="drops-heading">
  <h2 id="drops-heading">Active Drops</h2>
  {/* content */}
</section>
```

### ARIA Roles

Use ARIA roles when semantic HTML isn't sufficient:

```typescript
// Navigation
<nav role="navigation" aria-label="Main navigation">
  {/* links */}
</nav>

// Search
<form role="search">
  <input type="search" aria-label="Search drops" />
</form>

// Alert
<div role="alert" aria-live="assertive">
  Payment successful!
</div>

// Status
<div role="status" aria-live="polite">
  Loading drops...
</div>
```

### ARIA States

Communicate dynamic states:

```typescript
// Expanded/Collapsed
<button
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
  onClick={() => setIsOpen(!isOpen)}
>
  Menu
</button>
<div id="dropdown-menu" hidden={!isOpen}>
  {/* menu items */}
</div>

// Selected
<button
  role="tab"
  aria-selected={isActive}
  aria-controls="panel-1"
>
  Tab 1
</button>

// Disabled
<button disabled aria-disabled="true">
  Sold Out
</button>

// Loading
<button aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Buy Now'}
</button>
```

### Live Regions

Announce dynamic content changes:

```typescript
// Polite: Announces when user is idle
<div aria-live="polite" aria-atomic="true">
  {itemsInCart} items in cart
</div>

// Assertive: Announces immediately
<div role="alert" aria-live="assertive">
  Error: Payment failed
</div>

// Off: No announcements (default)
<div aria-live="off">
  {/* content */}
</div>
```

## Color and Contrast

### Contrast Ratios

Meet WCAG AA contrast requirements:
- Normal text (< 18pt): 4.5:1
- Large text (≥ 18pt or ≥ 14pt bold): 3:1
- UI components and graphics: 3:1

```css
/* ✅ Good: High contrast */
.button-primary {
  background: #262083; /* Primary purple */
  color: #ffffff; /* White text - 8.5:1 ratio */
}

/* ❌ Avoid: Low contrast */
.button-secondary {
  background: #e0e0e0; /* Light gray */
  color: #ffffff; /* White text - 1.3:1 ratio - FAILS */
}
```

### Don't Rely on Color Alone

```typescript
// ✅ Good: Color + icon + text
<div className="status-live">
  <CheckIcon aria-hidden="true" />
  <span>Live</span>
</div>

// ❌ Avoid: Color only
<div className="status-live">
  {/* Only background color indicates status */}
</div>
```

### Test Tools

- Chrome DevTools: Lighthouse accessibility audit
- axe DevTools browser extension
- WAVE browser extension
- Contrast checker: https://webaim.org/resources/contrastchecker/

## Images and Media

### Alt Text

Provide meaningful alt text:

```typescript
// ✅ Good: Descriptive alt text
<Image
  src="/drops/keyboard.jpg"
  alt="Mechanical keyboard with custom keycaps and RGB lighting"
  width={800}
  height={600}
/>

// ✅ Good: Decorative images
<Image
  src="/decorative-pattern.svg"
  alt=""  // Empty alt for decorative images
  aria-hidden="true"
  width={100}
  height={100}
/>

// ❌ Avoid: Generic or missing alt text
<Image src="/drops/keyboard.jpg" alt="image" />
<Image src="/drops/keyboard.jpg" />
```

### Video and Audio

Provide captions and transcripts:

```typescript
<video controls>
  <source src="/drop-preview.mp4" type="video/mp4" />
  <track
    kind="captions"
    src="/captions.vtt"
    srclang="en"
    label="English"
    default
  />
</video>
```

## Forms

### Labels

Always associate labels with inputs. Implicit labels are preferred over explicit ones:

```typescript
// ✅ Good fallback: Explicit label
<label htmlFor="email">Email Address</label>
<input id="email" type="email" name="email" />

// ✅ Good: Implicit label is preferred
<label>
  Email Address
  <input type="email" name="email" />
</label>

// ❌ Avoid: No label
<input type="email" placeholder="Email" />
```

### Error Messages

Make errors accessible:

```typescript
<div>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? 'email-error' : undefined}
  />
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email address
    </div>
  )}
</div>
```

### Required Fields

Indicate required fields:

```typescript
<label htmlFor="name">
  Name <span aria-label="required">*</span>
</label>
<input
  id="name"
  type="text"
  required
  aria-required="true"
/>
```

### Field Instructions

Provide helpful instructions:

```typescript
<label htmlFor="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby="password-requirements"
/>
<div id="password-requirements">
  Must be at least 8 characters with one number and one special character
</div>
```

## Interactive Components

### Buttons

```typescript
// ✅ Good: Clear purpose
<button type="button" onClick={handleDelete}>
  Delete Drop
</button>

// ✅ Good: Icon button with label
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>

// ❌ Avoid: Unclear purpose
<button>Click here</button>
```

### Links

```typescript
// ✅ Good: Descriptive link text
<a href="/drops/keyboard-mystery-box">
  View Mechanical Keyboard Mystery Box
</a>

// ✅ Good: External link indication
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Resource
  <span className="sr-only">(opens in new tab)</span>
</a>

// ❌ Avoid: Generic link text
<a href="/drops/123">Click here</a>
<a href="/drops/123">Read more</a>
```

### Modals and Dialogs

```typescript
<Dialog
  isOpen={isOpen}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Purchase</h2>
  <p id="dialog-description">
    Are you sure you want to purchase this drop for $49.99?
  </p>
  <button onClick={handleConfirm}>Confirm</button>
  <button onClick={onClose}>Cancel</button>
</Dialog>
```

### Tooltips

```typescript
<button
  aria-describedby="tooltip"
  onMouseEnter={() => setShowTooltip(true)}
  onMouseLeave={() => setShowTooltip(false)}
  onFocus={() => setShowTooltip(true)}
  onBlur={() => setShowTooltip(false)}
>
  Help
</button>
{showTooltip && (
  <div id="tooltip" role="tooltip">
    Click to view help documentation
  </div>
)}
```

## Screen Reader Support

### Screen Reader Only Text

```css
/* app/globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```typescript
// Usage
<button>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete drop</span>
</button>
```

### Skip Links

Provide skip navigation:

```typescript
// app/layout.tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<nav>{/* navigation */}</nav>

<main id="main-content">
  {children}
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Motion and Animation

### Respect Reduced Motion

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// JavaScript detection
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Apply animations
}
```

## Testing Accessibility

### Automated Testing

```typescript
// __tests__/accessibility/home.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import HomePage from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Home Page Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

Test with:
- Keyboard only (no mouse)
- Screen reader (NVDA, JAWS, VoiceOver)
- Browser zoom (200%, 400%)
- High contrast mode
- Color blindness simulators

### Testing Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Proper heading hierarchy
- [ ] Alt text on all images
- [ ] Form labels associated with inputs
- [ ] Error messages accessible
- [ ] Color contrast meets WCAG AA
- [ ] No color-only information
- [ ] ARIA attributes used correctly
- [ ] Live regions for dynamic content
- [ ] Skip links present
- [ ] Reduced motion respected
- [ ] Screen reader tested
- [ ] Keyboard navigation tested
- [ ] Automated tests passing

## Common Patterns

### Accessible Dropdown

```typescript
export function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <ul
          id="dropdown-menu"
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, index) => (
            <li key={index} role="none">
              <button
                role="menuitem"
                onClick={item.onClick}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Accessible Tabs

```typescript
export function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div role="tablist" aria-label="Drop categories">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

## Resources

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- A11y Project: https://www.a11yproject.com/
- Inclusive Components: https://inclusive-components.design/
