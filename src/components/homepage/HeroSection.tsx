'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function HeroSection({ collective }: HeroSectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'curator' | null>(null);

  useEffect(() => {
    // Check authentication status
    // This would typically come from a useAuth hook or session
    // For now, we'll assume unauthenticated
    setIsAuthenticated(false);
    setUserRole(null);
  }, []);

  const getHeadline = () => {
    if (collective === 'all') {
      return 'Curated Drops for Makers & Modders';
    }
    
    const collectiveNames = {
      MOD: 'modders',
      MAKE: 'makers',
      MINI: 'miniature enthusiasts',
    };
    
    return `Curated drops for ${collectiveNames[collective]}`;
  };

  const getSubheadline = () => {
    if (collective === 'all') {
      return 'Discover limited-run mystery boxes, themed surplus, and exclusive drops from verified curators';
    }
    
    const collectiveDescriptions = {
      MOD: 'mechanical keyboards, keycaps, and PC mods',
      MAKE: 'DIY electronics, 3D printing, and modular synth',
      MINI: 'miniatures, model kits, and painting supplies',
    };
    
    return `Limited drops featuring ${collectiveDescriptions[collective]} from verified curators`;
  };

  const showBrowseDrops = true;
  const showSignUp = !isAuthenticated;
  const showBecomeCurator = !isAuthenticated || userRole === 'buyer';

  return (
    <section className="relative py-16 md:py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-collective">
          {getHeadline()}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {getSubheadline()}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {showBrowseDrops && (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/drops">Browse Drops</Link>
            </Button>
          )}
          
          {showSignUp && (
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/signup">Sign Up</Link>
            </Button>
          )}
          
          {showBecomeCurator && (
            <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
              <Link href="/curator/apply">Become a Curator</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
