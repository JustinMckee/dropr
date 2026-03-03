'use client';

import { useEffect, useState } from 'react';
import {
  type Collective,
  type CollectiveConfig,
  getCollectiveConfig,
} from '@/lib/collective-config';

export function useCollective(): {
  collective: Collective;
  config: CollectiveConfig;
} {
  const [collective, setCollective] = useState<Collective>('MOD');

  useEffect(() => {
    // Read collective from body class
    const bodyClasses = document.body.classList;
    if (bodyClasses.contains('collective-mod')) {
      setCollective('MOD');
    } else if (bodyClasses.contains('collective-make')) {
      setCollective('MAKE');
    } else if (bodyClasses.contains('collective-mini')) {
      setCollective('MINI');
    }
  }, []);

  return {
    collective,
    config: getCollectiveConfig(collective),
  };
}
