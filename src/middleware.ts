import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCollectiveFromSubdomain } from './lib/collective-config';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { searchParams } = new URL(request.url);
  
  // Check for query parameter override (for local development testing)
  const collectiveParam = searchParams.get('collective');
  let collective: string = 'all';
  
  if (collectiveParam && ['MOD', 'MAKE', 'MINI'].includes(collectiveParam.toUpperCase())) {
    collective = collectiveParam.toUpperCase();
  } else {
    // Extract subdomain
    const subdomain = hostname.split('.')[0];
    
    // Determine collective based on subdomain
    if (subdomain === 'mod') {
      collective = 'MOD';
    } else if (subdomain === 'make') {
      collective = 'MAKE';
    } else if (subdomain === 'mini') {
      collective = 'MINI';
    } else if (subdomain === 'www' || hostname.includes('localhost') || hostname.includes('dropr.com')) {
      // Main homepage shows all collectives
      collective = 'all';
    } else {
      // Fallback to checking collective config
      const configCollective = getCollectiveFromSubdomain(subdomain);
      collective = configCollective || 'all';
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
