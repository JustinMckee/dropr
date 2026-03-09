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
  category?: string; // Single category (vertical, collective-specific)
  tags: string[]; // Multiple tags (horizontal, cross-cutting)
  priceTier?: string;
}

export interface SearchState {
  query: string;
  collective: Collective | 'all';
  filters: SearchFilters;
  isExpanded: boolean;
  history: SearchHistoryItem[];
  suggestions: SuggestedSearch[];
  categories: Category[]; // Available categories for current collective
  tags: Tag[]; // Available tags (cross-collective)
}

export interface Drop {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  price: number;
  inventory: number;
  status: string;
  startTime: Date | null;
  endTime: Date | null;
  type: string;
  collective: Collective;
  isFeatured: boolean;
  curator: {
    id: string;
    name: string | null;
    avatar: string | null;
    verified?: boolean;
  };
  averageRating?: number;
  reviewCount: number;
}

export interface SearchResult {
  drops: Drop[];
  totalCount: number;
  appliedFilters: SearchFilters;
}
