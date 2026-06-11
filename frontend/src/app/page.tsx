import Link from 'next/link';

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5l13 6.5-13 6.5V3.5z" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 8h3l5-5v16l-5-5H3V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 6c2 1.8 2 6.2 0 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 3.5c3.5 3 3.5 9 0 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 19S2 13.5 2 7.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1C20 13.5 11 19 11 19z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 6v5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const HOW_STEPS = [
  ['01', 'Share your story',   'Tell us about the occasion, the person, and a few memories — speak it or type it.'],
  ['02', 'Pick a feeling',     "Choose a vibe and a style. Or hand it to our producers and we'll surprise you."],
  ['03', 'We make the song',   'Real songwriters write. Real musicians play. You hear a preview in 1–3 days.'],
  ['04', 'Approve & download', 'Love it? Approve to charge $99 and unlock the full audio + lyrics. Need a change? You get one free revision.'],
] as const;

export default function Home() {
  return (
    <>
      {/* Ambient background */}
      <div className="ambient">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>
      <div className="grain" />

      {/* Page content */}
      <div className="shell shell-wide" style={{ paddingTop: 60 }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="fade-up hero-grid" style={{ padding: '40px 0 80px' }}>

          {/* Left: headline + CTAs */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 28 }}>
              <span className="spark" />For weddings &amp; graduations
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(44px, 6vw, 84px)', margin: '0 0 28px' }}>
              Give them <em>a moment</em> the whole room will feel.
            </h1>
            <p style={{ fontSize: 19, color: 'var(--ink-200)', lineHeight: 1.55, margin: '0 0 36px', maxWidth: 540 }}>
              A custom song, written from your memories and produced by real musicians.
              Professionally mixed and mastered for the room. Delivered in{' '}
              <b style={{ color: 'var(--ink-50)' }}>1–3 days</b>, for{' '}
              <b style={{ color: 'var(--ink-50)' }}>$99</b>{' '}
              — with nothing charged until you love it.
            </p>
            <div className="row" style={{ gap: 14, marginBottom: 36 }}>
              <Link href="/intake" className="btn btn-primary btn-lg">
                Start your song <ArrowIcon />
              </Link>
            </div>
            <div className="row" style={{ gap: 28, color: 'var(--ink-400)', fontSize: 13 }}>
              {(['No upfront charge', '1 free revision', 'Real musicians'] as const).map(label => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CheckIcon /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: hero card — example delivered order */}
          <div className="glass" style={{ padding: 'clamp(22px, 4vw, 30px)', borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 0%, oklch(0.65 0.16 60 / 0.18), transparent 55%)', pointerEvents: 'none' }} />

            <div className="between" style={{ marginBottom: 22 }}>
              <div className="badge success"><span className="pip" />Order #SG-4192 · Delivered</div>
              <div className="eyebrow" style={{ fontSize: 10 }}>FATHER · OF · THE · BRIDE</div>
            </div>

            <div className="display" style={{ fontSize: 30, marginBottom: 6, lineHeight: 1.1 }}>
              &ldquo;Maggie&apos;s Garden&rdquo;
            </div>
            <div className="muted" style={{ fontSize: 14, marginBottom: 22 }}>
              For Maggie &amp; Jonathan · June 14, 2026 · Folk
            </div>

            {/* Static audio player mockup */}
            <div className="player">
              <div className="play-btn" role="presentation" aria-hidden="true">
                <PlayIcon />
              </div>
              <div className="player-track">
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-50)', marginBottom: 2 }}>
                  Maggie&apos;s Garden — final master
                </div>
                <div className="player-bar">
                  <div className="player-fill" style={{ width: '38%' }} />
                </div>
                <div className="player-meta">
                  <span>2:42 · A. Holloway / R. Singh</span>
                  <span>–1:40</span>
                </div>
              </div>
            </div>

            {/* Chorus preview */}
            <div style={{ marginTop: 22, padding: 18, borderRadius: 14, background: 'rgba(0,0,0,0.18)', borderLeft: '2px solid var(--accent-500)' }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Chorus</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontStyle: 'italic', color: 'var(--ink-50)', lineHeight: 1.5 }}>
                &ldquo;And every Sunday in the garden,<br />
                you were laughing at the rain —<br />
                I&apos;ll be there for every season,<br />
                and I&apos;ll know you all the same.&rdquo;
              </div>
            </div>
          </div>

        </section>

        {/* ── Features ──────────────────────────────────────────── */}
        <section style={{ padding: '40px 0 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Why families choose us</div>
            <h2 className="display" style={{ fontSize: 'clamp(32px, 4vw, 48px)', margin: 0 }}>
              A keepsake built for <em>the moment</em>, not the algorithm.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="feature-card">
              <div className="feature-icon"><SpeakerIcon /></div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)' }}>Made for the room</h3>
              <p style={{ margin: 0, color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.55 }}>
                Mixed and mastered for venue speakers — so it lands the same way on a dance floor as it does in your headphones.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><HeartIcon /></div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)' }}>Deeply personal</h3>
              <p style={{ margin: 0, color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.55 }}>
                Real producers shape your story — actual memories, names, inside jokes — into lyrics no template could touch.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ClockIcon /></div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-50)' }}>Ready in days</h3>
              <p style={{ margin: 0, color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.55 }}>
                Delivered in 1–3 business days. You&apos;ll get a preview to approve before anything is charged.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section style={{ padding: '40px 0 80px' }}>
          <div className="glass glass-pad-lg" style={{ padding: '50px 48px', borderRadius: 28 }}>
            <div className="how-grid">
              <div>
                <div className="eyebrow" style={{ marginBottom: 16 }}>How it works</div>
                <h2 className="display" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', margin: '0 0 18px' }}>
                  Four steps. <em>Then a song.</em>
                </h2>
                <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
                  You tell us about your person. We write, record, and produce. You approve. Then — and only then — you pay.
                </p>
                <Link href="/intake" className="btn btn-primary">
                  Begin your song <ArrowIcon />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {HOW_STEPS.map(([n, title, desc]) => (
                  <div key={n} style={{ display: 'flex', gap: 18, padding: '14px 0', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-400)', minWidth: 28, paddingTop: 3 }}>{n}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink-50)', marginBottom: 4 }}>{title}</div>
                      <div className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonial ───────────────────────────────────────── */}
        <section style={{ padding: '40px 0 60px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 22 }}>From the families</div>
          <blockquote style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.3, color: 'var(--ink-50)', fontStyle: 'italic' }}>
            &ldquo;She walked down the aisle and the whole room understood her in a way I couldn&apos;t have explained in a toast. The song said it for me.&rdquo;
          </blockquote>
          <div className="muted tiny" style={{ marginTop: 18, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Daniel R. · Father of the bride · Asheville, NC
          </div>
        </section>

        {/* ── Consumer delivery note ────────────────────────────── */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--glass-border)', padding: '28px 0 60px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: 0 }}>
            Received a delivery link? Click the link your producer sent you.
          </p>
        </div>

      </div>
    </>
  );
}
