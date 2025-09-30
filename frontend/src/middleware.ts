import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config/env';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/register/merchant', '/verify-email'];

// Auth routes that should redirect authenticated users
const authRoutes = ['/login', '/register', '/register/merchant'];

// Protected routes that require authentication
const protectedRoutes = ['/profile', '/orders', '/checkout', '/dashboard', '/admin'];

// Check if user has authentication cookies
function isAuthenticated(request: NextRequest): boolean {
  // Check for JWT specifically - this is more reliable than refresh token
  // If JWT is missing but refresh exists, the user will need to refresh first
  const jwtCookie = request.cookies.get('jwt');
  return !!jwtCookie?.value;
}

// Check if user has refresh token (for determining if they can be refreshed)
function hasRefreshToken(request: NextRequest): boolean {
  const refreshCookie = request.cookies.get('refresh');
  return !!refreshCookie?.value;
}

// Get user role by making API call (only when needed)
async function getUserRole(request: NextRequest): Promise<string | null> {
  try {
    const response = await fetch(`${ENV.API_URL}/users/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
      // Add cache control to prevent stale data
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.user.role;
    }

    // If we get 401 but have refresh token, let the request through
    // The client-side will handle the refresh
    if (response.status === 401) {
      return null;
    }
  } catch (error) {
    console.error('Failed to get user role:', error);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userIsAuthenticated = isAuthenticated(request);
  const userHasRefreshToken = hasRefreshToken(request);

  // Handle protected routes first
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute) {
    // If user has no tokens at all, redirect to login
    if (!userIsAuthenticated && !userHasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If user has refresh token but no JWT, let them through
    // The client-side will handle the refresh
    if (!userIsAuthenticated && userHasRefreshToken) {
      return NextResponse.next();
    }
  }

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from auth pages
    if (userIsAuthenticated && authRoutes.includes(pathname)) {
      // Check for redirect parameter first
      const redirectUrl = request.nextUrl.searchParams.get('redirect');
      if (redirectUrl && protectedRoutes.some((route) => redirectUrl.startsWith(route))) {
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Get user role to determine default redirect
      const userRole = await getUserRole(request);
      const defaultRedirect = userRole === 'merchant' || userRole === 'manager' ? '/dashboard' : '/';
      return NextResponse.redirect(new URL(defaultRedirect, request.url));
    }
    return NextResponse.next();
  }

  // Handle dashboard route (merchant/admin only)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    // If user has no tokens at all, redirect to login
    if (!userIsAuthenticated && !userHasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If user has tokens, get role for authorization check
    if (userIsAuthenticated) {
      const userRole = await getUserRole(request);
      // Only check role if we successfully got it
      // If getUserRole fails, let it through and let the page handle it
      if (userRole && userRole !== 'merchant' && userRole !== 'admin' && userRole !== 'manager') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  }

  // Handle admin route (admin only)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // If user has no tokens at all, redirect to login
    if (!userIsAuthenticated && !userHasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If user has tokens, get role for authorization check
    if (userIsAuthenticated) {
      const userRole = await getUserRole(request);
      // Only check role if we successfully got it
      if (userRole && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  }

  // All other routes (like /storeSlug/productSlug) are public
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/register/customer',
    '/register/merchant',
  ],
};
