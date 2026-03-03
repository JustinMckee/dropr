import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCollectiveFromSubdomain } from './lib/collective-config';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { searchParams } = new URL(request.url);
  
  // Check for query parameter override (for local development testing)
  const collectiveParam = searchParams.get('collective');
  let collective: string | null = null;
  
  if (collectiveParam && ['MOD', 'MAKE', 'MINI'].includes(collectiveParam.toUpperCase())) {
    collective = collectiveParam.toUpperCase();
  } else {
    // Extract subdomain
    const subdomain = hostname.split('.')[0];
    
    // Determine collective based on subdomain
    collective = getCollectiveFromSubdomain(subdomain);
    
    // Default to MOD for www or main domain
    if (!collective || subdomain === 'www' || hostname.includes('localhost')) {
      collective = 'MOD';
    }
  }
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-collective', collective);
  
  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
