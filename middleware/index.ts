import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for admin token cookie
    const tokenCookie = request.cookies.get('admin_token')
    if (!tokenCookie || !tokenCookie.value) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as any

      // Check if token is expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        // Redirect to login for expired tokens
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Verify user has admin role
      if (decoded.role !== 'admin' && decoded.role !== 'superAdmin') {
        // Redirect to login for non-admin users
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

    } catch (error) {
      // Invalid token - redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*'
  ],
}