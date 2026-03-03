import { getCollective } from '@/lib/collective';
import { getCollectiveConfig } from '@/lib/collective-config';

export default async function Home() {
  const collective = await getCollective();
  const config = getCollectiveConfig(collective);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-collective mb-4">
          {config.name}
        </h1>
        <h2 className="text-4xl font-bold mb-4">{config.messaging.headline}</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          {config.messaging.subheadline}
        </p>
        <button className="mt-8 px-8 py-3 bg-collective text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
          {config.messaging.cta}
        </button>
      </div>
      
      <div className="mt-16 text-sm text-gray-500">
        <p>Current collective: {collective}</p>
        <p>Subdomain: {config.subdomain}.dropr.com</p>
      </div>
    </main>
  );
}
