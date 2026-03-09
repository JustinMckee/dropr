'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CollectiveSwitcherProps {
  currentCollective: 'MOD' | 'MAKE' | 'MINI' | 'all';
  variant?: 'desktop' | 'mobile';
}

export function CollectiveSwitcher({
  currentCollective,
  variant = 'desktop',
}: CollectiveSwitcherProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const collectives = [
    { value: 'all', label: 'All', href: 'https://dropr.com' },
    { value: 'MOD', label: 'MOD', href: 'https://mod.dropr.com' },
    { value: 'MAKE', label: 'MAKE', href: 'https://make.dropr.com' },
    { value: 'MINI', label: 'MINI', href: 'https://mini.dropr.com' },
  ];

  const handleSelectChange = (value: string) => {
    const collective = collectives.find((c) => c.value === value);
    if (collective) {
      window.location.href = collective.href;
    }
  };

  // Mobile dropdown variant
  if (variant === 'mobile' || isMobile) {
    return (
      <div className="w-full max-w-xs">
        <Select value={currentCollective} onValueChange={handleSelectChange}>
          <SelectTrigger aria-label="Select collective">
            <SelectValue placeholder="Select collective" />
          </SelectTrigger>
          <SelectContent>
            {collectives.map((collective) => (
              <SelectItem key={collective.value} value={collective.value}>
                {collective.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Desktop button variant
  return (
    <div
      className="flex gap-2 p-1 bg-muted rounded-lg"
      role="tablist"
      aria-label="Collective filter"
    >
      {collectives.map((collective) => {
        const isActive = currentCollective === collective.value;
        
        return (
          <Button
            key={collective.value}
            asChild
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${collective.value}-panel`}
          >
            <Link href={collective.href}>{collective.label}</Link>
          </Button>
        );
      })}
    </div>
  );
}
