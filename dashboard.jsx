// dashboard.jsx — Consumer Dashboard (review & approve)

const SONG_TITLE = "Maggie's Garden";
const PRODUCER_NAME = "Aria Holloway";
const PRODUCER_INITIALS = "AH";
const SONG_DURATION = 162;

const CHORUS = [
  "And every Sunday in the garden,",
  "you were laughing at the rain —",
  "I'll be there for every season,",
  "and I'll know you all the same."
];

const LOCKED_LYRICS = [
  ["Verse 1", [
    "Eight years old in a yellow coat,",
    "you taught me how to throw a curve,",
    "every story had a quiet moral —",
    "every promise had a word."
  ]],
  ["Verse 2", [
    "There's a porch light in the photograph,",
    "and a song you used to hum,",
    "I'll be singing it on Saturday,",
    "when you walk and the music comes."
  ]],
  ["Bridge", [
    "Time will move,",
    "and the world will turn,",
    "but a daughter and a father —",
    "we'll always know our song."
  ]],
];

function Dashboard({ go, data, approved, setApproved }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [revisionSent, setRevisionSent] = useState(false);

  const name = data?.name || 'Maggie';
  const relationship = data?.relationship || 'Father of the bride';
  const occasion = data?.occasion === 'graduation' ? 'Graduation' : 'Wedding';
  const fmtDate = data?.date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) || 'Sun, Jun 14, 2026';

  return (
    <div className="shell shell-wide" style={{ paddingTop: 36 }}>
      {/* Status banner */}
      <div className="glass fade-up" style={{
        padding: '22px 28px',
        marginBottom: 28,
        background: 'linear-gradient(120deg, oklch(0.55 0.18 50 / 0.18), oklch(0.4 0.1 30 / 0.1))',
        borderColor: 'oklch(0.6 0.16 55 / 0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="feature-icon" style={{ width: 48, height: 48, borderRadius: 14, animation: 'pulse-soft 2.6s ease-in-out infinite' }}>
            <Icon.Music />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-50)', lineHeight: 1.15 }}>
              {approved ? "Your song is yours." : "Your song is ready for review."}
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
              {approved
                ? "Downloaded and unlocked. The full lyric sheet was emailed to you."
                : "Listen with someone you love. Take your time. Nothing is charged until you approve."}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="badge"><span className="pip"></span>Order #SG-{Math.floor(4000 + Math.random() * 1000)}</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Song */}
          <div className="glass" style={{ padding: "clamp(20px, 4vw, 30px)" }}>
            <div className="between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>For {name} · {fmtDate}</div>
                <h2 className="display" style={{ fontSize: 34, margin: 0 }}>"{SONG_TITLE}"</h2>
                <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
                  2:42 · Folk · Produced by {PRODUCER_NAME}
                </div>
              </div>
              {!approved && (
                <div className="badge"><span className="pip"></span>Watermarked preview</div>
              )}
              {approved && (
                <div className="badge success"><span className="pip"></span>Unlocked master</div>
              )}
            </div>
            <AudioPlayer
              title={`${SONG_TITLE} — ${approved ? 'final master' : 'preview'}`}
              subtitle={approved ? 'Mastered for venue speakers · 24-bit WAV + MP3' : 'A watermarked tone plays every 30 seconds in the preview.'}
              duration={SONG_DURATION}
              watermark={!approved} />
            <div className="row" style={{ marginTop: 22 }}>
              {!approved && !revisionSent && (
                <React.Fragment>
                  <button className="btn btn-primary btn-lg" onClick={() => setShowApproveModal(true)}>
                    Approve & download <Icon.Download />
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowEditModal(true)}>
                    Request edit
                  </button>
                </React.Fragment>
              )}
              {revisionSent && !approved && (
                <div className="badge warn"><span className="pip"></span>Revision sent · Producer responds in 24h</div>
              )}
              {approved && (
                <React.Fragment>
                  <button className="btn btn-ghost"><Icon.Download /> WAV · 24-bit</button>
                  <button className="btn btn-ghost"><Icon.Download /> MP3 · 320kbps</button>
                  <button className="btn btn-ghost"><Icon.Download /> Lyric sheet (PDF)</button>
                </React.Fragment>
              )}
            </div>
          </div>

          {/* Lyrics */}
          <div className="glass" style={{ padding: "clamp(20px, 4vw, 30px)" }}>
            <div className="between" style={{ marginBottom: 22 }}>
              <div>
                <h3 className="sect-title">Lyrics</h3>
                <p className="sect-sub">{approved ? 'Full lyric sheet · also sent by email' : 'Chorus is visible during review. The rest unlocks on approval.'}</p>
              </div>
              {!approved && <div className="badge"><Icon.Lock /> 12 lines locked</div>}
            </div>

            {/* Chorus visible */}
            <div style={{ padding: '18px 22px', background: 'rgba(0,0,0,0.18)', borderRadius: 14, borderLeft: '2px solid var(--accent-500)', marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Chorus</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink-50)', lineHeight: 1.55, fontStyle: 'italic' }}>
                {CHORUS.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>

            {/* Locked or unlocked rest */}
            {approved ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {LOCKED_LYRICS.map(([head, lines]) => (
                  <div key={head} style={{ padding: '18px 22px', background: 'rgba(0,0,0,0.1)', borderRadius: 14 }}>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>{head}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink-50)', lineHeight: 1.55 }}>
                      {lines.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lock-wrap">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none', maskImage: 'linear-gradient(180deg, black 30%, transparent 95%)', WebkitMaskImage: 'linear-gradient(180deg, black 30%, transparent 95%)' }}>
                  {LOCKED_LYRICS.map(([head, lines]) => (
                    <div key={head}>
                      <div className="eyebrow" style={{ marginBottom: 10 }}>{head}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink-50)', lineHeight: 1.55 }}>
                        {lines.map((l, i) => <div key={i}>{l}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lock-cta">
                  <div className="feature-icon" style={{ width: 44, height: 44, animation: 'none' }}><Icon.Lock /></div>
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-50)' }}>
                    Full lyrics are locked.
                  </div>
                  <div className="muted tiny" style={{ textAlign: 'center', maxWidth: 360 }}>
                    Approve and download your song to receive the complete lyric sheet.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Producer message */}
          <div className="glass" style={{ padding: "clamp(20px, 4vw, 30px)" }}>
            <div className="between" style={{ marginBottom: 20 }}>
              <div>
                <h3 className="sect-title">A note from your producer</h3>
                <p className="sect-sub">{PRODUCER_NAME} · Producer & arranger</p>
              </div>
            </div>
            <div className="chat-msg">
              <div className="avatar">{PRODUCER_INITIALS}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--ink-50)', fontWeight: 500, marginBottom: 6 }}>
                  {PRODUCER_NAME} <span className="muted tiny" style={{ marginLeft: 8 }}>· 2 hours ago</span>
                </div>
                <div style={{ fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 12px' }}>Hi — what a beautiful set of memories to work with. A few notes on the creative choices:</p>
                  <p style={{ margin: '0 0 12px' }}>
                    I leaned into a warm, gentle folk arrangement — fingerpicked guitar, a low cello pad, and a soft brush kit that comes in for the chorus. It's mixed so the lyrics carry over a room full of conversation, and mastered loud enough to hold the floor without overpowering it.
                  </p>
                  <p style={{ margin: '0 0 12px' }}>
                    The "porch light in the photograph" line came from your voice memo — that detail felt like the whole song. I built the chorus around the garden image you mentioned.
                  </p>
                  <p style={{ margin: 0 }}>
                    Have a listen with headphones first, then again on a speaker. If anything needs to move, I'm here — one revision is on us.
                  </p>
                </div>
              </div>
            </div>
            {revisionSent && (
              <div className="chat-msg" style={{ marginTop: 12, background: 'rgba(255,255,255,0.04)' }}>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, oklch(0.4 0.04 50), oklch(0.3 0.04 40))', color: 'var(--ink-50)' }}>You</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--ink-50)', fontWeight: 500, marginBottom: 6 }}>
                    You <span className="muted tiny" style={{ marginLeft: 8 }}>· just now</span>
                  </div>
                  <div style={{ fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.6 }}>
                    "{editNote}"
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Order details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="muted tiny">Occasion</div>
                <div style={{ color: 'var(--ink-50)', marginTop: 2 }}>{occasion} · {fmtDate}</div>
              </div>
              <div>
                <div className="muted tiny">For</div>
                <div style={{ color: 'var(--ink-50)', marginTop: 2 }}>{name}</div>
                <div className="muted tiny" style={{ marginTop: 2 }}>{relationship}</div>
              </div>
              <div>
                <div className="muted tiny">Vibe</div>
                <div style={{ color: 'var(--ink-50)', marginTop: 2 }}>Nostalgic & Sweet · Folk</div>
              </div>
              <div>
                <div className="muted tiny">Delivery target</div>
                <div style={{ color: 'var(--ink-50)', marginTop: 2 }}>By Friday, May 22</div>
              </div>
              <div style={{ height: 1, background: 'var(--glass-border)', margin: '4px 0' }}></div>
              <div className="between">
                <span className="muted">Total (on approval)</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent-400)' }}>$99.00</span>
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Your story</div>
            <p className="muted tiny" style={{ marginTop: 0, marginBottom: 12, lineHeight: 1.5 }}>
              What you shared with us during intake.
            </p>
            <AudioPlayer title="Voice memo" subtitle="1:32 · You" duration={92} compact />
            <div style={{ marginTop: 14, padding: 14, background: 'rgba(0,0,0,0.18)', borderRadius: 12, fontSize: 13, color: 'var(--ink-200)', lineHeight: 1.55, fontStyle: 'italic' }}>
              "{data?.story || "She used to bake cinnamon bread on Sundays — the whole house smelled like it before anyone was awake. There was this garden behind the old house in Maine. She'd be out there in her yellow coat before the sun was even up…"}"
            </div>
            <div className="muted tiny" style={{ marginTop: 10 }}>Auto-transcribed from voice memo</div>
          </div>

          <div className="glass" style={{ padding: 22, background: 'rgba(0,0,0,0.18)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Need a hand?</div>
            <p className="muted tiny" style={{ margin: '0 0 12px', lineHeight: 1.5 }}>
              We're real people. If something doesn't feel right, just say the word.
            </p>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
              Message the studio
            </button>
          </div>
        </aside>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <div className="modal-back" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="between" style={{ marginBottom: 18 }}>
              <div>
                <h3 className="sect-title">Request an edit</h3>
                <p className="sect-sub">You have <b style={{ color: 'var(--accent-400)' }}>1 free revision</b> included.</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)} style={{ padding: 8 }}><Icon.X /></button>
            </div>
            <p style={{ color: 'var(--ink-400)', fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
              Tell {PRODUCER_NAME} what to change. Be specific — a line, a tempo, a mood. The more concrete, the closer the next pass will be.
            </p>
            <textarea
              className="textarea"
              style={{ minHeight: 140 }}
              placeholder="e.g. The chorus is great. Could the verses be a little slower? And could we mention the dog, Buster?"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)} />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!editNote.trim()}
                      onClick={() => { setRevisionSent(true); setShowEditModal(false); }}>
                Send to {PRODUCER_NAME.split(' ')[0]} <Icon.Arrow />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve modal */}
      {showApproveModal && (
        <div className="modal-back" onClick={() => setShowApproveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="between" style={{ marginBottom: 18 }}>
              <div>
                <h3 className="sect-title">Approve & download</h3>
                <p className="sect-sub">Your card will be charged $99 and your files will unlock immediately.</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowApproveModal(false)} style={{ padding: 8 }}><Icon.X /></button>
            </div>
            <div style={{ padding: 18, background: 'rgba(0,0,0,0.18)', borderRadius: 14, marginBottom: 18 }}>
              <div className="between" style={{ marginBottom: 8 }}>
                <span className="muted">"{SONG_TITLE}" · master + lyrics</span>
                <span style={{ color: 'var(--ink-50)' }}>$99.00</span>
              </div>
              <div className="between">
                <span className="muted">Card on file</span>
                <span style={{ color: 'var(--ink-50)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>•••• 4242</span>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setApproved(true); setShowApproveModal(false); }}>
                Charge $99 & unlock <Icon.Check />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
