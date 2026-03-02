---
inclusion: manual
---
# Search and Discovery

## Philosophy

Help users find what they're looking for, and discover what they didn't know they wanted. Search should be fast, forgiving, and intelligent. Discovery should feel serendipitous, not algorithmic. Balance relevance with diversity—show popular drops, but also surface hidden gems. Make filtering intuitive and results actionable.

## Search Checklist

**Search Features:**
- [ ] Full-text search across drops
- [ ] Search by curator name
- [ ] Category filtering
- [ ] Price range filtering
- [ ] Status filtering (live, upcoming, ended)
- [ ] Sort options (relevance, price, time, popularity)
- [ ] Autocomplete suggestions
- [ ] Search history (logged-in users)
- [ ] "No results" helpful messaging

**Discovery Features:**
- [ ] Featured drops section
- [ ] Trending drops (based on views/sales)
- [ ] New drops feed
- [ ] Personalized recommendations
- [ ] "Drops you might like" based on history
- [ ] Category browse pages
- [ ] Curator discovery page
- [ ] Related drops suggestions

**Technical:**
- [ ] Search index optimized
- [ ] Query performance < 200ms
- [ ] Fuzzy matching for typos
- [ ] Synonym support
- [ ] Search analytics tracked
- [ ] A/B testing framework

## Search Implementation

### Search Bar Component

```typescript
// components/search/SearchBar.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchDrops } from '@/features/search/models/search.actions';
import { debounce } from '@/lib/utils';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const fetchSuggestions = debounce(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const results = await searchDrops(q, { limit: 5 });
    setSuggestions(results);
    setIsOpen(true);
  }, 300);
  
  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="search"
        placeholder="Search drops, curators, categories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        aria-label="Search"
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        aria-expanded={isOpen}
      />
      
      <button type="submit" aria-label="Search">
        <SearchIcon />
      </button>
      
      {isOpen && suggestions.length > 0 && (
        <div id="search-suggestions" role="listbox">
          {suggestions.map((drop) => (
            <a
              key={drop.id}
              href={`/drops/${drop.id}`}
              role="option"
              className="suggestion"
            >
              <img src={drop.imageUrl} alt="" />
              <div>
                <div className="title">{drop.title}</div>
                <div className="meta">
                  ${drop.price} • {drop.curator.name}
                </div>
              </div>
            </a>
          ))}
          
          <a href={`/search?q=${encodeURIComponent(query)}`} className="view-all">
            View all results for "{query}"
          </a>
        </div>
      )}
    </form>
  );
}
```

### Search Server Action

```typescript
// features/search/models/search.actions.ts
'use server'

import { db } from '@/lib/db';

interface SearchOptions {
  limit?: number;
  offset?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  status?: 'LIVE' | 'UPCOMING' | 'ENDED';
  sortBy?: 'relevance' | 'price' | 'time' | 'popularity';
}

export async function searchDrops(query: string, options: SearchOptions = {}) {
  const {
    limit = 20,
    offset = 0,
    category,
    priceMin,
    priceMax,
    status,
    sortBy = 'relevance',
  } = options;
  
  // Build where clause
  const where: any = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { curator: { name: { contains: query, mode: 'insensitive' } } },
    ],
  };
  
  if (category) {
    where.category = category;
  }
  
  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {};
    if (priceMin !== undefined) where.price.gte = priceMin;
    if (priceMax !== undefined) where.price.lte = priceMax;
  }
  
  if (status) {
    where.status = status;
  }
  
  // Build orderBy clause
  let orderBy: any;
  switch (sortBy) {
    case 'price':
      orderBy = { price: 'asc' };
      break;
    case 'time':
      orderBy = { startTime: 'desc' };
      break;
    case 'popularity':
      orderBy = { soldCount: 'desc' };
      break;
    default:
      // Relevance: prioritize title matches, then description
      orderBy = { createdAt: 'desc' }; // Fallback to recent
  }
  
  const drops = await db.drop.findMany({
    where,
    orderBy,
    take: limit,
    skip: offset,
    include: {
      curator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
  
  // Track search query
  await trackSearch(query, drops.length);
  
  return drops;
}

async function trackSearch(query: string, resultCount: number) {
  await db.searchQuery.create({
    data: {
      query,
      resultCount,
      timestamp: new Date(),
    },
  });
}
```

### Search Results Page

```typescript
// app/search/page.tsx
import { searchDrops } from '@/features/search/models/search.actions';
import { DropCard } from '@/features/drops/components/DropCard';
import { SearchFilters } from '@/features/search/components/SearchFilters';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    priceMin?: string;
    priceMax?: string;
    status?: string;
    sortBy?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const options = {
    category: searchParams.category,
    priceMin: searchParams.priceMin ? parseFloat(searchParams.priceMin) : undefined,
    priceMax: searchParams.priceMax ? parseFloat(searchParams.priceMax) : undefined,
    status: searchParams.status as any,
    sortBy: searchParams.sortBy as any,
  };
  
  const drops = await searchDrops(query, options);
  
  return (
    <div className="search-page">
      <h1>Search Results for "{query}"</h1>
      <p>{drops.length} drops found</p>
      
      <div className="search-layout">
        <aside>
          <SearchFilters currentFilters={options} />
        </aside>
        
        <main>
          {drops.length > 0 ? (
            <div className="drop-grid">
              {drops.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))}
            </div>
          ) : (
            <NoResults query={query} />
          )}
        </main>
      </div>
    </div>
  );
}
```

## Filtering and Sorting

### Filter Component

```typescript
// features/search/components/SearchFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation';

export function SearchFilters({ currentFilters }: { currentFilters: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <div className="search-filters">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <h4>Category</h4>
        <select
          value={currentFilters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="mechanical-keyboards">Mechanical Keyboards</option>
          <option value="keycaps">Keycaps</option>
          <option value="switches">Switches</option>
          <option value="pc-mods">PC Mods</option>
          <option value="diy-electronics">DIY Electronics</option>
          <option value="miniatures">Miniatures</option>
        </select>
      </div>
      
      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={currentFilters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={currentFilters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
          />
        </div>
      </div>
      
      <div className="filter-group">
        <h4>Status</h4>
        <label>
          <input
            type="radio"
            name="status"
            value=""
            checked={!currentFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="LIVE"
            checked={currentFilters.status === 'LIVE'}
            onChange={(e) => updateFilter('status', e.target.value)}
          />
          Live Now
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="UPCOMING"
            checked={currentFilters.status === 'UPCOMING'}
            onChange={(e) => updateFilter('status', e.target.value)}
          />
          Upcoming
        </label>
      </div>
      
      <button onClick={() => router.push('/search')}>
        Clear Filters
      </button>
    </div>
  );
}
```

### Sort Component

```typescript
// features/search/components/SortDropdown.tsx
'use client'

export function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSort = (sortBy: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <select
      value={currentSort || 'relevance'}
      onChange={(e) => handleSort(e.target.value)}
      aria-label="Sort results"
    >
      <option value="relevance">Most Relevant</option>
      <option value="time">Newest First</option>
      <option value="price">Price: Low to High</option>
      <option value="popularity">Most Popular</option>
    </select>
  );
}
```

## Discovery Features

### Featured Drops

```typescript
// features/drops/models/featured.actions.ts
'use server'

export async function getFeaturedDrops() {
  return await db.drop.findMany({
    where: {
      status: 'LIVE',
      featured: true,
    },
    orderBy: {
      featuredAt: 'desc',
    },
    take: 6,
    include: {
      curator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}
```

### Trending Drops

```typescript
// features/drops/models/trending.actions.ts
'use server'

export async function getTrendingDrops() {
  // Calculate trending score based on views and sales in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return await db.drop.findMany({
    where: {
      status: 'LIVE',
      startTime: { gte: oneDayAgo },
    },
    orderBy: [
      { views: 'desc' },
      { soldCount: 'desc' },
    ],
    take: 10,
    include: {
      curator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}
```

### Personalized Recommendations

```typescript
// features/drops/models/recommendations.actions.ts
'use server'

import { requireAuth } from '@/lib/auth';

export async function getRecommendedDrops() {
  const session = await requireAuth();
  
  // Get user's purchase history
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { drop: true },
    take: 10,
  });
  
  // Extract categories from past purchases
  const categories = [...new Set(orders.map(o => o.drop.category))];
  
  // Get curators user follows
  const follows = await db.follow.findMany({
    where: { userId: session.user.id },
    select: { curatorId: true },
  });
  
  const curatorIds = follows.map(f => f.curatorId);
  
  // Find similar drops
  return await db.drop.findMany({
    where: {
      status: 'LIVE',
      OR: [
        { category: { in: categories } },
        { curatorId: { in: curatorIds } },
      ],
      // Exclude already purchased
      NOT: {
        id: { in: orders.map(o => o.dropId) },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 12,
    include: {
      curator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}
```

### Related Drops

```typescript
// features/drops/models/related.actions.ts
'use server'

export async function getRelatedDrops(dropId: string) {
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    select: { category: true, curatorId: true },
  });
  
  if (!drop) return [];
  
  return await db.drop.findMany({
    where: {
      status: 'LIVE',
      id: { not: dropId },
      OR: [
        { category: drop.category },
        { curatorId: drop.curatorId },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 4,
    include: {
      curator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}
```

## No Results Handling

```typescript
// components/search/NoResults.tsx
export function NoResults({ query }: { query: string }) {
  return (
    <div className="no-results">
      <h2>No drops found for "{query}"</h2>
      
      <div className="suggestions">
        <h3>Try these instead:</h3>
        <ul>
          <li>Check your spelling</li>
          <li>Use fewer or different keywords</li>
          <li>Browse by <a href="/categories">category</a></li>
          <li>Explore <a href="/curators">curators</a></li>
        </ul>
      </div>
      
      <div className="popular-searches">
        <h3>Popular Searches:</h3>
        <div className="tags">
          <a href="/search?q=mechanical+keyboard">Mechanical Keyboard</a>
          <a href="/search?q=keycaps">Keycaps</a>
          <a href="/search?q=miniatures">Miniatures</a>
          <a href="/search?q=pc+mods">PC Mods</a>
        </div>
      </div>
      
      <div className="featured">
        <h3>Featured Drops:</h3>
        <FeaturedDrops />
      </div>
    </div>
  );
}
```

## Search Analytics

### Track Search Queries

```typescript
// Track search events
analytics.track('Search Performed', {
  query,
  resultCount: drops.length,
  filters: {
    category,
    priceRange: [priceMin, priceMax],
    status,
  },
  sortBy,
});

// Track zero-result searches
if (drops.length === 0) {
  analytics.track('Zero Results Search', {
    query,
    filters,
  });
}

// Track search result clicks
analytics.track('Search Result Clicked', {
  query,
  dropId: drop.id,
  position: index,
  resultCount: drops.length,
});
```

### Search Metrics

- **Search usage**: Percentage of users who search
- **Zero-result rate**: Percentage of searches with no results
- **Click-through rate**: Percentage of searches that lead to clicks
- **Conversion rate**: Percentage of searches that lead to purchases
- **Popular queries**: Most common search terms
- **Failed queries**: Searches with zero results

## Advanced Search Features (Future)

### Fuzzy Matching

```typescript
// Use Levenshtein distance for typo tolerance
import { distance } from 'fastest-levenshtein';

function fuzzyMatch(query: string, target: string, threshold: number = 2): boolean {
  return distance(query.toLowerCase(), target.toLowerCase()) <= threshold;
}
```

### Synonym Support

```typescript
const synonyms = {
  'keyboard': ['keeb', 'board', 'kb'],
  'keycaps': ['caps', 'keycap set'],
  'miniatures': ['minis', 'figures', 'figurines'],
};

function expandQuery(query: string): string[] {
  const words = query.toLowerCase().split(' ');
  const expanded = words.flatMap(word => 
    synonyms[word] ? [word, ...synonyms[word]] : [word]
  );
  return [...new Set(expanded)];
}
```

### Search Suggestions

```typescript
// Suggest corrections for common misspellings
const corrections = {
  'keybaord': 'keyboard',
  'keycap': 'keycaps',
  'minatures': 'miniatures',
};

function suggestCorrection(query: string): string | null {
  return corrections[query.toLowerCase()] || null;
}
```

## Best Practices

- Make search fast (< 200ms response time)
- Show results as user types (autocomplete)
- Support typos with fuzzy matching
- Provide helpful filters and sorting
- Show result count
- Handle zero results gracefully
- Track search analytics
- Optimize search index
- Use pagination for large result sets
- Make filters mobile-friendly
- Provide search history (logged-in users)
- A/B test search relevance algorithms

## Common Mistakes to Avoid

- Slow search performance
- No autocomplete or suggestions
- Poor handling of typos
- Too many or confusing filters
- No zero-result messaging
- Not tracking search analytics
- Ignoring mobile experience
- Complex query syntax required
- No visual feedback during search
- Overwhelming users with too many results

## Future Enhancements

- Voice search
- Image search (upload image to find similar drops)
- AI-powered semantic search
- Natural language queries
- Search within results
- Saved searches and alerts
- Advanced boolean operators
- Faceted search
- Search result previews
- Collaborative filtering recommendations
