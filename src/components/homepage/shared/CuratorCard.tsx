'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Curator } from '@/features/homepage/models/homepage.types';

interface CuratorCardProps {
  curator: Curator;
  showFoundingBadge?: boolean;
  onCardClick?: (curatorId: string) => void;
  className?: string;
}

export function CuratorCard({
  curator,
  showFoundingBadge = false,
  onCardClick,
  className,
}: CuratorCardProps) {
  const handleClick = () => {
    onCardClick?.(curator.id);
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col w-[280px] md:w-[320px]',
        'bg-card border border-border rounded-lg overflow-hidden',
        'transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02]',
        'snap-start flex-shrink-0',
        'cursor-pointer',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Content */}
      <div className="flex flex-col p-6">
        {/* Avatar and badges */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {curator.avatar && (
              <Image
                src={curator.avatar}
                alt={curator.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{curator.name}</h3>
              {curator.verified && (
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-label="Verified curator"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {showFoundingBadge && curator.founding && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                Founding Curator
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{curator.bio}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold font-mono">
              {curator.reputationScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Reputation</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold font-mono">{curator.completedDrops}</div>
            <div className="text-xs text-muted-foreground">Drops</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-500 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-lg font-bold font-mono">
                {curator.averageRating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>
      </div>
    </article>
  );
}
