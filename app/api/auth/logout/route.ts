import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response that clears the cookies
    const response = NextResponse.json({ success: true });

    // Clear the secure httpOnly token cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    // Clear the client-side auth cookie
    response.cookies.set('admin_auth', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}