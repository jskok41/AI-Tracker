import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security: Protect against RCE in React Server Components
function validateRSCRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  
  // Check for suspicious RSC payloads
  if (contentType?.includes('text/x-component')) {
    // Validate RSC-specific headers
    const rscHeader = request.headers.get('RSC');
    if (!rscHeader) {
      return false;
    }
  }
  
  // Validate content length to prevent DoS
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) { // 2MB limit
    return false;
  }
  
  return true;
}

// Security: Validate and sanitize request origins
function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // Allow same-origin requests
  if (!origin) {
    return true; // Same-origin requests don't have origin header
  }
  
  // Validate origin matches host for server actions
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/') || request.method === 'POST') {
    try {
      const originUrl = new URL(origin);
      // Allow localhost for development
      if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
        return true;
      }
      // Check if origin matches host
      return originUrl.host === host;
    } catch {
      return false;
    }
  }
  
  return true;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Security: Validate RSC requests to prevent RCE
  if (!validateRSCRequest(request)) {
    console.error('[Security] Invalid RSC request detected:', {
      path: pathname,
      contentType: request.headers.get('content-type'),
    });
    return new NextResponse('Bad Request', { status: 400 });
  }
  
  // Security: Validate request origin
  if (!validateRequestOrigin(request)) {
    console.error('[Security] Invalid origin detected:', {
      path: pathname,
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
    });
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Security: Add security headers to response
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // API auth routes
  const isAuthApi = pathname.startsWith('/api/auth');
  
  if (isPublicRoute || isAuthApi) {
    return response;
  }
  
  // Check for NextAuth session token cookie
  // NextAuth v5 uses different cookie names depending on environment
  const sessionToken = 
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  // Check if user is authenticated
  if (!sessionToken) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

