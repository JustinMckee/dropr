'use client';

import Image from 'next/image';
import { CountdownTimer } from './CountdownTimer';
import { shouldShowCountdown } from '@/features/homepage/models/homepage.utils';
import { cn } from '@/lib/utils';
import type { Drop } from '@/features/homepage/models/homepage.types';

interface DropCardProps {
  drop: Drop;
  showCollectiveBadge: boolean;
  isFollowed?: boolean;
  onCardClick?: (dropId: string) => void;
  onFollowToggle?: (dropId: string, isFollowed: boolean) => void;
  className?: string;
}

export function DropCard({
  drop,
  showCollectiveBadge,
  isFollowed = false,
  onCardClick,
  onFollowToggle,
  className,
}: DropCardProps) {
  const showCountdown = shouldShowCountdown(drop);
  const isSoldOut = drop.status === 'sold_out' || drop.inventory === 0;

  const handleClick = () => {
    onCardClick?.(drop.id);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowToggle?.(drop.id, isFollowed);
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
      {/* Image */}
      <div className="relative aspect-video bg-muted">
        <Image
          src={drop.coverImageUrl}
          alt={drop.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 320px"
        />

        {/* Follow button */}
        <button
          className={cn(
            'absolute top-2 right-2 z-10',
            'w-9 h-9 rounded-full',
            'bg-background/80 backdrop-blur-sm',
            'border border-border',
            'flex items-center justify-center',
            'transition-all duration-200',
            'hover:bg-background hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          onClick={handleFollowClick}
          aria-label={isFollowed ? 'Unfollow drop' : 'Follow drop'}
        >
          <svg
            className={cn('w-5 h-5', isFollowed ? 'fill-primary' : 'fill-none')}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Sold Out</span>
          </div>
        )}

        {/* Collective badge */}
        {showCollectiveBadge && (
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-1',
                'text-xs font-semibold rounded',
                'bg-background/80 backdrop-blur-sm',
                'border border-border'
              )}
            >
              {drop.collective}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 mb-2">{drop.title}</h3>

        {/* Curator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {drop.curator.avatar && (
              <Image
                src={drop.curator.avatar}
                alt={drop.curator.name}
                width={24}
                height={24}
                className="object-cover"
              />
            )}
          </div>
          <span className="text-sm text-muted-foreground truncate">
            {drop.curator.name}
          </span>
          {drop.curator.verified && (
            <svg
              className="w-4 h-4 text-primary flex-shrink-0"
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

        {/* Drop type badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground">
            {drop.dropType.replace('_', ' ')}
          </span>
        </div>

        {/* Price and countdown */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold font-mono">${drop.price}</span>
          {showCountdown && (
            <CountdownTimer
              targetTime={drop.status === 'live' ? drop.endTime : drop.startTime}
              status={drop.status === 'live' ? 'live' : 'upcoming'}
            />
          )}
        </div>

        {/* Inventory and rating */}
        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <span>{drop.inventory} left</span>
          {drop.averageRating && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-500 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{drop.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
