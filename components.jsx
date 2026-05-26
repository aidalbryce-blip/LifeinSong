// components.jsx — shared primitives + icons + small UI parts
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ─── Icons ─────────────────────────────────────────────────────────
const Icon = {
  Mic: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>),
  MicLg: (p) => (<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>),
  Play: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}><path d="M8 5.14v13.72L19 12 8 5.14z"/></svg>),
  Pause: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>),
  Stop: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...p}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>),
  Heart: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  Speaker: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5 10 17.5 19 7"/></svg>),
  Arrow: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>),
  ArrowLeft: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>),
  Lock: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>),
  Download: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>),
  Edit: (p) => (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>),
  Upload: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>),
  Cal: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>),
  X: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>),
  Music: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>),
  Card: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20"/></svg>),
  Mail: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>),
  Sparkle: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m5.6 5.6 2.1 2.1"/><path d="m16.3 16.3 2.1 2.1"/><path d="m5.6 18.4 2.1-2.1"/><path d="m16.3 7.7 2.1-2.1"/></svg>),
};

// ─── Ambient orbs ─────────────────────────────────────────────────
function Ambient() {
  return (
    <React.Fragment>
      <div className="ambient">
        <div className="orb a"></div>
        <div className="orb b"></div>
        <div className="orb c"></div>
      </div>
      <div className="grain"></div>
    </React.Fragment>
  );
}

// ─── Top Nav ──────────────────────────────────────────────────────
function Nav({ route, go }) {
  const links = [
    { key: 'landing', label: 'Home' },
    { key: 'intake', label: 'Order' },
    { key: 'dashboard', label: 'My Song' },
    { key: 'producer', label: 'Studio' },
  ];
  return (
    <nav className="nav">
      <a className="brand" onClick={() => go('landing')} style={{ cursor: 'pointer' }}>
        <span className="dot"></span>
        Life <span style={{ fontStyle: 'italic', color: 'var(--accent-400)', margin: '0 4px' }}>in</span> Song
      </a>
      <div className="nav-links">
        {links.map(l => (
          <span key={l.key}
                className={`nav-link ${route === l.key ? 'active' : ''}`}
                onClick={() => go(l.key)}>{l.label}</span>
        ))}
      </div>
    </nav>
  );
}

// ─── Waveform (decorative, 36 bars) ──────────────────────────────
function Waveform({ playing, bars = 48 }) {
  const heights = useMemo(
    () => Array.from({ length: bars }, (_, i) => {
      // pseudo-music shape, deterministic
      const x = i / bars;
      const v = Math.sin(x * 12) * 0.4 + Math.sin(x * 5.5) * 0.3 + Math.sin(x * 22) * 0.2 + 0.6;
      return Math.max(0.15, Math.min(1, v));
    }),
    [bars]
  );
  return (
    <div className={`wave ${playing ? 'playing' : ''}`}>
      {heights.map((h, i) => (
        <span key={i} style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}

// ─── Audio player (simulated) ────────────────────────────────────
function AudioPlayer({ title, subtitle, duration = 162, watermark = false, compact = false }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const ref = useRef();
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos(p => {
        if (p >= duration) { setPlaying(false); return 0; }
        return p + 0.5;
      });
    }, 500);
    return () => clearInterval(t);
  }, [playing, duration]);
  const fmt = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  if (compact) {
    return (
      <div className="player" style={{ padding: '12px 14px', gap: 12 }}>
        <button className="play-btn" style={{ width: 38, height: 38 }} onClick={() => setPlaying(p => !p)}>
          {playing ? <Icon.Pause /> : <Icon.Play />}
        </button>
        <div className="player-track">
          <div className="player-bar"><div className="player-fill" style={{ width: `${(pos/duration)*100}%` }} /></div>
          <div className="player-meta"><span>{fmt(pos)}</span><span>{fmt(duration)}</span></div>
        </div>
      </div>
    );
  }
  return (
    <div className="player">
      <button className="play-btn" onClick={() => setPlaying(p => !p)}>
        {playing ? <Icon.Pause /> : <Icon.Play />}
      </button>
      <div className="player-track">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--ink-50)', fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            {subtitle && <div className="muted tiny" style={{ marginTop: 2 }}>{subtitle}</div>}
          </div>
          {watermark && (
            <div className="badge" style={{ flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-400)' }}></span>
              Preview · watermarked
            </div>
          )}
        </div>
        <Waveform playing={playing} />
        <div className="player-meta"><span>{fmt(pos)}</span><span>{fmt(duration)}</span></div>
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────
function MiniCalendar({ value, onChange }) {
  // Always start on the month containing today (May 2026)
  const today = new Date(2026, 4, 19);
  const [view, setView] = useState({ y: 2026, m: 5 }); // June default (wedding season)
  const monthName = new Date(view.y, view.m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  return (
    <div className="glass" style={{ padding: 18, borderRadius: 14 }}>
      <div className="date-head">
        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}
          onClick={() => setView(v => ({ y: v.m === 0 ? v.y - 1 : v.y, m: v.m === 0 ? 11 : v.m - 1 }))}>‹</button>
        <b style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-display)', fontSize: 16 }}>{monthName}</b>
        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}
          onClick={() => setView(v => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }))}>›</button>
      </div>
      <div className="dow">
        {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="date-grid">
        {cells.map((d, i) => {
          if (d === null) return <span key={i}></span>;
          const date = new Date(view.y, view.m, d);
          const isPast = date < today;
          const selected = value && value.getFullYear() === view.y && value.getMonth() === view.m && value.getDate() === d;
          return (
            <span key={i}
              className={`date-cell ${isPast ? 'muted' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => !isPast && onChange(date)}
              style={{ pointerEvents: isPast ? 'none' : 'auto', opacity: isPast ? 0.35 : 1 }}>
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recorder (simulated) ────────────────────────────────────────
function VoiceRecorder({ value, onChange }) {
  const [state, setState] = useState(value ? 'recorded' : 'idle'); // idle, recording, recorded
  const [elapsed, setElapsed] = useState(value?.duration || 0);
  const ref = useRef();
  useEffect(() => {
    if (state !== 'recording') return;
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(ref.current);
  }, [state]);
  const start = () => { setElapsed(0); setState('recording'); };
  const stop = () => {
    setState('recorded');
    onChange({ duration: elapsed });
  };
  const retake = () => { setState('idle'); setElapsed(0); onChange(null); };
  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="recorder">
      {state === 'idle' && (
        <React.Fragment>
          <button className="mic" onClick={start} aria-label="Start recording">
            <Icon.MicLg />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div className="display" style={{ fontSize: 22, marginBottom: 6 }}>
              Tap to start recording
            </div>
            <div className="muted tiny">Speak naturally. Aim for 1–3 minutes.</div>
          </div>
        </React.Fragment>
      )}
      {state === 'recording' && (
        <React.Fragment>
          <button className="mic recording" onClick={stop} aria-label="Stop recording">
            <Icon.Stop />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, letterSpacing: '0.04em', color: 'var(--ink-50)' }}>
              {fmt(elapsed)}
            </div>
            <div className="muted tiny" style={{ marginTop: 6 }}>Recording. Tap to stop.</div>
          </div>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <Waveform playing={true} bars={36} />
          </div>
        </React.Fragment>
      )}
      {state === 'recorded' && (
        <React.Fragment>
          <div className="badge success" style={{ alignSelf: 'center' }}>
            <span className="pip"></span>Recorded · {fmt(elapsed)}
          </div>
          <div style={{ width: '100%' }}>
            <AudioPlayer title="Your story" subtitle="Voice memo" duration={elapsed || 92} compact />
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={retake}>Retake</button>
            <button className="btn btn-ghost btn-sm" onClick={start}>Add another</button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// Export
Object.assign(window, { Icon, Ambient, Nav, Waveform, AudioPlayer, MiniCalendar, VoiceRecorder });
