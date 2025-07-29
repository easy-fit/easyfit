import { NextRequest, NextResponse } from 'next/server';

// Define route patterns
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/register/customer',  
  '/register/merchant',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/products',
  '/stores',
];

const authRoutes = [
  '/login',
  '/register',
  '/register/customer',
  '/register/merchant',
  '/forgot-password',
  '/reset-password',
];

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/orders',
  '/cart',
  '/checkout',
];

const merchantRoutes = [
  '/merchant',
  '/store-management',
];

const adminRoutes = [
  '/admin',
];

// Helper function to check if a path matches any pattern in an array
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

// Helper function to get user from JWT cookie
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;
  
  if (!token) {
    return null;
  }

  try {
    // Make a request to verify token and get user info
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        'Cookie': `jwt=${token}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.user;
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user information from token
  const user = await getUserFromToken(request);
  const isAuthenticated = !!user;

  // Allow all public routes
  if (matchesPath(pathname, publicRoutes)) {
    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthenticated && matchesPath(pathname, authRoutes)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check for protected routes
  if (matchesPath(pathname, protectedRoutes)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check for merchant-only routes
  if (matchesPath(pathname, merchantRoutes)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (user.role !== 'merchant' && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check for admin-only routes
  if (matchesPath(pathname, adminRoutes)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

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
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};