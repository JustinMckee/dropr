# Search and Filter - Requirements

## Introduction

The Search and Filter feature provides an Airbnb-inspired search interface that emphasizes discovery and intuitive filtering. The search bar is prominently placed at the top center of the page as one of the key interfaces for users. The design leverages familiar patterns that users already understand while adapting them for the maker culture and drop discovery.

The feature centers around three core elements: a prominent search bar, collective filters (Mod, Make, Mini), and an expandable search experience that reveals search history, suggested searches, and advanced filters. When users focus on the search input, the interface expands to show more options, creating a focused search experience without leaving the current page.

This feature integrates with the existing homepage-drop-discovery spec which uses subdomains for collectives (mod.dropr.com, make.dropr.com, mini.dropr.com). The main homepage (dropr.com) shows all collectives, and clicking a collective filter navigates to that subdomain while maintaining search state. The interface emphasizes fast, forgiving, and intelligent search that respects the maker culture.

## Glossary

- **Search_Bar**: The prominent input component at the top center of the page where users enter search queries
- **Search_Query**: The text string entered by the user to find drops
- **Expanded_Search_UI**: The enlarged search interface that appears when the search bar is focused
- **Collective_Filter**: The three filter buttons (Mod, Make, Mini) below the search bar for filtering by collective
- **Active_Collective**: The currently selected collective filter (affects search scope and page content)
- **Search_History**: Stored list of previous searches displayed when search bar is focused
- **Suggested_Searches**: Curated search suggestions like "trending curators" or "most followed drops"
- **Tag_Filter**: Filter icon next to search field for filtering by tags/categories within the selected collective
- **Price_Tier**: Predefined price ranges that creators use for drops (details TBD)
- **Price_Range_Filter**: Filter option for price tiers or custom price ranges
- **Search_Overlay**: The expanded UI that takes up a larger portion of the page when search is focused
- **Search_Index**: The optimized database structure for fast search queries
- **Debounce**: Technique to delay search requests until user stops typing
- **Search_Analytics**: Tracking data about search queries and user behavior
- **Zero_Result_Search**: A search query that returns no matching drops
- **Subdomain_Navigation**: Navigation between collective-specific subdomains (mod.dropr.com, make.dropr.com, mini.dropr.com)
- **Fuzzy_Matching**: Technique for matching queries with typos (future enhancement)
- **Synonym_Support**: Matching alternative terms for the same concept (future enhancement)

## Requirements

### Requirement 1: Prominent Search Bar Placement

**User Story:** As a user, I want a prominent search bar at the top center of the page, so that I can immediately understand that search is a primary way to discover drops.

#### Acceptance Criteria

1. THE Search_Bar SHALL be displayed at the top center of the page as one of the most prominent UI elements
2. THE Search_Bar SHALL be positioned above the collective filters (Mod, Make, Mini)
3. THE Search_Bar SHALL have a minimum width of 600px on desktop viewports (≥1024px)
4. THE Search_Bar SHALL span 90% of the viewport width on mobile viewports (<768px)
5. THE Search_Bar SHALL include a placeholder text "Search drops, curators, categories..."
6. THE Search_Bar SHALL include a search icon on the left side of the input
7. THE Search_Bar SHALL include a filter icon button on the right side of the input
8. THE Search_Bar SHALL be accessible via keyboard navigation with appropriate focus indicators
9. THE Search_Bar SHALL include appropriate ARIA labels for screen readers
10. THE Search_Bar SHALL remain in a fixed position at the top of the page when scrolling

### Requirement 2: Collective Filter Buttons

**User Story:** As a user, I want to quickly filter drops by collective (Mod, Make, Mini), so that I can focus on drops relevant to my hobby area.

#### Acceptance Criteria

1. THE Search_Interface SHALL display three Collective_Filter buttons below the Search_Bar: Mod, Make, and Mini
2. THE Collective_Filter buttons SHALL be horizontally aligned and centered below the Search_Bar
3. WHEN a user clicks a Collective_Filter button, THE System SHALL navigate to that collective's subdomain (mod.dropr.com, make.dropr.com, or mini.dropr.com)
4. WHEN a user clicks a Collective_Filter button, THE System SHALL immediately filter all page content sections to show only drops from that collective
5. THE Active_Collective SHALL be visually indicated with distinct styling (filled background, bold text, or border)
6. WHEN on the main homepage (dropr.com), NO Collective_Filter SHALL be active by default (showing all collectives)
7. WHEN on a collective subdomain, THE corresponding Collective_Filter SHALL be active by default
8. THE Collective_Filter buttons SHALL maintain the current search query when navigating between collectives
9. THE Collective_Filter buttons SHALL be accessible via keyboard navigation
10. THE Collective_Filter buttons SHALL include appropriate ARIA attributes indicating the active state

### Requirement 3: Expanded Search UI on Focus

**User Story:** As a user, I want the search interface to expand when I focus on the search bar, so that I can see my search history and suggested searches without leaving the page.

#### Acceptance Criteria

1. WHEN a user focuses on the Search_Bar, THE Expanded_Search_UI SHALL appear and take up a larger portion of the page
2. THE Expanded_Search_UI SHALL display as an overlay that dims the background content
3. THE Expanded_Search_UI SHALL include the Search_Bar at the top, maintaining its position
4. THE Expanded_Search_UI SHALL display Search_History below the Search_Bar (if user is logged in)
5. THE Expanded_Search_UI SHALL display Suggested_Searches below the Search_History
6. WHEN a user clicks outside the Expanded_Search_UI, THE System SHALL close the overlay and return to the normal view
7. WHEN a user presses the Escape key, THE System SHALL close the Expanded_Search_UI
8. THE Expanded_Search_UI SHALL animate smoothly when opening and closing (300ms transition)
9. THE Expanded_Search_UI SHALL trap focus within the overlay while open
10. THE Expanded_Search_UI SHALL be accessible via keyboard navigation

### Requirement 4: Search History Display

**User Story:** As a logged-in user, I want to see my recent searches when I focus on the search bar, so that I can quickly repeat previous searches.

#### Acceptance Criteria

1. WHEN a logged-in user focuses on the Search_Bar, THE Expanded_Search_UI SHALL display their Search_History
2. THE Search_History SHALL display up to 10 recent searches
3. FOR EACH Search_History item, THE System SHALL display the search query text and a timestamp (e.g., "2 hours ago")
4. WHEN a user clicks a Search_History item, THE System SHALL execute that search with the Active_Collective filter applied
5. THE Search_History SHALL include a "Clear History" button at the bottom
6. WHEN a user clicks "Clear History", THE System SHALL remove all stored searches for that user
7. THE Search_History SHALL display a heading "Recent Searches" above the list
8. WHEN a user has no search history, THE System SHALL NOT display the Search_History section
9. THE Search_History SHALL be accessible via keyboard navigation
10. THE Search_History items SHALL include appropriate ARIA labels for screen readers

### Requirement 5: Suggested Searches Display

**User Story:** As a user, I want to see suggested searches when I focus on the search bar, so that I can discover popular or trending content.

#### Acceptance Criteria

1. WHEN a user focuses on the Search_Bar, THE Expanded_Search_UI SHALL display Suggested_Searches below the Search_History
2. THE Suggested_Searches SHALL include curated suggestions like "Trending Curators", "Most Followed Drops", "New This Week", "Ending Soon"
3. THE Suggested_Searches SHALL display a heading "Suggested Searches" above the list
4. FOR EACH Suggested_Search, THE System SHALL display the suggestion text and an icon indicating the type of search
5. WHEN a user clicks a Suggested_Search, THE System SHALL execute that search with the Active_Collective filter applied
6. THE Suggested_Searches SHALL be dynamically generated based on the Active_Collective (different suggestions for Mod vs Make vs Mini)
7. WHEN on the main homepage (dropr.com) with no Active_Collective, THE Suggested_Searches SHALL show cross-collective suggestions
8. THE Suggested_Searches SHALL be accessible via keyboard navigation
9. THE Suggested_Searches SHALL include appropriate ARIA labels for screen readers
10. THE System SHALL display 4-6 Suggested_Searches at a time

### Requirement 6: Tag Filter Icon and Panel

**User Story:** As a user, I want to filter drops by tags within my selected collective, so that I can narrow down results to specific categories or themes.

#### Acceptance Criteria

1. THE Search_Bar SHALL include a Tag_Filter icon button on the right side of the input field
2. WHEN a user clicks the Tag_Filter icon, THE System SHALL display a Tag_Filter panel below the Search_Bar
3. THE Tag_Filter panel SHALL display available tags/categories for the Active_Collective
4. THE Tag_Filter panel SHALL allow users to select multiple tags simultaneously
5. WHEN a user selects a tag, THE System SHALL immediately filter page content to show only drops with that tag
6. THE Tag_Filter panel SHALL display the count of drops for each tag
7. THE Tag_Filter panel SHALL include a "Clear All" button to remove all tag filters
8. THE Tag_Filter icon SHALL display a badge indicating the number of active tag filters
9. THE Tag_Filter panel SHALL close when the user clicks outside of it or presses Escape
10. THE Tag_Filter panel SHALL be accessible via keyboard navigation
11. NOTE: The specific tags/categories available are TBD and may differ from freeform curator tags

### Requirement 7: Price Tier Filtering

**User Story:** As a user, I want to filter drops by price tier, so that I can find drops within my budget using predictable price ranges.

#### Acceptance Criteria

1. THE Tag_Filter panel SHALL include a Price_Tier section as a top-level filter option
2. THE Price_Tier filter SHALL display predefined price tiers that creators use for drops
3. THE Price_Tier filter SHALL allow users to select one or more price tiers
4. WHEN a user selects a Price_Tier, THE System SHALL filter page content to show only drops within that price range
5. THE Price_Tier filter SHALL display the price range for each tier (e.g., "$10-$25", "$25-$50", "$50-$100")
6. THE Price_Tier filter SHALL display the count of drops in each tier
7. THE Price_Tier filter SHALL update the URL with the selected tier parameter
8. THE Price_Tier filter SHALL be accessible via keyboard navigation
9. NOTE: The specific price tiers and ranges are TBD and will be defined based on creator pricing patterns
10. THE System SHALL support custom price range input as an alternative to predefined tiers (future enhancement)

### Requirement 8: Full-Text Search with Collective Scope

**User Story:** As a user, I want to search for drops by title, description, or curator name within my selected collective, so that I can find relevant drops quickly.

#### Acceptance Criteria

1. WHEN a user enters a Search_Query, THE Search_System SHALL search across drop titles, descriptions, and curator names
2. WHEN an Active_Collective is selected, THE Search_System SHALL scope the search to only drops within that collective
3. WHEN on the main homepage (dropr.com) with no Active_Collective, THE Search_System SHALL search across all collectives
4. THE Search_System SHALL perform case-insensitive matching
5. THE Search_System SHALL return results within 200 milliseconds for queries under 50 characters
6. THE Search_System SHALL support partial word matching (e.g., "key" matches "keyboard")
7. THE Search_System SHALL prioritize title matches over description matches in relevance scoring
8. WHEN a Search_Query contains multiple words, THE Search_System SHALL match drops containing any of the words (OR logic)
9. THE Search_System SHALL update the page content immediately as the user types (with 300ms debounce)
10. THE Search_System SHALL maintain the search query in the URL as a query parameter

### Requirement 9: Immediate Content Filtering

**User Story:** As a user, I want page content to update immediately when I apply filters, so that I can see results without navigating to a new page.

#### Acceptance Criteria

1. WHEN a user applies any filter (Collective, Tag, Price_Tier), THE System SHALL immediately update all page content sections
2. THE System SHALL filter the "Featured Drops", "Trending Drops", "New Drops", and "All Drops" sections simultaneously
3. THE System SHALL display a loading indicator during the filter operation (if it takes longer than 100ms)
4. THE System SHALL maintain scroll position when filters are applied
5. THE System SHALL update the URL with all active filter parameters
6. THE System SHALL display the count of matching drops for each section after filtering
7. WHEN no drops match the applied filters, THE System SHALL display an empty state for that section
8. THE System SHALL complete the filtering operation within 500 milliseconds
9. THE System SHALL use optimistic UI updates to make filtering feel instant
10. THE System SHALL support browser back/forward navigation to restore previous filter states

### Requirement 10: Active Filter Visibility

**User Story:** As a user, I want to clearly see which filters are active, so that I understand why I'm seeing specific results.

#### Acceptance Criteria

1. THE System SHALL display all active filters as removable chips/tags below the Search_Bar and Collective_Filter buttons
2. FOR EACH active filter, THE System SHALL display a chip showing the filter type and value (e.g., "Keycaps", "$25-$50")
3. EACH filter chip SHALL include a remove button (X icon) to clear that specific filter
4. WHEN a user clicks a filter chip's remove button, THE System SHALL remove that filter and update the page content immediately
5. THE System SHALL display a "Clear All" button when multiple filters are active
6. THE Active_Collective SHALL be visually indicated in the Collective_Filter buttons (not as a removable chip)
7. THE filter chips SHALL be accessible via keyboard navigation
8. THE filter chips SHALL include appropriate ARIA labels for screen readers
9. THE System SHALL display the total count of active filters (excluding the collective filter) in the Tag_Filter icon badge
10. THE filter chips SHALL animate smoothly when added or removed (200ms transition)

### Requirement 11: Empty State Display

**User Story:** As a user, I want helpful guidance when my search or filters return no results, so that I can adjust my criteria and find what I'm looking for.

#### Acceptance Criteria

1. WHEN a search query or filter combination returns zero results, THE System SHALL display an empty state in the affected content section
2. THE empty state SHALL display a message "No drops found" with the applied filters listed
3. THE empty state SHALL include suggestions: "Try removing some filters", "Browse all drops in [collective]", "Explore other collectives"
4. THE empty state SHALL display 4-6 suggested drops from the same collective (ignoring current filters)
5. THE empty state SHALL include a "Clear All Filters" button
6. THE empty state SHALL be visually distinct from error states
7. THE empty state SHALL be accessible via screen readers
8. WHEN all content sections are empty, THE System SHALL display a prominent empty state above the fold

### Requirement 12: Search Analytics Tracking

**User Story:** As a platform administrator, I want to track search behavior, so that I can optimize search relevance and understand user needs.

#### Acceptance Criteria

1. WHEN a user performs a search, THE System SHALL log the query, Active_Collective, result count, and timestamp
2. WHEN a search returns zero results, THE System SHALL log the query as a Zero_Result_Search
3. WHEN a user clicks a drop from search results, THE System SHALL log the click with the query, drop ID, and position
4. WHEN a user applies filters, THE System SHALL log the filter type and value
5. WHEN a user clicks a Search_History item, THE System SHALL log the repeated search
6. WHEN a user clicks a Suggested_Search, THE System SHALL log which suggestion was clicked
7. THE System SHALL store analytics data in the database for later analysis
8. THE System SHALL NOT log personally identifiable information in search analytics
9. THE System SHALL track these metrics: search usage rate, zero-result rate, click-through rate, conversion rate, popular queries per collective

### Requirement 13: Mobile-Responsive Search Interface

**User Story:** As a mobile user, I want to easily search and filter drops on my phone, so that I can discover drops on the go.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Search_Bar SHALL span 90% of the viewport width
2. WHEN the viewport width is less than 768px, THE Collective_Filter buttons SHALL stack vertically or scroll horizontally
3. THE Expanded_Search_UI SHALL work seamlessly on mobile with touch interactions
4. THE Tag_Filter panel SHALL display as a bottom sheet on mobile devices
5. THE Tag_Filter panel SHALL support touch scrolling and swipe-to-close gestures on mobile
6. THE filter chips SHALL wrap to multiple lines on narrow viewports
7. THE Search_Bar SHALL use appropriate mobile keyboard types (search keyboard with "Go" button)
8. THE mobile interface SHALL use touch-friendly tap targets (minimum 44x44px)
9. THE mobile interface SHALL prevent zoom on input focus
10. THE mobile interface SHALL be tested on iOS Safari and Android Chrome

### Requirement 14: Search Performance Optimization

**User Story:** As a user, I want search and filtering to be fast, so that I can find drops without frustration.

#### Acceptance Criteria

1. THE System SHALL return search results within 200 milliseconds for queries under 50 characters
2. THE System SHALL use database indexes on drop title, description, curator name, and collective fields
3. THE System SHALL debounce search input by 300 milliseconds to reduce server load
4. THE System SHALL cache popular search queries for 60 seconds
5. THE System SHALL use optimistic UI updates to make filtering feel instant
6. THE System SHALL prefetch drop detail pages on DropCard hover
7. THE System SHALL achieve a Lighthouse Performance score of 90+ on the search interface
8. THE System SHALL use Next.js Server Components for initial page load optimization
9. THE System SHALL implement virtual scrolling for long lists of search results (future enhancement)

### Requirement 15: Accessibility Compliance

**User Story:** As a user with disabilities, I want the search feature to be fully accessible, so that I can find drops using assistive technologies.

#### Acceptance Criteria

1. THE Search_Bar SHALL include appropriate ARIA labels and roles
2. THE Expanded_Search_UI SHALL announce its state to screen readers using ARIA live regions
3. THE Collective_Filter buttons SHALL support keyboard navigation and indicate active state to screen readers
4. THE Tag_Filter panel SHALL support keyboard navigation for all controls
5. THE System SHALL maintain WCAG 2.1 AA color contrast ratios for all text
6. THE System SHALL include skip links to jump to search results
7. THE filter chips SHALL be operable via keyboard (Tab to focus, Enter to remove)
8. THE System SHALL announce filter changes to screen readers
9. THE Expanded_Search_UI SHALL trap focus within the overlay while open
10. THE System SHALL be tested with NVDA, JAWS, and VoiceOver screen readers

### Requirement 16: Error Handling

**User Story:** As a user, I want clear feedback when search fails, so that I understand what happened and can try again.

#### Acceptance Criteria

1. WHEN a search query fails due to server error, THE System SHALL display an error message "Unable to load results. Please try again."
2. WHEN a search query fails due to network error, THE System SHALL display an error message "Connection lost. Please check your internet and try again."
3. THE error message SHALL include a "Retry" button that re-executes the search
4. WHEN the Expanded_Search_UI fails to load, THE System SHALL silently fall back to a simple search input
5. THE System SHALL log all errors to the error monitoring service (Sentry)
6. WHEN a search query exceeds 200 characters, THE System SHALL display a validation error "Search query too long. Please use fewer than 200 characters."
7. THE System SHALL degrade gracefully when JavaScript is disabled by providing a basic search form

### Requirement 17: Subdomain Navigation and State Persistence

**User Story:** As a user, I want my search query and filters to persist when I switch between collectives, so that I can compare results across collectives.

#### Acceptance Criteria

1. WHEN a user clicks a Collective_Filter button, THE System SHALL navigate to that collective's subdomain
2. THE System SHALL maintain the current search query when navigating between subdomains
3. THE System SHALL maintain tag and price tier filters when navigating between subdomains (if applicable to the new collective)
4. THE System SHALL encode the search query in the URL as the "q" parameter
5. THE System SHALL encode active filters in the URL as query parameters
6. WHEN a user navigates to a subdomain URL with search parameters, THE System SHALL apply those parameters
7. THE System SHALL use browser history API to support back/forward navigation across subdomains
8. THE System SHALL handle subdomain navigation without full page reload when possible (using Next.js navigation)
9. THE URL parameters SHALL be human-readable and properly encoded
10. THE System SHALL support sharing and bookmarking of search results with filters applied

### Requirement 18: Search History Persistence

**User Story:** As a logged-in user, I want my search history to persist across sessions, so that I can access my recent searches even after closing the browser.

#### Acceptance Criteria

1. WHEN a logged-in user performs a search, THE System SHALL save the query to their search history in the database
2. THE System SHALL store up to 10 recent searches per user
3. THE System SHALL store the search query, Active_Collective, and timestamp for each search
4. WHEN a user logs in, THE System SHALL load their search history from the database
5. THE Search_History SHALL be ordered by timestamp descending (most recent first)
6. THE System SHALL deduplicate search history (same query in same collective updates the timestamp)
7. WHEN a user clears their history, THE System SHALL delete all search history records for that user
8. THE System SHALL NOT store search history for unauthenticated users
9. THE System SHALL automatically delete search history older than 90 days

### Requirement 19: Suggested Searches Curation

**User Story:** As a user, I want relevant suggested searches based on my selected collective, so that I can discover popular and trending content.

#### Acceptance Criteria

1. THE System SHALL display different Suggested_Searches for each collective (Mod, Make, Mini)
2. FOR the Mod collective, THE Suggested_Searches SHALL include: "Trending Keyboards", "New Keycap Sets", "Popular Switches", "Ending Soon"
3. FOR the Make collective, THE Suggested_Searches SHALL include: "Trending Electronics", "New 3D Prints", "Popular Synth Modules", "Ending Soon"
4. FOR the Mini collective, THE Suggested_Searches SHALL include: "Trending Miniatures", "New Model Kits", "Popular Paints", "Ending Soon"
5. FOR the main homepage (no Active_Collective), THE Suggested_Searches SHALL include: "Trending Curators", "Most Followed Drops", "New This Week", "Ending Soon"
6. THE System SHALL dynamically generate "Trending Curators" based on curator follow count and recent activity
7. THE System SHALL dynamically generate "Most Followed Drops" based on drop follow count
8. THE System SHALL dynamically generate "New This Week" based on drop creation date
9. THE System SHALL dynamically generate "Ending Soon" based on drops ending within 24 hours
10. THE System SHALL update Suggested_Searches daily to reflect current trends

### Requirement 20: Integration with Homepage Content Sections

**User Story:** As a user, I want search and filters to work seamlessly with the homepage content sections, so that I have a consistent discovery experience.

#### Acceptance Criteria

1. THE System SHALL integrate with the existing homepage-drop-discovery spec content sections
2. WHEN filters are applied, THE System SHALL update the "Featured Drops", "Trending Drops", "New Drops", and "All Drops" sections
3. THE System SHALL maintain the section layout and styling when filtering
4. THE System SHALL use the existing DropCard component to display filtered results
5. THE System SHALL display section-specific empty states when a section has no matching drops
6. THE System SHALL maintain section-specific sorting (e.g., "Trending Drops" sorted by popularity)
7. THE System SHALL support infinite scroll or pagination for the "All Drops" section
8. THE System SHALL prefetch the next page of results when the user scrolls near the bottom
9. THE System SHALL use the same real-time countdown and status updates as the homepage
10. THE System SHALL maintain follow state for drops across search and filtering operations

## Functional Requirements

### Search Functionality
- Full-text search across drop titles, descriptions, and curator names
- Case-insensitive partial word matching
- Relevance scoring prioritizing title matches over description matches
- Query performance under 200ms for typical queries
- Support for multi-word queries with OR logic
- Autocomplete suggestions with 300ms debounce
- Top 5 autocomplete results with thumbnails, titles, prices, and curator names
- Search history for logged-in users (up to 10 recent searches)

### Filtering Capabilities
- Category filter with 12 category options
- Price range filter with minimum and maximum inputs
- Status filter with options: All, Live Now, Upcoming, Ended
- Multiple filters can be applied simultaneously
- Filter state persisted in URL query parameters
- Clear individual filters or all filters at once
- Active filter count display
- Removable filter tags above results

### Sorting Options
- Most Relevant (default, based on search relevance score)
- Newest First (by creation date descending)
- Price: Low to High (by price ascending)
- Price: High to Low (by price descending)
- Most Popular (by sold count descending)
- Sort option persisted in URL query parameters

### Results Display
- Responsive grid layout (2 columns mobile, 4 columns desktop)
- 20 drops per page with pagination
- Total result count display
- Uses existing DropCard component
- Pagination controls with page numbers, previous, and next buttons
- Scroll to top on page navigation

### Mobile Experience
- Collapsible filter sidebar on viewports < 1024px
- Full-screen filter overlay on mobile
- Touch-friendly tap targets (44x44px minimum)
- "Show Results" button with result count
- Filter changes not applied until "Show Results" clicked
- Expandable search icon on viewports < 768px

### Empty States and Errors
- Helpful empty state with suggestions when no results found
- Popular search terms as clickable links
- Featured drops as alternative suggestions
- Clear error messages for server and network failures
- Retry button for failed searches
- Graceful degradation when JavaScript disabled

### Analytics and Tracking
- Log all search queries with result count and timestamp
- Track zero-result searches separately
- Log search result clicks with position and drop ID
- Track filter and sort usage
- Store analytics data for later analysis
- Calculate metrics: search usage rate, zero-result rate, click-through rate, conversion rate

### Performance
- Search results within 200ms
- Autocomplete debounced to 300ms
- Database indexes on searchable fields
- Cache popular queries for 60 seconds
- Prefetch drop detail pages on hover
- Lighthouse Performance score 90+

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all controls
- ARIA labels and live regions
- Screen reader announcements for result changes
- Skip links to results
- Color contrast ratios 4.5:1 minimum

### URL State Management
- Search query in "q" parameter
- Filters in query parameters (category, priceMin, priceMax, status)
- Sort option in "sortBy" parameter
- Page number in "page" parameter
- Browser history support for back/forward navigation
- Shareable and bookmarkable URLs

