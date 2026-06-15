import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const SESSION_TTL = 8 * 60 * 60; // 8 hours — matches backend

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password: string };

  const backendRes = await fetch(`${BACKEND}/api/producer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const setCookie = backendRes.headers.get('set-cookie') ?? '';
  const match = setCookie.match(/producer_session=([^;]+)/);
  const token = match?.[1];

  if (!token) {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set('producer_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });

  return NextResponse.json({ status: 'ok' });
}
