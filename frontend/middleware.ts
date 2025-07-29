import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, type JWTPayload } from '@/lib/auth/jwt';

const publicRoutes = ['/', '/login', '/register', '/register/customer', '/register/merchant'];

const authRoutes = ['/login', '/register', '/register/customer', '/register/merchant'];

function getUserFromToken(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('jwt')?.value;

  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

async function getUserRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('jwt')?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        Cookie: `jwt=${token}`,
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

  const user = getUserFromToken(request);
  const isAuthenticated = !!user;

  // Handle static public routes
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.includes(pathname)) {
      // Get user role to determine redirect destination
      const userRole = await getUserRole(request);
      const redirectUrl = userRole === 'merchant' ? '/dashboard' : '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Handle dashboard route (merchant only)
  if (pathname === '/dashboard') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user role for dashboard access check
    const userRole = await getUserRole(request);

    if (userRole !== 'merchant' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  }

  // All other routes are considered dynamic (slug-based) and allowed to pass through
  // This includes routes like /storeSlug/productSlug, etc.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
