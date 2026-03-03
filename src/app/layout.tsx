import type { Metadata } from 'next';
import './globals.css';
import { getCollective } from '@/lib/collective';
import { getCollectiveConfig } from '@/lib/collective-config';
import { ThemeProvider } from '@/components/providers/theme-provider';

export async function generateMetadata(): Promise<Metadata> {
  const collective = await getCollective();
  const config = getCollectiveConfig(collective);

  return {
    title: config.seo.title,
    description: config.seo.description,
    keywords: config.seo.keywords,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const collective = await getCollective();

  return (
    <html lang="en">
      <body>
        <ThemeProvider collective={collective}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
