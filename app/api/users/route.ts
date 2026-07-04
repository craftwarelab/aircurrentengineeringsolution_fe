import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// GET /api/users — list users
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const search = request.nextUrl.search;
  const res = await fetch(`${BACKEND}/users${search}`, {
    headers: { ...(auth && { Authorization: auth }) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/users — create user
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const body = await request.json();
  const res = await fetch(`${BACKEND}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
