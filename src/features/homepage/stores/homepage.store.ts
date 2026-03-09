'use client';

import { createStore } from 'zustand';
import { fetchHomepageData } from '../models/homepage.actions';
import type { HomepageData, Drop, FilterOptions, SortOption } from '../models/homepage.types';

export interface HomepageStore {
  // State
  data: HomepageData | null;
  loading: boolean;
  error: string | null;
  eventSource: EventSource | null;
  filters: FilterOptions;
  sort: SortOption;
  followedDropIds: Set<string>;

  // Actions
  loadHomepageData: () => Promise<void>;
  subscribeToDropUpdates: () => void;
  unsubscribe: () => void;
  updateDropFromSSE: (dropUpdate: Partial<Drop>) => void;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
  toggleFollowDrop: (dropId: string) => Promise<void>;
  loadFollowedDrops: () => Promise<void>;
}

export const createHomepageStore = () => {
  return createStore<HomepageStore>((set, get) => ({
    // Initial state
    data: null,
    loading: false,
    error: null,
    eventSource: null,
    filters: {},
    sort: { field: 'startTime', direction: 'asc' },
    followedDropIds: new Set<string>(),

    // Load homepage data
    loadHomepageData: async () => {
      set({ loading: true, error: null });

      try {
        const data = await fetchHomepageData();
        set({ data, loading: false });

        // Subscribe to real-time updates after initial load
        get().subscribeToDropUpdates();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load homepage',
          loading: false,
        });
      }
    },

    // Subscribe to SSE for real-time updates
    subscribeToDropUpdates: () => {
      const eventSource = new EventSource('/api/drops/stream');

      eventSource.onmessage = (event) => {
        try {
          const updates = JSON.parse(event.data);

          // Update each drop with new data
          updates.forEach((update: any) => {
            get().updateDropFromSSE({
              id: update.id,
              inventory: update.inventory,
              status: update.status,
              startTime: new Date(update.startTime),
              endTime: new Date(update.endTime),
            });
          });
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };

      eventSource.onerror = () => {
        // SSE connection failed - this is expected if no drops exist in database
        // Silently close and don't retry to avoid console noise
        eventSource.close();
        set({ eventSource: null });
      };

      set({ eventSource });
    },

    // Unsubscribe from SSE
    unsubscribe: () => {
      const { eventSource } = get();
      if (eventSource) {
        eventSource.close();
        set({ eventSource: null });
      }
    },

    // Update a single drop from SSE data
    updateDropFromSSE: (dropUpdate) => {
      set((state) => {
        if (!state.data) return state;

        const updateDropInArray = (drops: Drop[]) =>
          drops.map((drop) => (drop.id === dropUpdate.id ? { ...drop, ...dropUpdate } : drop));

        return {
          data: {
            ...state.data,
            featuredDrops: updateDropInArray(state.data.featuredDrops),
            liveUpcomingDrops: updateDropInArray(state.data.liveUpcomingDrops),
            dropSpotlights: state.data.dropSpotlights.map((spotlight) =>
              spotlight.id === dropUpdate.id ? { ...spotlight, ...dropUpdate } : spotlight
            ),
          },
        };
      });
    },

    // Set filters
    setFilters: (filters) => {
      set({ filters });
    },

    // Set sort
    setSort: (sort) => {
      set({ sort });
    },

    // Clear all filters
    clearFilters: () => {
      set({ filters: {} });
    },

    // Toggle follow drop
    toggleFollowDrop: async (dropId: string) => {
      const { followedDropIds } = get();
      const isCurrentlyFollowed = followedDropIds.has(dropId);

      // Optimistic UI update
      const newFollowedDropIds = new Set(followedDropIds);
      if (isCurrentlyFollowed) {
        newFollowedDropIds.delete(dropId);
      } else {
        newFollowedDropIds.add(dropId);
      }
      set({ followedDropIds: newFollowedDropIds });

      try {
        // Call Server Action to persist follow state
        // Implementation will be in separate user dashboard spec
        // await toggleDropFollow(dropId);
      } catch (error) {
        // Revert optimistic update on error
        set({ followedDropIds });
        console.error('Failed to toggle drop follow:', error);
      }
    },

    // Load followed drops for authenticated user
    loadFollowedDrops: async () => {
      try {
        // Call Server Action to fetch user's followed drops
        // Implementation will be in separate user dashboard spec
        // const followedIds = await fetchFollowedDropIds();
        // set({ followedDropIds: new Set(followedIds) });
      } catch (error) {
        console.error('Failed to load followed drops:', error);
      }
    },
  }));
};
