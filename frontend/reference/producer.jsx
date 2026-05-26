// producer.jsx — Producer / studio workspace

const QUEUE = [
  { id: 'SG-4192', client: 'Daniel R.', for: 'Maggie', occ: 'Wedding', vibe: 'Nostalgic · Folk', due: 'Today', status: 'In progress', active: true },
  { id: 'SG-4188', client: 'Carmen V.', for: 'Liliana', occ: 'Graduation', vibe: 'Uplifting · Soul', due: 'Tomorrow', status: 'Drafting' },
  { id: 'SG-4183', client: 'Theo K.', for: 'Marcus & Sara', occ: 'Wedding', vibe: 'Tear-jerker · Piano', due: 'Fri, May 22', status: 'In revision' },
  { id: 'SG-4179', client: 'Pat M.', for: 'Joaquin', occ: 'Graduation', vibe: 'Energetic · Folk', due: 'Sat, May 23', status: 'Drafting' },
  { id: 'SG-4172', client: 'Lori D.', for: 'Maeve', occ: 'Wedding', vibe: 'Peaceful · Piano', due: 'Mon, May 25', status: 'Brief received' },
];

function Producer({ data }) {
  const [tab, setTab] = useState('brief'); // brief, deliver
  const [activeOrder, setActiveOrder] = useState('SG-4192');
  const [audio, setAudio] = useState(null); // {name, size}
  const [chorus, setChorus] = useState("And every Sunday in the garden,\nyou were laughing at the rain —\nI'll be there for every season,\nand I'll know you all the same.");
  const [full, setFull] = useState("");
  const [msg, setMsg] = useState("");
  const [internal, setInternal] = useState("Capo 2. Demo in C, retune cello. Daniel mentioned 'porch light' twice — anchor verse 2.");
  const [sent, setSent] = useState(false);

  const order = QUEUE.find(q => q.id === activeOrder) || QUEUE[0];
  const customerName = data?.name || order.for;

  return (
    <div className="shell shell-wide" style={{ paddingTop: 28 }}>
      {/* Header */}
      <div className="between" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Studio · Producer console</div>
          <h1 className="display" style={{ fontSize: 32, margin: 0 }}>
            Order <span style={{ color: 'var(--accent-400)' }}>#{order.id}</span> · {order.for}
          </h1>
          <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
            {order.client} · {order.occ} · {order.vibe} · Due <b style={{ color: 'var(--ink-50)' }}>{order.due}</b>
          </div>
        </div>
        <div className="row">
          <div className="badge warn"><span className="pip"></span>{order.status}</div>
          <button className="btn btn-ghost btn-sm">Save draft</button>
        </div>
      </div>

      <div className="producer-grid">
        {/* Main */}
        <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div className="tabs">
              <span className={`tab ${tab === 'brief' ? 'active' : ''}`} onClick={() => setTab('brief')}>Customer brief</span>
              <span className={`tab ${tab === 'deliver' ? 'active' : ''}`} onClick={() => setTab('deliver')}>Upload & deliver</span>
            </div>
            {sent && tab === 'deliver' && (
              <div className="badge success"><span className="pip"></span>Sent for review</div>
            )}
          </div>

          {tab === 'brief' && (
            <div style={{ padding: 'clamp(18px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Voice memo from customer</div>
                <AudioPlayer title="Daniel R. — 'About Maggie'" subtitle="1:32 · Recorded May 17" duration={92} />
                <div style={{ marginTop: 16, padding: '18px 22px', background: 'rgba(0,0,0,0.22)', borderRadius: 14, borderLeft: '2px solid var(--glass-border)' }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Auto-transcript</div>
                  <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.65, fontStyle: 'italic' }}>
                    {data?.story || `"Okay — so Maggie. She's the oldest, and she's the one who basically organized our whole family ever since her mom passed. She used to bake cinnamon bread on Sundays — the whole house smelled like it before anyone was awake. There was this garden behind the old house in Maine. She'd be out there in her yellow coat before the sun was even up, on her knees, just… happy. Jonathan's a good man. He sees her the way I see her, which is most of what I ever wanted for her. The line I keep thinking is — I'll know you all the same. That's it. That's the whole thing."`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <BriefCell label="Occasion" value={order.occ} />
                <BriefCell label="Event date" value={data?.date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) || 'Sun, Jun 14'} />
                <BriefCell label="For" value={`${customerName}`} sub={data?.relationship || 'Father of the bride'} />
                <BriefCell label="Feeling" value="Nostalgic & Sweet" sub={data?.feelingNote || 'Tear-jerker okay but warm'} />
                <BriefCell label="Style" value="Folk / Country" sub={data?.styleNote || 'Avett Brothers vibe'} />
                <BriefCell label="Length target" value="2:30 – 3:00" />
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Additional notes</div>
                <p style={{ margin: 0, color: 'var(--ink-200)', fontSize: 15, lineHeight: 1.6 }}>
                  Will play during the father-of-the-bride moment, in a barn venue (~150 people). PA system confirmed. Customer wants chorus simple enough to be hummed back by guests.
                </p>
              </div>
            </div>
          )}

          {tab === 'deliver' && (
            <div style={{ padding: 'clamp(18px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 26 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Final audio file</div>
                <p className="muted tiny" style={{ margin: '0 0 12px' }}>WAV or MP3. Watermark is applied automatically for the customer preview.</p>
                <div
                  className={`dropzone ${audio ? 'has-file' : ''}`}
                  onClick={() => setAudio({ name: "maggies-garden-master-v3.wav", size: "38.2 MB", duration: 162 })}>
                  {!audio && (
                    <React.Fragment>
                      <Icon.Upload />
                      <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink-50)' }}>
                        Drag your master here
                      </div>
                      <div className="muted tiny" style={{ marginTop: 6 }}>
                        or click to browse · WAV 24-bit preferred · watermark auto-applied to preview
                      </div>
                    </React.Fragment>
                  )}
                  {audio && (
                    <div style={{ textAlign: 'left' }}>
                      <div className="between" style={{ marginBottom: 12 }}>
                        <div>
                          <div style={{ color: 'var(--ink-50)', fontWeight: 500 }}>{audio.name}</div>
                          <div className="muted tiny" style={{ marginTop: 2 }}>{audio.size} · 2:42 · Watermark preview generated</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setAudio(null); }}>Replace</button>
                      </div>
                      <AudioPlayer title="maggies-garden-master-v3" subtitle="Master · clean" duration={162} compact />
                    </div>
                  )}
                </div>
              </div>

              <div className="field">
                <div className="between">
                  <label className="field-label">Chorus lyrics (preview)</label>
                  <span className="muted tiny" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon.Check /> Visible during review
                  </span>
                </div>
                <textarea className="textarea" style={{ minHeight: 110, fontFamily: 'var(--font-display)', fontSize: 17, fontStyle: 'italic' }}
                          value={chorus} onChange={e => setChorus(e.target.value)} />
              </div>

              <div className="field">
                <div className="between">
                  <label className="field-label">Full lyrics</label>
                  <span className="muted tiny" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon.Lock /> Locked until payment
                  </span>
                </div>
                <textarea className="textarea" style={{ minHeight: 200, fontFamily: 'var(--font-display)', fontSize: 16 }}
                          placeholder={"[Verse 1]\nEight years old in a yellow coat,\nyou taught me how to throw a curve,\n…\n\n[Chorus]\n…\n\n[Verse 2]\n…"}
                          value={full} onChange={e => setFull(e.target.value)} />
              </div>

              <div className="field">
                <label className="field-label">Message to customer</label>
                <p className="muted tiny" style={{ margin: '0 0 4px' }}>Explain your creative choices. Sent with the preview.</p>
                <textarea className="textarea" style={{ minHeight: 120 }}
                          placeholder="Hi — a few notes on the creative choices…"
                          value={msg} onChange={e => setMsg(e.target.value)} />
              </div>

              <div className="between" style={{ paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                <div className="muted tiny">
                  When you send, the customer receives an email and the order moves to <b style={{ color: 'var(--ink-50)' }}>Awaiting review</b>.
                </div>
                <button className="btn btn-primary" disabled={!audio || !chorus.trim() || !full.trim()}
                        onClick={() => setSent(true)}>
                  Send for review <Icon.Arrow />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass" style={{ padding: '18px 8px 14px' }}>
            <div className="between" style={{ padding: '0 14px 12px' }}>
              <div className="eyebrow">Queue · 5 active</div>
              <span className="muted tiny">Sorted by due</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {QUEUE.map(q => (
                <div key={q.id}
                     className={`queue-item ${q.id === activeOrder ? 'active' : ''}`}
                     onClick={() => setActiveOrder(q.id)}>
                  <div className="between" style={{ marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-400)', letterSpacing: '0.04em' }}>{q.id}</span>
                    <span className="muted tiny">{q.due}</span>
                  </div>
                  <div style={{ color: 'var(--ink-50)', fontSize: 14, fontWeight: 500 }}>{q.for}</div>
                  <div className="muted tiny">{q.occ} · {q.vibe}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: 20 }}>
            <div className="between" style={{ marginBottom: 10 }}>
              <div className="eyebrow">Internal notes</div>
              <span className="muted tiny">Private</span>
            </div>
            <textarea className="textarea" style={{ minHeight: 160, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.5 }}
                      value={internal} onChange={e => setInternal(e.target.value)}
                      placeholder="Scratchpad. Only the studio sees this." />
          </div>

          <div className="glass" style={{ padding: 20, background: 'rgba(0,0,0,0.18)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>This week</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Stat label="Delivered" value="12" />
              <Stat label="In progress" value="5" />
              <Stat label="Avg. turnaround" value="2.1d" />
              <Stat label="Revisions" value="1.3" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BriefCell({ label, value, sub }) {
  return (
    <div style={{ padding: 16, background: 'rgba(0,0,0,0.18)', borderRadius: 14, border: '1px solid var(--glass-border)' }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ color: 'var(--ink-50)', fontSize: 15, fontWeight: 500 }}>{value}</div>
      {sub && <div className="muted tiny" style={{ marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink-50)' }}>{value}</div>
      <div className="muted tiny" style={{ marginTop: 2 }}>{label}</div>
    </div>
  );
}

window.Producer = Producer;
