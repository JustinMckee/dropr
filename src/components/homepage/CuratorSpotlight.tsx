'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { DropCard } from './shared/DropCard';
import type { FeaturedCurator } from '@/features/homepage/models/homepage.types';

interface CuratorSpotlightProps {
  curator: FeaturedCurator;
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function CuratorSpotlight({ curator, collective }: CuratorSpotlightProps) {
  const showCollectiveBadge = collective === 'all';

  return (
    <section className="relative w-full py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Curator Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <Image
                  src={curator.avatarUrl || '/placeholder-avatar.png'}
                  alt={curator.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold">{curator.name}</h3>
                  {curator.isVerified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {curator.totalDrops} drops created
                </p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground line-clamp-3">
              {curator.bio}
            </p>
            
            <Button asChild size="lg">
              <Link href={`/curator/${curator.id}`}>View Profile</Link>
            </Button>
          </div>

          {/* Recent Drops Preview */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Recent Drops</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {curator.recentDrops.slice(0, 5).map((drop) => (
                <div key={drop.id} className="flex-shrink-0 w-64">
                  <DropCard
                    drop={drop}
                    showCollectiveBadge={showCollectiveBadge}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
