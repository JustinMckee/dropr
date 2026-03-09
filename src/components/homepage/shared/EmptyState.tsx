'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  ctaText,
  ctaHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {ctaText && ctaHref && (
        <Button asChild>
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      )}
    </div>
  );
}
