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

  const res = await fetch(`${BACKEND}/api/producer/orders/${id}/voice`, {
    headers: { Cookie: `producer_session=${token}` },
  });

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const headers = new Headers();
  const ct = res.headers.get('content-type');
  const cl = res.headers.get('content-length');
  if (ct) headers.set('content-type', ct);
  if (cl) headers.set('content-length', cl);

  return new NextResponse(res.body, { status: 200, headers });
}
