import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('producer_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${BACKEND}/api/producer/orders/${id}`, {
    headers: { Cookie: `producer_session=${token}` },
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('producer_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.text();
  const res = await fetch(`${BACKEND}/api/producer/orders/${id}`, {
    method: 'PATCH',
    headers: {
      Cookie: `producer_session=${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  const resBody = await res.text();
  return new NextResponse(resBody, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
