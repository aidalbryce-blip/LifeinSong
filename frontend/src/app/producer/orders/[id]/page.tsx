'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Tab = 'brief' | 'deliver';
type UploadState = 'idle' | 'uploading' | 'success' | 'error';

type Order = {
  order_id: string;
  name: string;
  occasion: string;
  event_date?: string;
  relationship?: string;
  feeling?: string;
  feeling_note?: string;
  style?: string;
  style_note?: string;
  story_text?: string;
  voice_recording_reference?: string | null;
  status: string;
  received_at: string;
  internal_notes?: string;
  song_reference?: string | null;
  chorus_lyrics?: string;
  full_lyrics?: string;
  producer_message?: string;
  delivery_token?: string | null;
  revision_note?: string | null;
  download_unlocked?: boolean;
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
  revision_requested: {
    label: 'Revision requested',
    color: 'oklch(0.75 0.18 25)',
    bg: 'rgba(220,80,60,0.12)',
  },
  approved: {
    label: 'Approved',
    color: 'oklch(0.82 0.15 150)',
    bg: 'rgba(80,220,120,0.12)',
  },
  delivered: {
    label: 'Delivered',
    color: 'var(--ink-400)',
    bg: 'rgba(255,255,255,0.06)',
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIGS[status] ?? {
    label: status,
    color: 'var(--ink-400)',
    bg: 'rgba(255,255,255,0.06)',
  };
  return (
    <span
      style={{
        padding: '4px 12px',
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

function BriefField({
  label,
  value,
  sub,
}: {
  label: string;
  value?: string | null;
  sub?: string | null;
}) {
  if (!value) return null;
  return (
    <div
      style={{
        padding: '14px 18px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ color: 'var(--ink-50)', fontSize: 14, fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ color: 'var(--ink-400)', fontSize: 13, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function OrderWorkPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>('brief');

  const [internalNotes, setInternalNotes] = useState('');
  const [chorusLyrics, setChorusLyrics] = useState('');
  const [fullLyrics, setFullLyrics] = useState('');
  const [producerMessage, setProducerMessage] = useState('');

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [saving, setSaving] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleUnauth = useCallback(() => {
    router.replace('/producer/login');
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${BACKEND}/api/producer/orders/${orderId}`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { handleUnauth(); return; }
        if (res.status === 404) { if (!cancelled) setNotFound(true); return; }
        if (!res.ok) { if (!cancelled) setNotFound(true); return; }
        const data: Order = await res.json();
        if (!cancelled) {
          setOrder(data);
          setInternalNotes(data.internal_notes ?? '');
          setChorusLyrics(data.chorus_lyrics ?? '');
          setFullLyrics(data.full_lyrics ?? '');
          setProducerMessage(data.producer_message ?? '');
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [orderId, handleUnauth]);

  async function patchOrder(fields: Record<string, string | boolean>) {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/api/producer/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.status === 401) { handleUnauth(); return; }
      if (res.ok) {
        setOrder(prev => (prev ? { ...prev, ...fields } : prev));
      }
    } finally {
      setSaving(false);
    }
  }

  function debouncedPatch(key: string, fields: Record<string, string>, delayMs = 1500) {
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(() => patchOrder(fields), delayMs);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState('uploading');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${BACKEND}/api/producer/orders/${orderId}/song`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (res.status === 401) { handleUnauth(); return; }
      if (res.ok) {
        const data = await res.json();
        setOrder(prev => (prev ? { ...prev, song_reference: data.song_reference } : prev));
        setUploadState('success');
      } else {
        setUploadState('error');
      }
    } catch {
      setUploadState('error');
    }
    // reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleStatusChange(newStatus: string) {
    setSendingReview(true);
    try {
      const res = await fetch(`${BACKEND}/api/producer/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.status === 401) { handleUnauth(); return; }
      if (res.ok) {
        const data = await res.json();
        setOrder(prev => prev ? {
          ...prev,
          status: newStatus,
          ...(data.delivery_token ? { delivery_token: data.delivery_token } : {}),
        } : prev);
      }
    } finally {
      setSendingReview(false);
    }
  }

  function deliveryUrl(token: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/consumer/${token}`;
  }

  async function copyDeliveryUrl(token: string) {
    await navigator.clipboard.writeText(deliveryUrl(token));
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }

  const canSendForReview =
    Boolean(order?.song_reference) &&
    chorusLyrics.trim().length > 0 &&
    fullLyrics.trim().length > 0;

  const alreadySent = ['awaiting_review', 'approved', 'delivered'].includes(order?.status ?? '');

  if (loading) {
    return (
      <div className="shell" style={{ maxWidth: 860 }}>
        <div style={{ padding: '48px 0', color: 'var(--ink-400)', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="shell" style={{ maxWidth: 860 }}>
        <div style={{ color: '#f87171', fontSize: 14, marginBottom: 12 }}>Order not found.</div>
        <Link href="/producer" style={{ color: 'var(--accent-400)', fontSize: 13, textDecoration: 'none' }}>
          ← Back to queue
        </Link>
      </div>
    );
  }

  return (
    <div className="shell" style={{ maxWidth: 860 }}>
      {/* Back link */}
      <Link
        href="/producer"
        style={{ color: 'var(--ink-400)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}
      >
        ← All orders
      </Link>

      {/* Order header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-400)',
              marginBottom: 6,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {order.order_id}
          </div>
          <h1 style={{ fontSize: 24, color: 'var(--ink-50)', margin: '0 0 4px', fontWeight: 600 }}>
            {order.name || 'Customer'} · {order.occasion}
          </h1>
          {order.received_at && (
            <div style={{ color: 'var(--ink-400)', fontSize: 13 }}>
              Received{' '}
              {new Date(order.received_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={order.status} />
          {order.status === 'received' && (
            <button onClick={() => handleStatusChange('in_progress')} className="btn btn-ghost btn-sm">
              Mark in progress
            </button>
          )}
        </div>
      </div>

      {/* Pill tabs (FLAG 4) */}
      <div className="tabs" style={{ marginBottom: 28 }}>
        {(['brief', 'deliver'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab${tab === t ? ' active' : ''}`}
          >
            {t === 'brief' ? 'Customer brief' : 'Upload & deliver'}
          </button>
        ))}
      </div>

      {/* ── Brief tab ── */}
      {tab === 'brief' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Voice recording */}
          {order.voice_recording_reference && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className="eyebrow">Voice memo</div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'oklch(0.82 0.15 150)',
                    background: 'rgba(80,220,120,0.12)',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  ● Recording attached
                </span>
              </div>
              <audio
                controls
                src={`${BACKEND}/api/producer/orders/${orderId}/voice`}
                style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              />
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 6 }}>
                Duration shows 0:00 — this is normal for browser recordings. Press play to listen.
              </div>
            </div>
          )}

          {/* Brief fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <BriefField label="Occasion" value={order.occasion} />
            <BriefField label="Event date" value={order.event_date} />
            <BriefField label="For" value={order.name} sub={order.relationship} />
            <BriefField label="Feeling" value={order.feeling} sub={order.feeling_note} />
            <BriefField label="Style" value={order.style} sub={order.style_note} />
          </div>

          {/* Story */}
          {order.story_text && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Story</div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--ink-200)',
                  fontSize: 15,
                  lineHeight: 1.7,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--glass-border)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {order.story_text}
              </p>
            </div>
          )}

          {/* Internal notes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="eyebrow">Internal notes</div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Private · auto-saves on blur</span>
            </div>
            <textarea
              value={internalNotes}
              onChange={e => { setInternalNotes(e.target.value); debouncedPatch('notes', { internal_notes: e.target.value }); }}
              onBlur={() => { clearTimeout(saveTimers.current['notes']); patchOrder({ internal_notes: internalNotes }); }}
              placeholder="Scratchpad — only the studio sees this."
              rows={5}
              className="textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minHeight: 100 }}
            />
          </div>
        </div>
      )}

      {/* ── Upload & Deliver tab ── */}
      {tab === 'deliver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Revision note callout */}
          {order.status === 'revision_requested' && (
            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(220,80,60,0.10)',
                border: '1px solid rgba(220,80,60,0.35)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div className="eyebrow" style={{ color: 'oklch(0.75 0.18 25)', marginBottom: 8 }}>
                Revision requested
              </div>
              <p style={{ margin: 0, color: 'var(--ink-100)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {order.revision_note || 'No note provided.'}
              </p>
            </div>
          )}

          {/* File upload */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Final audio file</div>

            {order.song_reference ? (
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ color: 'var(--ink-50)', fontSize: 14, fontWeight: 500 }}>
                    {order.song_reference}
                  </div>
                  <div style={{ color: 'oklch(0.82 0.15 150)', fontSize: 12, marginTop: 2 }}>
                    Song uploaded
                  </div>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost btn-sm">
                  Replace
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                className="dropzone"
              >
                <div style={{ color: 'var(--ink-200)', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
                  Upload master file
                </div>
                <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>
                  WAV or MP3 · up to 100 MB
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,audio/wav,audio/x-wav,audio/mpeg"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {uploadState === 'uploading' && (
              <div style={{ color: 'var(--ink-400)', fontSize: 12, marginTop: 8 }}>Uploading…</div>
            )}
            {uploadState === 'success' && (
              <div style={{ color: 'oklch(0.82 0.15 150)', fontSize: 12, marginTop: 8 }}>Upload successful.</div>
            )}
            {uploadState === 'error' && (
              <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>Upload failed. Please try again.</div>
            )}
          </div>

          {/* Chorus lyrics */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="eyebrow">Chorus lyrics</div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Visible during preview</span>
            </div>
            <textarea
              value={chorusLyrics}
              onChange={e => { setChorusLyrics(e.target.value); debouncedPatch('chorus', { chorus_lyrics: e.target.value }); }}
              onBlur={() => { clearTimeout(saveTimers.current['chorus']); patchOrder({ chorus_lyrics: chorusLyrics }); }}
              placeholder="Chorus lyrics visible to the customer during review…"
              rows={5}
              className="textarea"
              style={{ fontStyle: 'italic', minHeight: 100 }}
            />
          </div>

          {/* Full lyrics */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="eyebrow">Full lyrics</div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Locked until payment</span>
            </div>
            <textarea
              value={fullLyrics}
              onChange={e => { setFullLyrics(e.target.value); debouncedPatch('full', { full_lyrics: e.target.value }); }}
              onBlur={() => { clearTimeout(saveTimers.current['full']); patchOrder({ full_lyrics: fullLyrics }); }}
              placeholder={'[Verse 1]\n…\n\n[Chorus]\n…\n\n[Verse 2]\n…'}
              rows={10}
              className="textarea"
              style={{ minHeight: 200 }}
            />
          </div>

          {/* Message to customer */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Message to customer</div>
            <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: '0 0 8px' }}>
              Explain your creative choices. Sent with the preview.
            </p>
            <textarea
              value={producerMessage}
              onChange={e => { setProducerMessage(e.target.value); debouncedPatch('msg', { producer_message: e.target.value }); }}
              onBlur={() => { clearTimeout(saveTimers.current['msg']); patchOrder({ producer_message: producerMessage }); }}
              placeholder="Hi — a few notes on the creative choices…"
              rows={5}
              className="textarea"
              style={{ minHeight: 100 }}
            />
          </div>

          {/* Send for review */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 16,
              borderTop: '1px solid var(--glass-border)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
              Requires: song uploaded · chorus lyrics · full lyrics.
            </div>
            <button
              onClick={() => !alreadySent && handleStatusChange('awaiting_review')}
              disabled={!canSendForReview || sendingReview || alreadySent}
              className={`btn ${canSendForReview && !alreadySent ? 'btn-primary' : 'btn-ghost'}`}
            >
              {alreadySent
                ? 'Sent for review'
                : sendingReview
                  ? 'Sending…'
                  : order.status === 'revision_requested'
                    ? 'Re-deliver →'
                    : 'Send for review →'}
            </button>
          </div>

          {/* Download unlock — shown when customer has approved */}
          {order.status === 'approved' && (
            <div
              style={{
                padding: '16px 20px',
                background: order.download_unlocked ? 'rgba(80,220,120,0.08)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${order.download_unlocked ? 'rgba(80,220,120,0.3)' : 'var(--glass-border)'}`,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 10 }}>Download unlock</div>
              {order.download_unlocked ? (
                <div style={{ color: 'oklch(0.82 0.15 150)', fontSize: 14 }}>
                  Download unlocked — customer can download and see full lyrics.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-400)' }}>
                    Customer has approved. Unlock after confirming payment.
                  </div>
                  <button
                    onClick={() => patchOrder({ download_unlocked: true })}
                    disabled={saving}
                    className="btn btn-primary btn-sm"
                  >
                    {saving ? 'Saving…' : 'Unlock download'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delivery URL — shown once token exists */}
          {order.delivery_token && (
            <div
              style={{
                marginTop: 8,
                padding: '16px 18px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 10 }}>Customer delivery link</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--ink-300)',
                    background: 'rgba(0,0,0,0.22)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {deliveryUrl(order.delivery_token)}
                </div>
                <button
                  onClick={() => copyDeliveryUrl(order.delivery_token!)}
                  className="btn btn-ghost"
                  style={{
                    color: urlCopied ? 'oklch(0.82 0.15 150)' : undefined,
                    background: urlCopied ? 'rgba(80,220,120,0.15)' : undefined,
                  }}
                >
                  {urlCopied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 8 }}>
                Send this link to the customer. They can use it to preview and approve their song.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-save indicator */}
      {saving && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontSize: 12,
            color: 'var(--ink-400)',
          }}
        >
          Saving…
        </div>
      )}
    </div>
  );
}
