'use client';

import { HorizontalScrollSection } from './shared/HorizontalScrollSection';
import { DropCard } from './shared/DropCard';
import { DropCardSkeleton } from './shared/LoadingSkeletons';
import { EmptyState } from './shared/EmptyState';
import type { Drop } from '@/features/homepage/models/homepage.types';

interface LiveUpcomingDropsSectionProps {
  drops: Drop[];
  loading?: boolean;
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function LiveUpcomingDropsSection({
  drops,
  loading = false,
  collective,
}: LiveUpcomingDropsSectionProps) {
  const showCollectiveBadge = collective === 'all';

  // Sort drops: live first, then upcoming by start time
  const sortedDrops = [...drops].sort((a, b) => {
    // Live drops first
    if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
    if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
    
    // Within same status, sort by start time
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  if (loading) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">Live & Upcoming Drops</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <DropCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (sortedDrops.length === 0) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">Live & Upcoming Drops</h2>
        <EmptyState
          title="No drops available"
          description="Check back soon for new drops from verified curators"
          ctaText="Browse All Drops"
          ctaHref="/drops"
        />
      </section>
    );
  }

  return (
    <section className="py-8">
      <HorizontalScrollSection
        title="Live & Upcoming Drops"
        viewAllLink="/drops"
        ariaLabel="Live and upcoming drops"
      >
        {sortedDrops.map((drop) => (
          <DropCard
            key={drop.id}
            drop={drop}
            showCollectiveBadge={showCollectiveBadge}
          />
        ))}
      </HorizontalScrollSection>
    </section>
  );
}
