import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const search = request.nextUrl.search;
  const res = await fetch(`${BACKEND}/users/count${search}`, {
    headers: { ...(auth && { Authorization: auth }) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
