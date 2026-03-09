'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Package, Sparkles, Zap } from 'lucide-react';

interface ValuePropositionBuyersProps {
  collective: 'MOD' | 'MAKE' | 'MINI' | 'all';
}

export function ValuePropositionBuyers({ collective }: ValuePropositionBuyersProps) {
  const getMessaging = () => {
    if (collective === 'all') {
      return {
        headline: 'Why Dropr?',
        subheadline: 'Curated drops by makers, for makers',
        description: 'Discover unique items from verified curators who understand your passion',
      };
    }
    
    const collectiveMessaging = {
      MOD: {
        headline: 'Why Dropr for Modders?',
        subheadline: 'Curated drops by modders, for modders',
        description: 'Discover unique keyboard parts, keycaps, and PC mods from fellow modders',
      },
      MAKE: {
        headline: 'Why Dropr for Makers?',
        subheadline: 'Curated drops by makers, for makers',
        description: 'Discover unique electronics, 3D printing supplies, and synth modules from fellow makers',
      },
      MINI: {
        headline: 'Why Dropr for Miniaturists?',
        subheadline: 'Curated drops by miniaturists, for miniaturists',
        description: 'Discover unique miniatures, model kits, and painting supplies from fellow miniaturists',
      },
    };
    
    return collectiveMessaging[collective];
  };

  const messaging = getMessaging();

  const dropTypes = [
    {
      icon: <Package className="w-12 h-12" />,
      title: 'Mystery Boxes',
      description: 'Themed surprise boxes curated by makers who know what you love',
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Surplus Drops',
      description: "Unique items from makers' personal collections at great prices",
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Limited Editions',
      description: 'Exclusive runs created by makers specifically for the community',
    },
  ];

  const trustSignals = [
    'Escrow protection on all purchases',
    'Verified curators only',
    'Community ratings and reviews',
    'Transparent pricing and value',
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{messaging.headline}</h2>
          <p className="text-xl text-muted-foreground mb-2">
            {messaging.subheadline}
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {messaging.description}
          </p>
        </div>

        {/* Drop Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {dropTypes.map((type, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4 text-primary">
                  {type.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                <p className="text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="bg-background rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Shop with Confidence
          </h3>
          <ul className="grid md:grid-cols-2 gap-3">
            {trustSignals.map((signal, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/drops">Browse Drops</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
