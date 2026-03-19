# Product Listings & Marketplace

## Overview
Core marketplace functionality allowing makers to list products and buyers to browse and discover items.

## Requirements

### Product Types
- **Standard Product**: Regular inventory item
- **Pre-order Product**: Future delivery, payment upfront, estimated ship date
- **Drop Product**: Limited quantity, timed release, immediate or near-term availability

### Product Information
- Title (max 100 chars)
- Description (rich text, max 2000 chars)
- Product images (min 1, max 8)
- Price (USD)
- Category tags
- Materials/specifications
- Estimated shipping time
- Shipping cost or free shipping flag

### Inventory Management
- Stock quantity tracking
- Low stock warnings for makers
- Out of stock status
- Inventory adjustments (manual for MVP)

### Product Discovery
- Browse all products (paginated)
- Filter by category
- Filter by price range
- Search by keyword
- Sort by: newest, price (low/high), popularity

### Maker Product Management
- Create new product listing
- Edit existing products
- Archive/unarchive products
- View product analytics (views, favorites, sales)

## Design

### Data Models

```typescript
Product {
  id: string
  makerId: string (FK to User)
  title: string
  description: string
  price: decimal
  images: string[] // URLs
  category: string[]
  materials: string?
  shippingDays: int // estimated days
  shippingCost: decimal
  freeShipping: boolean
  
  type: 'standard' | 'preorder' | 'drop'
  stockQuantity: int
  status: 'draft' | 'active' | 'archived' | 'sold_out'
  
  // Video support
  videoUrl: string? // uploaded video URL
  
  viewCount: int
  favoriteCount: int
  salesCount: int
  
  createdAt: datetime
  updatedAt: datetime
}

ProductImage {
  id: string
  productId: string (FK)
  url: string
  order: int
  isPrimary: boolean
}
```

### Server Actions & Routes

**Product Routes & Actions:**
- `app/dashboard/products/` - Maker products dashboard (SSR)
- `app/dashboard/products/create/` - Create new product
  - `actions.ts`: `createProductAction()` - Create product listing
- `app/dashboard/products/[id]/edit/` - Edit product
  - `actions.ts`: `updateProductAction()` - Update product details
  - `actions.ts`: `deleteProductAction()` - Delete/archive product
- `app/products/` - Browse products (SSR with search/filter)
- `app/products/[id]/` - Product detail page (SSR)
  - `actions.ts`: `favoriteProductAction()` - Add to favorites
  - `actions.ts`: `unfavoriteProductAction()` - Remove from favorites

**Data Fetching:**
- Server Components with direct Prisma queries for product listings
- Real-time inventory checks during checkout

## Implementation Tasks

- [x] Create Product and ProductImage schemas
- [x] Build product creation form for makers
- [ ] Implement image upload with multiple file support
- [x] Create product listing page (grid view)
- [x] Build individual product detail page
- [ ] Implement search functionality
- [ ] Add category and price filters
- [x] Create maker's product dashboard
- [x] Build product edit functionality
- [ ] Add inventory tracking system
- [ ] Implement product archiving
- [ ] Add view counter (increment on page view)
- [ ] Create favorite/wishlist feature

## Acceptance Criteria

- Makers can create products with all required fields
- Products support 1-8 images with drag-to-reorder
- Product listings display in responsive grid
- Search returns relevant results
- Filters work correctly (category, price)
- Product detail page shows all information
- Makers can edit their own products only
- Inventory decrements on successful purchase
- Out of stock products show appropriate status
- Archived products hidden from public view
- Product analytics show view and favorite counts

## Out of Scope for MVP

- Bulk product import
- Product variants (size, color)
- Digital product downloads
- Product reviews (separate spec)
- Related products recommendations
- Advanced search (fuzzy matching, filters combination)
