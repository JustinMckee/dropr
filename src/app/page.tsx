import { headers } from 'next/headers';
import { HomepageStoreProvider } from '@/features/homepage/hooks/useHomepage';
import { HeroSection } from '@/components/homepage/HeroSection';
import { FeaturedDropsSection } from '@/components/homepage/FeaturedDropsSection';
import { LiveUpcomingDropsSection } from '@/components/homepage/LiveUpcomingDropsSection';
import { PopularCuratorsSection } from '@/components/homepage/PopularCuratorsSection';
import { FoundingCuratorsSection } from '@/components/homepage/FoundingCuratorsSection';
import { CuratorSpotlight } from '@/components/homepage/CuratorSpotlight';
import { DropSpotlight } from '@/components/homepage/DropSpotlight';
import { ValuePropositionBuyers } from '@/components/homepage/ValuePropositionBuyers';
import { ValuePropositionCurators } from '@/components/homepage/ValuePropositionCurators';
import { CollectiveSwitcher } from '@/components/homepage/CollectiveSwitcher';
import { fetchHomepageData } from '@/features/homepage/models/homepage.actions';
import Script from 'next/script';

export default async function Home() {
  const headersList = await headers();
  const collective = (headersList.get('x-collective') || 'all') as 'MOD' | 'MAKE' | 'MINI' | 'all';

  // Fetch homepage data
  const data = await fetchHomepageData();

  // Combine popular curators from all collectives for display
  const popularCurators = [
    ...(data.popularModders || []),
    ...(data.popularMakers || []),
    ...(data.popularMinists || []),
  ];

  // Generate JSON-LD structured data
  const baseUrl = collective === 'all' 
    ? 'https://dropr.com' 
    : `https://${collective.toLowerCase()}.dropr.com`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: collective === 'all' ? 'Dropr' : `Dropr ${collective}`,
    url: baseUrl,
    description: collective === 'all'
      ? 'Curated drops for makers and modders'
      : `Curated drops for ${collective} enthusiasts`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dropr',
      url: 'https://dropr.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dropr.com/logo.png',
      },
    },
  };

  return (
    <HomepageStoreProvider>
      {/* JSON-LD Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-background">
        {/* Collective Switcher */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4 flex justify-center">
            <CollectiveSwitcher currentCollective={collective} />
          </div>
        </div>

        {/* Hero Section */}
        <HeroSection collective={collective} />

        {/* Featured Drops Section */}
        <FeaturedDropsSection
          drops={data.featuredDrops}
          collective={collective}
        />

        {/* Drop Spotlight (if available) */}
        {data.dropSpotlights && data.dropSpotlights.length > 0 && (
          <DropSpotlight
            drop={data.dropSpotlights[0]}
            collective={collective}
          />
        )}

        {/* Live & Upcoming Drops Section */}
        <LiveUpcomingDropsSection
          drops={data.liveUpcomingDrops}
          collective={collective}
        />

        {/* Value Proposition for Buyers */}
        <ValuePropositionBuyers collective={collective} />

        {/* Popular Curators Section */}
        <PopularCuratorsSection
          curators={popularCurators}
          collective={collective}
        />

        {/* Curator Spotlight (if available) */}
        {data.curatorSpotlights && data.curatorSpotlights.length > 0 && (
          <CuratorSpotlight
            curator={data.curatorSpotlights[0]}
            collective={collective}
          />
        )}

        {/* Founding Curators Section */}
        <FoundingCuratorsSection curators={data.foundingCurators} />

        {/* Value Proposition for Curators */}
        <ValuePropositionCurators
          curatorCount={data.stats?.totalCurators}
          totalDrops={data.stats?.totalDrops}
        />
      </main>
    </HomepageStoreProvider>
  );
}
