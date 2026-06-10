'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type Order = {
  order_id: string;
  name: string;
  occasion: string;
  event_date?: string;
  relationship?: string;
  feeling?: string;
  style?: string;
  story_text?: string;
  status: string;
  chorus_lyrics?: string;
  full_lyrics?: string;
  producer_message?: string;
  delivery_token: string;
  download_unlocked: boolean;
  has_song: boolean;
  received_at: string;
};

type ActionState = 'idle' | 'approving' | 'approved' | 'requesting' | 'revision_sent' | 'error';

const EYEBROW: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-500)',
  marginBottom: 8,
};

const GLASS_CARD: React.CSSProperties = {
  background: 'var(--glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: 16,
};

export default function ConsumerDeliveryPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BACKEND}/api/consumer/orders/${token}`)
      .then(async res => {
        if (res.status === 404) { if (!cancelled) setNotFound(true); return; }
        if (!res.ok) { if (!cancelled) setNotFound(true); return; }
        const data: Order = await res.json();
        if (!cancelled) setOrder(data);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  async function handleApprove() {
    setActionState('approving');
    try {
      const res = await fetch(`${BACKEND}/api/consumer/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        setOrder(prev => prev ? { ...prev, status: 'approved' } : prev);
        setActionState('approved');
      } else {
        setActionState('error');
      }
    } catch {
      setActionState('error');
    }
  }

  async function handleRevisionSubmit() {
    if (!revisionNote.trim()) return;
    setActionState('requesting');
    try {
      const res = await fetch(`${BACKEND}/api/consumer/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_revision', revision_note: revisionNote }),
      });
      if (res.ok) {
        setOrder(prev => prev ? { ...prev, status: 'revision_requested' } : prev);
        setActionState('revision_sent');
        setShowRevisionModal(false);
      } else {
        setActionState('error');
      }
    } catch {
      setActionState('error');
    }
  }

  function copyLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ padding: 48, color: 'var(--ink-400)', fontSize: 14 }}>Loading…</div>
    );
  }

  if (notFound || !order) {
    return (
      <div style={{ padding: 48 }}>
        <div style={{ color: '#f87171', fontSize: 18, marginBottom: 12 }}>Song not found.</div>
        <div style={{ color: 'var(--ink-400)', fontSize: 14, lineHeight: 1.6 }}>
          This link may be invalid or has already expired. Check the link sent to you by your producer.
        </div>
      </div>
    );
  }

  const isAwaiting = order.status === 'awaiting_review';
  const isApproved = order.status === 'approved';
  const isRevisionRequested = order.status === 'revision_requested';
  const isDelivered = order.status === 'delivered';

  const justApproved = actionState === 'approved';
  const justSentRevision = actionState === 'revision_sent';

  const fmtDate = order.event_date
    ? new Date(order.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--glass-border)', padding: '13px 24px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Life in Song
        </span>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px, 5vw, 40px) 24px' }}>
        {/* Status banner */}
        <div style={{ ...GLASS_CARD, padding: '22px 28px', marginBottom: 28, background: 'linear-gradient(120deg, oklch(0.55 0.18 50 / 0.18), oklch(0.4 0.1 30 / 0.1))', borderColor: 'oklch(0.6 0.16 55 / 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, color: 'var(--ink-50)', fontWeight: 600, marginBottom: 4 }}>
              {isApproved || justApproved
                ? 'Your song has been approved.'
                : isRevisionRequested || justSentRevision
                  ? 'Revision requested.'
                  : isDelivered
                    ? 'Your song has been delivered.'
                    : 'Your song is ready for review.'}
            </div>
            <div style={{ color: 'var(--ink-400)', fontSize: 14 }}>
              {isApproved || justApproved
                ? 'Your producer will email you a payment link shortly.'
                : isRevisionRequested || justSentRevision
                  ? 'Your producer will be in touch within 24 hours.'
                  : isDelivered
                    ? 'Download your files below.'
                    : 'Listen, read the chorus, and take your time. Nothing is charged until you approve.'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {(isApproved || justApproved) && (
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'oklch(0.82 0.15 150)', background: 'rgba(80,220,120,0.12)' }}>
                Approved
              </span>
            )}
            {(isRevisionRequested || justSentRevision) && (
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'oklch(0.80 0.13 65)', background: 'rgba(220,180,80,0.12)' }}>
                Revision sent · Producer responds in 24h
              </span>
            )}
            {isAwaiting && !justApproved && !justSentRevision && (
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'oklch(0.80 0.13 65)', background: 'rgba(220,180,80,0.12)' }}>
                Awaiting your review
              </span>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 24, alignItems: 'start' }}>
          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Song card */}
            <div style={{ ...GLASS_CARD, padding: 'clamp(20px, 4vw, 28px)' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...EYEBROW, marginBottom: 6 }}>
                  {fmtDate ? `For ${order.name} · ${fmtDate}` : `For ${order.name}`}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-400)', marginTop: 4 }}>
                  {order.occasion}{order.style ? ` · ${order.style}` : ''}
                </div>
              </div>

              {order.has_song && (
                <div style={{ marginBottom: 20 }}>
                  <audio
                    controls
                    src={`${BACKEND}/api/consumer/orders/${token}/song`}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </div>
              )}

              {/* Action area */}
              {justApproved && (
                <div style={{ padding: '14px 18px', background: 'rgba(80,220,120,0.1)', border: '1px solid rgba(80,220,120,0.25)', borderRadius: 12, color: 'oklch(0.82 0.15 150)', fontSize: 14 }}>
                  You&apos;ve approved your song. Your producer will email you a payment link shortly.
                </div>
              )}

              {!justApproved && isAwaiting && !justSentRevision && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleApprove}
                    disabled={actionState === 'approving'}
                    style={{ padding: '10px 22px', background: 'var(--accent-500)', color: 'var(--bg-950)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: actionState === 'approving' ? 'not-allowed' : 'pointer' }}
                  >
                    {actionState === 'approving' ? 'Approving…' : 'Approve song'}
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 14, color: 'var(--ink-200)', cursor: 'pointer' }}
                  >
                    Request a change
                  </button>
                </div>
              )}

              {(isApproved && !justApproved) && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'oklch(0.82 0.15 150)', background: 'rgba(80,220,120,0.12)' }}>
                    Approved
                  </span>
                </div>
              )}

              {order.download_unlocked && (
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href={`${BACKEND}/api/consumer/orders/${token}/song`}
                    download="song.wav"
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 13, color: 'var(--ink-200)', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Download WAV
                  </a>
                  <a
                    href={`${BACKEND}/api/consumer/orders/${token}/song`}
                    download="song.mp3"
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 13, color: 'var(--ink-200)', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Download MP3
                  </a>
                </div>
              )}

              {actionState === 'error' && (
                <div style={{ marginTop: 12, fontSize: 13, color: '#f87171' }}>
                  Something went wrong. Please try again.
                </div>
              )}
            </div>

            {/* Lyrics card */}
            <div style={{ ...GLASS_CARD, padding: 'clamp(20px, 4vw, 28px)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-50)', margin: '0 0 4px' }}>Lyrics</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: 0 }}>
                    {order.download_unlocked
                      ? 'Full lyrics unlocked.'
                      : 'The chorus is visible during review. Full lyrics unlock when your producer releases your files.'}
                  </p>
                </div>
                {!order.download_unlocked && (
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-400)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', whiteSpace: 'nowrap' }}>
                    Full lyrics locked
                  </span>
                )}
              </div>

              {/* Chorus — always visible */}
              {order.chorus_lyrics && (
                <div style={{ padding: '18px 22px', background: 'rgba(0,0,0,0.18)', borderRadius: 14, borderLeft: '2px solid var(--accent-500)', marginBottom: 18 }}>
                  <div style={{ ...EYEBROW, marginBottom: 10 }}>Chorus</div>
                  <div style={{ fontSize: 18, color: 'var(--ink-50)', lineHeight: 1.65, fontStyle: 'italic' }}>
                    {order.chorus_lyrics.split('\n').map((line, i) => (
                      <div key={i}>{line || ' '}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full lyrics — shown or blurred */}
              {order.download_unlocked && order.full_lyrics ? (
                <div style={{ padding: '18px 22px', background: 'rgba(0,0,0,0.1)', borderRadius: 14 }}>
                  <div style={{ ...EYEBROW, marginBottom: 10 }}>Full lyrics</div>
                  <div style={{ fontSize: 16, color: 'var(--ink-50)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {order.full_lyrics}
                  </div>
                </div>
              ) : !order.download_unlocked ? (
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Blurred placeholder */}
                  <div style={{ padding: '18px 22px', background: 'rgba(0,0,0,0.1)', borderRadius: 14, filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', maskImage: 'linear-gradient(180deg, black 20%, transparent 90%)', WebkitMaskImage: 'linear-gradient(180deg, black 20%, transparent 90%)' }}>
                    <div style={{ fontSize: 16, color: 'var(--ink-50)', lineHeight: 1.65 }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>{'████████████████████'.slice(0, 14 + (i % 3) * 4)}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink-200)' }}>Full lyrics are locked.</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-500)', textAlign: 'center', maxWidth: 280 }}>
                      Your producer will release the full lyric sheet after payment.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Producer message */}
            {order.producer_message && (
              <div style={{ ...GLASS_CARD, padding: 'clamp(20px, 4vw, 28px)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-50)', margin: '0 0 16px' }}>A note from your producer</h3>
                <div style={{ fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {order.producer_message}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Order details */}
            <div style={{ ...GLASS_CARD, padding: 22 }}>
              <div style={{ ...EYEBROW, marginBottom: 16 }}>Order details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {order.occasion && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 2 }}>Occasion</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-50)' }}>{order.occasion}</div>
                    {fmtDate && <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 2 }}>{fmtDate}</div>}
                  </div>
                )}
                {order.name && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 2 }}>For</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-50)' }}>{order.name}</div>
                    {order.relationship && <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 2 }}>{order.relationship}</div>}
                  </div>
                )}
                {order.feeling && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 2 }}>Feeling</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-50)' }}>{order.feeling}</div>
                  </div>
                )}
                {order.style && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 2 }}>Style</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-50)' }}>{order.style}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Save this link */}
            <div style={{ ...GLASS_CARD, padding: 22 }}>
              <div style={{ ...EYEBROW, marginBottom: 10 }}>Save this link</div>
              <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
                Bookmark this page or save this link — you&apos;ll need it to download your files after approving.
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-400)', background: 'rgba(0,0,0,0.22)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {typeof window !== 'undefined' ? window.location.href : ''}
              </div>
              <button
                onClick={copyLink}
                style={{ width: '100%', padding: '9px 16px', background: linkCopied ? 'rgba(80,220,120,0.15)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: 8, color: linkCopied ? 'oklch(0.82 0.15 150)' : 'var(--ink-200)', fontSize: 13, cursor: 'pointer' }}
              >
                {linkCopied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Revision modal */}
      {showRevisionModal && (
        <div
          onClick={() => setShowRevisionModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ ...GLASS_CARD, background: 'var(--bg-900)', padding: 28, width: '100%', maxWidth: 480 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-50)', margin: '0 0 4px' }}>Request a change</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-400)', margin: 0 }}>
                  You have <strong style={{ color: 'var(--accent-400)' }}>1 free revision</strong> included.
                </p>
              </div>
              <button
                onClick={() => setShowRevisionModal(false)}
                style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--ink-400)', fontSize: 16, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-400)', lineHeight: 1.55, margin: '0 0 16px' }}>
              Tell your producer what to change. Be specific — a line, a tempo, a mood. The more concrete, the closer the next version will be.
            </p>
            <textarea
              value={revisionNote}
              onChange={e => setRevisionNote(e.target.value)}
              placeholder="e.g. The chorus is perfect. Could the verses be a little slower? And could we mention the dog, Buster?"
              rows={5}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.22)', border: '1px solid var(--glass-border)', borderRadius: 12, color: 'var(--ink-200)', fontSize: 14, lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', minHeight: 120 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button
                onClick={() => setShowRevisionModal(false)}
                style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--ink-400)', fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRevisionSubmit}
                disabled={!revisionNote.trim() || actionState === 'requesting'}
                style={{ padding: '9px 20px', background: revisionNote.trim() ? 'var(--accent-500)' : 'rgba(255,255,255,0.07)', color: revisionNote.trim() ? 'var(--bg-950)' : 'var(--ink-500)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: revisionNote.trim() && actionState !== 'requesting' ? 'pointer' : 'not-allowed' }}
              >
                {actionState === 'requesting' ? 'Sending…' : 'Send to producer →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
