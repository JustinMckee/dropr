'use client';

import { HorizontalScrollSection } from './shared/HorizontalScrollSection';
import { CuratorCard } from './shared/CuratorCard';
import { CuratorCardSkeleton } from './shared/LoadingSkeletons';
import { EmptyState } from './shared/EmptyState';
import type { Curator } from '@/features/homepage/models/homepage.types';

interface PopularCuratorsSectionProps {
  curators: Curator[];
  loading?: boolean;
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function PopularCuratorsSection({
  curators,
  loading = false,
  collective,
}: PopularCuratorsSectionProps) {
  if (loading) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">
          {collective === 'all' ? 'Popular Curators' : `Popular ${collective} Curators`}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CuratorCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (curators.length === 0) {
    return (
      <section className="py-8 px-4">
        <h2 className="text-3xl font-bold mb-6">
          {collective === 'all' ? 'Popular Curators' : `Popular ${collective} Curators`}
        </h2>
        <EmptyState
          title="No curators yet"
          description="Check back soon for verified curators"
          ctaText="Become a Curator"
          ctaHref="/curator/apply"
        />
      </section>
    );
  }

  // For Main Homepage, group curators by collective
  if (collective === 'all') {
    const modCurators = curators.filter((c) => c.collective === 'MOD');
    const makeCurators = curators.filter((c) => c.collective === 'MAKE');
    const miniCurators = curators.filter((c) => c.collective === 'MINI');

    return (
      <div className="space-y-8">
        {modCurators.length > 0 && (
          <section className="py-8">
            <HorizontalScrollSection
              title="Popular Modders"
              viewAllLink="/curators?collective=MOD"
              ariaLabel="Popular MOD collective curators"
            >
              {modCurators.map((curator) => (
                <CuratorCard key={curator.id} curator={curator} />
              ))}
            </HorizontalScrollSection>
          </section>
        )}

        {makeCurators.length > 0 && (
          <section className="py-8">
            <HorizontalScrollSection
              title="Popular Makers"
              viewAllLink="/curators?collective=MAKE"
              ariaLabel="Popular MAKE collective curators"
            >
              {makeCurators.map((curator) => (
                <CuratorCard key={curator.id} curator={curator} />
              ))}
            </HorizontalScrollSection>
          </section>
        )}

        {miniCurators.length > 0 && (
          <section className="py-8">
            <HorizontalScrollSection
              title="Popular Miniaturists"
              viewAllLink="/curators?collective=MINI"
              ariaLabel="Popular MINI collective curators"
            >
              {miniCurators.map((curator) => (
                <CuratorCard key={curator.id} curator={curator} />
              ))}
            </HorizontalScrollSection>
          </section>
        )}
      </div>
    );
  }

  // For Collective Homepage, show single section
  const collectiveTitles = {
    MOD: 'Popular Modders',
    MAKE: 'Popular Makers',
    MINI: 'Popular Miniaturists',
  };

  return (
    <section className="py-8">
      <HorizontalScrollSection
        title={collectiveTitles[collective]}
        viewAllLink={`/curators?collective=${collective}`}
        ariaLabel={`Popular ${collective} collective curators`}
      >
        {curators.map((curator) => (
          <CuratorCard key={curator.id} curator={curator} />
        ))}
      </HorizontalScrollSection>
    </section>
  );
}
