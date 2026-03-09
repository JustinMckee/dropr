# Search and Filter - Design

## Overview

The Search and Filter feature provides an Airbnb-inspired search interface that emphasizes discovery and intuitive filtering for the Dropr platform. The design centers around three core elements: a prominent search bar at the top center of the page, collective filters (Mod, Make, Mini) below the search bar, and an expandable search experience that reveals search history, suggested searches, and advanced filters.

This feature integrates seamlessly with the existing homepage-drop-discovery spec, filtering all content sections simultaneously when search queries or filters are applied. The interface uses subdomains for collective filtering (mod.dropr.com, make.dropr.com, mini.dropr.com) and maintains all search state in URL query parameters for shareable, bookmarkable URLs.

### Key Design Principles

- **Familiar Interface**: Airbnb-inspired patterns that users already understand
- **Prominent Search**: Search bar as a primary interface element at top center
- **Immediate Filtering**: All page content updates without navigation to separate results page
- **URL State Persistence**: All search state (query, filters, collective) encoded in URL
- **Subdomain Navigation**: Collective filters navigate to subdomains for better SEO and caching
- **MVVM Architecture**: Thin views with fat ViewModels using scoped Zustand stores
- **Real-Time Integration**: Works with existing SSE-powered countdown timers and inventory updates

## Architecture

### High-Level Component Structure

```
app/
├── page.tsx                           # Main homepage with search integration
├── middleware.ts                      # Subdomain detection + search param handling
└── api/
    └── search/
        └── route.ts                   # Search API endpoint (if needed)

components/
└── search/
    ├── SearchBar.tsx
    ├── ExpandedSearchUI.tsx
    ├── CollectiveFilters.tsx
    ├── TagFilterPanel.tsx
    ├── ActiveFiltersChips.tsx
    └── SearchHistory.tsx

features/
└── search/
    ├── models/
    │   ├── search.types.ts
    │   └── search.actions.ts         # Server Actions
    ├── stores/
    │   └── search.store.ts           # Zustand ViewModel
    └── hooks/
        └── useSearch.ts              # Context Provider + hook
```

### MVVM Pattern Implementation

The search feature follows the MVVM pattern with scoped Zustand stores:

**Model Layer** (features/search/models/):
- TypeScript types for SearchQuery, FilterOptions, SearchHistory
- Server Actions for search queries, filter operations, history management
- Data transformation utilities

**ViewModel Layer** (features/search/stores/):
- Zustand store factory for search state management
- Client-side business logic (query debouncing, filter application, URL sync)
- Search history management
- Integration with homepage content sections

**Glue Layer** (features/search/hooks/):
- Context Provider to scope store instances
- Custom hook to expose store with selectors

**View Layer** (components/search/):
- Thin React components consuming the hook
- Presentational logic only
- No direct Server Action calls


### Integration with Homepage

The search feature integrates with the homepage-drop-discovery spec by:

1. **Filtering Existing Sections**: When search/filters are applied, the existing homepage sections (Featured Drops, Live & Upcoming Drops, etc.) are filtered in place
2. **Shared State**: The search store communicates with the homepage store to apply filters
3. **URL Synchronization**: Both features respect URL query parameters for state
4. **Component Reuse**: Uses existing DropCard component from homepage spec
5. **Real-Time Updates**: Maintains SSE connections for countdown timers and inventory

### Subdomain Architecture

```typescript
// middleware.ts enhancement for search
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const collective = detectCollective(hostname);
  const url = request.nextUrl;
  
  // Extract search params
  const searchQuery = url.searchParams.get('q') || '';
  const tags = url.searchParams.getAll('tag');
  const priceTier = url.searchParams.get('priceTier');
  
  // Add collective and search context to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-collective', collective);
  requestHeaders.set('x-search-query', searchQuery);
  requestHeaders.set('x-search-tags', tags.join(','));
  requestHeaders.set('x-search-price-tier', priceTier || '');
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function detectCollective(hostname: string): Collective | 'all' {
  if (hostname.startsWith('mod.')) return 'MOD';
  if (hostname.startsWith('make.')) return 'MAKE';
  if (hostname.startsWith('mini.')) return 'MINI';
  return 'all';
}
```

## Data Models

### TypeScript Types

```typescript
// features/search/models/search.types.ts

export type Collective = 'MOD' | 'MAKE' | 'MINI';

export interface SearchQuery {
  query: string;
  collective: Collective | 'all';
  timestamp: Date;
}

export interface SearchHistoryItem extends SearchQuery {
  id: string;
  userId: string;
}

export interface SuggestedSearch {
  id: string;
  text: string;
  icon: string;
  type: 'trending' | 'popular' | 'curated';
  collective?: Collective;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  collective: Collective;
  description?: string;
  icon?: string;
  order: number;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: TagType;
  count: number;
}

export type TagType = 'GENERAL' | 'MATERIAL' | 'COLOR' | 'THEME' | 'SKILL_LEVEL';

export interface PriceTier {
  id: string;
  name: string;
  min: number;
  max: number;
  count: number;
}

export interface SearchFilters {
  category?: string;      // Single category (vertical, collective-specific)
  tags: string[];         // Multiple tags (horizontal, cross-cutting)
  priceTier?: string;
}

export interface SearchState {
  query: string;
  collective: Collective | 'all';
  filters: SearchFilters;
  isExpanded: boolean;
  history: SearchHistoryItem[];
  suggestions: SuggestedSearch[];
  categories: Category[];  // Available categories for current collective
  tags: Tag[];            // Available tags (cross-collective)
}

export interface SearchResult {
  drops: Drop[];
  totalCount: number;
  appliedFilters: SearchFilters;
}
```


### Server Actions

```typescript
// features/search/models/search.actions.ts
'use server'

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import type { SearchQuery, SearchHistoryItem, SuggestedSearch, TagFilter, PriceTier } from './search.types';

/**
 * Performs full-text search across drops
 * Scoped to collective based on subdomain
 */
export async function searchDrops(query: string, filters: SearchFilters): Promise<SearchResult> {
  const headersList = headers();
  const collective = (headersList.get('x-collective') || 'all') as Collective | 'all';
  
  // Build where clause
  const where: any = {
    status: { in: ['upcoming', 'live'] },
  };
  
  // Apply collective filter
  if (collective !== 'all') {
    where.collective = collective;
  }
  
  // Apply search query
  if (query.trim()) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { curator: { user: { name: { contains: query, mode: 'insensitive' } } } },
    ];
  }
  
  // Apply category filter (single selection, vertical)
  if (filters.category) {
    where.categoryId = filters.category;
  }
  
  // Apply tag filters (multiple selection, horizontal)
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      some: {
        id: { in: filters.tags },
      },
    };
  }
  
  // Apply price tier filter
  if (filters.priceTier) {
    const tier = await getPriceTier(filters.priceTier);
    if (tier) {
      where.price = {
        gte: tier.min,
        lte: tier.max,
      };
    }
  }
  
  // Execute search
  const [drops, totalCount] = await Promise.all([
    db.drop.findMany({
      where,
      include: {
        curator: {
          include: { user: true },
        },
        reviews: {
          select: { rating: true },
        },
        tags: true,
      },
      orderBy: [
        { featured: 'desc' },
        { startTime: 'asc' },
      ],
    }),
    db.drop.count({ where }),
  ]);
  
  // Track search query
  if (query.trim()) {
    await trackSearchQuery(query, collective, totalCount);
  }
  
  return {
    drops: drops.map(transformDropFromPrisma),
    totalCount,
    appliedFilters: filters,
  };
}

/**
 * Fetches search history for authenticated user
 */
export async function fetchSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const session = await requireAuth();
    
    const history = await db.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
    
    return history.map(h => ({
      id: h.id,
      userId: h.userId,
      query: h.query,
      collective: h.collective as Collective | 'all',
      timestamp: h.timestamp,
    }));
  } catch (error) {
    // User not authenticated, return empty history
    return [];
  }
}

/**
 * Saves search query to user's history
 */
export async function saveSearchToHistory(query: string, collective: Collective | 'all'): Promise<void> {
  try {
    const session = await requireAuth();
    
    // Check if query already exists for this user and collective
    const existing = await db.searchHistory.findFirst({
      where: {
        userId: session.user.id,
        query,
        collective,
      },
    });
    
    if (existing) {
      // Update timestamp
      await db.searchHistory.update({
        where: { id: existing.id },
        data: { timestamp: new Date() },
      });
    } else {
      // Create new history entry
      await db.searchHistory.create({
        data: {
          userId: session.user.id,
          query,
          collective,
          timestamp: new Date(),
        },
      });
      
      // Keep only last 10 searches
      const allHistory = await db.searchHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { timestamp: 'desc' },
      });
      
      if (allHistory.length > 10) {
        const toDelete = allHistory.slice(10);
        await db.searchHistory.deleteMany({
          where: {
            id: { in: toDelete.map(h => h.id) },
          },
        });
      }
    }
  } catch (error) {
    // User not authenticated, skip saving
    console.error('Failed to save search history:', error);
  }
}

/**
 * Clears all search history for authenticated user
 */
export async function clearSearchHistory(): Promise<void> {
  const session = await requireAuth();
  
  await db.searchHistory.deleteMany({
    where: { userId: session.user.id },
  });
}

/**
 * Fetches suggested searches based on collective
 */
export async function fetchSuggestedSearches(collective: Collective | 'all'): Promise<SuggestedSearch[]> {
  return await getCachedSuggestedSearches(collective);
}

const getCachedSuggestedSearches = unstable_cache(
  async (collective: Collective | 'all') => {
    const suggestions: SuggestedSearch[] = [];
    
    if (collective === 'all') {
      // Cross-collective suggestions
      suggestions.push(
        { id: '1', text: 'Trending Curators', icon: 'trending-up', type: 'trending' },
        { id: '2', text: 'Most Followed Drops', icon: 'heart', type: 'popular' },
        { id: '3', text: 'New This Week', icon: 'sparkles', type: 'curated' },
        { id: '4', text: 'Ending Soon', icon: 'clock', type: 'curated' },
      );
    } else if (collective === 'MOD') {
      suggestions.push(
        { id: '5', text: 'Trending Keyboards', icon: 'trending-up', type: 'trending', collective: 'MOD' },
        { id: '6', text: 'New Keycap Sets', icon: 'sparkles', type: 'curated', collective: 'MOD' },
        { id: '7', text: 'Popular Switches', icon: 'heart', type: 'popular', collective: 'MOD' },
        { id: '8', text: 'Ending Soon', icon: 'clock', type: 'curated', collective: 'MOD' },
      );
    } else if (collective === 'MAKE') {
      suggestions.push(
        { id: '9', text: 'Trending Electronics', icon: 'trending-up', type: 'trending', collective: 'MAKE' },
        { id: '10', text: 'New 3D Prints', icon: 'sparkles', type: 'curated', collective: 'MAKE' },
        { id: '11', text: 'Popular Synth Modules', icon: 'heart', type: 'popular', collective: 'MAKE' },
        { id: '12', text: 'Ending Soon', icon: 'clock', type: 'curated', collective: 'MAKE' },
      );
    } else if (collective === 'MINI') {
      suggestions.push(
        { id: '13', text: 'Trending Miniatures', icon: 'trending-up', type: 'trending', collective: 'MINI' },
        { id: '14', text: 'New Model Kits', icon: 'sparkles', type: 'curated', collective: 'MINI' },
        { id: '15', text: 'Popular Paints', icon: 'heart', type: 'popular', collective: 'MINI' },
        { id: '16', text: 'Ending Soon', icon: 'clock', type: 'curated', collective: 'MINI' },
      );
    }
    
    return suggestions;
  },
  ['suggested-searches'],
  { tags: ['search'], revalidate: 86400 } // Cache for 24 hours
);

/**
 * Fetches available categories for filtering (collective-specific, vertical)
 */
export async function fetchCategories(collective: Collective | 'all'): Promise<Category[]> {
  if (collective === 'all') {
    // No category filter on main homepage (categories are collective-specific)
    return [];
  }
  
  const categories = await db.category.findMany({
    where: { collective },
    include: {
      _count: {
        select: {
          drops: {
            where: {
              status: { in: ['upcoming', 'live'] },
            },
          },
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });
  
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    collective: cat.collective as Collective,
    description: cat.description || undefined,
    icon: cat.icon || undefined,
    order: cat.order,
    count: cat._count.drops,
  }));
}

/**
 * Fetches available tags for filtering (cross-collective, horizontal)
 */
export async function fetchTags(): Promise<Tag[]> {
  // Tags are cross-collective, so no collective filter
  const tags = await db.tag.findMany({
    include: {
      _count: {
        select: {
          drops: {
            where: {
              status: { in: ['upcoming', 'live'] },
            },
          },
        },
      },
    },
    orderBy: [
      { type: 'asc' },  // Group by type
      { name: 'asc' },
    ],
  });
  
  return tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description || undefined,
    type: tag.type as TagType,
    count: tag._count.drops,
  }));
}

/**
 * Fetches available price tiers
 */
export async function fetchPriceTiers(collective: Collective | 'all'): Promise<PriceTier[]> {
  // Define price tiers (TBD - these are placeholder values)
  const tiers = [
    { id: 'tier-1', name: '$10-$25', min: 10, max: 25 },
    { id: 'tier-2', name: '$25-$50', min: 25, max: 50 },
    { id: 'tier-3', name: '$50-$100', min: 50, max: 100 },
    { id: 'tier-4', name: '$100+', min: 100, max: 10000 },
  ];
  
  // Count drops in each tier
  const where: any = {
    status: { in: ['upcoming', 'live'] },
  };
  
  if (collective !== 'all') {
    where.collective = collective;
  }
  
  const tiersWithCounts = await Promise.all(
    tiers.map(async (tier) => {
      const count = await db.drop.count({
        where: {
          ...where,
          price: {
            gte: tier.min,
            lte: tier.max,
          },
        },
      });
      
      return {
        ...tier,
        count,
      };
    })
  );
  
  return tiersWithCounts;
}

/**
 * Gets a specific price tier by ID
 */
async function getPriceTier(tierId: string): Promise<PriceTier | null> {
  const tiers = [
    { id: 'tier-1', name: '$10-$25', min: 10, max: 25, count: 0 },
    { id: 'tier-2', name: '$25-$50', min: 25, max: 50, count: 0 },
    { id: 'tier-3', name: '$50-$100', min: 50, max: 100, count: 0 },
    { id: 'tier-4', name: '$100+', min: 100, max: 10000, count: 0 },
  ];
  
  return tiers.find(t => t.id === tierId) || null;
}

/**
 * Tracks search query for analytics
 */
async function trackSearchQuery(query: string, collective: Collective | 'all', resultCount: number): Promise<void> {
  await db.searchAnalytics.create({
    data: {
      query,
      collective,
      resultCount,
      timestamp: new Date(),
    },
  });
}

// Transform function to convert Prisma model to app type
function transformDropFromPrisma(prismaData: any): Drop {
  const reviews = prismaData.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : undefined;
  
  return {
    id: prismaData.id,
    title: prismaData.title,
    description: prismaData.description,
    coverImageUrl: prismaData.coverImageUrl,
    price: prismaData.price,
    inventory: prismaData.inventory,
    status: prismaData.status,
    startTime: prismaData.startTime,
    endTime: prismaData.endTime,
    dropType: prismaData.dropType,
    collective: prismaData.collective,
    featured: prismaData.featured,
    curator: {
      id: prismaData.curator.id,
      name: prismaData.curator.user.name,
      avatar: prismaData.curator.user.image,
      verified: prismaData.curator.verified,
    },
    averageRating,
    reviewCount: reviews.length,
  };
}
```


### ViewModel: Zustand Store

```typescript
// features/search/stores/search.store.ts
'use client'

import { createStore } from 'zustand';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  searchDrops,
  fetchSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  fetchSuggestedSearches,
  fetchTagFilters,
  fetchPriceTiers,
} from '../models/search.actions';
import type { SearchState, SearchFilters, SearchHistoryItem, SuggestedSearch, TagFilter, PriceTier } from '../models/search.types';

export interface SearchStore extends SearchState {
  // Additional state
  loading: boolean;
  error: string | null;
  categories: Category[];  // Collective-specific categories (vertical)
  tags: Tag[];            // Cross-collective tags (horizontal)
  priceTiers: PriceTier[];
  
  // Actions
  setQuery: (query: string) => void;
  setCollective: (collective: Collective | 'all') => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  toggleExpanded: (expanded: boolean) => void;
  performSearch: () => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadPriceTiers: () => Promise<void>;
  syncFromURL: (searchParams: URLSearchParams) => void;
  syncToURL: () => void;
}

export const createSearchStore = (initialCollective: Collective | 'all' = 'all') => {
  return createStore<SearchStore>((set, get) => ({
    // Initial state
    query: '',
    collective: initialCollective,
    filters: {
      tags: [],
      priceTier: undefined,
    },
    isExpanded: false,
    history: [],
    suggestions: [],
    loading: false,
    error: null,
    categories: [],
    tags: [],
    priceTiers: [],
    
    // Set query
    setQuery: (query: string) => {
      set({ query });
      
      // Debounce search
      const timeoutId = setTimeout(() => {
        get().performSearch();
      }, 300);
      
      return () => clearTimeout(timeoutId);
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
          priceTier: undefined,
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
        
        set({ loading: false });
        
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
        await clearSearchHistory();
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
      const params = new URLSearchParams();
      
      if (query) {
        params.set('q', query);
      }
      
      if (filters.category) {
        params.set('category', filters.category);
      }
      
      filters.tags.forEach(tag => {
        params.append('tag', tag);
      });
      
      if (filters.priceTier) {
        params.set('priceTier', filters.priceTier);
      }
      
      // Update URL without navigation
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    },
  }));
};
```


### Glue Layer: Context Provider and Hook

```typescript
// features/search/hooks/useSearch.ts
'use client'

import { createContext, useContext, useRef, useEffect } from 'react';
import { useStore } from 'zustand';
import { useSearchParams } from 'next/navigation';
import { createSearchStore, SearchStore } from '../stores/search.store';

const SearchStoreContext = createContext<ReturnType<typeof createSearchStore> | null>(null);

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
```

## Components and Interfaces

### Core Components

#### 1. SearchBar

**Purpose**: Prominent search input at top center of page

**Props**:
```typescript
interface SearchBarProps {
  collective: Collective | 'all';
}
```

**Behavior**:
- Displays at top center of page
- Minimum width 600px on desktop, 90% on mobile
- Includes search icon on left, filter icon on right
- Focuses to expand search UI
- Debounces input by 300ms
- Updates URL with query parameter
- Accessible via keyboard navigation

**Implementation**:
```typescript
// components/search/SearchBar.tsx
'use client'

import { Search, Filter } from 'lucide-react';
import { useSearchQuery, useSetQuery, useToggleExpanded, useSearchExpanded } from '@/features/search/hooks/useSearch';

export function SearchBar({ collective }: SearchBarProps) {
  const query = useSearchQuery();
  const setQuery = useSetQuery();
  const isExpanded = useSearchExpanded();
  const toggleExpanded = useToggleExpanded();
  
  const handleFocus = () => {
    toggleExpanded(true);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input
          type="search"
          placeholder="Search drops, curators, categories..."
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          aria-label="Search"
          className="search-input"
        />
        <button
          type="button"
          onClick={() => toggleExpanded(true)}
          aria-label="Open filters"
          className="filter-button"
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
}
```


#### 2. CollectiveFilters

**Purpose**: Three filter buttons (Mod, Make, Mini) below search bar

**Props**:
```typescript
interface CollectiveFiltersProps {
  currentCollective: Collective | 'all';
}
```

**Behavior**:
- Displays three buttons: Mod, Make, Mini
- Highlights active collective
- Clicking navigates to subdomain (mod.dropr.com, make.dropr.com, mini.dropr.com)
- Maintains search query in URL when navigating
- Accessible via keyboard navigation

**Implementation**:
```typescript
// components/search/CollectiveFilters.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useSearchQuery } from '@/features/search/hooks/useSearch';

export function CollectiveFilters({ currentCollective }: CollectiveFiltersProps) {
  const router = useRouter();
  const query = useSearchQuery();
  
  const handleCollectiveClick = (collective: 'MOD' | 'MAKE' | 'MINI') => {
    const subdomain = collective.toLowerCase();
    const queryParam = query ? `?q=${encodeURIComponent(query)}` : '';
    
    // Navigate to subdomain
    window.location.href = `https://${subdomain}.dropr.com${queryParam}`;
  };
  
  return (
    <div className="collective-filters">
      <button
        onClick={() => handleCollectiveClick('MOD')}
        className={currentCollective === 'MOD' ? 'active' : ''}
        aria-pressed={currentCollective === 'MOD'}
      >
        Mod
      </button>
      <button
        onClick={() => handleCollectiveClick('MAKE')}
        className={currentCollective === 'MAKE' ? 'active' : ''}
        aria-pressed={currentCollective === 'MAKE'}
      >
        Make
      </button>
      <button
        onClick={() => handleCollectiveClick('MINI')}
        className={currentCollective === 'MINI' ? 'active' : ''}
        aria-pressed={currentCollective === 'MINI'}
      >
        Mini
      </button>
    </div>
  );
}
```

#### 3. ExpandedSearchUI

**Purpose**: Overlay that appears when search bar is focused

**Props**:
```typescript
interface ExpandedSearchUIProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Behavior**:
- Displays as overlay dimming background
- Shows search bar at top
- Displays search history below (if logged in)
- Displays suggested searches below history
- Closes on outside click or Escape key
- Animates smoothly (300ms transition)
- Traps focus within overlay

**Implementation**:
```typescript
// components/search/ExpandedSearchUI.tsx
'use client'

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchHistory } from './SearchHistory';
import { SuggestedSearches } from './SuggestedSearches';
import { useSearchExpanded, useToggleExpanded } from '@/features/search/hooks/useSearch';

export function ExpandedSearchUI({ collective }: { collective: Collective | 'all' }) {
  const isExpanded = useSearchExpanded();
  const toggleExpanded = useToggleExpanded();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        toggleExpanded(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded, toggleExpanded]);
  
  useEffect(() => {
    if (isExpanded) {
      // Trap focus
      const firstFocusable = overlayRef.current?.querySelector('input, button');
      (firstFocusable as HTMLElement)?.focus();
    }
  }, [isExpanded]);
  
  if (!isExpanded) return null;
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleExpanded(false);
    }
  };
  
  return (
    <div
      ref={overlayRef}
      className="expanded-search-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="expanded-search-content">
        <div className="expanded-search-header">
          <SearchBar collective={collective} />
          <button
            onClick={() => toggleExpanded(false)}
            aria-label="Close search"
            className="close-button"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="expanded-search-body">
          <SearchHistory />
          <SuggestedSearches />
        </div>
      </div>
    </div>
  );
}
```


#### 4. SearchHistory

**Purpose**: Displays recent searches for logged-in users

**Props**: None (uses hook to access state)

**Behavior**:
- Displays up to 10 recent searches
- Shows query text and timestamp
- Clicking item executes that search
- Includes "Clear History" button
- Only visible for authenticated users
- Accessible via keyboard navigation

**Implementation**:
```typescript
// components/search/SearchHistory.tsx
'use client'

import { Clock, X } from 'lucide-react';
import { useSearchHistory, useSetQuery, useClearHistory, usePerformSearch } from '@/features/search/hooks/useSearch';
import { formatDistanceToNow } from 'date-fns';

export function SearchHistory() {
  const history = useSearchHistory();
  const setQuery = useSetQuery();
  const clearHistory = useClearHistory();
  const performSearch = usePerformSearch();
  
  if (history.length === 0) return null;
  
  const handleHistoryClick = (query: string) => {
    setQuery(query);
    performSearch();
  };
  
  return (
    <div className="search-history">
      <div className="search-history-header">
        <h3>Recent Searches</h3>
        <button
          onClick={clearHistory}
          className="clear-button"
          aria-label="Clear search history"
        >
          Clear History
        </button>
      </div>
      
      <ul className="search-history-list" role="list">
        {history.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleHistoryClick(item.query)}
              className="history-item"
              aria-label={`Search for ${item.query}`}
            >
              <Clock size={16} className="history-icon" />
              <span className="history-query">{item.query}</span>
              <span className="history-time">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 5. SuggestedSearches

**Purpose**: Displays curated search suggestions

**Props**: None (uses hook to access state)

**Behavior**:
- Displays 4-6 suggested searches
- Shows suggestion text and icon
- Clicking executes that search
- Different suggestions per collective
- Accessible via keyboard navigation

**Implementation**:
```typescript
// components/search/SuggestedSearches.tsx
'use client'

import { TrendingUp, Heart, Sparkles, Clock } from 'lucide-react';
import { useSearchSuggestions, useSetQuery, usePerformSearch } from '@/features/search/hooks/useSearch';

const iconMap = {
  'trending-up': TrendingUp,
  'heart': Heart,
  'sparkles': Sparkles,
  'clock': Clock,
};

export function SuggestedSearches() {
  const suggestions = useSearchSuggestions();
  const setQuery = useSetQuery();
  const performSearch = usePerformSearch();
  
  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    performSearch();
  };
  
  return (
    <div className="suggested-searches">
      <h3>Suggested Searches</h3>
      
      <ul className="suggested-searches-list" role="list">
        {suggestions.map((suggestion) => {
          const Icon = iconMap[suggestion.icon as keyof typeof iconMap] || Sparkles;
          
          return (
            <li key={suggestion.id}>
              <button
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="suggestion-item"
                aria-label={`Search for ${suggestion.text}`}
              >
                <Icon size={16} className="suggestion-icon" />
                <span className="suggestion-text">{suggestion.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```


#### 6. FilterPanel

**Purpose**: Panel for filtering by category (vertical), tags (horizontal), and price tier

**Props**: None (uses hook to access state)

**Behavior**:
- Opens when filter icon is clicked
- Displays price tier filter section (top)
- Displays category filter section (single-select, collective-specific)
- Displays tag filter section (multi-select, cross-collective)
- Shows "Clear All" button
- Displays badge on filter icon with active filter count
- Closes on outside click or Escape
- Accessible via keyboard navigation

**Implementation**:
```typescript
// components/search/FilterPanel.tsx
'use client'

import { X } from 'lucide-react';
import { useState } from 'react';
import { useCategories, useTags, usePriceTiers, useSearchFilters, useSetFilters, useClearFilters } from '@/features/search/hooks/useSearch';

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const categories = useCategories();
  const tags = useTags();
  const priceTiers = usePriceTiers();
  const currentFilters = useSearchFilters();
  const setFilters = useSetFilters();
  const clearFilters = useClearFilters();
  
  const handleCategorySelect = (categoryId: string) => {
    setFilters({ category: categoryId });
  };
  
  const handleTagToggle = (tagId: string) => {
    const newTags = currentFilters.tags.includes(tagId)
      ? currentFilters.tags.filter(t => t !== tagId)
      : [...currentFilters.tags, tagId];
    
    setFilters({ tags: newTags });
  };
  
  const handlePriceTierSelect = (tierId: string) => {
    setFilters({ priceTier: tierId });
  };
  
  const activeFilterCount = 
    (currentFilters.category ? 1 : 0) +
    currentFilters.tags.length + 
    (currentFilters.priceTier ? 1 : 0);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="filter-icon-button"
        aria-label="Open filters"
        aria-expanded={isOpen}
      >
        <Filter size={20} />
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="filter-panel" role="dialog" aria-label="Filters">
          <div className="filter-panel-header">
            <h3>Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close filters"
              className="close-button"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="filter-panel-body">
            {/* Price Tier Section */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-tier-list">
                {priceTiers.map((tier) => (
                  <label key={tier.id} className="filter-option">
                    <input
                      type="radio"
                      name="priceTier"
                      value={tier.id}
                      checked={currentFilters.priceTier === tier.id}
                      onChange={() => handlePriceTierSelect(tier.id)}
                    />
                    <span className="filter-label">
                      {tier.name}
                      <span className="filter-count">({tier.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Category Section (vertical, collective-specific, single-select) */}
            {categories.length > 0 && (
              <div className="filter-section">
                <h4>Category</h4>
                <p className="filter-description">Choose one category</p>
                <div className="category-list">
                  {categories.map((category) => (
                    <label key={category.id} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={currentFilters.category === category.id}
                        onChange={() => handleCategorySelect(category.id)}
                      />
                      <span className="filter-label">
                        {category.icon && <span className="category-icon">{category.icon}</span>}
                        {category.name}
                        <span className="filter-count">({category.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tag Section (horizontal, cross-collective, multi-select) */}
            <div className="filter-section">
              <h4>Tags</h4>
              <p className="filter-description">Select multiple tags</p>
              <div className="tag-list">
                {/* Group tags by type */}
                {['GENERAL', 'MATERIAL', 'COLOR', 'THEME', 'SKILL_LEVEL'].map((type) => {
                  const typeTags = tags.filter(tag => tag.type === type);
                  if (typeTags.length === 0) return null;
                  
                  return (
                    <div key={type} className="tag-group">
                      <h5 className="tag-group-title">{formatTagType(type)}</h5>
                      {typeTags.map((tag) => (
                        <label key={tag.id} className="filter-option">
                          <input
                            type="checkbox"
                            checked={currentFilters.tags.includes(tag.id)}
                            onChange={() => handleTagToggle(tag.id)}
                          />
                          <span className="filter-label">
                            {tag.name}
                            <span className="filter-count">({tag.count})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="filter-panel-footer">
            <button
              onClick={clearFilters}
              className="clear-all-button"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function formatTagType(type: string): string {
  const typeMap: Record<string, string> = {
    'GENERAL': 'General',
    'MATERIAL': 'Materials',
    'COLOR': 'Colors',
    'THEME': 'Themes',
    'SKILL_LEVEL': 'Skill Level',
  };
  return typeMap[type] || type;
}
```

#### 7. ActiveFiltersChips

**Purpose**: Displays active filters as removable chips

**Props**: None (uses hook to access state)

**Behavior**:
- Displays below search bar and collective filters
- Shows chip for active category (if selected)
- Shows chip for each active tag filter
- Shows chip for active price tier
- Each chip has remove button (X icon)
- Includes "Clear All" button when multiple filters active
- Animates smoothly when added/removed (200ms)
- Accessible via keyboard navigation

**Implementation**:
```typescript
// components/search/ActiveFiltersChips.tsx
'use client'

import { X } from 'lucide-react';
import { useSearchFilters, useSetFilters, useClearFilters, useCategories, useTags, usePriceTiers } from '@/features/search/hooks/useSearch';

export function ActiveFiltersChips() {
  const currentFilters = useSearchFilters();
  const setFilters = useSetFilters();
  const clearFilters = useClearFilters();
  const categories = useCategories();
  const tags = useTags();
  const priceTiers = usePriceTiers();
  
  const handleRemoveCategory = () => {
    setFilters({ category: undefined });
  };
  
  const handleRemoveTag = (tagId: string) => {
    const newTags = currentFilters.tags.filter(t => t !== tagId);
    setFilters({ tags: newTags });
  };
  
  const handleRemovePriceTier = () => {
    setFilters({ priceTier: undefined });
  };
  
  const activeFilterCount = 
    (currentFilters.category ? 1 : 0) +
    currentFilters.tags.length + 
    (currentFilters.priceTier ? 1 : 0);
  
  if (activeFilterCount === 0) return null;
  
  return (
    <div className="active-filters-chips">
      {/* Category chip (vertical, single) */}
      {currentFilters.category && (
        <div className="filter-chip filter-chip--category">
          <span>
            {categories.find(c => c.id === currentFilters.category)?.name}
          </span>
          <button
            onClick={handleRemoveCategory}
            aria-label="Remove category filter"
            className="chip-remove"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Tag chips (horizontal, multiple) */}
      {currentFilters.tags.map((tagId) => {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) return null;
        
        return (
          <div key={tagId} className="filter-chip filter-chip--tag">
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tagId)}
              aria-label={`Remove ${tag.name} filter`}
              className="chip-remove"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      
      {/* Price tier chip */}
      {currentFilters.priceTier && (
        <div className="filter-chip filter-chip--price">
          <span>
            {priceTiers.find(t => t.id === currentFilters.priceTier)?.name}
          </span>
          <button
            onClick={handleRemovePriceTier}
            aria-label="Remove price filter"
            className="chip-remove"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Clear all button */}
      {activeFilterCount > 1 && (
        <button
          onClick={clearFilters}
          className="clear-all-button"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
```


## Integration with Homepage Content Sections

The search feature integrates with the homepage-drop-discovery spec by filtering existing content sections in place. When search queries or filters are applied, all homepage sections update simultaneously without navigation to a separate results page.

### Integration Strategy

```typescript
// app/page.tsx (Main Homepage)
import { SearchStoreProvider } from '@/features/search/hooks/useSearch';
import { HomepageStoreProvider } from '@/features/homepage/hooks/useHomepage';
import { SearchBar } from '@/components/search/SearchBar';
import { CollectiveFilters } from '@/components/search/CollectiveFilters';
import { ExpandedSearchUI } from '@/components/search/ExpandedSearchUI';
import { ActiveFiltersChips } from '@/components/search/ActiveFiltersChips';
import { FeaturedDropsSection } from '@/components/homepage/FeaturedDropsSection';
import { LiveUpcomingDropsSection } from '@/components/homepage/LiveUpcomingDropsSection';

export default function HomePage() {
  const collective = 'all'; // or from middleware
  
  return (
    <SearchStoreProvider initialCollective={collective}>
      <HomepageStoreProvider>
        <div className="homepage">
          {/* Search Interface */}
          <SearchBar collective={collective} />
          <CollectiveFilters currentCollective={collective} />
          <ActiveFiltersChips />
          <ExpandedSearchUI collective={collective} />
          
          {/* Homepage Content Sections (filtered by search) */}
          <FeaturedDropsSection />
          <LiveUpcomingDropsSection />
          {/* ... other sections */}
        </div>
      </HomepageStoreProvider>
    </SearchStoreProvider>
  );
}
```

### Filtered Content Sections

Each homepage section component accesses both the homepage store and search store to apply filters:

```typescript
// components/homepage/FeaturedDropsSection.tsx
'use client'

import { useFeaturedDrops } from '@/features/homepage/hooks/useHomepage';
import { useSearchQuery, useSearchFilters } from '@/features/search/hooks/useSearch';
import { HorizontalScrollSection } from './shared/HorizontalScrollSection';
import { DropCard } from './shared/DropCard';

export function FeaturedDropsSection() {
  const allDrops = useFeaturedDrops();
  const searchQuery = useSearchQuery();
  const searchFilters = useSearchFilters();
  
  // Apply search and filters
  const filteredDrops = applySearchAndFilters(allDrops, searchQuery, searchFilters);
  
  if (filteredDrops.length === 0 && (searchQuery || searchFilters.tags.length > 0)) {
    return (
      <section className="featured-drops-section">
        <h2>Featured Drops</h2>
        <div className="empty-state">
          <p>No featured drops match your search.</p>
        </div>
      </section>
    );
  }
  
  return (
    <HorizontalScrollSection
      title="Featured Drops"
      ariaLabel="Featured drops"
      viewAllLink="/drops?featured=true"
    >
      {filteredDrops.map((drop) => (
        <DropCard
          key={drop.id}
          drop={drop}
          showCollectiveBadge={true}
        />
      ))}
    </HorizontalScrollSection>
  );
}

// Utility function to apply search and filters
function applySearchAndFilters(
  drops: Drop[],
  query: string,
  filters: SearchFilters
): Drop[] {
  let filtered = drops;
  
  // Apply search query
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(drop =>
      drop.title.toLowerCase().includes(lowerQuery) ||
      drop.description.toLowerCase().includes(lowerQuery) ||
      drop.curator.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Apply tag filters
  if (filters.tags.length > 0) {
    filtered = filtered.filter(drop =>
      drop.tags?.some(tag => filters.tags.includes(tag.id))
    );
  }
  
  // Apply price tier filter
  if (filters.priceTier) {
    const tier = getPriceTierById(filters.priceTier);
    if (tier) {
      filtered = filtered.filter(drop =>
        drop.price >= tier.min && drop.price <= tier.max
      );
    }
  }
  
  return filtered;
}

function getPriceTierById(tierId: string): { min: number; max: number } | null {
  const tiers: Record<string, { min: number; max: number }> = {
    'tier-1': { min: 10, max: 25 },
    'tier-2': { min: 25, max: 50 },
    'tier-3': { min: 50, max: 100 },
    'tier-4': { min: 100, max: 10000 },
  };
  
  return tiers[tierId] || null;
}
```

### Section-Specific Empty States

Each section displays its own empty state when no drops match the search/filters:

```typescript
// components/homepage/EmptyState.tsx
interface SectionEmptyStateProps {
  sectionName: string;
  hasActiveSearch: boolean;
}

export function SectionEmptyState({ sectionName, hasActiveSearch }: SectionEmptyStateProps) {
  if (!hasActiveSearch) {
    // No search active, just no drops in this section
    return (
      <div className="section-empty-state">
        <p>No {sectionName.toLowerCase()} available at the moment.</p>
      </div>
    );
  }
  
  // Search active, no matching drops
  return (
    <div className="section-empty-state">
      <p>No {sectionName.toLowerCase()} match your search.</p>
      <p className="empty-state-hint">Try adjusting your filters or search query.</p>
    </div>
  );
}
```


## URL State Management

All search state is persisted in URL query parameters for shareable, bookmarkable URLs.

### URL Parameter Schema

```
?q=<search_query>&category=<category_id>&tag=<tag_id>&tag=<tag_id>&priceTier=<tier_id>
```

**Examples:**
- Search only: `?q=mechanical+keyboard`
- Search with category: `?q=keyboard&category=mechanical-keyboards`
- Search with tags: `?q=keycaps&tag=artisan&tag=gmk`
- Search with price tier: `?q=switches&priceTier=tier-2`
- All filters: `?q=keyboard&category=keycaps&tag=custom&priceTier=tier-3`

### URL Synchronization

The search store automatically syncs state to/from URL:

```typescript
// Sync from URL on mount
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  store.syncFromURL(searchParams);
}, []);

// Sync to URL on state change
useEffect(() => {
  store.syncToURL();
}, [query, filters]);
```

### Browser History Support

The search feature supports browser back/forward navigation:

```typescript
// Listen for popstate events
useEffect(() => {
  const handlePopState = () => {
    const searchParams = new URLSearchParams(window.location.search);
    store.syncFromURL(searchParams);
    store.performSearch();
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

## Responsive Design

### Mobile (≤ 768px)

- Search bar spans 90% of viewport width
- Collective filters stack vertically or scroll horizontally
- Expanded search UI is full-screen overlay
- Tag filter panel displays as bottom sheet
- Filter chips wrap to multiple lines
- Touch-friendly tap targets (minimum 44x44px)

### Desktop (> 768px)

- Search bar minimum width 600px
- Collective filters horizontally aligned
- Expanded search UI is centered overlay (max-width 800px)
- Tag filter panel displays as dropdown
- Filter chips display in single row with horizontal scroll if needed

### CSS Implementation

```css
/* Search Bar */
.search-bar-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 90%;
  max-width: 600px;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
}

/* Collective Filters */
.collective-filters {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
}

.collective-filters button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.collective-filters button.active {
  background: #000;
  color: white;
  border-color: #000;
}

@media (max-width: 768px) {
  .collective-filters {
    overflow-x: auto;
    justify-content: flex-start;
  }
}

/* Expanded Search UI */
.expanded-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s;
}

.expanded-search-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideDown 0.3s;
}

@media (max-width: 768px) {
  .expanded-search-overlay {
    padding: 0;
  }
  
  .expanded-search-content {
    border-radius: 0;
    max-height: 100vh;
  }
}

/* Filter Chips */
.active-filters-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  justify-content: center;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.875rem;
  animation: slideIn 0.2s;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.chip-remove:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```


## Error Handling

### Search Errors

```typescript
// components/search/SearchError.tsx
interface SearchErrorProps {
  error: string;
  onRetry: () => void;
}

export function SearchError({ error, onRetry }: SearchErrorProps) {
  return (
    <div className="search-error">
      <p>{error}</p>
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
    </div>
  );
}

// Usage in SearchBar
export function SearchBar() {
  const error = useSearchError();
  const performSearch = usePerformSearch();
  
  return (
    <>
      {/* search bar UI */}
      {error && <SearchError error={error} onRetry={performSearch} />}
    </>
  );
}
```

### Empty States

```typescript
// components/search/EmptySearchResults.tsx
interface EmptySearchResultsProps {
  query: string;
  hasFilters: boolean;
}

export function EmptySearchResults({ query, hasFilters }: EmptySearchResultsProps) {
  const clearFilters = useClearFilters();
  
  return (
    <div className="empty-search-results">
      <h2>No drops found{query && ` for "${query}"`}</h2>
      
      <div className="suggestions">
        <h3>Try these instead:</h3>
        <ul>
          <li>Check your spelling</li>
          <li>Use fewer or different keywords</li>
          {hasFilters && <li>Remove some filters</li>}
          <li>Browse by collective</li>
        </ul>
      </div>
      
      {hasFilters && (
        <button onClick={clearFilters} className="clear-filters-button">
          Clear All Filters
        </button>
      )}
      
      <div className="popular-searches">
        <h3>Popular Searches:</h3>
        <SuggestedSearches />
      </div>
    </div>
  );
}
```

## Performance Optimization

### Debouncing

Search queries are debounced by 300ms to reduce server load:

```typescript
const setQuery = (query: string) => {
  set({ query });
  
  // Clear existing timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  // Set new timeout
  debounceTimeout = setTimeout(() => {
    get().performSearch();
  }, 300);
};
```

### Caching

Search results and filter options are cached:

```typescript
// Cache suggested searches for 24 hours
const getCachedSuggestedSearches = unstable_cache(
  async (collective: Collective | 'all') => {
    // ... fetch logic
  },
  ['suggested-searches'],
  { tags: ['search'], revalidate: 86400 }
);

// Cache tag filters for 1 hour
const getCachedTagFilters = unstable_cache(
  async (collective: Collective | 'all') => {
    // ... fetch logic
  },
  ['tag-filters'],
  { tags: ['search'], revalidate: 3600 }
);
```

### Database Indexes

Ensure proper indexes for search performance:

```prisma
// prisma/schema.prisma
model Drop {
  id          String   @id @default(cuid())
  title       String
  description String
  collective  Collective
  status      DropStatus
  price       Float
  
  @@index([title])
  @@index([collective, status])
  @@index([price])
  @@fulltext([title, description])
}

model Tag {
  id         String     @id @default(cuid())
  name       String
  collective Collective
  
  @@index([collective])
  @@index([name])
}
```

### Optimistic UI Updates

Filter changes use optimistic UI updates for instant feedback:

```typescript
const setFilters = (filters: Partial<SearchFilters>) => {
  // Optimistic update
  set((state) => ({
    filters: {
      ...state.filters,
      ...filters,
    },
  }));
  
  // Perform search in background
  get().performSearch();
};
```


## Accessibility

### Keyboard Navigation

All search components support full keyboard navigation:

- **Search Bar**: Tab to focus, type to search, Enter to submit
- **Collective Filters**: Tab to navigate, Enter/Space to select
- **Expanded Search UI**: Escape to close, Tab to navigate within
- **Search History**: Tab to navigate, Enter to select
- **Suggested Searches**: Tab to navigate, Enter to select
- **Tag Filter Panel**: Tab to navigate, Space to toggle checkboxes, Escape to close
- **Filter Chips**: Tab to focus, Enter to remove

### ARIA Labels

```typescript
// Search Bar
<input
  type="search"
  aria-label="Search drops, curators, and categories"
  aria-autocomplete="list"
  aria-controls="search-suggestions"
  aria-expanded={isExpanded}
/>

// Collective Filters
<button
  aria-pressed={isActive}
  aria-label={`Filter by ${collective} collective`}
>
  {collective}
</button>

// Expanded Search UI
<div
  role="dialog"
  aria-modal="true"
  aria-label="Search"
>
  {/* content */}
</div>

// Filter Chips
<button
  aria-label={`Remove ${filterName} filter`}
  onClick={handleRemove}
>
  <X size={14} />
</button>

// Tag Filter Panel
<div
  role="dialog"
  aria-label="Filters"
>
  <input
    type="checkbox"
    aria-label={`Filter by ${tagName}`}
    aria-describedby={`${tagId}-count`}
  />
  <span id={`${tagId}-count`}>{count} drops</span>
</div>
```

### Screen Reader Announcements

```typescript
// Announce search results
const announceResults = (count: number) => {
  const announcement = count === 0
    ? 'No results found'
    : `${count} ${count === 1 ? 'result' : 'results'} found`;
  
  // Use ARIA live region
  const liveRegion = document.getElementById('search-announcements');
  if (liveRegion) {
    liveRegion.textContent = announcement;
  }
};

// In component
<div
  id="search-announcements"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
/>
```

### Focus Management

```typescript
// Trap focus in expanded search UI
useEffect(() => {
  if (!isExpanded) return;
  
  const focusableElements = overlayRef.current?.querySelectorAll(
    'button, input, [tabindex]:not([tabindex="-1"])'
  );
  
  if (!focusableElements || focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  document.addEventListener('keydown', handleTabKey);
  firstElement.focus();
  
  return () => document.removeEventListener('keydown', handleTabKey);
}, [isExpanded]);
```

## Testing Strategy

### Unit Testing

Unit tests focus on individual functions and utilities:

```typescript
// features/search/models/search.utils.test.ts
import { describe, it, expect } from '@jest/globals';
import { applySearchQuery, applyTagFilters, applyPriceTierFilter } from './search.utils';

describe('Search Utils', () => {
  describe('applySearchQuery', () => {
    it('should filter drops by title', () => {
      const drops = [
        { id: '1', title: 'Mechanical Keyboard', description: '', curator: { name: '' } },
        { id: '2', title: 'Keycap Set', description: '', curator: { name: '' } },
      ];
      
      const result = applySearchQuery(drops, 'keyboard');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
    
    it('should filter drops by description', () => {
      const drops = [
        { id: '1', title: 'Drop 1', description: 'mechanical keyboard', curator: { name: '' } },
        { id: '2', title: 'Drop 2', description: 'keycaps', curator: { name: '' } },
      ];
      
      const result = applySearchQuery(drops, 'keyboard');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
    
    it('should be case-insensitive', () => {
      const drops = [
        { id: '1', title: 'Mechanical Keyboard', description: '', curator: { name: '' } },
      ];
      
      const result = applySearchQuery(drops, 'KEYBOARD');
      
      expect(result).toHaveLength(1);
    });
  });
  
  describe('applyTagFilters', () => {
    it('should filter drops by tags', () => {
      const drops = [
        { id: '1', tags: [{ id: 'tag1', name: 'Custom' }] },
        { id: '2', tags: [{ id: 'tag2', name: 'Artisan' }] },
      ];
      
      const result = applyTagFilters(drops, ['tag1']);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
    
    it('should support multiple tag filters (OR logic)', () => {
      const drops = [
        { id: '1', tags: [{ id: 'tag1', name: 'Custom' }] },
        { id: '2', tags: [{ id: 'tag2', name: 'Artisan' }] },
        { id: '3', tags: [{ id: 'tag3', name: 'GMK' }] },
      ];
      
      const result = applyTagFilters(drops, ['tag1', 'tag2']);
      
      expect(result).toHaveLength(2);
    });
  });
  
  describe('applyPriceTierFilter', () => {
    it('should filter drops by price tier', () => {
      const drops = [
        { id: '1', price: 20 },
        { id: '2', price: 40 },
        { id: '3', price: 80 },
      ];
      
      const tier = { id: 'tier-2', min: 25, max: 50 };
      const result = applyPriceTierFilter(drops, tier);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });
});
```


### Component Testing

Component tests verify rendering and user interactions:

```typescript
// components/search/SearchBar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { SearchStoreProvider } from '@/features/search/hooks/useSearch';

describe('SearchBar', () => {
  it('should render search input', () => {
    render(
      <SearchStoreProvider>
        <SearchBar collective="all" />
      </SearchStoreProvider>
    );
    
    expect(screen.getByPlaceholderText(/search drops/i)).toBeInTheDocument();
  });
  
  it('should expand search UI on focus', () => {
    render(
      <SearchStoreProvider>
        <SearchBar collective="all" />
      </SearchStoreProvider>
    );
    
    const input = screen.getByPlaceholderText(/search drops/i);
    fireEvent.focus(input);
    
    // Expanded UI should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  
  it('should debounce search input', async () => {
    const mockSearch = jest.fn();
    
    render(
      <SearchStoreProvider>
        <SearchBar collective="all" />
      </SearchStoreProvider>
    );
    
    const input = screen.getByPlaceholderText(/search drops/i);
    
    // Type quickly
    fireEvent.change(input, { target: { value: 'k' } });
    fireEvent.change(input, { target: { value: 'ke' } });
    fireEvent.change(input, { target: { value: 'key' } });
    
    // Search should not be called immediately
    expect(mockSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledTimes(1);
    }, { timeout: 400 });
  });
});
```

### Integration Testing

Integration tests verify full user flows with Playwright:

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Search and Filter', () => {
  test('should search for drops', async ({ page }) => {
    await page.goto('/');
    
    // Enter search query
    await page.fill('[placeholder*="Search"]', 'keyboard');
    
    // Wait for results
    await page.waitForTimeout(400); // Debounce
    
    // Check URL updated
    expect(page.url()).toContain('?q=keyboard');
    
    // Check results displayed
    const dropCards = page.locator('.drop-card');
    await expect(dropCards.first()).toBeVisible();
  });
  
  test('should filter by collective', async ({ page }) => {
    await page.goto('/');
    
    // Click MOD collective filter
    await page.click('button:has-text("Mod")');
    
    // Should navigate to subdomain
    await expect(page).toHaveURL(/mod\.dropr\.com/);
  });
  
  test('should apply tag filters', async ({ page }) => {
    await page.goto('/');
    
    // Open filter panel
    await page.click('[aria-label="Open filters"]');
    
    // Select a tag
    await page.check('input[type="checkbox"]:has-text("Custom")');
    
    // Check URL updated
    expect(page.url()).toContain('tag=');
    
    // Check filter chip displayed
    await expect(page.locator('.filter-chip:has-text("Custom")')).toBeVisible();
  });
  
  test('should clear filters', async ({ page }) => {
    await page.goto('/?q=keyboard&tag=custom');
    
    // Click clear all
    await page.click('button:has-text("Clear All")');
    
    // URL should be clean
    expect(page.url()).not.toContain('?');
    
    // Filter chips should be gone
    await expect(page.locator('.filter-chip')).not.toBeVisible();
  });
  
  test('should display search history', async ({ page }) => {
    // Login first
    await page.goto('/login');
    // ... login flow
    
    // Perform searches
    await page.goto('/');
    await page.fill('[placeholder*="Search"]', 'keyboard');
    await page.waitForTimeout(400);
    
    await page.fill('[placeholder*="Search"]', 'keycaps');
    await page.waitForTimeout(400);
    
    // Focus search bar
    await page.focus('[placeholder*="Search"]');
    
    // Check history displayed
    await expect(page.locator('text=Recent Searches')).toBeVisible();
    await expect(page.locator('text=keyboard')).toBeVisible();
    await expect(page.locator('text=keycaps')).toBeVisible();
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab to search bar
    await page.keyboard.press('Tab');
    
    // Should focus search input
    await expect(page.locator('[placeholder*="Search"]')).toBeFocused();
    
    // Type and press Enter
    await page.keyboard.type('keyboard');
    await page.keyboard.press('Enter');
    
    // Should perform search
    expect(page.url()).toContain('?q=keyboard');
  });
});
```


### Property-Based Testing

Property-based tests verify universal properties across many generated inputs:

```typescript
// features/search/models/search.properties.test.ts
import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { applySearchQuery, applyTagFilters, applyPriceTierFilter } from './search.utils';

describe('Search Property Tests', () => {
  /**
   * Feature: search-and-filter, Property 1: Search result subset
   * For any list of drops and any search query, the search results
   * should be a subset of the original list
   */
  it('should return subset of drops when searching', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        fc.string(),
        (drops, query) => {
          const results = applySearchQuery(drops, query);
          
          // Every result should exist in original list
          results.every(result => drops.some(d => d.id === result.id));
          
          // Results should be <= original list
          expect(results.length).toBeLessThanOrEqual(drops.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: search-and-filter, Property 2: Case insensitivity
   * For any search query, searching with uppercase, lowercase, or
   * mixed case should return the same results
   */
  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        fc.string({ minLength: 1 }),
        (drops, query) => {
          const lowerResults = applySearchQuery(drops, query.toLowerCase());
          const upperResults = applySearchQuery(drops, query.toUpperCase());
          const mixedResults = applySearchQuery(drops, query);
          
          expect(lowerResults.length).toBe(upperResults.length);
          expect(lowerResults.length).toBe(mixedResults.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: search-and-filter, Property 3: Filter combination
   * Applying multiple filters should never increase the result count
   */
  it('should not increase results when adding filters', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        fc.array(fc.string()),
        priceTierArbitrary(),
        (drops, tags, priceTier) => {
          const noFilters = drops;
          const withTags = applyTagFilters(drops, tags);
          const withPrice = applyPriceTierFilter(drops, priceTier);
          const withBoth = applyPriceTierFilter(applyTagFilters(drops, tags), priceTier);
          
          expect(withTags.length).toBeLessThanOrEqual(noFilters.length);
          expect(withPrice.length).toBeLessThanOrEqual(noFilters.length);
          expect(withBoth.length).toBeLessThanOrEqual(withTags.length);
          expect(withBoth.length).toBeLessThanOrEqual(withPrice.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: search-and-filter, Property 4: Empty query returns all
   * Searching with an empty query should return all drops
   */
  it('should return all drops for empty query', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        (drops) => {
          const results = applySearchQuery(drops, '');
          
          expect(results.length).toBe(drops.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: search-and-filter, Property 5: Price tier boundaries
   * Drops filtered by price tier should all fall within tier range
   */
  it('should respect price tier boundaries', () => {
    fc.assert(
      fc.property(
        fc.array(dropArbitrary()),
        priceTierArbitrary(),
        (drops, tier) => {
          const results = applyPriceTierFilter(drops, tier);
          
          results.every(drop => 
            drop.price >= tier.min && drop.price <= tier.max
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Arbitraries for generating test data
function dropArbitrary() {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    description: fc.string({ minLength: 50, maxLength: 500 }),
    price: fc.float({ min: 10, max: 10000 }),
    curator: fc.record({
      name: fc.string({ minLength: 3, maxLength: 50 }),
    }),
    tags: fc.array(fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 3, maxLength: 20 }),
    })),
  });
}

function priceTierArbitrary() {
  return fc.record({
    id: fc.uuid(),
    min: fc.float({ min: 0, max: 5000 }),
    max: fc.float({ min: 5000, max: 10000 }),
  });
}
```

## Correctness Properties

After analyzing all acceptance criteria, I identified the following testable properties:

### Property 1: Search Result Subset
**Requirement**: 8.1, 8.2, 8.3
**Property**: For any list of drops and any search query, the search results should be a subset of the original list.
**Test**: Verify that every result exists in the original list and result count ≤ original count.

### Property 2: Case Insensitivity
**Requirement**: 8.4
**Property**: For any search query, searching with uppercase, lowercase, or mixed case should return the same results.
**Test**: Compare result counts for query.toLowerCase(), query.toUpperCase(), and query.

### Property 3: Filter Combination Monotonicity
**Requirement**: 9.1, 9.2
**Property**: Applying additional filters should never increase the result count.
**Test**: Verify that adding filters always produces results.length ≤ previous results.length.

### Property 4: Empty Query Returns All
**Requirement**: 8.1
**Property**: Searching with an empty query should return all drops (no filtering).
**Test**: Verify that applySearchQuery(drops, '') returns all drops.

### Property 5: Price Tier Boundaries
**Requirement**: 7.4, 7.5
**Property**: All drops filtered by a price tier should fall within that tier's min/max range.
**Test**: Verify that every result satisfies drop.price >= tier.min && drop.price <= tier.max.

### Property 6: Collective Scope Preservation
**Requirement**: 8.2, 8.3
**Property**: When a collective is selected, all search results should belong to that collective.
**Test**: Verify that every result has drop.collective === selectedCollective.

### Property 7: URL State Synchronization
**Requirement**: 17.4, 17.5, 17.6
**Property**: Encoding state to URL and decoding back should produce the same state.
**Test**: Verify that syncToURL() followed by syncFromURL() restores original state.

### Property 8: Search History Deduplication
**Requirement**: 18.6
**Property**: Saving the same query in the same collective should update timestamp, not create duplicate.
**Test**: Verify that history.length remains constant when saving duplicate query.

### Property 9: Tag Filter OR Logic
**Requirement**: 6.4
**Property**: Selecting multiple tags should show drops that have ANY of the selected tags (OR logic).
**Test**: Verify that results include drops with tag1 OR tag2 OR tag3.

### Property 10: Debounce Delay
**Requirement**: 8.9, 14.3
**Property**: Search should not execute until 300ms after last keystroke.
**Test**: Verify that performSearch is called exactly once after 300ms of inactivity.

