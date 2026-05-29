import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('token');

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // Already authenticated — redirect to dashboard
      if (refreshToken?.value) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // No refresh token cookie — redirect to login
    if (!refreshToken?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
