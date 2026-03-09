'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface ValuePropositionCuratorsProps {
  curatorCount?: number;
  totalDrops?: number;
}

export function ValuePropositionCurators({
  curatorCount = 0,
  totalDrops = 0,
}: ValuePropositionCuratorsProps) {
  const benefits = [
    {
      icon: <DollarSign className="w-12 h-12" />,
      title: '80% Payout',
      description: 'Keep 80% of every sale. We only take 20% to cover platform costs.',
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Built-In Audience',
      description: 'Reach thousands of passionate buyers who trust our curation.',
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: 'Grow Your Brand',
      description: 'Build your reputation and following through quality drops.',
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Become a Curator</h2>
          <p className="text-xl text-muted-foreground mb-2">
            Monetize your expertise and surplus
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community of verified curators and turn your passion into profit
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Proof */}
        {(curatorCount > 0 || totalDrops > 0) && (
          <div className="bg-muted/30 rounded-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              {curatorCount > 0 && (
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {curatorCount}+
                  </p>
                  <p className="text-muted-foreground">Active Curators</p>
                </div>
              )}
              {totalDrops > 0 && (
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {totalDrops}+
                  </p>
                  <p className="text-muted-foreground">Drops Created</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fee Structure */}
        <div className="bg-background rounded-lg p-6 mb-8 border">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Transparent Fee Structure
          </h3>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-muted-foreground">Your Payout</span>
              <span className="text-2xl font-bold text-primary">80%</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-lg">20%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              No hidden fees. No monthly charges. You only pay when you sell.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/curator/apply">Apply to Become a Curator</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Application review typically takes 2-3 business days
          </p>
        </div>
      </div>
    </section>
  );
}
