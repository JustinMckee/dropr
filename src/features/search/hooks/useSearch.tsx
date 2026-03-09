'use client';

import { createContext, useContext, useRef, useEffect } from 'react';
import { useStore } from 'zustand';
import { useSearchParams } from 'next/navigation';
import { createSearchStore, SearchStore } from '../stores/search.store';
import type { Collective } from '../models/search.types';

const SearchStoreContext = createContext<ReturnType<
  typeof createSearchStore
> | null>(null);

export function SearchStoreProvider({
  children,
  initialCollective = 'all',
}: {
  children: React.ReactNode;
  initialCollective?: Collective | 'all';
}) {
  const storeRef = useRef(createSearchStore(initialCollective));
  const searchParams = useSearchParams();

  useEffect(() => {
    const store = storeRef.current;
    const state = store.getState();

    // Sync from URL on mount
    state.syncFromURL(searchParams);

    // Load initial data
    state.loadSuggestions();
    state.loadCategories();
    state.loadTags();
    state.loadPriceTiers();

    // Perform search if query exists
    if (state.query) {
      state.performSearch();
    }
  }, [searchParams]);

  return (
    <SearchStoreContext.Provider value={storeRef.current}>
      {children}
    </SearchStoreContext.Provider>
  );
}

export function useSearch<T>(selector: (state: SearchStore) => T): T {
  const store = useContext(SearchStoreContext);
  if (!store) {
    throw new Error('useSearch must be used within SearchStoreProvider');
  }
  return useStore(store, selector);
}

// Convenience hooks for common selectors
export function useSearchQuery() {
  return useSearch((state) => state.query);
}

export function useSearchCollective() {
  return useSearch((state) => state.collective);
}

export function useSearchFilters() {
  return useSearch((state) => state.filters);
}

export function useSearchExpanded() {
  return useSearch((state) => state.isExpanded);
}

export function useSearchHistory() {
  return useSearch((state) => state.history);
}

export function useSearchSuggestions() {
  return useSearch((state) => state.suggestions);
}

export function useCategories() {
  return useSearch((state) => state.categories);
}

export function useTags() {
  return useSearch((state) => state.tags);
}

export function usePriceTiers() {
  return useSearch((state) => state.priceTiers);
}

export function useSearchLoading() {
  return useSearch((state) => state.loading);
}

export function useSearchError() {
  return useSearch((state) => state.error);
}

export function useSearchResult() {
  return useSearch((state) => state.searchResult);
}

// Action hooks
export function useSetQuery() {
  return useSearch((state) => state.setQuery);
}

export function useSetCollective() {
  return useSearch((state) => state.setCollective);
}

export function useSetFilters() {
  return useSearch((state) => state.setFilters);
}

export function useClearFilters() {
  return useSearch((state) => state.clearFilters);
}

export function useToggleExpanded() {
  return useSearch((state) => state.toggleExpanded);
}

export function usePerformSearch() {
  return useSearch((state) => state.performSearch);
}

export function useClearHistory() {
  return useSearch((state) => state.clearHistory);
}
