// intake.jsx — 5-step intake (with intro screen)

const FEELINGS = [
  { id: 'uplifting', label: 'Uplifting & Joyful', hint: 'Hands in the air, big smiles' },
  { id: 'nostalgic', label: 'Nostalgic & Sweet', hint: 'Soft, warm, looking back' },
  { id: 'tearjerker', label: 'Tear-jerker', hint: 'The first-dance kind of cry' },
  { id: 'peaceful', label: 'Peaceful & Reflective', hint: 'Quiet, grateful, still' },
  { id: 'energetic', label: 'Fun & Energetic', hint: 'Pulls everyone onto the floor' },
];
const STYLES = [
  { id: 'acoustic', label: 'Acoustic Singer-Songwriter' },
  { id: 'piano', label: 'Piano Ballad' },
  { id: 'folk', label: 'Folk / Country' },
  { id: 'soul', label: 'Classic Soul' },
  { id: 'producer', label: 'Leave it to the producer' },
];

const STEPS = ['Occasion', 'Vibe', 'Story', 'Review', 'Checkout'];

function ProgressBar({ step }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  return (
    <div className="progress">
      <div className="progress-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="eyebrow">Step <b style={{ color: 'var(--ink-50)' }}>{step + 1}</b> of {STEPS.length}</span>
          <span className="muted" style={{ fontSize: 13 }}>· {STEPS[step]}</span>
        </div>
        <div className="muted tiny" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.Lock /> No charge until you approve
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function StepHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 36 }} className="fade-up">
      <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>
      <h2 className="display" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', margin: '0 0 14px' }}>
        {title}
      </h2>
      {sub && <p style={{ margin: 0, fontSize: 17, color: 'var(--ink-400)', maxWidth: 560, lineHeight: 1.55 }}>{sub}</p>}
    </div>
  );
}

function NavRow({ back, next, nextLabel = 'Continue', nextDisabled }) {
  return (
    <div className="between" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--glass-border)' }}>
      <button className="btn btn-ghost" onClick={back}><Icon.ArrowLeft /> Back</button>
      <button className="btn btn-primary" onClick={next} disabled={nextDisabled}>
        {nextLabel} <Icon.Arrow />
      </button>
    </div>
  );
}

// ─── Intro ─────────────────────────────────────────────────────────
function IntakeIntro({ start }) {
  return (
    <div className="shell shell-narrow fade-up" style={{ paddingTop: 80, textAlign: 'center' }}>
      <div className="feature-icon" style={{ margin: '0 auto 28px', width: 64, height: 64, borderRadius: 18 }}>
        <Icon.Heart />
      </div>
      <h1 className="display" style={{ fontSize: 'clamp(38px, 5vw, 58px)', margin: '0 0 22px', lineHeight: 1.05 }}>
        Let's create <em>something special</em>.
      </h1>
      <p style={{ fontSize: 18, color: 'var(--ink-200)', lineHeight: 1.6, maxWidth: 540, margin: '0 auto 40px' }}>
        We're going to ask you a few questions about your person and the moment you're celebrating. Take your time. Speak from the heart. We'll handle the rest.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 36 }}>
        <button className="btn btn-primary btn-lg" onClick={start}>
          Begin <Icon.Arrow />
        </button>
      </div>
      <div className="muted tiny" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Icon.Clock /> About 6 minutes · You can save and come back
      </div>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────
function Step1({ data, set, next, back }) {
  const ok = data.occasion && data.date && data.name && data.relationship;
  return (
    <div className="shell shell-narrow fade-up" style={{ paddingTop: 48 }}>
      <StepHeader eyebrow="Step 1 of 5" title="Who is this for?" sub="A few basics so we know the room we're writing for." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div className="field">
          <label className="field-label">Occasion</label>
          <div className="row">
            {[
              { id: 'wedding', label: 'Wedding', icon: <Icon.Heart /> },
              { id: 'graduation', label: 'Graduation', icon: <Icon.Sparkle /> },
            ].map(o => (
              <button key={o.id}
                className={`chip ${data.occasion === o.id ? 'active' : ''}`}
                style={{ padding: '14px 22px', fontSize: 15 }}
                onClick={() => set({ occasion: o.id })}>
                {o.icon} {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">When is the event?</label>
          <MiniCalendar value={data.date} onChange={(d) => set({ date: d })} />
          {data.date && (
            <div className="muted tiny" style={{ marginTop: 6 }}>
              Event date set to <b style={{ color: 'var(--ink-50)' }}>{data.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</b>
            </div>
          )}
        </div>

        <div className="field">
          <label className="field-label">Their name</label>
          <input className="input" placeholder="e.g. Maggie" value={data.name || ''} onChange={(e) => set({ name: e.target.value })} />
        </div>

        <div className="field">
          <label className="field-label">Your relationship to them</label>
          <input className="input" placeholder="e.g. Father of the bride" value={data.relationship || ''} onChange={(e) => set({ relationship: e.target.value })} />
        </div>
      </div>
      <NavRow back={back} next={next} nextDisabled={!ok} />
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────
function Step2({ data, set, next, back }) {
  return (
    <div className="shell shell-narrow fade-up" style={{ paddingTop: 48 }}>
      <StepHeader eyebrow="Step 2 of 5" title="What should it feel like?" sub="Pick the feeling and the sound. There are no wrong answers." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="field">
          <label className="field-label">Feeling</label>
          <div className="row">
            {FEELINGS.map(f => (
              <button key={f.id}
                className={`chip ${data.feeling === f.id ? 'active' : ''}`}
                style={{ padding: '12px 18px', flexDirection: 'column', alignItems: 'flex-start', gap: 4, borderRadius: 14 }}
                onClick={() => set({ feeling: f.id })}>
                <span style={{ fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{f.hint}</span>
              </button>
            ))}
          </div>
          <input
            className="input"
            style={{ marginTop: 14 }}
            placeholder="Add more details or an example (optional)"
            value={data.feelingNote || ''}
            onChange={(e) => set({ feelingNote: e.target.value })} />
        </div>

        <div className="field">
          <label className="field-label">Musical style</label>
          <div className="row">
            {STYLES.map(s => (
              <button key={s.id}
                className={`chip ${data.style === s.id ? 'active' : ''}`}
                onClick={() => set({ style: s.id })}>
                {s.label}
              </button>
            ))}
          </div>
          <textarea
            className="textarea"
            style={{ marginTop: 14 }}
            placeholder="Give us an example artist or song (optional) — e.g. 'Something like The Avett Brothers, or Norah Jones meets James Taylor'"
            value={data.styleNote || ''}
            onChange={(e) => set({ styleNote: e.target.value })} />
        </div>
      </div>
      <NavRow back={back} next={next} nextDisabled={!data.feeling || !data.style} />
    </div>
  );
}

// ─── Step 3 — Story / Voice ──────────────────────────────────────
function Step3({ data, set, next, back }) {
  return (
    <div className="shell shell-narrow fade-up" style={{ paddingTop: 48 }}>
      <StepHeader
        eyebrow="Step 3 of 5"
        title="Tell us about them."
        sub="The memories, the inside jokes, the moments that make them them. Speak it — we hear so much in your voice. Or type, if you prefer." />

      <VoiceRecorder value={data.voice} onChange={(v) => set({ voice: v })} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0 20px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
        <span className="muted tiny" style={{ letterSpacing: '0.08em' }}>OR TYPE INSTEAD</span>
        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
      </div>

      <div className="field">
        <label className="field-label">In your own words (optional)</label>
        <textarea
          className="textarea"
          style={{ minHeight: 160 }}
          placeholder="The summer she taught me to ride a bike. The way she still calls me 'kiddo'. The garden behind the old house in Maine…"
          value={data.story || ''}
          onChange={(e) => set({ story: e.target.value })} />
        <div className="muted tiny" style={{ marginTop: 4 }}>
          {(data.story || '').length} characters · Anything is helpful, even fragments.
        </div>
      </div>

      <NavRow back={back} next={next} nextDisabled={!data.voice && !(data.story || '').trim()} />
    </div>
  );
}

// ─── Step 4 — Review ─────────────────────────────────────────────
function Step4({ data, set, next, back, goStep }) {
  const feeling = FEELINGS.find(f => f.id === data.feeling)?.label;
  const style = STYLES.find(s => s.id === data.style)?.label;
  const fmtDate = data.date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const Row = ({ label, value, onEdit }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, padding: '18px 0', borderTop: '1px solid var(--glass-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
        <div style={{ color: 'var(--ink-50)', fontSize: 16, lineHeight: 1.5 }}>{value}</div>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onEdit}><Icon.Edit /> Edit</button>
    </div>
  );

  return (
    <div className="shell shell-narrow fade-up" style={{ paddingTop: 48 }}>
      <StepHeader eyebrow="Step 4 of 5" title="Does this feel right?" sub="A quick look before we hand it to the producer." />
      <div className="glass" style={{ padding: '4px 26px 26px' }}>
        <Row label="Occasion" value={`${data.occasion === 'wedding' ? 'Wedding' : 'Graduation'} · ${fmtDate}`} onEdit={() => goStep(1)} />
        <Row label="For" value={<span><b>{data.name}</b> · <span className="muted">{data.relationship}</span></span>} onEdit={() => goStep(1)} />
        <Row label="Feeling" value={<span>{feeling}{data.feelingNote && <span className="muted"> · "{data.feelingNote}"</span>}</span>} onEdit={() => goStep(2)} />
        <Row label="Musical style" value={<span>{style}{data.styleNote && <div className="muted" style={{ fontSize: 14, marginTop: 4, fontStyle: 'italic' }}>"{data.styleNote}"</div>}</span>} onEdit={() => goStep(2)} />
        <Row label="Your story" value={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.voice && <div className="badge success" style={{ alignSelf: 'flex-start' }}><span className="pip"></span>Voice recording · {Math.floor(data.voice.duration/60)}:{String(data.voice.duration%60).padStart(2,'0')}</div>}
            {data.story && <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ink-200)' }}>"{data.story.length > 220 ? data.story.slice(0, 220) + '…' : data.story}"</div>}
            {!data.voice && !data.story && <span className="muted">No story added</span>}
          </div>
        } onEdit={() => goStep(3)} />
      </div>
      <NavRow back={back} next={next} nextLabel="Go to checkout" />
    </div>
  );
}

// ─── Step 5 — Checkout ────────────────────────────────────────────
function Step5({ data, set, submit, back }) {
  const [email, setEmail] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const valid = email.includes('@') && cardName && cardNum.replace(/\s/g,'').length >= 12 && exp && cvc;

  return (
    <div className="shell shell-narrow fade-up" style={{ paddingTop: 48 }}>
      <StepHeader eyebrow="Step 5 of 5" title="Hold your spot." sub="One last thing — we'll secure your slot with a card. No charge until you approve the final song." />

      <div className="glass" style={{ padding: 26, marginBottom: 24, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div className="feature-icon" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, animation: 'none' }}>
          <Icon.Lock />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink-50)', marginBottom: 6 }}>
            You won't be charged today.
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-400)', lineHeight: 1.55 }}>
            We'll place a $99 hold on your card to confirm your order. You'll only be charged when you approve and download the final song. One revision is included.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="field">
          <label className="field-label">Email address</label>
          <div style={{ position: 'relative' }}>
            <Icon.Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }} />
            <input className="input" style={{ paddingLeft: 42 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="muted tiny" style={{ marginTop: 4 }}>We'll send the preview here.</div>
        </div>

        <div className="field">
          <label className="field-label">Cardholder name</label>
          <input className="input" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Card details</label>
          <div style={{ position: 'relative' }}>
            <Icon.Card style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }} />
            <input className="input" style={{ paddingLeft: 42 }} placeholder="1234 1234 1234 1234"
                   value={cardNum}
                   onChange={e => setCardNum(e.target.value.replace(/[^0-9 ]/g,'').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0,19))} />
          </div>
          <div className="split-row" style={{ marginTop: 10 }}>
            <input className="input" placeholder="MM / YY" value={exp} onChange={e => setExp(e.target.value)} />
            <input className="input" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g,'').slice(0,4))} />
          </div>
        </div>

        <div className="glass" style={{ padding: 20, background: 'rgba(0,0,0,0.18)' }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <span className="muted">Custom song · 1 free revision</span>
            <span style={{ color: 'var(--ink-50)' }}>$99.00</span>
          </div>
          <div className="between">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-50)' }}>Charged on approval</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--accent-400)' }}>$99.00</span>
          </div>
        </div>
      </div>

      <div className="between" style={{ marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={back}><Icon.ArrowLeft /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={submit} disabled={!valid}>
          Submit order <Icon.Arrow />
        </button>
      </div>
      <div className="muted tiny" style={{ textAlign: 'center', marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon.Lock /> Encrypted and secure · No charge until you approve
      </div>
    </div>
  );
}

// ─── Top-level intake ───────────────────────────────────────────
function Intake({ go, data, setData }) {
  const [step, setStep] = useState(-1); // -1 = intro
  const set = (patch) => setData(d => ({ ...d, ...patch }));
  const back = () => {
    if (step === 0) setStep(-1);
    else if (step === -1) go('landing');
    else setStep(s => s - 1);
  };
  const next = () => setStep(s => s + 1);
  const goStep = (n) => setStep(n);

  if (step === -1) {
    return <IntakeIntro start={() => setStep(0)} />;
  }

  return (
    <React.Fragment>
      <ProgressBar step={step} />
      {step === 0 && <Step1 data={data} set={set} next={next} back={back} />}
      {step === 1 && <Step2 data={data} set={set} next={next} back={back} />}
      {step === 2 && <Step3 data={data} set={set} next={next} back={back} />}
      {step === 3 && <Step4 data={data} set={set} next={next} back={back} goStep={goStep} />}
      {step === 4 && <Step5 data={data} set={set} submit={() => go('dashboard')} back={back} />}
    </React.Fragment>
  );
}

window.Intake = Intake;
