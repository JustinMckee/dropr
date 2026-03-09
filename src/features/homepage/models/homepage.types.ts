// Homepage & Drop Discovery - Type Definitions

export type Collective = 'MOD' | 'MAKE' | 'MINI';

export type DropStatus = 'upcoming' | 'live' | 'sold_out';

export type DropType = 'mystery_box' | 'surplus' | 'limited_edition';

export interface CuratorSummary {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

export interface Drop {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price: number;
  inventory: number;
  status: DropStatus;
  startTime: Date;
  endTime: Date;
  dropType: DropType;
  collective: Collective;
  featured: boolean;
  curator: CuratorSummary;
  averageRating?: number;
  reviewCount: number;
}

export interface Curator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  reputationScore: number;
  completedDrops: number;
  averageRating: number;
  verified: boolean;
  founding: boolean;
  collective: Collective;
}

export interface FeaturedCurator extends Curator {
  heroImage: string;
  totalDrops: number;
  recentDrops: Drop[];
}

export interface FeaturedDrop extends Drop {
  heroImage: string;
  theme: string;
}

export interface HomepageData {
  collective: Collective | 'all';
  featuredDrops: Drop[];
  liveUpcomingDrops: Drop[];
  foundingCurators: Curator[];
  popularModders?: Curator[];
  popularMakers?: Curator[];
  popularMinists?: Curator[];
  curatorSpotlights: FeaturedCurator[];
  dropSpotlights: FeaturedDrop[];
  stats: PlatformStats;
}

export interface PlatformStats {
  totalDrops: number;
  totalCurators: number;
  totalBuyers: number;
  averageRating: number;
}

export interface FilterOptions {
  dropType?: DropType[];
  priceRange?: { min: number; max: number };
  status?: DropStatus[];
  collective?: Collective[];
}

export interface SortOption {
  field: 'createdAt' | 'startTime' | 'price';
  direction: 'asc' | 'desc';
}

export interface CountdownData {
  expired: boolean;
  display: string;
  updateInterval: number;
  status?: 'upcoming' | 'live';
}
