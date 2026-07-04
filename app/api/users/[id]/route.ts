import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = req.headers.get('authorization') || '';
  const res = await fetch(`${BACKEND}/users/${id}`, {
    headers: { ...(auth && { Authorization: auth }) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = req.headers.get('authorization') || '';
  const body = await req.json();
  const res = await fetch(`${BACKEND}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = req.headers.get('authorization') || '';
  const res = await fetch(`${BACKEND}/users/${id}`, {
    method: 'DELETE',
    headers: { ...(auth && { Authorization: auth }) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
