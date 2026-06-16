import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('producer_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const res = await fetch(`${BACKEND}/api/producer/orders/${id}/song`, {
    method: 'POST',
    headers: { Cookie: `producer_session=${token}` },
    body: formData,
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
