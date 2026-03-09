'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { CountdownTimer } from './shared/CountdownTimer';
import type { FeaturedDrop } from '@/features/homepage/models/homepage.types';

interface DropSpotlightProps {
  drop: FeaturedDrop;
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function DropSpotlight({ drop, collective }: DropSpotlightProps) {
  const showCollectiveBadge = collective === 'all';
  const inventoryPercentage = (drop.inventory / drop.totalInventory) * 100;
  const isLowStock = inventoryPercentage < 20;

  return (
    <section className="relative w-full py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Drop Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={drop.coverImageUrl}
              alt={drop.title}
              fill
              className="object-cover"
              priority
            />
            
            {drop.status === 'SOLD_OUT' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">SOLD OUT</span>
              </div>
            )}
          </div>

          {/* Drop Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{drop.dropType}</Badge>
              {showCollectiveBadge && (
                <Badge variant="outline">{drop.collective}</Badge>
              )}
              {isLowStock && drop.status === 'LIVE' && (
                <Badge variant="destructive">Low Stock</Badge>
              )}
            </div>
            
            <h2 className="text-4xl font-bold">{drop.title}</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={drop.curator.avatarUrl || '/placeholder-avatar.png'}
                  alt={drop.curator.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{drop.curator.name}</p>
                <p className="text-sm text-muted-foreground">
                  {drop.curator.isVerified && 'Verified Curator'}
                </p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground line-clamp-3">
              {drop.description}
            </p>
            
            <div className="flex items-center justify-between py-4 border-y">
              <div>
                <p className="text-3xl font-bold">${drop.price}</p>
                {drop.originalPrice && drop.originalPrice > drop.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    ${drop.originalPrice}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {drop.inventory} of {drop.totalInventory} left
                </p>
                {drop.status === 'LIVE' && (
                  <CountdownTimer
                    targetDate={drop.endTime}
                    status="live"
                    onExpire={() => {}}
                  />
                )}
                {drop.status === 'UPCOMING' && (
                  <CountdownTimer
                    targetDate={drop.startTime}
                    status="upcoming"
                    onExpire={() => {}}
                  />
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button asChild size="lg" className="flex-1">
                <Link href={`/drops/${drop.id}`}>View Drop</Link>
              </Button>
              
              {drop.status === 'LIVE' && drop.inventory > 0 && (
                <Button asChild size="lg" variant="outline" className="flex-1">
                  <Link href={`/drops/${drop.id}?action=add-to-cart`}>
                    Add to Cart
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
