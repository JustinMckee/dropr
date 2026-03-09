import type { Metadata } from 'next';
import './globals.css';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/providers/theme-provider';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const collective = (headersList.get('x-collective') || 'all') as 'all' | 'MOD' | 'MAKE' | 'MINI';

  const metaData = {
    all: {
      title: 'Dropr - Curated Drops for Makers & Modders',
      description:
        'Discover limited-edition drops from verified curators. Mechanical keyboards, DIY electronics, miniatures, and more. Curated quality you can trust.',
      keywords:
        'curated drops, maker marketplace, mechanical keyboards, DIY electronics, miniatures, limited edition',
      url: 'https://dropr.com',
    },
    MOD: {
      title: 'Dropr MOD - Curated Drops for Keyboard Enthusiasts',
      description:
        'Discover curated drops of mechanical keyboards, keycaps, switches, and PC mods from verified modders. Limited releases you can trust.',
      keywords:
        'mechanical keyboards, keycaps, switches, PC mods, gaming peripherals, custom keyboards',
      url: 'https://mod.dropr.com',
    },
    MAKE: {
      title: 'Dropr MAKE - Curated Drops for Makers',
      description:
        'Discover curated drops of DIY electronics, 3D printing supplies, and modular synth components from expert makers. Limited releases you can trust.',
      keywords: 'DIY electronics, 3D printing, modular synth, maker supplies, components, kits',
      url: 'https://make.dropr.com',
    },
    MINI: {
      title: 'Dropr MINI - Curated Drops for Miniature Enthusiasts',
      description:
        'Discover curated drops of miniatures, model kits, painting supplies, and terrain from master painters. Limited releases you can trust.',
      keywords:
        'miniatures, model kits, painting supplies, terrain, tabletop gaming, figurines',
      url: 'https://mini.dropr.com',
    },
  };

  const meta = metaData[collective];

  return {
    title: {
      default: meta.title,
      template: `%s | ${meta.title}`,
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'Dropr' }],
    creator: 'Dropr',
    publisher: 'Dropr',
    metadataBase: new URL(meta.url),
    alternates: {
      canonical: meta.url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: meta.url,
      siteName: 'Dropr',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      creator: '@dropr',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
