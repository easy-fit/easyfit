import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config/env';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/register/merchant', '/verify-email'];

// Auth routes that should redirect authenticated users
const authRoutes = ['/login', '/register', '/register/merchant'];

// Protected routes that require authentication
const protectedRoutes = ['/profile', '/orders', '/checkout', '/dashboard'];

// Check if user has authentication cookies
function isAuthenticated(request: NextRequest): boolean {
  // Get all possible cookie names your backend might use
  const cookieNames = ['jwt', 'refresh'];

  for (const cookieName of cookieNames) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) {
      return true;
    }
  }

  return false;
}

// Get user role by making API call (only when needed)
async function getUserRole(request: NextRequest): Promise<string | null> {
  try {
    const response = await fetch(`${ENV.API_URL}/users/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.user.role;
    }
  } catch (error) {
    console.error('Failed to get user role:', error);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userIsAuthenticated = isAuthenticated(request);

  // Handle protected routes first
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !userIsAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
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
  if (pathname === '/dashboard') {
    if (!userIsAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user role for dashboard access check
    const userRole = await getUserRole(request);
    if (userRole !== 'merchant' && userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
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
    '/login',
    '/register',
    '/register/customer',
    '/register/merchant',
  ],
};
