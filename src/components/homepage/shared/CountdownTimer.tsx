'use client';

import { useEffect, useState } from 'react';
import { calculateCountdown } from '@/features/homepage/models/homepage.utils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetTime: Date;
  status: 'upcoming' | 'live';
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({
  targetTime,
  status,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(targetTime, status)
  );

  useEffect(() => {
    // Initial calculation
    const newCountdown = calculateCountdown(targetTime, status);
    setCountdown(newCountdown);

    if (newCountdown.expired) {
      onComplete?.();
      return;
    }

    // Set up interval based on update frequency
    if (newCountdown.updateInterval === 0) {
      // Static display (2+ hours), no updates needed
      return;
    }

    const interval = setInterval(() => {
      const updated = calculateCountdown(targetTime, status);
      setCountdown(updated);

      if (updated.expired) {
        clearInterval(interval);
        onComplete?.();
      }
    }, newCountdown.updateInterval);

    return () => clearInterval(interval);
  }, [targetTime, status, onComplete]);

  if (countdown.expired) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-sm font-medium',
        status === 'upcoming'
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : 'bg-red-500/10 text-red-600 dark:text-red-400',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">
        {status === 'upcoming' ? 'Starts in' : 'Ends in'}
      </span>
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{countdown.display}</span>
    </div>
  );
}
