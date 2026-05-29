import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    // Forward the refresh token cookie to the browser
    // The backend sets: token=<value>; HttpOnly; SameSite=Lax
    // We rewrite it so it is scoped to this Next.js origin
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      // Extract just the token value from the Set-Cookie string
      const tokenMatch = setCookie.match(/token=([^;]+)/);
      if (tokenMatch) {
        response.cookies.set('token', tokenMatch[1], {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          // Preserve Max-Age from backend if present
          maxAge: (() => {
            const maxAgeMatch = setCookie.match(/Max-Age=(\d+)/i);
            return maxAgeMatch ? parseInt(maxAgeMatch[1]) : 60 * 60 * 24 * 7;
          })(),
          secure: process.env.NODE_ENV === 'production',
        });
      }
    }

    return response;
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
