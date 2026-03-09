import type { CountdownData } from './homepage.types';

/**
 * Calculates countdown with appropriate format and update interval
 * Unified logic for both upcoming (time until start) and live (time until end) drops
 */
export function calculateCountdown(
  targetTime: Date,
  status: 'upcoming' | 'live',
  now: Date = new Date()
): CountdownData {
  const diff = targetTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, display: '', updateInterval: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Same display logic for both upcoming and live drops
  if (hours >= 2) {
    // > 2 hours: show "2+ hours", no updates needed
    return {
      expired: false,
      display: '2+ hours',
      updateInterval: 0, // Static display
      status,
    };
  } else if (hours >= 1) {
    // 1-2 hours: show "1 hr, X min", update every 15 minutes
    return {
      expired: false,
      display: `1 hr, ${minutes} min`,
      updateInterval: 15 * 60 * 1000, // 15 minutes
      status,
    };
  } else {
    // < 1 hour: show "Xm Ys", update every second
    return {
      expired: false,
      display: `${minutes}m ${seconds}s`,
      updateInterval: 1000,
      status,
    };
  }
}

/**
 * Formats a countdown for display
 */
export function formatCountdown(countdown: CountdownData): string {
  return countdown.display;
}

/**
 * Determines if a drop should show a countdown timer
 * Only shows for drops within 24 hours of start (upcoming) or any live drop
 */
export function shouldShowCountdown(
  drop: { status: string; startTime: Date; endTime: Date },
  now: Date = new Date()
): boolean {
  if (drop.status === 'live') {
    return true; // Always show countdown for live drops
  }

  if (drop.status === 'upcoming') {
    const hoursUntilStart = (drop.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilStart <= 24; // Only show if within 24 hours
  }

  return false;
}

/**
 * Applies filters to a list of drops
 */
export function applyFilters(drops: any[], filters: any): any[] {
  let filtered = drops;

  if (filters.dropType && filters.dropType.length > 0) {
    filtered = filtered.filter((drop) => filters.dropType!.includes(drop.dropType));
  }

  if (filters.priceRange) {
    filtered = filtered.filter(
      (drop) => drop.price >= filters.priceRange!.min && drop.price <= filters.priceRange!.max
    );
  }

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((drop) => filters.status!.includes(drop.status));
  }

  if (filters.collective && filters.collective.length > 0) {
    filtered = filtered.filter((drop) => filters.collective!.includes(drop.collective));
  }

  return filtered;
}

/**
 * Applies sorting to a list of drops
 */
export function applySorting(drops: any[], sort: any): any[] {
  const sorted = [...drops].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];

    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}
