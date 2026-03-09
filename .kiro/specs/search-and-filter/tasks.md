# Search and Filter - Implementation Tasks

## Overview

This document outlines the implementation tasks for the Search and Filter feature. The feature provides an Airbnb-inspired search interface with prominent search bar, collective filters, expandable search UI, and advanced filtering capabilities. It integrates with the homepage-drop-discovery spec to filter content sections in place.

## Task Breakdown

### Phase 1: Foundation and Data Models

#### Task 1: Database Schema and Migrations

- [ ] 1.1 Create Category model in Prisma schema
  - Add Category model with fields: id, name, slug, collective, description, icon, order
  - Add relation to Drop model (one-to-many)
  - Add indexes on collective and slug fields
- [ ] 1.2 Create Tag model in Prisma schema
  - Add Tag model with fields: id, name, slug, description, type
  - Add many-to-many relation between Drop and Tag
  - Add indexes on type and name fields
- [ ] 1.3 Create SearchHistory model in Prisma schema
  - Add SearchHistory model with fields: id, userId, query, collective, timestamp
  - Add relation to User model
  - Add indexes on userId and timestamp fields
- [ ] 1.4 Create SearchAnalytics model in Prisma schema
  - Add SearchAnalytics model with fields: id, query, collective, resultCount, timestamp
  - Add indexes on query and timestamp fields
- [ ] 1.5 Update Drop model with search indexes
  - Add fulltext index on title and description fields
  - Add index on collective and status fields
  - Add index on price field
- [ ] 1.6 Generate and run Prisma migrations
  - Run `npx prisma migrate dev --name add_search_models`
  - Verify migrations applied successfully

#### Task 1.7: Seed Initial Categories and Tags

- [ ] 1.7.1 Create seed data for MOD collective categories
  - Keyboards & Accessories
  - PC Building & Mods
  - Gaming Gear
  - Other Mods
- [ ] 1.7.2 Create seed data for MAKE collective categories
  - Electronics & Circuits
  - Audio & Instruments
  - 3D Printing & Fabrication
  - Tools & Materials
- [ ] 1.7.3 Create seed data for MINI collective categories
  - Miniatures & Figures
  - Model Kits
  - Paints & Supplies
  - Terrain & Accessories
- [ ] 1.7.4 Create seed data for cross-collective tags
  - General tags: Custom, Limited Edition, Rare, Vintage
  - Material tags: Metal, Plastic, Resin, Wood
  - Color tags: Black, White, RGB, Custom Color
  - Theme tags: Cyberpunk, Retro, Minimalist, Tactical
  - Skill Level tags: Beginner, Intermediate, Advanced, Expert
- [ ] 1.7.5 Run seed script to populate database

#### Task 1.8: TypeScript Types

- [ ] 1.8.1 Create search.types.ts with core types
  - Collective, SearchQuery, SearchHistoryItem, SuggestedSearch
  - Category, Tag, TagType, PriceTier
  - SearchFilters, SearchState, SearchResult
- [ ] 1.8.2 Export types from models/index.ts

### Phase 2: Server Actions (Model Layer)

#### Task 2: Search Server Actions

- [ ] 2.1 Implement searchDrops() Server Action
  - Accept query and filters parameters
  - Read collective from request headers
  - Build Prisma where clause with collective scope
  - Apply full-text search on title, description, curator name
  - Apply category filter (single selection)
  - Apply tag filters (multiple selection with OR logic)
  - Apply price tier filter
  - Execute query with proper includes and ordering
  - Track search query for analytics
  - Return SearchResult with drops and totalCount
- [ ] 2.2 Implement fetchSearchHistory() Server Action
  - Require authentication
  - Fetch last 10 searches for current user
  - Order by timestamp descending
  - Return SearchHistoryItem array
  - Handle unauthenticated users gracefully
- [ ] 2.3 Implement saveSearchToHistory() Server Action
  - Require authentication
  - Check for existing query/collective combination
  - Update timestamp if exists, create new if not
  - Limit to 10 most recent searches per user
  - Delete oldest searches when limit exceeded
- [ ] 2.4 Implement clearSearchHistory() Server Action
  - Require authentication
  - Delete all search history for current user
- [ ] 2.5 Implement fetchSuggestedSearches() Server Action
  - Accept collective parameter
  - Return different suggestions per collective
  - Cache results for 24 hours using unstable_cache
  - Include: Trending Curators, Most Followed Drops, New This Week, Ending Soon
- [ ] 2.6 Implement fetchCategories() Server Action
  - Accept collective parameter
  - Return empty array if collective is 'all'
  - Fetch categories for specific collective
  - Include drop count for each category
  - Order by order field
- [ ] 2.7 Implement fetchTags() Server Action
  - Fetch all tags (cross-collective)
  - Include drop count for each tag
  - Group by type and order by name
- [ ] 2.8 Implement fetchPriceTiers() Server Action
  - Define price tier ranges (TBD values as placeholders)
  - Count drops in each tier for given collective
  - Return PriceTier array with counts
- [ ] 2.9 Implement trackSearchQuery() helper function
  - Create SearchAnalytics record
  - Store query, collective, resultCount, timestamp
  - Handle errors gracefully

### Phase 3: ViewModel Layer (Zustand Store)

#### Task 3: Search Store Implementation

- [ ] 3.1 Create search.store.ts with store factory
  - Define SearchStore interface extending SearchState
  - Add loading, error, categories, tags, priceTiers state
  - Implement createSearchStore factory function
- [ ] 3.2 Implement state setters
  - setQuery: Update query and debounce search (300ms)
  - setCollective: Update collective and trigger data reload
  - setFilters: Update filters and trigger search
  - clearFilters: Reset all filters and trigger search
  - toggleExpanded: Toggle expanded state
- [ ] 3.3 Implement search actions
  - performSearch: Call searchDrops Server Action, handle loading/error
  - loadHistory: Call fetchSearchHistory Server Action
  - clearHistory: Call clearSearchHistory Server Action
  - loadSuggestions: Call fetchSuggestedSearches Server Action
  - loadCategories: Call fetchCategories Server Action
  - loadTags: Call fetchTags Server Action
  - loadPriceTiers: Call fetchPriceTiers Server Action
- [ ] 3.4 Implement URL synchronization
  - syncFromURL: Parse URL params and update state
  - syncToURL: Encode state to URL params using replaceState
- [ ] 3.5 Add debounce logic for search input
  - Clear existing timeout on new input
  - Set 300ms timeout before calling performSearch
- [ ] 3.6 Add error handling for all async actions
  - Catch errors and set error state
  - Log errors to console

### Phase 4: Glue Layer (Context Provider and Hooks)

#### Task 4: Search Hooks Implementation

- [ ] 4.1 Create useSearch.ts with Context Provider
  - Define SearchStoreContext
  - Implement SearchStoreProvider component
  - Accept initialCollective prop
  - Create store ref with createSearchStore
- [ ] 4.2 Implement initialization logic in Provider
  - Sync from URL on mount using useEffect
  - Load initial data (suggestions, categories, tags, price tiers)
  - Perform search if query exists in URL
- [ ] 4.3 Implement useSearch hook
  - Access context and throw error if not within Provider
  - Use Zustand's useStore with selector
- [ ] 4.4 Create convenience selector hooks
  - useSearchQuery, useSearchCollective, useSearchFilters
  - useSearchExpanded, useSearchHistory, useSearchSuggestions
  - useCategories, useTags, usePriceTiers
  - useSearchLoading, useSearchError
- [ ] 4.5 Create convenience action hooks
  - useSetQuery, useSetCollective, useSetFilters, useClearFilters
  - useToggleExpanded, usePerformSearch, useClearHistory

### Phase 5: View Components

#### Task 5: Core Search Components

- [ ] 5.1 Create SearchBar component
  - Accept collective prop
  - Render search input with search icon and filter icon
  - Implement focus handler to expand search UI
  - Implement change handler with debounced query update
  - Add keyboard navigation support
  - Add ARIA labels for accessibility
  - Style with Tailwind CSS (sticky position, centered, rounded)
- [ ] 5.2 Create CollectiveFilters component
  - Accept currentCollective prop
  - Render three buttons: Mod, Make, Mini
  - Implement click handler for subdomain navigation
  - Maintain search query in URL when navigating
  - Highlight active collective
  - Add ARIA pressed state
  - Style with Tailwind CSS (horizontal layout, pill buttons)
- [ ] 5.3 Create ExpandedSearchUI component
  - Accept collective prop
  - Render overlay with dimmed background
  - Include SearchBar at top
  - Include close button (X icon)
  - Include SearchHistory and SuggestedSearches
  - Implement outside click handler to close
  - Implement Escape key handler to close
  - Trap focus within overlay
  - Add smooth animations (300ms fade/slide)
  - Add ARIA dialog role and modal attributes
- [ ] 5.4 Create SearchHistory component
  - Fetch history from useSearchHistory hook
  - Render list of recent searches with timestamps
  - Implement click handler to execute search
  - Include "Clear History" button
  - Show only for authenticated users
  - Add keyboard navigation support
  - Format timestamps with date-fns
  - Style with Tailwind CSS
- [ ] 5.5 Create SuggestedSearches component
  - Fetch suggestions from useSearchSuggestions hook
  - Render list of suggestions with icons
  - Implement click handler to execute search
  - Map icon names to Lucide icons
  - Add keyboard navigation support
  - Style with Tailwind CSS
- [ ] 5.6 Create FilterPanel component
  - Implement open/close state
  - Render filter icon button with badge showing active count
  - Render panel with three sections: Price Tier, Category, Tags
  - Implement price tier selection (radio buttons)
  - Implement category selection (radio buttons, single-select)
  - Implement tag selection (checkboxes, multi-select, grouped by type)
  - Include "Clear All" button in footer
  - Implement outside click and Escape key handlers
  - Add keyboard navigation support
  - Style with Tailwind CSS (dropdown on desktop, bottom sheet on mobile)
- [ ] 5.7 Create ActiveFiltersChips component
  - Fetch filters from useSearchFilters hook
  - Render chip for active category
  - Render chips for active tags
  - Render chip for active price tier
  - Implement remove handler for each chip
  - Include "Clear All" button when multiple filters active
  - Add smooth animations (200ms slide-in)
  - Add keyboard navigation support
  - Style with Tailwind CSS (pill chips with X button)

#### Task 6: Error and Empty State Components

- [ ] 6.1 Create SearchError component
  - Accept error and onRetry props
  - Display error message
  - Include retry button
  - Style with Tailwind CSS
- [ ] 6.2 Create EmptySearchResults component
  - Accept query and hasFilters props
  - Display "No drops found" message
  - Include suggestions list
  - Include "Clear All Filters" button if filters active
  - Display SuggestedSearches component
  - Style with Tailwind CSS
- [ ] 6.3 Create SectionEmptyState component
  - Accept sectionName and hasActiveSearch props
  - Display appropriate message based on context
  - Style with Tailwind CSS

### Phase 6: Integration with Homepage

#### Task 7: Homepage Integration

- [ ] 7.1 Update app/page.tsx with SearchStoreProvider
  - Wrap page content with SearchStoreProvider
  - Pass initialCollective from middleware
  - Nest HomepageStoreProvider inside SearchStoreProvider
- [ ] 7.2 Add search interface to homepage layout
  - Add SearchBar component at top
  - Add CollectiveFilters below search bar
  - Add ActiveFiltersChips below collective filters
  - Add ExpandedSearchUI component
- [ ] 7.3 Update FeaturedDropsSection with search filtering
  - Import useSearchQuery and useSearchFilters hooks
  - Implement applySearchAndFilters utility function
  - Filter drops based on query and filters
  - Display SectionEmptyState when no results
- [ ] 7.4 Update LiveUpcomingDropsSection with search filtering
  - Apply same filtering logic as FeaturedDropsSection
  - Display SectionEmptyState when no results
- [ ] 7.5 Update other homepage sections with search filtering
  - Apply filtering to all content sections
  - Maintain section-specific sorting
  - Display section-specific empty states
- [ ] 7.6 Create applySearchAndFilters utility function
  - Accept drops array, query, and filters
  - Apply search query (case-insensitive, partial match)
  - Apply category filter (single selection)
  - Apply tag filters (multiple selection with OR logic)
  - Apply price tier filter
  - Return filtered drops array

### Phase 7: URL State Management

#### Task 8: URL Synchronization

- [ ] 8.1 Implement URL parameter encoding in syncToURL
  - Encode query as 'q' parameter
  - Encode category as 'category' parameter
  - Encode tags as multiple 'tag' parameters
  - Encode priceTier as 'priceTier' parameter
  - Use URLSearchParams for proper encoding
  - Update URL with replaceState (no navigation)
- [ ] 8.2 Implement URL parameter decoding in syncFromURL
  - Parse 'q' parameter to query
  - Parse 'category' parameter to filters.category
  - Parse 'tag' parameters to filters.tags array
  - Parse 'priceTier' parameter to filters.priceTier
  - Update store state with parsed values
- [ ] 8.3 Add browser history support
  - Listen for popstate events
  - Sync from URL and perform search on popstate
  - Clean up event listener on unmount

### Phase 8: Middleware Enhancement

#### Task 9: Subdomain and Search Context

- [ ] 9.1 Update middleware.ts with search context
  - Extract search query from URL params
  - Extract tags from URL params
  - Extract priceTier from URL params
  - Add search context to request headers
  - Pass to Server Components via headers
- [ ] 9.2 Implement detectCollective helper
  - Check hostname for subdomain prefix
  - Return 'MOD', 'MAKE', 'MINI', or 'all'
- [ ] 9.3 Test subdomain navigation
  - Verify collective detection works correctly
  - Verify search params persist across subdomains

### Phase 9: Responsive Design and Styling

#### Task 10: CSS Implementation

- [ ] 10.1 Create search.css with base styles
  - Search bar container (sticky, centered)
  - Search bar (flex, rounded, shadow)
  - Search input (flex-1, no border)
  - Collective filters (horizontal, pill buttons)
  - Expanded search overlay (fixed, dimmed background)
  - Expanded search content (centered, rounded, scrollable)
  - Filter chips (flex-wrap, pill style)
  - Animations (fadeIn, slideDown, slideIn)
- [ ] 10.2 Add mobile responsive styles
  - Search bar spans 90% width on mobile
  - Collective filters scroll horizontally on mobile
  - Expanded search UI is full-screen on mobile
  - Filter panel displays as bottom sheet on mobile
  - Filter chips wrap to multiple lines
  - Touch-friendly tap targets (44x44px minimum)
- [ ] 10.3 Add desktop styles
  - Search bar minimum width 600px
  - Collective filters horizontally aligned
  - Expanded search UI max-width 800px
  - Filter panel displays as dropdown
  - Filter chips in single row with scroll
- [ ] 10.4 Add dark mode support
  - Use next-themes for theme detection
  - Add dark mode color variants
  - Ensure proper contrast ratios

### Phase 10: Accessibility

#### Task 11: Accessibility Implementation

- [ ] 11.1 Add ARIA labels to SearchBar
  - aria-label on search input
  - aria-autocomplete="list"
  - aria-controls for suggestions
  - aria-expanded for expanded state
- [ ] 11.2 Add ARIA labels to CollectiveFilters
  - aria-pressed for active state
  - aria-label for each button
- [ ] 11.3 Add ARIA attributes to ExpandedSearchUI
  - role="dialog"
  - aria-modal="true"
  - aria-label="Search"
- [ ] 11.4 Add ARIA labels to FilterPanel
  - role="dialog"
  - aria-label="Filters"
  - aria-describedby for filter counts
- [ ] 11.5 Add ARIA labels to filter chips
  - aria-label for remove buttons
- [ ] 11.6 Implement focus management
  - Trap focus in ExpandedSearchUI
  - Trap focus in FilterPanel
  - Return focus to trigger on close
- [ ] 11.7 Add screen reader announcements
  - Create ARIA live region for search results
  - Announce result count on search
  - Announce filter changes
- [ ] 11.8 Test with screen readers
  - Test with NVDA on Windows
  - Test with VoiceOver on macOS
  - Test with TalkBack on Android

### Phase 11: Performance Optimization

#### Task 12: Performance Enhancements

- [ ] 12.1 Implement search query debouncing
  - 300ms delay after last keystroke
  - Clear timeout on new input
  - Verify single search call per typing session
- [ ] 12.2 Add caching for Server Actions
  - Cache suggested searches for 24 hours
  - Cache categories for 1 hour
  - Cache tags for 1 hour
  - Cache price tiers for 1 hour
  - Use unstable_cache with proper tags
- [ ] 12.3 Add database indexes
  - Verify fulltext index on Drop.title and Drop.description
  - Verify index on Drop.collective and Drop.status
  - Verify index on Drop.price
  - Verify index on Category.collective
  - Verify index on Tag.type
- [ ] 12.4 Implement optimistic UI updates
  - Update filter chips immediately on selection
  - Show loading state during search
  - Use Suspense boundaries for sections
- [ ] 12.5 Add prefetching
  - Prefetch drop detail pages on DropCard hover
  - Prefetch next page of results on scroll
- [ ] 12.6 Run Lighthouse audit
  - Achieve Performance score 90+
  - Optimize images and fonts
  - Minimize JavaScript bundle size

### Phase 12: Testing

#### Task 13: Unit Tests

- [ ] 13.1 Test search utility functions
  - applySearchQuery: title match, description match, case-insensitive
  - applyTagFilters: single tag, multiple tags, OR logic
  - applyPriceTierFilter: tier boundaries
- [ ] 13.2 Test URL synchronization
  - syncToURL: encode all parameters correctly
  - syncFromURL: decode all parameters correctly
  - Round-trip: encode then decode produces same state
- [ ] 13.3 Test search store actions
  - setQuery: updates state and triggers search
  - setFilters: updates state and triggers search
  - clearFilters: resets filters and triggers search
  - performSearch: calls Server Action and updates state

#### Task 14: Component Tests

- [ ] 14.1 Test SearchBar component
  - Renders search input
  - Expands search UI on focus
  - Debounces search input
  - Updates URL on query change
- [ ] 14.2 Test CollectiveFilters component
  - Renders three buttons
  - Highlights active collective
  - Navigates to subdomain on click
- [ ] 14.3 Test FilterPanel component
  - Opens and closes correctly
  - Displays filter sections
  - Updates filters on selection
  - Shows active filter count badge
- [ ] 14.4 Test ActiveFiltersChips component
  - Displays chips for active filters
  - Removes filter on chip click
  - Shows "Clear All" button when multiple filters
- [ ] 14.5 Test SearchHistory component
  - Displays recent searches
  - Executes search on item click
  - Clears history on button click
- [ ] 14.6 Test SuggestedSearches component
  - Displays suggestions
  - Executes search on suggestion click

#### Task 15: Integration Tests (Playwright)

- [ ] 15.1 Test search flow
  - Enter search query
  - Verify URL updated
  - Verify results displayed
- [ ] 15.2 Test collective filtering
  - Click collective filter
  - Verify subdomain navigation
  - Verify content filtered
- [ ] 15.3 Test tag filtering
  - Open filter panel
  - Select tags
  - Verify URL updated
  - Verify filter chips displayed
  - Verify content filtered
- [ ] 15.4 Test price tier filtering
  - Open filter panel
  - Select price tier
  - Verify URL updated
  - Verify content filtered
- [ ] 15.5 Test filter clearing
  - Apply multiple filters
  - Click "Clear All"
  - Verify URL cleared
  - Verify chips removed
  - Verify content unfiltered
- [ ] 15.6 Test search history
  - Login
  - Perform multiple searches
  - Focus search bar
  - Verify history displayed
  - Click history item
  - Verify search executed
- [ ] 15.7 Test keyboard navigation
  - Tab through search interface
  - Use Enter to submit search
  - Use Escape to close overlays
  - Verify focus management
- [ ] 15.8 Test mobile responsive
  - Test on mobile viewport
  - Verify search bar spans width
  - Verify filter panel is bottom sheet
  - Verify touch targets are 44x44px

#### Task 16: Property-Based Tests

- [ ] 16.1 Property 1: Search result subset
  - For any drops and query, results should be subset of original
  - Generate random drops and queries
  - Verify results.length <= drops.length
  - Verify every result exists in original list
- [ ] 16.2 Property 2: Case insensitivity
  - For any query, uppercase/lowercase/mixed should return same results
  - Generate random queries
  - Compare result counts for different cases
- [ ] 16.3 Property 3: Filter combination monotonicity
  - Adding filters should never increase result count
  - Generate random filter combinations
  - Verify results.length decreases or stays same
- [ ] 16.4 Property 4: Empty query returns all
  - Empty query should return all drops
  - Generate random drop lists
  - Verify applySearchQuery(drops, '') returns all drops
- [ ] 16.5 Property 5: Price tier boundaries
  - All results should fall within tier range
  - Generate random drops and tiers
  - Verify every result satisfies tier.min <= price <= tier.max
- [ ] 16.6 Property 6: Collective scope preservation
  - When collective selected, all results should match
  - Generate random drops with collectives
  - Verify every result has correct collective
- [ ] 16.7 Property 7: URL state synchronization
  - Encoding to URL and decoding back should restore state
  - Generate random search states
  - Verify syncToURL then syncFromURL produces same state
- [ ] 16.8 Property 8: Search history deduplication
  - Saving duplicate query should update timestamp, not create new
  - Generate random queries
  - Verify history.length stays constant for duplicates
- [ ] 16.9 Property 9: Tag filter OR logic
  - Multiple tags should show drops with ANY tag
  - Generate random drops with tags
  - Verify results include drops with tag1 OR tag2 OR tag3
- [ ] 16.10 Property 10: Debounce delay
  - Search should not execute until 300ms after last keystroke
  - Simulate rapid typing
  - Verify performSearch called exactly once after 300ms

### Phase 13: Documentation and Cleanup

#### Task 17: Documentation

- [ ] 17.1 Add JSDoc comments to Server Actions
  - Document parameters and return types
  - Document error conditions
  - Add usage examples
- [ ] 17.2 Add JSDoc comments to store actions
  - Document state changes
  - Document side effects
- [ ] 17.3 Add component prop documentation
  - Document all props with TypeScript types
  - Add usage examples
- [ ] 17.4 Update README with search feature
  - Document search capabilities
  - Document filter options
  - Add screenshots
- [ ] 17.5 Create API documentation
  - Document Server Actions
  - Document URL parameters
  - Document data models

#### Task 18: Code Review and Cleanup

- [ ] 18.1 Review code for consistency
  - Follow naming conventions
  - Follow file organization
  - Follow code style guidelines
- [ ] 18.2 Remove console.log statements
  - Replace with proper logging
  - Use error monitoring service
- [ ] 18.3 Remove commented code
  - Clean up unused code
  - Remove debug code
- [ ] 18.4 Run linter and fix issues
  - Run `npm run lint`
  - Fix all warnings and errors
- [ ] 18.5 Run type checker
  - Run `npm run type-check`
  - Fix all type errors
- [ ] 18.6 Format code
  - Run `npm run format`
  - Verify consistent formatting

## Testing Strategy

### Unit Testing
- Test search utility functions with Jest
- Test URL synchronization logic
- Test store actions with mocked Server Actions
- Aim for 80%+ code coverage

### Component Testing
- Test components with React Testing Library
- Test rendering and user interactions
- Test keyboard navigation
- Test accessibility attributes

### Integration Testing
- Test full user flows with Playwright
- Test search, filtering, and navigation
- Test mobile responsive behavior
- Test keyboard navigation end-to-end

### Property-Based Testing
- Test universal properties with fast-check
- Generate random inputs to verify properties
- Run 100+ iterations per property
- Verify correctness across edge cases

## Success Criteria

- All 20 requirements from requirements.md are implemented
- All acceptance criteria are met
- All unit tests pass with 80%+ coverage
- All component tests pass
- All integration tests pass
- All 10 property-based tests pass
- Lighthouse Performance score 90+
- WCAG 2.1 AA accessibility compliance
- Search results return within 200ms
- Mobile responsive on iOS and Android
- Works on Chrome, Firefox, Safari, Edge
