'use client';

import { createContext, useContext, useRef, useEffect, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createHomepageStore, type HomepageStore } from '../stores/homepage.store';
import { applyFilters, applySorting } from '../models/homepage.utils';

const HomepageStoreContext = createContext<ReturnType<typeof createHomepageStore> | null>(null);

export function HomepageStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef(createHomepageStore());

  useEffect(() => {
    const store = storeRef.current;
    const state = store.getState();

    // Load data on mount
    state.loadHomepageData();

    // Cleanup on unmount
    return () => {
      state.unsubscribe();
    };
  }, []);

  return (
    <HomepageStoreContext.Provider value={storeRef.current}>
      {children}
    </HomepageStoreContext.Provider>
  );
}

export function useHomepage<T>(selector: (state: HomepageStore) => T): T {
  const store = useContext(HomepageStoreContext);
  if (!store) {
    throw new Error('useHomepage must be used within HomepageStoreProvider');
  }
  return useStore(store, selector);
}

// Convenience hooks for common selectors
export function useHomepageData() {
  return useHomepage((state) => state.data);
}

export function useHomepageLoading() {
  return useHomepage((state) => state.loading);
}

export function useHomepageError() {
  return useHomepage((state) => state.error);
}

export function useFeaturedDrops() {
  return useHomepage((state) => state.data?.featuredDrops || []);
}

export function useLiveUpcomingDrops() {
  const drops = useHomepage((state) => state.data?.liveUpcomingDrops || []);
  const filters = useHomepage((state) => state.filters);
  const sort = useHomepage((state) => state.sort);

  // Apply filters
  let filtered = applyFilters(drops, filters);

  // Apply sort
  const sorted = applySorting(filtered, sort);

  return sorted;
}

export function useFoundingCurators() {
  return useHomepage((state) => state.data?.foundingCurators || []);
}

export function usePopularCurators(collective?: 'MOD' | 'MAKE' | 'MINI') {
  return useHomepage((state) => {
    if (!state.data) return [];

    if (collective === 'MOD') return state.data.popularModders || [];
    if (collective === 'MAKE') return state.data.popularMakers || [];
    if (collective === 'MINI') return state.data.popularMinists || [];

    // Return all if no collective specified
    return [
      ...(state.data.popularModders || []),
      ...(state.data.popularMakers || []),
      ...(state.data.popularMinists || []),
    ];
  });
}

export function useCuratorSpotlights() {
  return useHomepage((state) => state.data?.curatorSpotlights || []);
}

export function useDropSpotlights() {
  return useHomepage((state) => state.data?.dropSpotlights || []);
}

export function usePlatformStats() {
  return useHomepage((state) => state.data?.stats);
}

export function useFilters() {
  return useHomepage((state) => state.filters);
}

export function useSetFilters() {
  return useHomepage((state) => state.setFilters);
}

export function useSort() {
  return useHomepage((state) => state.sort);
}

export function useSetSort() {
  return useHomepage((state) => state.setSort);
}

export function useClearFilters() {
  return useHomepage((state) => state.clearFilters);
}

export function useFollowedDropIds() {
  return useHomepage((state) => state.followedDropIds);
}

export function useToggleFollowDrop() {
  return useHomepage((state) => state.toggleFollowDrop);
}
