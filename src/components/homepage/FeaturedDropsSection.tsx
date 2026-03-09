'use client';

import { HorizontalScrollSection } from './shared/HorizontalScrollSection';
import { DropCard } from './shared/DropCard';
import { DropCardSkeleton } from './shared/LoadingSkeletons';
import { EmptyState } from './shared/EmptyState';
import type { Drop } from '@/features/homepage/models/homepage.types';

interface FeaturedDropsSectionProps {
  drops: Drop[];
  loading?: boolean;
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function FeaturedDropsSection({
  drops,
  loading = false,
  collective,
}: FeaturedDropsSectionProps) {
  const showCollectiveBadge = collective === 'all';

  if (loading) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">Featured Drops</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <DropCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (drops.length === 0) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">Featured Drops</h2>
        <EmptyState
          title="No featured drops yet"
          description="Check back soon for curated drops from verified makers"
          ctaText="Browse All Drops"
          ctaHref="/drops"
        />
      </section>
    );
  }

  return (
    <section className="py-8">
      <HorizontalScrollSection
        title="Featured Drops"
        viewAllLink="/drops?featured=true"
        ariaLabel="Featured drops"
      >
        {drops.map((drop) => (
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
