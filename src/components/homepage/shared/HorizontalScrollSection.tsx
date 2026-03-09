'use client';

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HorizontalScrollSectionProps {
  title: string;
  children: ReactNode;
  viewAllLink?: string;
  ariaLabel: string;
  className?: string;
}

export function HorizontalScrollSection({
  title,
  children,
  viewAllLink,
  ariaLabel,
  className,
}: HorizontalScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Check scroll boundaries
  const checkScrollBoundaries = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll by one card width
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 360; // Desktop card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  // Setup scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollBoundaries();
    container.addEventListener('scroll', checkScrollBoundaries);

    return () => {
      container.removeEventListener('scroll', checkScrollBoundaries);
    };
  }, [checkScrollBoundaries]);

  // Check boundaries when children change (real-time updates)
  useEffect(() => {
    checkScrollBoundaries();
  }, [children, checkScrollBoundaries]);

  return (
    <section className={cn('relative', className)} aria-label={ariaLabel}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All →
          </a>
        )}
      </div>

      <div className="relative group">
        {/* Left scroll indicator */}
        <button
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm',
            'border border-border shadow-lg',
            'flex items-center justify-center',
            'transition-opacity duration-200',
            'hover:bg-background',
            'hidden md:flex',
            !canScrollLeft && 'opacity-0 pointer-events-none'
          )}
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-4 overflow-x-auto scroll-smooth',
            'snap-x snap-mandatory',
            'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent',
            'md:scrollbar-thumb-rounded-full',
            '[&::-webkit-scrollbar]:h-2',
            '[&::-webkit-scrollbar-thumb]:bg-muted',
            '[&::-webkit-scrollbar-thumb]:rounded-full',
            '[&::-webkit-scrollbar-track]:bg-transparent',
            'md:[&::-webkit-scrollbar]:block',
            '[&::-webkit-scrollbar]:hidden'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label={`${title} scrollable content`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {children}
        </div>

        {/* Right scroll indicator */}
        <button
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10',
            'w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm',
            'border border-border shadow-lg',
            'flex items-center justify-center',
            'transition-opacity duration-200',
            'hover:bg-background',
            'hidden md:flex',
            !canScrollRight && 'opacity-0 pointer-events-none'
          )}
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
