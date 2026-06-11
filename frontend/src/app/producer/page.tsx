import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { JSX } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Order = {
  order_id: string;
  name: string;
  occasion: string;
  status: string;
  received_at: string;
  has_voice: boolean;
};

const STATUS_CONFIGS: Record<string, { label: string; color: string; bg: string }> = {
  received: {
    label: 'Brief received',
    color: 'var(--ink-400)',
    bg: 'rgba(255,255,255,0.06)',
  },
  in_progress: {
    label: 'In progress',
    color: 'oklch(0.82 0.15 200)',
    bg: 'rgba(80,200,220,0.12)',
  },
  awaiting_review: {
    label: 'Awaiting review',
    color: 'oklch(0.80 0.13 65)',
    bg: 'rgba(220,180,80,0.12)',
  },
};

function StatusChip({ status }: { status: string }): JSX.Element {
  const cfg = STATUS_CONFIGS[status] ?? {
    label: status,
    color: 'var(--ink-400)',
    bg: 'rgba(255,255,255,0.06)',
  };
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        color: cfg.color,
        background: cfg.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

function computeWeeklyStats(orders: Order[]) {
  const now = new Date();
  const weekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()),
  );

  const thisWeek = orders.filter(o => new Date(o.received_at) >= weekStart);
  return {
    awaitingReview: thisWeek.filter(o =>
      ['awaiting_review', 'approved', 'delivered'].includes(o.status),
    ).length,
    inProgress: thisWeek.filter(o => o.status === 'in_progress').length,
  };
}

export default async function ProducerQueuePage() {
  const cookieStore = await cookies();
  if (!cookieStore.has('producer_session')) {
    redirect('/producer/login');
  }

  const sessionValue = cookieStore.get('producer_session')!.value;

  let orders: Order[] = [];
  let fetchError = false;

  try {
    const res = await fetch(`${BACKEND_URL}/api/producer/orders`, {
      headers: { Cookie: `producer_session=${sessionValue}` },
      cache: 'no-store',
    });
    if (res.status === 401) redirect('/producer/login');
    if (res.ok) {
      orders = await res.json();
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  const { awaitingReview, inProgress } = computeWeeklyStats(orders);

  return (
    <div className="shell shell-wide">
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-400)',
            marginBottom: 8,
            fontFamily: 'var(--font-mono)',
          }}
        >
          Order queue
        </div>
        <h1 style={{ fontSize: 28, color: 'var(--ink-50)', margin: 0, fontWeight: 600 }}>
          Orders
        </h1>
      </div>

      {/* Weekly stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: 'Awaiting review this week', value: awaitingReview },
          { label: 'In progress this week', value: inProgress },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 30, fontWeight: 600, color: 'var(--ink-50)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Order list */}
      {fetchError ? (
        <div style={{ color: '#f87171', fontSize: 14 }}>
          Could not load orders. Is the backend running?
        </div>
      ) : orders.length === 0 ? (
        <div style={{ color: 'var(--ink-400)', fontSize: 14 }}>No orders yet.</div>
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 170px 150px 24px',
              padding: '10px 20px',
              borderBottom: '1px solid var(--glass-border)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-500)',
            }}
          >
            <span>Customer</span>
            <span>Occasion</span>
            <span>Status</span>
            <span>Received</span>
            <span />
          </div>

          {orders.map((order, i) => (
            <Link
              key={order.order_id}
              href={`/producer/orders/${order.order_id}`}
              className="hover:bg-white/5"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 170px 150px 24px',
                padding: '14px 20px',
                borderBottom:
                  i < orders.length - 1 ? '1px solid var(--glass-border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ color: 'var(--ink-50)', fontWeight: 500 }}>
                {order.name || '—'}
              </span>
              <span style={{ color: 'var(--ink-200)', fontSize: 14 }}>{order.occasion}</span>
              <span>
                <StatusChip status={order.status} />
              </span>
              <span style={{ color: 'var(--ink-400)', fontSize: 13 }}>
                {order.received_at
                  ? new Date(order.received_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              <span style={{ color: 'var(--accent-400)', fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
