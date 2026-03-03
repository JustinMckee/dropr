export type Collective = 'MOD' | 'MAKE' | 'MINI';

export interface CollectiveConfig {
  key: Collective;
  name: string;
  subdomain: string;
  description: string;
  color: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
  };
  iconography: string;
  pattern: 'grid' | 'circuit-board' | 'hexagon';
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  messaging: {
    headline: string;
    subheadline: string;
    cta: string;
  };
}

export const collectiveConfig: Record<Collective, CollectiveConfig> = {
  MOD: {
    key: 'MOD',
    name: 'Mod Collective',
    subdomain: 'mod',
    description: 'Mechanical keyboards, PC modding, gaming peripherals',
    color: {
      primary: '#8b5cf6', // purple-500
      primaryDark: '#6d28d9', // purple-600
      primaryLight: '#a78bfa', // purple-400
    },
    iconography: 'keyboard',
    pattern: 'grid',
    seo: {
      title: 'Dropr - Mod Collective',
      description:
        'Curated mystery drops for mechanical keyboard enthusiasts, PC modders, and gaming peripheral collectors',
      keywords: [
        'mechanical keyboards',
        'keycaps',
        'switches',
        'PC mods',
        'gaming peripherals',
        'custom keyboards',
      ],
    },
    messaging: {
      headline: 'Curated Drops for Keyboard Enthusiasts & PC Modders',
      subheadline:
        'Limited mystery boxes featuring switches, keycaps, and rare mods from verified curators',
      cta: 'Explore Drops',
    },
  },
  MAKE: {
    key: 'MAKE',
    name: 'Make Collective',
    subdomain: 'make',
    description: 'DIY electronics, 3D printing, modular synth',
    color: {
      primary: '#06b6d4', // cyan-500
      primaryDark: '#0891b2', // cyan-600
      primaryLight: '#22d3ee', // cyan-400
    },
    iconography: 'circuit',
    pattern: 'circuit-board',
    seo: {
      title: 'Dropr - Make Collective',
      description:
        'Curated mystery drops for DIY electronics makers, 3D printing enthusiasts, and modular synth builders',
      keywords: [
        'DIY electronics',
        '3D printing',
        'modular synth',
        'maker',
        'components',
        'PCB',
      ],
    },
    messaging: {
      headline: 'Curated Drops for Makers & Builders',
      subheadline:
        'Limited mystery boxes featuring components, tools, and rare parts from verified curators',
      cta: 'Discover Drops',
    },
  },
  MINI: {
    key: 'MINI',
    name: 'Mini Collective',
    subdomain: 'mini',
    description: 'Miniatures, model kits, figurines, painting supplies',
    color: {
      primary: '#ec4899', // pink-500
      primaryDark: '#db2777', // pink-600
      primaryLight: '#f472b6', // pink-400
    },
    iconography: 'paintbrush',
    pattern: 'hexagon',
    seo: {
      title: 'Dropr - Mini Collective',
      description:
        'Curated mystery drops for miniature painters, model kit builders, and figurine collectors',
      keywords: [
        'miniatures',
        'model kits',
        'figurines',
        'painting supplies',
        'warhammer',
        'tabletop',
      ],
    },
    messaging: {
      headline: 'Curated Drops for Miniature Enthusiasts',
      subheadline:
        'Limited mystery boxes featuring minis, paints, and rare finds from verified curators',
      cta: 'Browse Drops',
    },
  },
};

export function getCollectiveConfig(collective: Collective): CollectiveConfig {
  return collectiveConfig[collective];
}

export function getCollectiveFromSubdomain(
  subdomain: string
): Collective | null {
  const entry = Object.entries(collectiveConfig).find(
    ([_, config]) => config.subdomain === subdomain
  );
  return entry ? (entry[0] as Collective) : null;
}
