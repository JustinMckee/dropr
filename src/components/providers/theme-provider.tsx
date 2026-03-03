'use client';

import { useEffect } from 'react';
import type { Collective } from '@/lib/collective-config';

interface ThemeProviderProps {
  children: React.ReactNode;
  collective: Collective;
}

export function ThemeProvider({ children, collective }: ThemeProviderProps) {
  useEffect(() => {
    // Add collective class to body
    document.body.classList.remove(
      'collective-mod',
      'collective-make',
      'collective-mini'
    );
    document.body.classList.add(`collective-${collective.toLowerCase()}`);
  }, [collective]);

  return <>{children}</>;
}
