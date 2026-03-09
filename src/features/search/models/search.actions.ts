'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type {
  SearchFilters,
  SearchResult,
  SearchHistoryItem,
  SuggestedSearch,
  Category,
  Tag,
  PriceTier,
  Collective,
  Drop,
} from './search.types';

/**
 * Performs full-text search across drops
 * Scoped to collective based on subdomain
 */
export async function searchDrops(
  query: string,
  filters: SearchFilters
): Promise<SearchResult> {
  const headersList = await headers();
  const collective = (headersList.get('x-collective') || 'all') as
    | Collective
    | 'all';

  // Build where clause
  const where: any = {
    status: { in: ['SCHEDULED', 'LIVE'] },
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
      {
        curator: {
          user: { name: { contains: query, mode: 'insensitive' } },
        },
      },
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
    prisma.drop.findMany({
      where,
      include: {
        curator: {
          include: { user: true },
        },
        reviews: {
          select: { overallRating: true },
        },
        tags: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { startTime: 'asc' }],
    }),
    prisma.drop.count({ where }),
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
    // TODO: Implement authentication check
    // For now, return empty array
    return [];
  } catch (error) {
    // User not authenticated, return empty history
    return [];
  }
}

/**
 * Saves search query to user's history
 */
export async function saveSearchToHistory(
  query: string,
  collective: Collective | 'all'
): Promise<void> {
  try {
    // TODO: Implement authentication and history saving
    // For now, skip
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * Clears all search history for authenticated user
 */
export async function clearSearchHistory(): Promise<void> {
  // TODO: Implement authentication and history clearing
}

/**
 * Fetches suggested searches based on collective
 */
export async function fetchSuggestedSearches(
  collective: Collective | 'all'
): Promise<SuggestedSearch[]> {
  const suggestions: SuggestedSearch[] = [];

  if (collective === 'all') {
    // Cross-collective suggestions
    suggestions.push(
      {
        id: '1',
        text: 'Trending Curators',
        icon: 'trending-up',
        type: 'trending',
      },
      {
        id: '2',
        text: 'Most Followed Drops',
        icon: 'heart',
        type: 'popular',
      },
      { id: '3', text: 'New This Week', icon: 'sparkles', type: 'curated' },
      { id: '4', text: 'Ending Soon', icon: 'clock', type: 'curated' }
    );
  } else if (collective === 'MOD') {
    suggestions.push(
      {
        id: '5',
        text: 'Trending Keyboards',
        icon: 'trending-up',
        type: 'trending',
        collective: 'MOD',
      },
      {
        id: '6',
        text: 'New Keycap Sets',
        icon: 'sparkles',
        type: 'curated',
        collective: 'MOD',
      },
      {
        id: '7',
        text: 'Popular Switches',
        icon: 'heart',
        type: 'popular',
        collective: 'MOD',
      },
      {
        id: '8',
        text: 'Ending Soon',
        icon: 'clock',
        type: 'curated',
        collective: 'MOD',
      }
    );
  } else if (collective === 'MAKE') {
    suggestions.push(
      {
        id: '9',
        text: 'Trending Electronics',
        icon: 'trending-up',
        type: 'trending',
        collective: 'MAKE',
      },
      {
        id: '10',
        text: 'New 3D Prints',
        icon: 'sparkles',
        type: 'curated',
        collective: 'MAKE',
      },
      {
        id: '11',
        text: 'Popular Synth Modules',
        icon: 'heart',
        type: 'popular',
        collective: 'MAKE',
      },
      {
        id: '12',
        text: 'Ending Soon',
        icon: 'clock',
        type: 'curated',
        collective: 'MAKE',
      }
    );
  } else if (collective === 'MINI') {
    suggestions.push(
      {
        id: '13',
        text: 'Trending Miniatures',
        icon: 'trending-up',
        type: 'trending',
        collective: 'MINI',
      },
      {
        id: '14',
        text: 'New Model Kits',
        icon: 'sparkles',
        type: 'curated',
        collective: 'MINI',
      },
      {
        id: '15',
        text: 'Popular Paints',
        icon: 'heart',
        type: 'popular',
        collective: 'MINI',
      },
      {
        id: '16',
        text: 'Ending Soon',
        icon: 'clock',
        type: 'curated',
        collective: 'MINI',
      }
    );
  }

  return suggestions;
}

/**
 * Fetches available categories for filtering (collective-specific, vertical)
 */
export async function fetchCategories(
  collective: Collective | 'all'
): Promise<Category[]> {
  if (collective === 'all') {
    // No category filter on main homepage (categories are collective-specific)
    return [];
  }

  const categories = await prisma.category.findMany({
    where: { collective },
    include: {
      _count: {
        select: {
          drops: {
            where: {
              status: { in: ['SCHEDULED', 'LIVE'] },
            },
          },
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  return categories.map((cat) => ({
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
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          drops: {
            where: {
              status: { in: ['SCHEDULED', 'LIVE'] },
            },
          },
        },
      },
    },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description || undefined,
    type: tag.type as any,
    count: tag._count.drops,
  }));
}

/**
 * Fetches available price tiers
 */
export async function fetchPriceTiers(
  collective: Collective | 'all'
): Promise<PriceTier[]> {
  // Define price tiers (TBD - these are placeholder values)
  const tiers = [
    { id: 'tier-1', name: '$10-$25', min: 10, max: 25 },
    { id: 'tier-2', name: '$25-$50', min: 25, max: 50 },
    { id: 'tier-3', name: '$50-$100', min: 50, max: 100 },
    { id: 'tier-4', name: '$100+', min: 100, max: 10000 },
  ];

  // Count drops in each tier
  const where: any = {
    status: { in: ['SCHEDULED', 'LIVE'] },
  };

  if (collective !== 'all') {
    where.collective = collective;
  }

  const tiersWithCounts = await Promise.all(
    tiers.map(async (tier) => {
      const count = await prisma.drop.count({
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

  return tiers.find((t) => t.id === tierId) || null;
}

/**
 * Tracks search query for analytics
 */
async function trackSearchQuery(
  query: string,
  collective: string,
  resultCount: number
): Promise<void> {
  try {
    await prisma.searchAnalytics.create({
      data: {
        query,
        collective,
        resultCount,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to track search query:', error);
  }
}

// Transform function to convert Prisma model to app type
function transformDropFromPrisma(prismaData: any): Drop {
  const reviews = prismaData.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) /
        reviews.length
      : undefined;

  return {
    id: prismaData.id,
    title: prismaData.title,
    description: prismaData.description,
    coverImage: prismaData.coverImage,
    price: Number(prismaData.price),
    inventory: prismaData.inventory,
    status: prismaData.status,
    startTime: prismaData.startTime,
    endTime: prismaData.endTime,
    type: prismaData.type,
    collective: prismaData.collective,
    isFeatured: prismaData.isFeatured,
    curator: {
      id: prismaData.curator.id,
      name: prismaData.curator.user.name,
      avatar: prismaData.curator.user.image,
      verified: false, // TODO: Add verified field to Curator model
    },
    averageRating,
    reviewCount: reviews.length,
  };
}
