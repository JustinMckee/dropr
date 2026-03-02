---
inclusion: fileMatch
fileMatchPattern: '**/*.{tsx,jsx,css}'
---
# Design System

## Philosophy

Design for makers who value seeing the "bones" of things. Prioritize technical clarity, tactile feedback, and structural honesty. Use high-contrast accents, visible structure lines, and isometric patterns. Balance high energy with usability. Dark and light modes are first-class citizens, not afterthoughts. Every design decision should serve both aesthetics and function.

## Visual Mood Board

### Inspiration References

**Technical Aesthetics:**
- **Linear.app** (linear.app) - Clean, high-contrast UI with subtle animations and technical precision
- **Vercel** (vercel.com) - Dark mode excellence, glassmorphism, grid patterns
- **Tailwind CSS** (tailwindcss.com) - Subtle structural lines, clean typography, technical documentation aesthetic
- **Payload CMS** (payloadcms.com) - Blueprint-inspired structural lines, dimension markers
- **Stripe** (stripe.com) - Sophisticated dark mode, smooth animations, professional polish
- **Rauno.me** (rauno.me) - Experimental interactions, playful micro-animations, technical depth

**Maker/Technical Culture:**
- **Mechanical Keyboard Subreddit** (r/MechanicalKeyboards) - Product photography style, detail shots, community aesthetic
- **GeekHack** (geekhack.org) - Forum aesthetic, technical specifications, community-driven
- **Drop.com** (drop.com) - Product cards, countdown timers, limited edition presentation
- **Massdrop Archive** - Group buy presentation, community voting, limited availability messaging

**E-commerce/Marketplace:**
- **Gumroad** (gumroad.com) - Creator-first marketplace, clean product cards, simple checkout
- **Patreon** (patreon.com) - Creator profiles, subscription tiers, community focus
- **Kickstarter** (kickstarter.com) - Project cards, countdown timers, funding progress

### Visual Elements to Emulate

**From Linear:**
- Smooth page transitions with subtle fade/slide
- High-contrast text on dark backgrounds
- Minimal, purposeful use of color
- Clean, spacious layouts

**From Vercel:**
- Glassmorphism effects on cards and modals
- Subtle grid patterns in backgrounds
- Gradient accents on hover states
- Dark-first color scheme

**From Tailwind CSS:**
- Subtle white structural lines (10-15% opacity)
- Grid-aligned layouts with visible guides
- Technical documentation aesthetic
- Clean, readable typography

**From Payload CMS:**
- Blueprint-inspired dimension lines
- Extension lines and dimension markers
- Isometric shading patterns
- Technical drawing aesthetic
- **Dark theme with large white content sections** (payloadcms.com/use-cases/enterprise-app-builder)
- White sections provide clean canvas for product photography
- High contrast between dark UI chrome and white content areas
- Maintains dark theme benefits while showcasing visual content

**From Mechanical Keyboard Community:**
- High-quality product photography
- Detail shots showing craftsmanship
- Spec sheets with technical details
- Community-driven content

### Color Palette Examples

**Dark Mode Primary:**
- Background: `#0a0a0a` (near black)
- Surface: `#1a1a1a` (dark gray)
- Border: `#2a2a2a` (subtle border)
- Text: `#fafafa` (off-white)
- Muted: `#6b7280` (gray)

**Accent Colors:**
- Primary: `#8b5cf6` (vibrant purple)
- Secondary: `#06b6d4` (cyan)
- Accent: `#ec4899` (hot pink)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (orange)
- Error: `#ef4444` (red)

**Light Mode Primary:**
- Background: `#ffffff` (white)
- Surface: `#f9fafb` (light gray)
- Border: `#e5e7eb` (subtle border)
- Text: `#111827` (near black)
- Muted: `#6b7280` (gray)

### Typography Examples

**Headers:**
- Font: Space Grotesk or Inter (bold)
- Size: Large, impactful
- Weight: 600-700
- Letter spacing: -0.02em (tight)

**Body:**
- Font: Inter or Geist Sans
- Size: 16px base
- Weight: 400-500
- Line height: 1.5-1.6

**Technical Details:**
- Font: JetBrains Mono or Fira Code
- Size: 14px
- Weight: 400
- Use for: Codes, timestamps, specs

### Component Style Examples

**Drop Cards:**
- Large product image (16:9 or 4:3)
- Countdown timer (prominent, monospace)
- Curator avatar and name
- Price and inventory count
- Subtle hover effect (scale 1.02, shadow increase)
- Glass effect on overlay elements

**Curator Profiles:**
- Large avatar (circular or rounded square)
- Bio with technical details
- Stats (drops created, rating, followers)
- Social links with icons
- Recent drops grid

**Buttons:**
- Primary: Solid fill with vibrant color
- Secondary: Outline with border
- Ghost: Transparent with hover background
- Rounded corners (8px)
- Subtle hover scale (1.02)
- Press animation (scale 0.98)

**Status Badges:**
- Small, pill-shaped
- Color-coded (live, upcoming, sold out)
- Subtle glow effect
- Monospace font for numbers

### Layout Patterns

**Hero Section:**
- Full-width background with pattern
- Large headline (fluid typography)
- Subheadline with value prop
- Primary CTA button
- Subtle parallax effect on scroll

**Drop Grid:**
- 1 column mobile, 2-3 columns tablet, 3-4 columns desktop
- Consistent card heights
- Grid gap: 16-24px
- Masonry layout optional for variety

**Curator Dashboard:**
- Sidebar navigation (collapsible on mobile)
- Main content area with cards
- Stats overview at top
- Recent activity feed

**Product Detail:**
- Large image gallery (carousel or grid)
- Sticky sidebar with purchase info
- Countdown timer (if active)
- Curator info card
- Description with rich formatting

## Design System Checklist

**Core Principles:**
- [ ] High energy and immersive (vibrant colors, motion, depth)
- [ ] Structural honesty (visible lines, grid alignment, dimension markers)
- [ ] Tactile aesthetics (shadows, rounded corners, interactive feedback)

**Components:**
- [ ] shadcn/ui with Base UI primitives
- [ ] Tailwind CSS v4 (configured in app/globals.css)
- [ ] next-themes for dark/light mode
- [ ] framer-motion for animations

**Typography:**
- [ ] Inter or Geist Sans for body text
- [ ] Space Grotesk for headers
- [ ] JetBrains Mono for code/technical details
- [ ] Fluid typography (clamp for responsive sizing)

**Colors:**
- [ ] High contrast in both modes (4.5:1 minimum)
- [ ] Primary: Vibrant purple (#262083)
- [ ] Secondary: Cyan for highlights
- [ ] Accent: Hot pink for emphasis
- [ ] Glassmorphism effects for overlays

**Accessibility:**
- [ ] WCAG AA contrast ratios
- [ ] Focus indicators visible
- [ ] Reduced motion respected
- [ ] Touch targets 44x44px minimum

**Performance:**
- [ ] Images optimized with Next.js Image
- [ ] Fonts optimized with next/font
- [ ] Animations respect prefers-reduced-motion
- [ ] Layout shift minimized (CLS < 0.1)

## Design Principles

### 1. High Energy and Immersive

Create an experience that matches the excitement of limited drops and maker culture.

**Implementation:**
- Dark and light modes with high-contrast accents
- 3D elements and depth through shadows and layers
- Liquid glass textures for overlays and modals
- Seamless theme transitions with preserved content integrity
- Motion graphics and parallax effects for depth
- Vibrant colors and bold typography for impact

**Technical Approach:**
- CSS variables for theme switching
- next-themes for persistence
- framer-motion for complex animations
- Backdrop blur for glassmorphism
- Transform and scale for depth effects

### 2. Structural Honesty (Function Over Form)

Show the structure and organization of the interface, inspired by technical drawings and blueprints.

**Implementation:**
- Light white/subtle lines for visual alignment (inspired by tailwindcss.com, payloadcms.com)
- Grid-aligned layouts with visible structure lines
- Dimension lines, extension lines, and dimension numerals as decorative overlays
- Isometric shading patterns (hatch, stipple, dots, characters) in backgrounds
- Subtle patterns (10-15% opacity) that don't interfere with readability
- Technical aesthetic reinforced through structural patterns

**Technical Approach:**
- Custom CSS patterns for backgrounds
- SVG dimension lines as decorative elements
- Grid-based layouts with visible guides
- Consistent spacing using Tailwind scale
- Pattern utilities with CSS variables

### 3. Tactile Aesthetics

Create a sense of physicality and responsiveness in the interface.

**Implementation:**
- Animated transitions and micro-interactions
- Subtle shadows and depth effects
- Slightly rounded corners (8px base, 12px large)
- Interactive feedback (hover, press, focus states)
- Loading indicators that feel responsive
- Button presses that feel satisfying

**Technical Approach:**
- CSS transitions with cubic-bezier easing
- Transform scale for press animations
- Box shadows for depth
- Framer-motion for spring animations
- useFormStatus for loading states

## Typography System

### Font Stack

**Primary (Body Text and UI):**
- Inter or Geist Sans
- Clean, modern geometric sans-serif
- Excellent readability at all sizes
- Wide range of weights available

**Accent (Headers and Emphasis):**
- Space Grotesk
- Distinctive geometric with technical feel
- Strong personality for headlines
- Pairs well with Inter/Geist

**Monospace (Technical Details):**
- JetBrains Mono or Fira Code
- For codes, timestamps, technical specs
- Ligature support for code
- Clear distinction from body text

### Type Scale

**Mobile (Base 16px, Scale 1.2 - Minor Third):**
```css
--text-xs: 0.694rem;    /* 11px */
--text-sm: 0.833rem;    /* 13px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.2rem;      /* 19px */
--text-xl: 1.44rem;     /* 23px */
--text-2xl: 1.728rem;   /* 28px */
--text-3xl: 2.074rem;   /* 33px */
--text-4xl: 2.488rem;   /* 40px */
```

**Desktop (Base 16px, Scale 1.25 - Major Third):**
```css
--text-xs: 0.64rem;     /* 10px */
--text-sm: 0.8rem;      /* 13px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.25rem;     /* 20px */
--text-xl: 1.563rem;    /* 25px */
--text-2xl: 1.953rem;   /* 31px */
--text-3xl: 2.441rem;   /* 39px */
--text-4xl: 3.052rem;   /* 49px */
--text-5xl: 3.815rem;   /* 61px */
--text-6xl: 4.768rem;   /* 76px */
--text-7xl: 5.96rem;    /* 95px */
```

### Fluid Typography

Use responsive fluid font sizing for better scalability:

```css
h1.fluid-font { font-size: clamp(var(--text-4xl), 4.5vw, var(--text-7xl)); }
h2.fluid-font { font-size: clamp(var(--text-3xl), 4vw, var(--text-6xl)); }
h3.fluid-font { font-size: clamp(var(--text-2xl), 3.5vw, var(--text-5xl)); }
h4.fluid-font { font-size: clamp(var(--text-xl), 3vw, var(--text-4xl)); }
```

### Font Loading

```typescript
// app/layout.tsx
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});
```

## Color System

Define color tokens in app/globals.css using CSS variables for theme switching.

### Base Colors

**Light Mode:**
```css
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--border: 240 5.9% 90%;
```

**Dark Mode:**
```css
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--card: 240 10% 7%;
--card-foreground: 0 0% 98%;
--muted: 240 3.7% 15.9%;
--muted-foreground: 240 5% 64.9%;
--border: 240 3.7% 15.9%;
```

### Accent Colors (High Contrast)

```css
--primary: 262 83% 58%;        /* Vibrant purple (#262083) for CTAs and key actions */
--primary-foreground: 0 0% 100%;
--secondary: 180 100% 50%;     /* Cyan for highlights and active states */
--accent: 340 82% 52%;         /* Hot pink for emphasis and notifications */
--destructive: 0 84% 60%;      /* Red for errors and destructive actions */
```

### Semantic Colors

```css
--success: 142 76% 36%;        /* Green for success states */
--warning: 38 92% 50%;         /* Orange for warnings */
--info: 199 89% 48%;           /* Blue for informational messages */
```

### Glassmorphism Effects

**Glass Background:**
- Dark mode: `rgba(255, 255, 255, 0.1)`
- Light mode: `rgba(0, 0, 0, 0.05)`

**Glass Border:**
- Dark mode: `rgba(255, 255, 255, 0.2)`
- Light mode: `rgba(0, 0, 0, 0.1)`

**Backdrop Blur:** `12px`

**Implementation:**
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
}
```

### Color Usage Guidelines

- **Primary:** CTAs, key actions, brand moments
- **Secondary:** Highlights, active states, links
- **Accent:** Emphasis, notifications, alerts
- **Muted:** Backgrounds, disabled states, subtle elements
- **Destructive:** Errors, warnings, destructive actions
- **Success:** Confirmations, completed states
- **Warning:** Cautions, pending states
- **Info:** Helpful information, tips

## Dark-with-White-Sections Pattern

Inspired by Payload CMS (payloadcms.com/use-cases/enterprise-app-builder), this pattern combines the benefits of dark mode with clean white content sections for showcasing visual content.

### Pattern Philosophy

**Why This Works:**
- Dark UI chrome reduces eye strain and creates immersive experience
- White content sections provide clean canvas for product photography
- High contrast between dark and white creates visual hierarchy
- Products and curator content get maximum attention
- Maintains dark theme benefits while showcasing visual content

**When to Use:**
- Product/drop cards with photography
- Curator profile showcases
- Gallery views and image-heavy pages
- Landing pages with hero imagery
- Marketing sections with visual content

**When NOT to Use:**
- Dashboard interfaces (keep dark)
- Forms and data entry (keep dark)
- Settings and configuration pages (keep dark)
- Text-heavy documentation (keep dark)

### Implementation Strategy

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Dark Header/Navigation         │ ← Dark chrome
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  White Content Section    │  │ ← White canvas
│  │  (Product photography)    │  │
│  │                           │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Dark Section (Features)        │ ← Dark chrome
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  White Content Section    │  │ ← White canvas
│  │  (Curator profiles)       │  │
│  │                           │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  Dark Footer                    │ ← Dark chrome
└─────────────────────────────────┘
```

### CSS Implementation

**Define Section Variants:**
```css
/* app/globals.css */
@theme {
  /* Dark sections (default) */
  --section-bg-dark: 10 10% 3.9%;
  --section-fg-dark: 0 0% 98%;
  
  /* White content sections */
  --section-bg-light: 0 0% 100%;
  --section-fg-light: 240 10% 3.9%;
  
  /* Transition zones */
  --section-border: 240 3.7% 15.9%;
}

/* Section base styles */
.section-dark {
  background: hsl(var(--section-bg-dark));
  color: hsl(var(--section-fg-dark));
}

.section-light {
  background: hsl(var(--section-bg-light));
  color: hsl(var(--section-fg-light));
}

/* Smooth transitions between sections */
.section-transition {
  border-top: 1px solid hsl(var(--section-border));
  border-bottom: 1px solid hsl(var(--section-border));
}
```

**Component Utilities:**
```css
/* Card variants for different section backgrounds */
.card-on-dark {
  background: hsl(240 10% 7%);
  border: 1px solid hsl(240 3.7% 15.9%);
  color: hsl(0 0% 98%);
}

.card-on-light {
  background: hsl(0 0% 100%);
  border: 1px solid hsl(240 5.9% 90%);
  color: hsl(240 10% 3.9%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Text color adjustments */
.text-on-dark {
  color: hsl(0 0% 98%);
}

.text-on-light {
  color: hsl(240 10% 3.9%);
}

.text-muted-on-dark {
  color: hsl(240 5% 64.9%);
}

.text-muted-on-light {
  color: hsl(240 3.8% 46.1%);
}
```

### React Component Pattern

**Section Component:**
```typescript
// components/ui/section.tsx
import { cn } from '@/lib/utils';

interface SectionProps {
  variant?: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
  withTransition?: boolean;
}

export function Section({ 
  variant = 'dark', 
  children, 
  className,
  withTransition = false 
}: SectionProps) {
  return (
    <section
      className={cn(
        'py-12 md:py-16 lg:py-24',
        variant === 'dark' ? 'section-dark' : 'section-light',
        withTransition && 'section-transition',
        className
      )}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
}
```

**Usage Example:**
```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <>
      {/* Dark hero section */}
      <Section variant="dark">
        <h1 className="text-4xl font-bold">Curated Drops for Makers</h1>
        <p className="text-muted-on-dark">Limited releases you can trust</p>
      </Section>
      
      {/* White section for featured drops */}
      <Section variant="light" withTransition>
        <h2 className="text-3xl font-bold text-on-light">Featured Drops</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {drops.map(drop => (
            <DropCard key={drop.id} drop={drop} variant="on-light" />
          ))}
        </div>
      </Section>
      
      {/* Dark section for features */}
      <Section variant="dark" withTransition>
        <h2 className="text-3xl font-bold">Why Dropr?</h2>
        <FeatureGrid />
      </Section>
      
      {/* White section for curator showcase */}
      <Section variant="light" withTransition>
        <h2 className="text-3xl font-bold text-on-light">Top Curators</h2>
        <CuratorGrid />
      </Section>
    </>
  );
}
```

### Drop Card Adaptation

**Card Component with Variant Support:**
```typescript
// components/drops/DropCard.tsx
interface DropCardProps {
  drop: Drop;
  variant?: 'on-dark' | 'on-light';
}

export function DropCard({ drop, variant = 'on-dark' }: DropCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden transition-transform hover:scale-102',
        variant === 'on-dark' ? 'card-on-dark' : 'card-on-light'
      )}
    >
      {/* Image always has white background for product photography */}
      <div className="aspect-video bg-white">
        <Image
          src={drop.imageUrl}
          alt={drop.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content adapts to section background */}
      <div className="p-4">
        <h3 className={cn(
          'font-semibold text-lg',
          variant === 'on-dark' ? 'text-on-dark' : 'text-on-light'
        )}>
          {drop.title}
        </h3>
        
        <p className={cn(
          'text-sm mt-2',
          variant === 'on-dark' ? 'text-muted-on-dark' : 'text-muted-on-light'
        )}>
          {drop.description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <span className={cn(
            'font-mono font-semibold',
            variant === 'on-dark' ? 'text-on-dark' : 'text-on-light'
          )}>
            ${drop.price}
          </span>
          
          <CountdownBadge 
            endTime={drop.endTime} 
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
}
```

### Light Mode Considerations

**In Light Mode:**
- "Dark" sections become light gray (`--section-bg-dark: 0 0% 98%`)
- "Light" sections remain white (`--section-bg-light: 0 0% 100%`)
- Subtle contrast maintained between sections
- Text colors invert appropriately

**Light Mode CSS:**
```css
/* Light mode overrides */
[data-theme="light"] {
  --section-bg-dark: 0 0% 98%;
  --section-fg-dark: 240 10% 3.9%;
  --section-bg-light: 0 0% 100%;
  --section-fg-light: 240 10% 3.9%;
  --section-border: 240 5.9% 90%;
}
```

### Best Practices

**Do:**
- Use white sections for product photography and visual content
- Maintain consistent padding between sections (py-12 to py-24)
- Add subtle borders between sections for visual separation
- Ensure text contrast meets WCAG AA standards in both sections
- Test all components in both dark and light section contexts
- Use the same card component with variant prop for consistency

**Don't:**
- Mix too many section types on one page (alternate dark/light/dark/light)
- Use white sections for text-heavy content (keep dark)
- Forget to adjust text colors when switching section backgrounds
- Use colored backgrounds in white sections (keep pure white)
- Overuse transitions (only between major section changes)

### Accessibility

**Contrast Requirements:**
- Dark sections: White text on dark background (21:1 ratio)
- Light sections: Dark text on white background (21:1 ratio)
- Muted text: Minimum 4.5:1 ratio in both contexts
- Interactive elements: Minimum 3:1 ratio for UI components

**Testing Checklist:**
- [ ] Text readable in both dark and light sections
- [ ] Focus indicators visible in both contexts
- [ ] Hover states work in both contexts
- [ ] Images have appropriate alt text
- [ ] Section transitions don't cause layout shift
- [ ] Reduced motion respected for transitions

### Performance

**Optimization Tips:**
- Use CSS variables for instant theme switching
- Avoid JavaScript for section background changes
- Lazy load images in white sections
- Use Next.js Image component for optimization
- Minimize layout shift with consistent section heights
- Use `will-change: transform` sparingly for hover effects

### Examples in the Wild

**Payload CMS Pattern:**
- Dark navigation and footer
- White content sections for case studies
- High-quality photography on white backgrounds
- Smooth transitions between sections

**Dropr Application:**
- Dark header with navigation
- White section for featured drops grid
- Dark section for "How it Works"
- White section for top curators
- Dark section for testimonials
- White section for latest drops
- Dark footer

## Spacing System

Use Tailwind's default spacing scale (4px base unit):

**Tight (Compact Layouts):**
- 0.5 (2px) - Minimal separation
- 1 (4px) - Very tight spacing
- 2 (8px) - Tight spacing

**Normal (Standard Layouts):**
- 3 (12px) - Small spacing
- 4 (16px) - Base spacing
- 6 (24px) - Medium spacing

**Loose (Generous Layouts):**
- 8 (32px) - Large spacing
- 12 (48px) - Extra large spacing
- 16 (64px) - Section spacing

**Component-Specific:**
- Card padding: 4-6 (16-24px)
- Section padding: 8-12 (32-48px)
- Container max-width: 1280px
- Grid gap: 4-6 (16-24px)

## Component Patterns

### Cards and Containers

**Visual Treatment:**
- Subtle elevation with layered shadows
- Glass effects for overlay components
- Dimension line decorations on product/drop cards
- Border radius: 8px (base), 12px (large cards)

**Implementation:**
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-large {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-glass {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
}
```

### Buttons

**Variants:**
- **Primary:** Solid fill with primary color, subtle glow on hover
- **Secondary:** Outline style with border
- **Ghost:** Transparent with hover background
- **Destructive:** Red for dangerous actions

**States:**
- Hover: Subtle scale (1.02) or glow effect
- Active/Press: Scale down (0.98) with increased shadow
- Focus: 2px outline with primary color at 50% opacity
- Disabled: 40% opacity with cursor-not-allowed

**Sizing:**
- Small: 32px height, 12px padding
- Medium: 40px height, 16px padding
- Large: 48px height, 24px padding
- Minimum touch target: 44x44px (mobile)

**Implementation:**
```typescript
// components/ui/button.tsx
const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:scale-102 active:scale-98',
  secondary: 'border border-border hover:bg-muted',
  ghost: 'hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground',
};
```

### Loading States and Skeletons

**Principles:**
- Use Suspense boundaries with custom skeleton components
- Match the shape and layout of actual content
- Apply subtle shimmer animation
- Maintain structural honesty (show structure while loading)
- Use same spacing and dimensions to prevent layout shift
- Avoid route-level loading.tsx (prefer component-level)

**Skeleton Colors:**
- Background: muted
- Shimmer: slightly lighter than muted

**Animation:**
- Duration: 1.5-2s
- Easing: linear
- Direction: left to right

**Implementation:**
```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

// Usage
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

### Interactive States

**Hover:**
- Subtle scale (1.02) or glow effect
- Transition: 150ms ease-out
- Cursor: pointer

**Active/Press:**
- Scale down (0.98)
- Increased shadow
- Transition: 100ms ease-in

**Focus:**
- 2px outline with primary color at 50% opacity
- Offset: 2px
- Visible on keyboard navigation

**Disabled:**
- Opacity: 40%
- Cursor: not-allowed
- No hover effects

**Implementation:**
```css
.interactive {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
  cursor: pointer;
}

.interactive:hover {
  transform: scale(1.02);
}

.interactive:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.interactive:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.5);
  outline-offset: 2px;
}

.interactive:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
```

## Motion and Animation

### Timing

**Fast (150ms):** Micro-interactions, hover states
**Standard (300ms):** State changes, transitions
**Slow (500ms):** Page transitions, complex animations

### Easing

**Standard:** `cubic-bezier(0.4, 0, 0.2, 1)` - Most transitions
**Ease-out:** `cubic-bezier(0, 0, 0.2, 1)` - Entering elements
**Ease-in:** `cubic-bezier(0.4, 0, 1, 1)` - Exiting elements
**Spring:** Use framer-motion for playful interactions

### Animation Types

**Fade:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide:**
```css
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Scale:**
```css
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

**Shimmer (for skeletons):**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Reduced Motion

Always respect user preferences:

```css
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

### Parallax Effects

Use sparingly on hero sections and feature showcases:

```typescript
// components/ParallaxSection.tsx
'use client'

import { useScroll, useTransform, motion } from 'framer-motion';

export function ParallaxSection({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
}
```

## Structural Honesty Patterns

Create custom utility classes for background patterns that reinforce the technical aesthetic.

### Pattern Color Variables

Define in @theme directive:

```css
@theme {
  --bg-pattern-color: var(--color-white);
  --bg-pattern-color-mix: color-mix(in oklab, var(--bg-pattern-color) 50%, transparent);
}
```

### Pattern Utilities

**Stipple (Dots):**
```css
.bg-stipple {
  background-image: radial-gradient(var(--bg-pattern-color-mix) 1px, transparent 0);
  background-size: 7px 7px;
}
```

**Hatch (Diagonal Lines):**
```css
.bg-hatch {
  background-image: repeating-linear-gradient(
    314deg,
    var(--bg-pattern-color-mix),
    var(--bg-pattern-color-mix) 1px,
    transparent 0,
    transparent 7px
  );
}
```

**Character Patterns:**
```css
.bg-x {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="12" font-family="Arial" font-size="10" fill="rgba(255,255,255,0.5)">×</text></svg>');
  background-size: 24px 24px;
}

.bg-arrow {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="12" font-family="Arial" font-size="10" fill="rgba(255,255,255,0.5)">↖</text></svg>');
  background-size: 24px 24px;
}
```

### Usage Guidelines

- Apply hatch patterns to hero sections, feature backgrounds, card overlays
- Use stipple for subtle texture on containers and panels
- Character patterns (×, ↖) for decorative accents and borders
- Keep pattern opacity low (50% transparency via color-mix)
- Layer patterns with glassmorphism for depth
- Test readability with patterns enabled

## Responsive Design

### Breakpoints

Use Tailwind's default breakpoints:

```css
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices (large desktops) */
2xl: 1536px /* 2X large devices (larger desktops) */
```

### Mobile-First Approach

Design for mobile first, then enhance for larger screens:

```typescript
// ✅ Good: Mobile first
<div className="p-4 md:p-6 lg:p-8">

// ❌ Avoid: Desktop first
<div className="p-8 lg:p-6 md:p-4">
```

### Touch Targets

Minimum touch target size: 44x44px

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

## Accessibility

### Contrast Ratios

- Normal text: 4.5:1 minimum (WCAG AA)
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

### Focus Indicators

Always visible on keyboard navigation:

```css
*:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.5);
  outline-offset: 2px;
}
```

### Color Independence

Never rely on color alone to convey information:

```typescript
// ✅ Good: Icon + color
<div className="text-destructive">
  <AlertIcon /> Error occurred
</div>

// ❌ Avoid: Color only
<div className="text-destructive">
  Error occurred
</div>
```

### Screen Reader Support

Use semantic HTML and ARIA labels:

```typescript
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

## Implementation Notes

### Tailwind Configuration

Configure Tailwind v4 in app/globals.css using @theme directive:

```css
@import "tailwindcss";

@theme {
  /* Color tokens */
  --color-primary: 262 83% 58%;
  --color-secondary: 180 100% 50%;
  
  /* Font families */
  --font-sans: var(--font-inter);
  --font-display: var(--font-space-grotesk);
  --font-mono: var(--font-jetbrains-mono);
  
  /* Spacing scale */
  --spacing-*: /* Tailwind defaults */
}
```

### Theme Switching

Use next-themes for persistence:

```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Component Library

Use shadcn/ui with Base UI primitives (not Radix):

```bash
npx shadcn@latest init
```

Configure to use Base UI in components/ui.

### Animation Library

Use framer-motion for complex animations:

```bash
npm install framer-motion
```

### Testing

Test all components in both light and dark modes during development:

```typescript
// Storybook decorators
export const decorators = [
  (Story) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
];
```

## Design Tokens

Maintain a single source of truth for design tokens in app/globals.css:

```css
@theme {
  /* Colors */
  --color-*: /* All color values */
  
  /* Typography */
  --font-*: /* Font families */
  --text-*: /* Font sizes */
  
  /* Spacing */
  --spacing-*: /* Spacing scale */
  
  /* Shadows */
  --shadow-*: /* Box shadows */
  
  /* Borders */
  --radius-*: /* Border radius values */
  
  /* Transitions */
  --transition-*: /* Timing functions */
}
```

Export tokens for use in JavaScript:

```typescript
// lib/design-tokens.ts
export const designTokens = {
  colors: {
    primary: 'hsl(262, 83%, 58%)',
    secondary: 'hsl(180, 100%, 50%)',
    // ...
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    // ...
  },
  // ...
};
```

## Resources

- Tailwind CSS v4: https://tailwindcss.com/
- shadcn/ui: https://ui.shadcn.com/
- Base UI: https://base-ui.com/
- Framer Motion: https://www.framer.com/motion/
- next-themes: https://github.com/pacocoursey/next-themes
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
