'use client';

import { HorizontalScrollSection } from './shared/HorizontalScrollSection';
import { CuratorCard } from './shared/CuratorCard';
import { CuratorCardSkeleton } from './shared/LoadingSkeletons';
import { EmptyState } from './shared/EmptyState';
import type { Curator } from '@/features/homepage/models/homepage.types';

interface FoundingCuratorsSectionProps {
  curators: Curator[];
  loading?: boolean;
}

export function FoundingCuratorsSection({
  curators,
  loading = false,
}: FoundingCuratorsSectionProps) {
  if (loading) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">Founding Curators</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CuratorCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (curators.length === 0) {
    return null; // Don't show section if no founding curators
  }

  return (
    <section className="py-8">
      <HorizontalScrollSection
        title="Founding Curators"
        viewAllLink="/curators?founding=true"
        ariaLabel="Founding curators"
      >
        {curators.map((curator) => (
          <CuratorCard
            key={curator.id}
            curator={curator}
            showFoundingBadge={true}
          />
        ))}
      </HorizontalScrollSection>
    </section>
  );
}
