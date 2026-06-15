import Link from 'next/link';

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5l13 6.5-13 6.5V3.5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PREP_ITEMS = [
  ['The occasion',  'Wedding or graduation, and the event date'],
  ["Who it’s for", 'Their name and your relationship to them'],
  ['The vibe',      'A feeling (joyful, nostalgic, etc.) and a musical style'],
  ['Their story',   'A few memories or a voice note about what makes them them'],
  ['Your email',    "Where we’ll send your delivery link"],
] as const;

export default function MySongPage() {
  return (
    <div className="shell" style={{ maxWidth: 860 }}>

      {/* Come prepared */}
      <section className="fade-up" style={{ padding: '48px 0 0', maxWidth: 640 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Before you begin</div>
        <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '0 0 14px' }}>
          Come prepared with a few things.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--ink-400)', lineHeight: 1.6, margin: '0 0 28px' }}>
          The form takes about 6 minutes. Having these ready makes it even easier.
        </p>
        <div className="glass" style={{ padding: '4px 0', marginBottom: 60 }}>
          {PREP_ITEMS.map(([title, desc], i) => (
            <div
              key={title}
              style={{
                display: 'flex', gap: 16, padding: '16px 24px',
                borderBottom: i < PREP_ITEMS.length - 1 ? '1px solid var(--glass-border)' : 'none',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-500)', flexShrink: 0, marginTop: 7 }} />
              <div>
                <div style={{ fontSize: 15, color: 'var(--ink-50)', fontWeight: 500, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-400)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="fade-up" style={{ padding: '0 0 60px', maxWidth: 640 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>What happens next</div>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: '0 0 18px' }}>
          Your song is on its way.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-400)', lineHeight: 1.6, margin: 0 }}>
          Here&apos;s exactly what to expect — from brief to download.
        </p>
      </section>

      {/* Journey steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>

        {/* Step 1 — We get to work */}
        <div className="glass" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-500)', marginBottom: 12 }}>01</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
            We get to work
          </h2>
          <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            Your brief is in our hands. We match you with the right producer and start writing within 24 hours. No action needed from you — just sit tight.
          </p>
          <div className="badge">
            <span className="pip" />
            Order received · In progress
          </div>
        </div>

        {/* Step 2 — You get a delivery link */}
        <div className="glass" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-500)', marginBottom: 12 }}>02</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
            You get a delivery link
          </h2>
          <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            Within 1–3 business days, you&apos;ll receive a delivery link by email. The link goes only to you — bookmark it, you&apos;ll need it later.
          </p>
          <div className="glass" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--accent-400)', display: 'flex' }}><MailIcon /></span>
              <div>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>New message</div>
                <div style={{ color: 'var(--ink-50)', fontSize: 14 }}>Your Life in Song preview is ready</div>
              </div>
            </div>
            <span className="btn btn-primary btn-sm">Listen to your song →</span>
          </div>
        </div>

        {/* Step 3 — Listen and read the chorus */}
        <div className="glass" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-500)', marginBottom: 12 }}>03</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
            Listen and read the chorus
          </h2>
          <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            Click the link to open your private preview page. You&apos;ll hear the full song and see the chorus lyrics. Take your time — nothing is charged yet.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="player">
              <div className="play-btn" role="presentation" aria-hidden="true">
                <PlayIcon />
              </div>
              <div className="player-track">
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-50)', marginBottom: 2 }}>Your song · preview</div>
                <div className="player-bar">
                  <div className="player-fill" style={{ width: '0%' }} />
                </div>
                <div className="player-meta"><span>0:00</span><span>2:48</span></div>
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.18)', borderLeft: '1px solid var(--accent-500)' }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Chorus</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontStyle: 'italic', color: 'var(--ink-50)', lineHeight: 1.5 }}>
                &ldquo;And every Sunday in the garden,<br />
                you were laughing at the rain&nbsp;—<br />
                I&apos;ll be there for every season,<br />
                and I&apos;ll know you all the same.&rdquo;
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 — Approve or request a change */}
        <div className="glass" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-500)', marginBottom: 12 }}>04</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
            Approve or request a change
          </h2>
          <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            Love it? Hit Approve. Need something different? You get one free revision — just tell your producer what to adjust. They&apos;ll respond within 24 hours.
          </p>
          <div className="row">
            <span className="btn btn-primary btn-sm">Approve song</span>
            <span className="btn btn-ghost btn-sm">Request a change</span>
          </div>
        </div>

        {/* Step 5 — Pay and download */}
        <div className="glass" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-500)', marginBottom: 12 }}>05</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
            Pay and download
          </h2>
          <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            Once you approve, we&apos;ll email you a payment link for $99. After payment, your download unlocks immediately — full-quality WAV and MP3, plus your complete lyrics.
          </p>
          <div className="glass" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-500)', display: 'inline-block', flexShrink: 0 }} />
                Locked
              </span>
              <span style={{ color: 'var(--ink-500)', fontSize: 13 }}>→</span>
              <span className="badge success"><span className="pip" />Download unlocked</span>
            </div>
            <span className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Download Song</span>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div style={{ borderTop: '1px solid var(--glass-border)', padding: '48px 0 80px', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Haven&apos;t started yet?</div>
        <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: '0 0 28px' }}>
          Create your song — nothing charged until you approve.
        </h2>
        <Link href="/intake" className="btn btn-primary btn-lg">
          Begin your song → <ArrowIcon />
        </Link>
      </div>

    </div>
  );
}
