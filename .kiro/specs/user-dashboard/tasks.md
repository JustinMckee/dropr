# Implementation Plan: User Dashboard

## Overview

This plan implements the User Dashboard feature using the MVVM architecture pattern with scoped Zustand stores. The dashboard provides authenticated users with a central hub for managing followed drops, viewing order history, managing profile and preferences, and receiving real-time notifications. Implementation follows a bottom-up approach: Models → ViewModel → Glue Layer → Views → SSE → Integration.

## Tasks

- [ ] 1. Set up project structure and core types
  - Create directory structure for dashboard feature
  - Define TypeScript types and interfaces
  - Set up testing framework configuration
  - _Requirements: 1.1, 2.1, 5.1, 6.1, 7.1_

- [ ] 2. Implement Model layer (Server Actions and types)
  - [ ] 2.1 Create dashboard.types.ts with all TypeScript interfaces
    - Define FollowedDrop, OrderSummary, OrderDetail, UserProfile, EmailPreferences, Notification, DashboardData types
    - Define enums for DropStatus, OrderStatus, NotificationType
    - _Requirements: 2.1, 5.1, 6.1, 7.1, 8.1, 17.1_
  
  - [ ]* 2.2 Write property test for type completeness
    - **Property 4: Followed Drop Display Completeness**
    - **Property 10: Order Display Completeness**
    - **Property 13: Order Details Completeness**
    - **Property 19: Curator Display Completeness**
    - **Property 20: Notification Display Completeness**
    - **Validates: Requirements 2.3, 5.2, 6.2, 16.5, 17.3**
  
  - [ ] 2.3 Implement dashboard.actions.ts Server Actions
    - Write fetchDashboardData() to fetch all dashboard data
    - Write updateUserProfile() with validation
    - Write updateEmailPreferences() with optimistic update support
    - Write markNotificationAsRead() and markAllNotificationsAsRead()
    - _Requirements: 1.1, 2.1, 7.1, 7.2, 8.1, 8.2, 17.1_
  
  - [ ]* 2.4 Write property tests for dashboard actions
    - **Property 15: Profile Validation**
    - **Property 22: Mark All Notifications Read**
    - **Validates: Requirements 7.3, 7.4, 17.5**
  
  - [ ] 2.5 Implement follow.actions.ts Server Actions
    - Write toggleDropFollow() for follow/unfollow operations
    - Write fetchFollowedDropIds() for homepage integration
    - Add cache revalidation tags
    - _Requirements: 3.1, 3.2, 24.1_
  
  - [ ] 2.6 Implement order.actions.ts Server Actions
    - Write fetchOrderHistory() with pagination support
    - Write fetchOrderDetails() with authorization check
    - _Requirements: 5.1, 5.4, 6.1_
  
  - [ ]* 2.7 Write property test for pagination
    - **Property 12: Pagination Subset Correctness**
    - **Validates: Requirements 5.5**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement ViewModel layer (Zustand store)
  - [ ] 4.1 Create dashboard.store.ts with store factory
    - Define DashboardStore interface with state and actions
    - Implement createDashboardStore() factory function
    - Implement loadDashboardData() action
    - Implement SSE subscription management (subscribeToUpdates, unsubscribe, updateDropFromSSE)
    - _Requirements: 1.1, 2.1, 13.1, 13.2, 13.3_
  
  - [ ] 4.2 Implement follow/unfollow actions with optimistic UI
    - Write unfollowDrop() with optimistic update and rollback
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 4.3 Write property test for optimistic UI updates
    - **Property 5: Optimistic UI Updates with Rollback**
    - **Validates: Requirements 3.2, 3.3, 3.4, 8.3, 8.4, 16.2, 16.3**
  
  - [ ] 4.4 Implement filter and search actions
    - Write setFollowedDropsFilter() and clearFollowedDropsFilter()
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [ ] 4.5 Implement order history actions
    - Write loadOrderHistory() with pagination
    - Write loadOrderDetails()
    - _Requirements: 5.1, 5.4, 6.1_
  
  - [ ] 4.6 Implement profile and preferences actions
    - Write updateProfile() with optimistic UI
    - Write updatePreferences() with optimistic UI
    - _Requirements: 7.1, 7.2, 8.1, 8.2_
  
  - [ ] 4.7 Implement notification actions
    - Write markNotificationRead() with optimistic UI
    - Write markAllNotificationsRead() with optimistic UI
    - _Requirements: 17.1, 17.5_
  
  - [ ]* 4.8 Write property tests for ViewModel logic
    - **Property 2: Followed Drops Grouping Completeness**
    - **Property 3: Status Group Sorting**
    - **Property 8: Unread Notification Count Accuracy**
    - **Property 11: Reverse Chronological Sorting**
    - **Property 16: Search Filter Subset**
    - **Validates: Requirements 2.4, 2.5, 4.4, 5.3, 15.2, 15.4, 17.2**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Glue layer (Context Provider and hooks)
  - [ ] 6.1 Create useDashboard.ts with Context Provider
    - Implement DashboardStoreProvider component
    - Implement useDashboard() base hook
    - Add auto-load on mount and cleanup on unmount
    - _Requirements: 1.1, 2.1_
  
  - [ ] 6.2 Create convenience selector hooks
    - Write useDashboardData(), useDashboardLoading(), useDashboardError()
    - Write useFollowedDrops() with filter application
    - Write useGroupedFollowedDrops() with sorting logic
    - Write useRecentOrders(), useOrderHistory(), useSelectedOrder()
    - Write useNotifications(), useUnreadNotifications()
    - Write useUserProfile(), useEmailPreferences(), useDashboardStats()
    - _Requirements: 2.1, 2.4, 2.5, 4.4, 5.1, 5.3, 7.1, 8.1, 17.1, 17.2_
  
  - [ ] 6.3 Create action hooks
    - Write useUnfollowDrop(), useSetFollowedDropsFilter(), useClearFollowedDropsFilter()
    - Write useLoadOrderHistory(), useLoadOrderDetails()
    - Write useUpdateProfile(), useUpdatePreferences()
    - Write useMarkNotificationRead(), useMarkAllNotificationsRead()
    - _Requirements: 3.1, 5.1, 6.1, 7.2, 8.2, 15.1, 17.1_
  
  - [ ]* 6.4 Write unit tests for hooks
    - Test Context Provider initialization
    - Test hook error handling when used outside Provider
    - Test selector hooks return correct data
    - _Requirements: 1.1, 2.1_

- [ ] 7. Implement View layer - Shared components
  - [ ] 7.1 Create EmptyState.tsx component
    - Implement reusable empty state with icon, title, message, and optional action
    - _Requirements: 2.2, 5.2, 17.2_
  
  - [ ] 7.2 Create LoadingSkeleton.tsx component
    - Implement skeleton loaders for drop cards, order cards, and lists
    - _Requirements: 11.1, 11.2_
  
  - [ ] 7.3 Create ErrorMessage.tsx component
    - Implement error display with retry button
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ]* 7.4 Write unit tests for shared components
    - Test EmptyState renders with all props
    - Test LoadingSkeleton displays correct skeleton structure
    - Test ErrorMessage displays error text and retry button
    - _Requirements: 2.2, 11.1, 12.1_

- [ ] 8. Implement View layer - Dashboard layout and navigation
  - [ ] 8.1 Create DashboardLayout.tsx component
    - Implement responsive layout with sidebar (desktop) and bottom nav (mobile)
    - Add user profile header with avatar and name
    - Add breadcrumb navigation
    - _Requirements: 1.1, 10.1, 10.2_
  
  - [ ] 8.2 Create DashboardNav.tsx component
    - Implement navigation menu with badge counts
    - Highlight current section
    - Add keyboard accessibility
    - _Requirements: 1.1, 10.1, 10.2, 20.1, 20.2, 20.3_
  
  - [ ]* 8.3 Write unit tests for layout components
    - Test DashboardLayout renders children
    - Test DashboardNav highlights current path
    - Test badge counts display correctly
    - Test keyboard navigation works
    - _Requirements: 1.1, 10.1, 20.2_

- [ ] 9. Implement View layer - Followed drops
  - [ ] 9.1 Create FollowedDropCard.tsx component
    - Display drop information (title, curator, status, countdown, price, inventory)
    - Implement unfollow button with hover state
    - Add notification indicator
    - Add sold out overlay
    - Add urgency indicator for drops ending soon
    - _Requirements: 2.3, 3.1, 4.2, 4.3_
  
  - [ ] 9.2 Create FollowedDropsList.tsx component
    - Group drops by status (live, upcoming, ended)
    - Display search and filter controls
    - Show empty state when no followed drops
    - Show skeleton loaders during initial load
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 11.1_
  
  - [ ]* 9.3 Write unit tests for followed drops components
    - Test FollowedDropCard renders all required fields
    - Test unfollow button calls handler
    - Test notification indicator displays when hasNotification is true
    - Test sold out overlay displays for sold_out status
    - Test urgency indicator displays for drops ending soon
    - Test FollowedDropsList groups drops correctly
    - Test empty state displays when no drops
    - _Requirements: 2.3, 3.1, 4.2, 4.3_
  
  - [ ]* 9.4 Write property tests for followed drops
    - **Property 7: Conditional Drop Indicators**
    - **Validates: Requirements 4.2, 4.3**

- [ ] 10. Implement View layer - Orders
  - [ ] 10.1 Create OrderCard.tsx component
    - Display order summary (number, drop title, curator, date, amount, status, item count)
    - Add status badge with appropriate colors
    - Make card clickable to view details
    - _Requirements: 5.2, 5.3_
  
  - [ ] 10.2 Create OrderHistoryList.tsx component
    - Display paginated list of orders
    - Show empty state for new users
    - Show skeleton loaders during fetch
    - Add pagination controls
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 11.1_
  
  - [ ] 10.3 Create OrderDetails.tsx component
    - Display comprehensive order information
    - Show items list with quantities and prices
    - Display shipping address
    - Show tracking link if available
    - Display order total breakdown
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 10.4 Write unit tests for order components
    - Test OrderCard renders all required fields
    - Test status badge colors match status
    - Test OrderCard click calls handler
    - Test OrderHistoryList displays pagination
    - Test OrderDetails renders all sections
    - Test tracking link displays when trackingNumber exists
    - _Requirements: 5.2, 6.2, 6.3_
  
  - [ ]* 10.5 Write property test for conditional tracking link
    - **Property 14: Conditional Tracking Link Display**
    - **Validates: Requirements 6.3**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement View layer - Profile and preferences
  - [ ] 12.1 Create ProfileForm.tsx component
    - Implement form with name, email, avatar, bio fields
    - Add client-side validation with Zod
    - Show field-specific error messages
    - Disable submit button while saving
    - Show success toast on save
    - Add unsaved changes warning
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 12.2 Create EmailPreferencesForm.tsx component
    - Implement toggle switches for each preference type
    - Add description text for each preference
    - Auto-save on change
    - Show success indicator after save
    - Revert and show error if save fails
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 12.3 Create AccountSettingsForm.tsx component
    - Implement change password section
    - Implement two-factor authentication section
    - Display connected accounts
    - Add delete account section with confirmation
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 12.4 Write unit tests for profile and preferences components
    - Test ProfileForm validation rejects invalid input
    - Test ProfileForm displays field-specific errors
    - Test EmailPreferencesForm toggles update state
    - Test AccountSettingsForm displays all sections
    - _Requirements: 7.3, 7.4, 8.1, 9.1_

- [ ] 13. Implement View layer - Notifications
  - [ ] 13.1 Create NotificationItem.tsx component
    - Display notification type, message, timestamp
    - Show unread indicator (bold text, colored dot)
    - Make notification clickable to navigate to related entity
    - _Requirements: 17.1, 17.3, 17.4_
  
  - [ ] 13.2 Create NotificationCenter.tsx component
    - Display notifications in reverse chronological order
    - Add "Mark all as read" button
    - Show empty state when no notifications
    - Handle notification click to mark as read and navigate
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 13.3 Write unit tests for notification components
    - Test NotificationItem displays all required fields
    - Test unread indicator displays for unread notifications
    - Test notification click calls handler
    - Test NotificationCenter displays in reverse chronological order
    - Test "Mark all as read" button calls handler
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 13.4 Write property tests for notifications
    - **Property 6: Drop Status Change Notifications**
    - **Property 9: Notification Read State Update**
    - **Property 21: Notification Navigation**
    - **Validates: Requirements 4.1, 4.5, 17.4**

- [ ] 14. Implement View layer - Quick actions and utilities
  - [ ] 14.1 Create QuickActions.tsx component
    - Implement dropdown menu with common actions
    - Show conditional curator dashboard link for curators
    - Add keyboard accessibility
    - Close on outside click and item selection
    - _Requirements: 18.1, 18.2, 18.3, 20.2_
  
  - [ ]* 14.2 Write unit tests for QuickActions
    - Test menu displays all items
    - Test curator dashboard link displays for curators only
    - Test keyboard navigation works
    - Test menu closes on outside click
    - _Requirements: 18.1, 18.3, 20.2_
  
  - [ ]* 14.3 Write property test for conditional curator actions
    - **Property 23: Conditional Curator Quick Actions**
    - **Validates: Requirements 18.3**

- [ ] 15. Implement SSE endpoint for real-time updates
  - [ ] 15.1 Create app/api/dashboard/stream/route.ts
    - Implement SSE endpoint with authentication check
    - Stream followed drop updates every second
    - Send countdown, inventory, and status updates
    - Handle client disconnect cleanup
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 15.2 Write integration test for SSE endpoint
    - Test endpoint requires authentication
    - Test endpoint streams data every second
    - Test endpoint closes on client disconnect
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ]* 15.3 Write property test for SSE reconnection
    - **Property 28: SSE Reconnection**
    - **Validates: Requirements 13.5**

- [ ] 16. Implement error handling
  - [ ] 16.1 Create DashboardErrorBoundary.tsx component
    - Catch React errors and display fallback UI
    - Log errors to Sentry
    - Provide refresh button
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ] 16.2 Create error handling utilities
    - Implement NetworkError, AuthenticationError, ValidationError classes
    - Write handleError() function for error message mapping
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ] 16.3 Create toast notification utilities
    - Implement showErrorToast(), showSuccessToast(), showInfoToast()
    - _Requirements: 3.4, 7.2, 8.2, 12.1_
  
  - [ ]* 16.4 Write unit tests for error handling
    - Test DashboardErrorBoundary catches errors
    - Test handleError() returns appropriate messages
    - Test AuthenticationError redirects to login
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ]* 16.5 Write property tests for error handling
    - **Property 26: Error Message Display**
    - **Property 27: Error Monitoring Logging**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Implement dashboard pages
  - [ ] 18.1 Create app/dashboard/page.tsx (main dashboard)
    - Wrap with DashboardStoreProvider
    - Display dashboard overview with stats
    - Show recent followed drops and orders
    - _Requirements: 1.1, 2.1, 5.1_
  
  - [ ] 18.2 Create app/dashboard/followed/page.tsx
    - Display FollowedDropsList with search and filters
    - _Requirements: 2.1, 15.1_
  
  - [ ] 18.3 Create app/dashboard/orders/page.tsx
    - Display OrderHistoryList with pagination
    - _Requirements: 5.1, 5.4_
  
  - [ ] 18.4 Create app/dashboard/orders/[id]/page.tsx
    - Display OrderDetails for specific order
    - _Requirements: 6.1_
  
  - [ ] 18.5 Create app/dashboard/profile/page.tsx
    - Display ProfileForm
    - _Requirements: 7.1_
  
  - [ ] 18.6 Create app/dashboard/settings/page.tsx
    - Display AccountSettingsForm
    - _Requirements: 9.1_
  
  - [ ] 18.7 Create app/dashboard/settings/email-preferences/page.tsx
    - Display EmailPreferencesForm
    - _Requirements: 8.1_
  
  - [ ] 18.8 Create app/dashboard/notifications/page.tsx
    - Display NotificationCenter
    - _Requirements: 17.1_

- [ ] 19. Implement authentication middleware
  - [ ] 19.1 Update middleware.ts to protect dashboard routes
    - Add dashboard path matcher
    - Redirect unauthenticated users to login with callback URL
    - _Requirements: 1.2_
  
  - [ ]* 19.2 Write integration test for authentication
    - **Property 1: Authentication Redirect**
    - **Validates: Requirements 1.2**

- [ ] 20. Implement search and filter functionality
  - [ ] 20.1 Create search input component for followed drops
    - Add debounced search input
    - Update URL query parameters on search
    - _Requirements: 15.1, 15.2, 15.5_
  
  - [ ] 20.2 Create filter controls for followed drops
    - Add status filter checkboxes
    - Update URL query parameters on filter change
    - _Requirements: 15.3, 15.5_
  
  - [ ] 20.3 Implement URL state persistence
    - Read query parameters on page load
    - Restore filter and search state from URL
    - _Requirements: 15.5_
  
  - [ ]* 20.4 Write property test for URL state persistence
    - **Property 17: URL State Persistence**
    - **Validates: Requirements 15.5**

- [ ] 21. Implement curator following functionality
  - [ ] 21.1 Add "Follow Curator" button to FollowedDropCard
    - Show button only if user is not already following curator
    - Implement follow/unfollow action
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [ ] 21.2 Create followed curators list view
    - Display curator cards with name, avatar, active drop count
    - _Requirements: 16.4, 16.5_
  
  - [ ]* 21.3 Write unit tests for curator following
    - Test "Follow Curator" button displays conditionally
    - Test follow action calls handler
    - Test curator card displays all required fields
    - _Requirements: 16.1, 16.5_
  
  - [ ]* 21.4 Write property test for conditional curator follow button
    - **Property 18: Conditional Curator Follow Button**
    - **Validates: Requirements 16.1**

- [ ] 22. Implement accessibility features
  - [ ] 22.1 Add ARIA labels to all interactive elements
    - Add labels to buttons, links, inputs
    - Add role attributes where needed
    - Add aria-live regions for dynamic content
    - _Requirements: 20.1, 20.3_
  
  - [ ] 22.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add focus indicators
    - Implement logical tab order
    - _Requirements: 20.2_
  
  - [ ] 22.3 Add screen reader announcements
    - Announce loading states
    - Announce error messages
    - Announce success messages
    - _Requirements: 20.4_
  
  - [ ]* 22.4 Write property test for ARIA labels
    - **Property 29: ARIA Label Presence**
    - **Validates: Requirements 20.3**

- [ ] 23. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Implement performance optimizations
  - [ ] 24.1 Add React.memo to expensive components
    - Memoize FollowedDropCard, OrderCard, NotificationItem
    - _Requirements: 14.1_
  
  - [ ] 24.2 Implement virtual scrolling for long lists
    - Add virtual scrolling to followed drops list
    - Add virtual scrolling to order history list
    - Add virtual scrolling to notifications list
    - _Requirements: 14.2_
  
  - [ ] 24.3 Optimize images with Next.js Image component
    - Use Image component for drop cover images
    - Use Image component for curator avatars
    - Add proper sizes and priority attributes
    - _Requirements: 14.3_
  
  - [ ] 24.4 Add Suspense boundaries for code splitting
    - Wrap dashboard sections in Suspense
    - Create loading skeletons for each section
    - _Requirements: 11.1, 14.4_

- [ ] 25. Integration and wiring
  - [ ] 25.1 Wire dashboard with homepage follow functionality
    - Ensure toggleDropFollow() works from both homepage and dashboard
    - Ensure follow state syncs between homepage and dashboard
    - Test cache revalidation updates both views
    - _Requirements: 24.1, 24.2_
  
  - [ ] 25.2 Wire notification system with drop status changes
    - Create notifications when followed drops go live
    - Create notifications when followed drops are ending soon
    - Create notifications when followed drops sell out
    - _Requirements: 4.1_
  
  - [ ] 25.3 Wire order notifications
    - Create notifications when orders ship
    - Create notifications when orders are delivered
    - _Requirements: 4.1_
  
  - [ ]* 25.4 Write integration tests for full user flows
    - Test user can follow drop from homepage and see it in dashboard
    - Test user can unfollow drop from dashboard
    - Test user can view order history and details
    - Test user can update profile and preferences
    - Test user can view and mark notifications as read
    - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1, 7.1, 8.1, 17.1_

- [ ] 26. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Implementation follows MVVM pattern: Models → ViewModel → Glue → Views
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate full user flows end-to-end
- SSE provides real-time updates for followed drop countdowns and status changes
- Optimistic UI updates provide immediate feedback with graceful error handling
- All components are scoped with Context Provider for isolation and testability
