import { cn } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
    />
  );
}

export function DropCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col w-[280px] md:w-[320px]',
        'bg-card border border-border rounded-lg overflow-hidden',
        'snap-start flex-shrink-0',
        className
      )}
    >
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-3" />

        {/* Curator */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Badge */}
        <Skeleton className="h-5 w-20 mb-3" />

        {/* Price and countdown */}
        <div className="flex items-center justify-between mt-auto">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Inventory and rating */}
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CuratorCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col w-[280px] md:w-[320px]',
        'bg-card border border-border rounded-lg overflow-hidden',
        'snap-start flex-shrink-0',
        className
      )}
    >
      <div className="flex flex-col p-6">
        {/* Avatar and name */}
        <div className="flex items-start gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Bio */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HorizontalScrollSkeleton({
  count = 6,
  type = 'drop',
}: {
  count?: number;
  type?: 'drop' | 'curator';
}) {
  const SkeletonComponent = type === 'drop' ? DropCardSkeleton : CuratorCardSkeleton;

  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}
