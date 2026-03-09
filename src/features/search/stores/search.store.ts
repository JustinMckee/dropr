'use client';

import { createStore } from 'zustand';
import {
  searchDrops,
  fetchSearchHistory,
  saveSearchToHistory,
  clearSearchHistory as clearSearchHistoryAction,
  fetchSuggestedSearches,
  fetchCategories,
  fetchTags,
  fetchPriceTiers,
} from '../models/search.actions';
import type {
  SearchState,
  SearchFilters,
  SearchHistoryItem,
  SuggestedSearch,
  Category,
  Tag,
  PriceTier,
  Collective,
  SearchResult,
} from '../models/search.types';

export interface SearchStore extends SearchState {
  // Additional state
  loading: boolean;
  error: string | null;
  priceTiers: PriceTier[];
  searchResult: SearchResult | null;

  // Actions
  setQuery: (query: string) => void;
  setCollective: (collective: Collective | 'all') => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  toggleExpanded: (expanded: boolean) => void;
  performSearch: () => Promise<SearchResult | undefined>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadPriceTiers: () => Promise<void>;
  syncFromURL: (searchParams: URLSearchParams) => void;
  syncToURL: () => void;
}

let debounceTimeout: NodeJS.Timeout | null = null;

export const createSearchStore = (
  initialCollective: Collective | 'all' = 'all'
) => {
  return createStore<SearchStore>((set, get) => ({
    // Initial state
    query: '',
    collective: initialCollective,
    filters: {
      tags: [],
    },
    isExpanded: false,
    history: [],
    suggestions: [],
    categories: [],
    tags: [],
    loading: false,
    error: null,
    priceTiers: [],
    searchResult: null,

    // Set query with debounce
    setQuery: (query: string) => {
      set({ query });

      // Clear existing timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Debounce search by 300ms
      debounceTimeout = setTimeout(() => {
        get().performSearch();
      }, 300);
    },

    // Set collective
    setCollective: (collective: Collective | 'all') => {
      set({ collective });
      get().performSearch();
      get().loadSuggestions();
      get().loadCategories();
      get().loadTags();
      get().loadPriceTiers();
    },

    // Set filters
    setFilters: (filters: Partial<SearchFilters>) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }));
      get().performSearch();
      get().syncToURL();
    },

    // Clear all filters
    clearFilters: () => {
      set({
        filters: {
          tags: [],
        },
      });
      get().performSearch();
      get().syncToURL();
    },

    // Toggle expanded state
    toggleExpanded: (expanded: boolean) => {
      set({ isExpanded: expanded });

      if (expanded) {
        // Load history and suggestions when expanding
        get().loadHistory();
        get().loadSuggestions();
      }
    },

    // Perform search
    performSearch: async () => {
      const { query, collective, filters } = get();

      set({ loading: true, error: null });

      try {
        const result = await searchDrops(query, filters);

        // Save to history if query is not empty
        if (query.trim()) {
          await saveSearchToHistory(query, collective);
        }

        // Update URL
        get().syncToURL();

        set({ loading: false, searchResult: result });

        // Return result for homepage integration
        return result;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Search failed',
          loading: false,
        });
      }
    },

    // Load search history
    loadHistory: async () => {
      try {
        const history = await fetchSearchHistory();
        set({ history });
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    },

    // Clear search history
    clearHistory: async () => {
      try {
        await clearSearchHistoryAction();
        set({ history: [] });
      } catch (error) {
        console.error('Failed to clear search history:', error);
      }
    },

    // Load suggested searches
    loadSuggestions: async () => {
      try {
        const { collective } = get();
        const suggestions = await fetchSuggestedSearches(collective);
        set({ suggestions });
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      }
    },

    // Load categories (collective-specific, vertical)
    loadCategories: async () => {
      try {
        const { collective } = get();
        const categories = await fetchCategories(collective);
        set({ categories });
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    },

    // Load tags (cross-collective, horizontal)
    loadTags: async () => {
      try {
        const tags = await fetchTags();
        set({ tags });
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    },

    // Load price tiers
    loadPriceTiers: async () => {
      try {
        const { collective } = get();
        const priceTiers = await fetchPriceTiers(collective);
        set({ priceTiers });
      } catch (error) {
        console.error('Failed to load price tiers:', error);
      }
    },

    // Sync state from URL
    syncFromURL: (searchParams: URLSearchParams) => {
      const query = searchParams.get('q') || '';
      const category = searchParams.get('category') || undefined;
      const tags = searchParams.getAll('tag');
      const priceTier = searchParams.get('priceTier') || undefined;

      set({
        query,
        filters: {
          category,
          tags,
          priceTier,
        },
      });
    },

    // Sync state to URL
    syncToURL: () => {
      const { query, filters } = get();
      const params = new URLSearchParams(window.location.search);

      // Update query parameter
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }

      // Update category parameter
      if (filters.category) {
        params.set('category', filters.category);
      } else {
        params.delete('category');
      }

      // Update tag parameters
      params.delete('tag');
      filters.tags.forEach((tag) => {
        params.append('tag', tag);
      });

      // Update priceTier parameter
      if (filters.priceTier) {
        params.set('priceTier', filters.priceTier);
      } else {
        params.delete('priceTier');
      }

      // Update URL without navigation
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    },
  }));
};
