'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DropStatus } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import type {
  HomepageData,
  Drop,
  Curator,
  FeaturedCurator,
  FeaturedDrop,
  PlatformStats,
  Collective,
} from './homepage.types';

/**
 * Fetches all homepage data based on collective context
 * Cached for 60 seconds with revalidation
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  const headersList = await headers();
  const collective = (headersList.get('x-collective') || 'all') as Collective | 'all';

  return await getCachedHomepageData(collective);
}

const getCachedHomepageData = unstable_cache(
  async (collective: Collective | 'all') => {
    const [
      featuredDrops,
      liveUpcomingDrops,
      foundingCurators,
      popularCurators,
      curatorSpotlights,
      dropSpotlights,
      stats,
    ] = await Promise.all([
      fetchFeaturedDrops(collective),
      fetchLiveUpcomingDrops(collective),
      fetchFoundingCurators(collective),
      fetchPopularCurators(collective),
      fetchCuratorSpotlights(collective),
      fetchDropSpotlights(collective),
      fetchPlatformStats(),
    ]);

    // Split popular curators by collective for Main Homepage
    const popularModders =
      collective === 'all' ? popularCurators.filter((c) => c.collective === 'MOD') : undefined;
    const popularMakers =
      collective === 'all' ? popularCurators.filter((c) => c.collective === 'MAKE') : undefined;
    const popularMinists =
      collective === 'all' ? popularCurators.filter((c) => c.collective === 'MINI') : undefined;

    return {
      collective,
      featuredDrops,
      liveUpcomingDrops,
      foundingCurators,
      popularModders,
      popularMakers,
      popularMinists,
      curatorSpotlights,
      dropSpotlights,
      stats,
    };
  },
  ['homepage-data'],
  { tags: ['homepage'], revalidate: 60 }
);

/**
 * Fetches featured drops with optional collective filtering
 */
async function fetchFeaturedDrops(collective: Collective | 'all'): Promise<Drop[]> {
  const where = {
    isFeatured: true,
    status: { in: [DropStatus.LIVE, DropStatus.SCHEDULED] },
    ...(collective !== 'all' && { collective }),
  };

  const drops = await prisma.drop.findMany({
    where,
    take: 12,
    orderBy: { startTime: 'asc' },
    include: {
      curator: {
        include: { user: true },
      },
      reviews: {
        select: { overallRating: true },
      },
    },
  });

  return drops.map(transformDropFromPrisma);
}

/**
 * Fetches live and upcoming drops
 */
async function fetchLiveUpcomingDrops(collective: Collective | 'all'): Promise<Drop[]> {
  const where = {
    status: { in: [DropStatus.LIVE, DropStatus.SCHEDULED] },
    ...(collective !== 'all' && { collective }),
  };

  const drops = await prisma.drop.findMany({
    where,
    take: 16,
    orderBy: [{ status: 'desc' }, { startTime: 'asc' }],
    include: {
      curator: {
        include: { user: true },
      },
      reviews: {
        select: { overallRating: true },
      },
    },
  });

  return drops.map(transformDropFromPrisma);
}

/**
 * Fetches founding curators
 */
async function fetchFoundingCurators(collective: Collective | 'all'): Promise<Curator[]> {
  // For now, return empty array as founding curator flag doesn't exist yet
  // This will be populated after migration
  return [];
}

/**
 * Fetches popular curators by collective
 */
async function fetchPopularCurators(collective: Collective | 'all'): Promise<Curator[]> {
  // Get curators who have drops in the specified collective
  const curators = await prisma.curator.findMany({
    where: collective !== 'all' 
      ? {
          drops: {
            some: {
              collective: collective,
            }
          }
        }
      : undefined,
    take: collective === 'all' ? 36 : 12,
    orderBy: { reputationScore: 'desc' },
    include: {
      user: true,
      drops: {
        where: { status: 'ENDED' },
        select: { id: true, collective: true },
      },
      reviews: {
        select: { overallRating: true },
      },
    },
  });

  return curators.map(transformCuratorFromPrisma);
}

/**
 * Fetches curator spotlights
 */
async function fetchCuratorSpotlights(collective: Collective | 'all'): Promise<FeaturedCurator[]> {
  // For now, return empty array as spotlight fields don't exist yet
  // This will be populated after migration
  return [];
}

/**
 * Fetches drop spotlights
 */
async function fetchDropSpotlights(collective: Collective | 'all'): Promise<FeaturedDrop[]> {
  // For now, return empty array as spotlight fields don't exist yet
  // This will be populated after migration
  return [];
}

/**
 * Fetches platform statistics
 */
async function fetchPlatformStats(): Promise<PlatformStats> {
  const [totalDrops, totalCurators, totalBuyers, avgRating] = await Promise.all([
    prisma.drop.count({ where: { status: 'ENDED' } }),
    prisma.curator.count(),
    prisma.buyer.count(),
    prisma.review.aggregate({ _avg: { overallRating: true } }),
  ]);

  return {
    totalDrops,
    totalCurators,
    totalBuyers,
    averageRating: avgRating._avg.overallRating || 0,
  };
}

// Transform functions to convert Prisma models to app types
function transformDropFromPrisma(prismaData: any): Drop {
  const reviews = prismaData.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) / reviews.length
      : undefined;

  // Map Prisma status to app status
  const statusMap: Record<string, 'upcoming' | 'live' | 'sold_out'> = {
    SCHEDULED: 'upcoming',
    LIVE: 'live',
    SOLD_OUT: 'sold_out',
    ENDED: 'sold_out',
  };

  // Map Prisma type to app type
  const typeMap: Record<string, 'mystery_box' | 'surplus' | 'limited_edition'> = {
    MYSTERY_BOX: 'mystery_box',
    SURPLUS: 'surplus',
    LIMITED_EDITION: 'limited_edition',
  };

  return {
    id: prismaData.id,
    title: prismaData.title,
    description: prismaData.description,
    coverImageUrl: prismaData.coverImage,
    price: Number(prismaData.price),
    inventory: prismaData.inventory,
    status: statusMap[prismaData.status] || 'upcoming',
    startTime: prismaData.startTime || new Date(),
    endTime: prismaData.endTime || new Date(),
    dropType: typeMap[prismaData.type] || 'mystery_box',
    collective: prismaData.collective,
    featured: prismaData.isFeatured,
    curator: {
      id: prismaData.curator.id,
      name: prismaData.curator.user.name || 'Unknown',
      avatar: prismaData.curator.user.image || '',
      verified: true, // Assuming all curators are verified
    },
    averageRating,
    reviewCount: reviews.length,
  };
}

function transformCuratorFromPrisma(prismaData: any): Curator {
  const reviews = prismaData.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) / reviews.length
      : 0;

  // Determine curator's primary collective from their drops
  const drops = prismaData.drops || [];
  const collectiveCounts: Record<string, number> = {};
  drops.forEach((drop: any) => {
    collectiveCounts[drop.collective] = (collectiveCounts[drop.collective] || 0) + 1;
  });
  
  // Get the collective with most drops, default to MOD
  const primaryCollective = Object.entries(collectiveCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] as Collective || 'MOD';

  return {
    id: prismaData.id,
    name: prismaData.user.name || 'Unknown',
    avatar: prismaData.user.image || '',
    bio: prismaData.bio || '',
    reputationScore: Number(prismaData.reputationScore),
    completedDrops: drops.length,
    averageRating,
    verified: true,
    founding: false, // Will be updated after migration
    collective: primaryCollective,
  };
}

/**
 * Invalidates homepage cache (called after drop/curator updates)
 */
export async function revalidateHomepage() {
  'use server';
  const { revalidateTag } = await import('next/cache');
  revalidateTag('homepage');
}
