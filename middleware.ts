import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/trades',
  '/profile',
  '/transactions',
  '/notifications',
  '/support',
  '/mt5',
  '/community',
];

// Routes that require admin role
const adminRoutes = ['/admin'];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/trades',
  '/api/transactions',
  '/api/notifications',
  '/api/tickets',
  '/api/mt5',
  '/api/community',
];

// API routes that require admin role
const adminApiRoutes = [
  '/api/users',
  '/api/admin',
  '/api/migrate-db',
  '/api/vps',
  '/api/automation',
];

// Public routes (no auth required)
const publicRoutes = ['/', '/login', '/register', '/api/login', '/api/health', '/api/landing-stats'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('au_session')?.value;

  // Skip public routes and static files
  if (
    publicRoutes.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/static'))
  ) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminApi = adminApiRoutes.some(route => pathname.startsWith(route));

  // For protected routes, check session exists
  if (isProtectedRoute || isAdminRoute || isProtectedApi || isAdminApi) {
    if (!sessionToken) {
      // API routes return 401, page routes redirect to login
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // Redirect to home page (which has login modal)
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // For admin routes, we need to verify the role
    // This is done at the API level since middleware can't access Redis
    // The session validation happens in the API route handlers
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
