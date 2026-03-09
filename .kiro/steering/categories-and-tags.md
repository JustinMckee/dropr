---
inclusion: auto
---
# Categories and Tags

## Philosophy

Categories are vertical - they define the primary classification within each collective's domain. Tags are horizontal - they describe cross-cutting attributes that apply across categories and collectives. This distinction is crucial for organizing drops in a way that respects each community's structure while enabling discovery across boundaries.

## Core Concepts

### Categories (Vertical)

Categories are **collective-specific** taxonomies that reflect how each community naturally organizes their domain. They are mutually exclusive within a drop - a drop belongs to exactly one category.

**Characteristics:**
- Collective-specific (MOD categories differ from MAKE categories)
- Mutually exclusive (one category per drop)
- Hierarchical structure possible
- Defined by platform, not user-generated
- Used for primary navigation and filtering
- Reflect the natural organization of each hobby

**Examples:**

**MOD Collective Categories (MVP):**
- Keyboards & Accessories (keyboards, keycaps, switches, cables, deskmats)
- PC Building & Mods (cases, components, cooling, lighting)
- Gaming Gear (peripherals, controllers, accessories)
- Other Mods (anything else that fits the modding culture)

**MAKE Collective Categories (MVP):**
- Electronics & Circuits (DIY electronics, Arduino, Raspberry Pi, components)
- Audio & Instruments (modular synth, pedals, Monomes, Theremins, MIDI controllers, audio gear)
- 3D Printing & Fabrication (printers, filament, prints, CNC, laser cutting)
- Tools & Materials (tools, kits, components, supplies)

**MINI Collective Categories (MVP):**
- Miniatures & Figures (miniatures, figurines, busts)
- Model Kits (plastic models, resin kits, vehicles, buildings)
- Paints & Supplies (paints, brushes, tools, materials)
- Terrain & Accessories (terrain pieces, bases, scenery, storage)

**Future Expansion:**
As the platform grows and specific categories see high volume, they can be split into more granular subcategories. For example:
- "Audio & Instruments" could split into "Modular Synth", "Guitar Pedals", "MIDI Controllers", "DIY Audio"
- "Keyboards & Accessories" could split into "Mechanical Keyboards", "Keycaps", "Switches & Parts"
- This keeps the MVP simple while allowing for natural growth

### Tags (Horizontal)

Tags are **cross-cutting attributes** that describe characteristics, themes, or properties that can apply to drops across categories and collectives. They are non-exclusive - a drop can have multiple tags.

**Characteristics:**
- Cross-collective (same tags can apply to MOD, MAKE, or MINI)
- Non-exclusive (multiple tags per drop)
- Flat structure (no hierarchy)
- Can be platform-defined or curator-suggested
- Used for secondary filtering and discovery
- Describe attributes, not primary classification

**Examples:**

**Common Tags (cross-collective):**
- Limited Edition
- Artisan
- Custom
- Vintage
- Rare
- Beginner-Friendly
- Advanced
- DIY
- Pre-Built
- Handmade
- Imported
- Exclusive
- Collaboration
- Themed (e.g., "Cyberpunk", "Retro", "Minimalist")

**Material Tags:**
- Aluminum
- Brass
- Acrylic
- Resin
- Wood
- Carbon Fiber

**Color Tags:**
- Black
- White
- RGB
- Monochrome
- Colorful

**Price Tags:**
- Budget
- Mid-Range
- Premium
- Luxury

## Usage in Search and Filter

### Category Filtering

Categories are used for **primary filtering** within a collective:

```typescript
// User on mod.dropr.com
// Categories shown: Mechanical Keyboards, Keycaps, Switches, etc.
// Selecting "Keycaps" shows only keycap drops

// User on make.dropr.com
// Categories shown: DIY Electronics, 3D Printing, Modular Synth, etc.
// Selecting "3D Printing" shows only 3D printing drops
```

**UI Pattern:**
- Displayed as primary filter options
- Radio buttons or single-select dropdown
- Prominent placement in filter panel
- Category-specific icons

### Tag Filtering

Tags are used for **secondary filtering** across categories:

```typescript
// User on mod.dropr.com, category "Keycaps"
// Tags available: Artisan, GMK, Custom, Limited Edition, etc.
// Selecting "Artisan" + "Limited Edition" shows artisan limited edition keycaps

// User on make.dropr.com, category "DIY Electronics"
// Tags available: Arduino, Beginner-Friendly, Kit, etc.
// Selecting "Beginner-Friendly" shows beginner-friendly electronics drops
```

**UI Pattern:**
- Displayed as secondary filter options
- Checkboxes for multi-select
- Below category filter in filter panel
- Tag chips for active filters

## Data Model

### Database Schema

```prisma
// prisma/schema.prisma

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  collective  Collective
  description String?
  icon        String?
  order       Int        @default(0)
  
  drops       Drop[]
  
  @@index([collective])
  @@index([slug])
}

model Tag {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  type        TagType  @default(GENERAL)
  
  drops       Drop[]
  
  @@index([slug])
  @@index([type])
}

enum TagType {
  GENERAL      // Cross-cutting attributes
  MATERIAL     // Material-specific tags
  COLOR        // Color-specific tags
  THEME        // Theme-specific tags
  SKILL_LEVEL  // Beginner, Advanced, etc.
}

model Drop {
  id          String     @id @default(cuid())
  title       String
  collective  Collective
  categoryId  String     // One category (vertical)
  category    Category   @relation(fields: [categoryId], references: [id])
  tags        Tag[]      // Multiple tags (horizontal)
  
  @@index([categoryId])
  @@index([collective])
}
```

### TypeScript Types

```typescript
// features/drops/models/drop.types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  collective: Collective;
  description?: string;
  icon?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: TagType;
}

export type TagType = 'GENERAL' | 'MATERIAL' | 'COLOR' | 'THEME' | 'SKILL_LEVEL';

export interface Drop {
  id: string;
  title: string;
  collective: Collective;
  category: Category;    // Single category
  tags: Tag[];           // Multiple tags
  // ... other fields
}
```

## Filter UI Design

### Filter Panel Structure

```
┌─────────────────────────────────┐
│ Filters                    [X]  │
├─────────────────────────────────┤
│                                 │
│ Price Range                     │
│ ○ $10-$25                       │
│ ○ $25-$50                       │
│ ○ $50-$100                      │
│ ○ $100+                         │
│                                 │
│ Category                        │
│ ○ Mechanical Keyboards          │
│ ○ Keycaps                       │
│ ○ Switches                      │
│ ○ Cables                        │
│                                 │
│ Tags                            │
│ ☐ Artisan                       │
│ ☐ Custom                        │
│ ☐ Limited Edition               │
│ ☐ GMK                           │
│ ☐ Aluminum                      │
│                                 │
│         [Clear All]             │
└─────────────────────────────────┘
```

### Active Filter Chips

```
Search: "keycaps"  [x]  Keycaps [x]  Artisan [x]  Limited Edition [x]  Clear All
```

**Rules:**
- Category filter shows as chip (removable)
- Tag filters show as chips (removable)
- Price tier shows as chip (removable)
- Collective filter does NOT show as chip (shown in collective buttons)

## Search Behavior

### Category Search

Categories are searchable as part of the main search query:

```typescript
// User searches "keycaps"
// System matches:
// 1. Drops in "Keycaps" category
// 2. Drops with "keycaps" in title/description
// 3. Prioritizes category matches over text matches
```

### Tag Search

Tags are also searchable:

```typescript
// User searches "artisan"
// System matches:
// 1. Drops with "Artisan" tag
// 2. Drops with "artisan" in title/description
```

### Combined Search

```typescript
// User searches "artisan keycaps"
// System matches:
// 1. Drops in "Keycaps" category with "Artisan" tag (highest priority)
// 2. Drops in "Keycaps" category with "artisan" in title/description
// 3. Drops with "Artisan" tag and "keycaps" in title/description
// 4. Drops with both words in title/description
```

## Category Management

### Platform-Defined Categories

Categories are defined by the platform and cannot be created by curators. This ensures consistency and prevents category proliferation.

**Admin Interface:**
- Add/edit/remove categories per collective
- Set category order for display
- Assign icons to categories
- Write category descriptions

**Curator Interface:**
- Select from existing categories when creating drop
- Cannot create new categories
- Can suggest new categories via feedback

### Tag Management

Tags can be both platform-defined and curator-suggested:

**Platform-Defined Tags:**
- Core tags that apply broadly (Limited Edition, Artisan, etc.)
- Material tags (Aluminum, Brass, etc.)
- Color tags (Black, White, RGB, etc.)
- Skill level tags (Beginner-Friendly, Advanced, etc.)

**Curator-Suggested Tags:**
- Curators can suggest new tags when creating drops
- Suggested tags go through moderation/approval
- Approved tags become available for all curators
- Prevents tag spam and maintains quality

## MVP Category Philosophy

**Keep It Broad:**
- Start with 3-4 categories per collective
- Each category should accommodate a wide range of items
- Use tags for specificity, not categories
- Categories should be obvious and unambiguous

**Growth Strategy:**
- Monitor which categories get the most drops
- Split high-volume categories when they exceed ~100 active drops
- Add new categories based on curator feedback and demand
- Never remove categories - only split or consolidate

**Example Growth Path:**
```
MVP: "Audio & Instruments" (broad)
  ↓ (after 100+ drops)
Split: "Modular Synth", "Guitar Pedals", "MIDI Controllers", "DIY Audio"
```

## Best Practices

### For Curators

**Choosing Categories:**
- Select the broadest category that fits your drop
- When in doubt, use "Other [Collective]" category
- Use tags to specify what your drop is (e.g., tag "Modular Synth" even if category is "Audio & Instruments")
- Contact support if no category fits

**Choosing Tags:**
- Use 3-7 tags per drop
- Be specific with tags since categories are broad
- Include material tags if relevant
- Include skill level tags if relevant
- Include theme tags if relevant
- Tags can duplicate category info (e.g., tag "Modular Synth" even if category is "Audio & Instruments")

### For Platform

**Adding Categories (Post-MVP):**
- Only add categories when a broad category has 100+ active drops
- Ensure new category is distinct from existing categories
- Split broad categories rather than adding unrelated ones
- Get community feedback before adding
- Document migration path for existing drops

**MVP Launch:**
- Start with 3-4 categories per collective
- Include an "Other [Collective]" catch-all category
- Monitor category usage in first 3-6 months
- Plan category splits based on actual usage data

**Adding Tags:**
- Add tags that apply across multiple categories
- Avoid tags that are too specific (those should be in title/description)
- Group related tags by type (Material, Color, Theme, etc.)
- Regularly review and consolidate similar tags

## Examples

### Example 1: Mechanical Keyboard Drop

```typescript
{
  title: "Custom Aluminum 60% Keyboard Kit",
  collective: "MOD",
  category: {
    name: "Mechanical Keyboards",
    slug: "mechanical-keyboards"
  },
  tags: [
    { name: "Custom", type: "GENERAL" },
    { name: "Aluminum", type: "MATERIAL" },
    { name: "60%", type: "GENERAL" },
    { name: "Kit", type: "GENERAL" },
    { name: "Advanced", type: "SKILL_LEVEL" }
  ]
}
```

### Example 2: Keycap Set Drop

```typescript
{
  title: "GMK Artisan Keycap Set - Cyberpunk Theme",
  collective: "MOD",
  category: {
    name: "Keycaps",
    slug: "keycaps"
  },
  tags: [
    { name: "GMK", type: "GENERAL" },
    { name: "Artisan", type: "GENERAL" },
    { name: "Limited Edition", type: "GENERAL" },
    { name: "Cyberpunk", type: "THEME" },
    { name: "Colorful", type: "COLOR" }
  ]
}
```

### Example 3: Audio Instrument Drop

```typescript
{
  title: "DIY Monome Grid Clone Kit",
  collective: "MAKE",
  category: {
    name: "Audio & Instruments",
    slug: "audio-instruments"
  },
  tags: [
    { name: "DIY", type: "GENERAL" },
    { name: "Kit", type: "GENERAL" },
    { name: "MIDI Controller", type: "GENERAL" },
    { name: "Advanced", type: "SKILL_LEVEL" },
    { name: "Monome", type: "GENERAL" }
  ]
}
```

### Example 4: 3D Printing Drop

```typescript
{
  title: "Beginner 3D Printer Filament Bundle",
  collective: "MAKE",
  category: {
    name: "3D Printing & Fabrication",
    slug: "3d-printing-fabrication"
  },
  tags: [
    { name: "Beginner-Friendly", type: "SKILL_LEVEL" },
    { name: "Bundle", type: "GENERAL" },
    { name: "PLA", type: "MATERIAL" },
    { name: "Multi-Color", type: "COLOR" }
  ]
}
```

## Migration Strategy

If the platform currently uses a different taxonomy:

1. **Audit existing drops**: Categorize all drops into new category structure
2. **Convert existing tags**: Map old tags to new tag system
3. **Communicate changes**: Notify curators of new category/tag structure
4. **Provide guidance**: Create documentation for choosing categories and tags
5. **Monitor usage**: Track category and tag usage to refine over time

## Common Mistakes to Avoid

- **Don't use categories as tags**: Categories are mutually exclusive, tags are not
- **Don't create too many categories**: Keep categories broad and manageable
- **Don't duplicate information**: If it's in the category, don't tag it
- **Don't use overly specific tags**: Those belong in title/description
- **Don't let tags proliferate**: Regularly consolidate and clean up tags

