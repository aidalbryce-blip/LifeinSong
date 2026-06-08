"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Occasion = "wedding" | "graduation";
type Feeling = "uplifting" | "nostalgic" | "tearjerker" | "peaceful" | "energetic";
type Style = "acoustic" | "piano" | "folk" | "soul" | "producer";
type RecordState = "idle" | "requesting" | "recording" | "recorded" | "error";

interface IntakeData {
  occasion: Occasion | null;
  date: string;
  name: string;
  relationship: string;
  feeling: Feeling | null;
  feelingNote: string;
  style: Style | null;
  styleNote: string;
  voiceBlob: Blob | null;
  voiceDuration: number;
  storyText: string;
  email: string;
}

const FEELINGS: { id: Feeling; label: string; hint: string }[] = [
  { id: "uplifting",  label: "Uplifting & Joyful",    hint: "Hands in the air, big smiles" },
  { id: "nostalgic",  label: "Nostalgic & Sweet",      hint: "Soft, warm, looking back" },
  { id: "tearjerker", label: "Tear-jerker",             hint: "The first-dance kind of cry" },
  { id: "peaceful",   label: "Peaceful & Reflective",  hint: "Quiet, grateful, still" },
  { id: "energetic",  label: "Fun & Energetic",         hint: "Pulls everyone onto the floor" },
];

const STYLES: { id: Style; label: string }[] = [
  { id: "acoustic",  label: "Acoustic Singer-Songwriter" },
  { id: "piano",     label: "Piano Ballad" },
  { id: "folk",      label: "Folk / Country" },
  { id: "soul",      label: "Classic Soul" },
  { id: "producer",  label: "Leave it to the producer" },
];

const STEP_NAMES = ["Occasion", "Vibe", "Story", "Review", "Submit"];

// ─── Voice recording helpers ──────────────────────────────────────────────────

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Chrome reports `duration: Infinity` for <audio> elements playing a Blob
// built from MediaRecorder chunks until playback passes through the real
// end once. Seeking past the end forces the browser to compute it.
function fixInfiniteDuration(audio: HTMLAudioElement) {
  if (Number.isFinite(audio.duration)) return;
  const onTimeUpdate = () => {
    audio.currentTime = 0;
    audio.removeEventListener("timeupdate", onTimeUpdate);
  };
  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.currentTime = Number.MAX_SAFE_INTEGER;
}

function fmtDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Order brief (submission stub) ───────────────────────────────────────────
// `POST /api/orders` is B006's responsibility — submitOrder is stubbed here so
// the review → submit → confirmation flow can be exercised end to end.

interface OrderBrief {
  occasion: Occasion | null;
  eventDate: string;
  name: string;
  relationship: string;
  feeling: Feeling | null;
  feelingNote: string;
  style: Style | null;
  styleNote: string;
  voiceRecording: { blob: Blob; durationSeconds: number } | null;
  storyText: string | null;
  email: string;
  submittedAt: string;
}

function buildBrief(data: IntakeData): OrderBrief {
  return {
    occasion: data.occasion,
    eventDate: data.date,
    name: data.name.trim(),
    relationship: data.relationship.trim(),
    feeling: data.feeling,
    feelingNote: data.feelingNote.trim(),
    style: data.style,
    styleNote: data.styleNote.trim(),
    voiceRecording: data.voiceBlob ? { blob: data.voiceBlob, durationSeconds: data.voiceDuration } : null,
    storyText: data.storyText.trim() || null,
    email: data.email.trim(),
    submittedAt: new Date().toISOString(),
  };
}

async function submitOrder(brief: OrderBrief): Promise<{ ok: true }> {
  console.info("submitOrder (stub — POST /api/orders lands in B006):", brief);
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / STEP_NAMES.length) * 100;
  return (
    <div style={{ padding: "20px 24px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "var(--ink-400)" }}>
          Step <strong style={{ color: "var(--ink-50)" }}>{step + 1}</strong> of {STEP_NAMES.length}
          <span style={{ marginLeft: 8, opacity: 0.6 }}>· {STEP_NAMES[step]}</span>
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-500)", display: "flex", alignItems: "center", gap: 4 }}>
          🔒 No charge until you approve
        </span>
      </div>
      <div style={{ height: 3, background: "var(--glass-border)", borderRadius: 99 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent-400)", borderRadius: 99, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 32 }} className="fade-up">
      <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-400)", marginBottom: 12 }}>{eyebrow}</div>
      <h2 style={{ margin: "0 0 12px", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 600, color: "var(--ink-50)", lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ margin: 0, fontSize: 16, color: "var(--ink-400)", lineHeight: 1.55 }}>{sub}</p>}
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Continue", nextDisabled }: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--glass-border)" }}>
      <button onClick={onBack} style={ghostBtn}>← Back</button>
      <button onClick={onNext} disabled={nextDisabled} style={nextDisabled ? { ...primaryBtn, opacity: 0.35, cursor: "not-allowed" } : primaryBtn}>
        {nextLabel} →
      </button>
    </div>
  );
}

const shell: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "40px 20px 60px",
  width: "100%",
};

const primaryBtn: React.CSSProperties = {
  background: "var(--accent-500)",
  color: "var(--ink-50)",
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--ink-400)",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "12px 20px",
  fontSize: 15,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--glass)",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 15,
  color: "var(--ink-50)",
  outline: "none",
};

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ink-400)",
  marginBottom: 8,
  letterSpacing: "0.03em",
};

// ─── Intro ────────────────────────────────────────────────────────────────────

function IntakeIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="fade-up" style={{ ...shell, paddingTop: 80, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 24 }}>♪</div>
      <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700, color: "var(--ink-50)", lineHeight: 1.05, margin: "0 0 20px" }}>
        Let&apos;s create <em style={{ color: "var(--accent-400)", fontStyle: "italic" }}>something special</em>.
      </h1>
      <p style={{ fontSize: 17, color: "var(--ink-400)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
        We&apos;ll ask you a few questions about your person and the moment you&apos;re celebrating. Take your time. Speak from the heart. We&apos;ll handle the rest.
      </p>
      <button onClick={onStart} style={{ ...primaryBtn, fontSize: 17, padding: "14px 36px" }}>
        Begin →
      </button>
      <div style={{ marginTop: 20, fontSize: 13, color: "var(--ink-500)" }}>
        About 6 minutes
      </div>
    </div>
  );
}

// ─── Step 1 — Occasion ────────────────────────────────────────────────────────

function Step1({ data, set, onNext, onBack }: {
  data: IntakeData;
  set: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const ok = !!data.occasion && !!data.date && !!data.name.trim() && !!data.relationship.trim();

  return (
    <div className="fade-up" style={shell}>
      <StepHeader
        eyebrow="Step 1 of 5"
        title="Who is this for?"
        sub="A few basics so we know the room we're writing for."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Occasion */}
        <div>
          <label style={fieldLabel}>Occasion</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["wedding", "graduation"] as Occasion[]).map((o) => (
              <button
                key={o}
                onClick={() => set({ occasion: o })}
                style={{
                  padding: "12px 22px",
                  borderRadius: 14,
                  border: `1px solid ${data.occasion === o ? "var(--accent-400)" : "var(--glass-border)"}`,
                  background: data.occasion === o ? "rgba(255,200,100,0.12)" : "var(--glass)",
                  color: data.occasion === o ? "var(--accent-400)" : "var(--ink-200)",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {o === "wedding" ? "💍" : "🎓"} {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Event date */}
        <div>
          <label style={fieldLabel}>When is the event?</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => set({ date: e.target.value })}
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </div>

        {/* Their name */}
        <div>
          <label style={fieldLabel}>Their name</label>
          <input
            type="text"
            placeholder="e.g. Maggie"
            value={data.name}
            onChange={(e) => set({ name: e.target.value })}
            style={inputStyle}
          />
        </div>

        {/* Relationship */}
        <div>
          <label style={fieldLabel}>Your relationship to them</label>
          <input
            type="text"
            placeholder="e.g. Father of the bride"
            value={data.relationship}
            onChange={(e) => set({ relationship: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!ok} />
    </div>
  );
}

// ─── Step 2 — Vibe ────────────────────────────────────────────────────────────

function Step2({ data, set, onNext, onBack }: {
  data: IntakeData;
  set: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const ok = !!data.feeling && !!data.style;

  return (
    <div className="fade-up" style={shell}>
      <StepHeader
        eyebrow="Step 2 of 5"
        title="What should it feel like?"
        sub="Pick the feeling and the sound. There are no wrong answers."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Feeling */}
        <div>
          <label style={fieldLabel}>Feeling</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FEELINGS.map((f) => (
              <button
                key={f.id}
                onClick={() => set({ feeling: f.id })}
                style={{
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: `1px solid ${data.feeling === f.id ? "var(--accent-400)" : "var(--glass-border)"}`,
                  background: data.feeling === f.id ? "rgba(255,200,100,0.10)" : "var(--glass)",
                  color: data.feeling === f.id ? "var(--ink-50)" : "var(--ink-200)",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 15 }}>{f.label}</span>
                <span style={{ fontSize: 12, opacity: 0.65 }}>{f.hint}</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add more detail or an example (optional)"
            value={data.feelingNote}
            onChange={(e) => set({ feelingNote: e.target.value })}
            style={{ ...inputStyle, marginTop: 12 }}
          />
        </div>

        {/* Style */}
        <div>
          <label style={fieldLabel}>Musical style</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => set({ style: s.id })}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: `1px solid ${data.style === s.id ? "var(--accent-400)" : "var(--glass-border)"}`,
                  background: data.style === s.id ? "rgba(255,200,100,0.10)" : "var(--glass)",
                  color: data.style === s.id ? "var(--accent-400)" : "var(--ink-200)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <textarea
            placeholder='Give us an example artist or song (optional) — e.g. "Something like The Avett Brothers, or Norah Jones meets James Taylor"'
            value={data.styleNote}
            onChange={(e) => set({ styleNote: e.target.value })}
            rows={3}
            style={{ ...inputStyle, marginTop: 12, resize: "vertical" }}
          />
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!ok} />
    </div>
  );
}

// ─── Step 3 — Story (voice + text) ───────────────────────────────────────────

function Step3({ data, set, onNext, onBack }: {
  data: IntakeData;
  set: (patch: Partial<IntakeData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [recState, setRecState] = useState<RecordState>(data.voiceBlob ? "recorded" : "idle");
  const [elapsed, setElapsed] = useState(data.voiceDuration);
  const [errMsg, setErrMsg] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationRef = useRef(data.voiceDuration);

  const ok = !!data.voiceBlob || !!data.storyText.trim();

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Object URLs are an external-system resource (the browser's blob registry):
  // each effect run must create its own and its own cleanup must revoke that
  // same instance — not one read back from state/memo. That's what survives
  // Strict Mode's mount→cleanup→mount dev cycle without ever rendering a
  // revoked URL (a memo'd value + ref-revoke-on-unmount does not: the
  // simulated remount reuses the memo'd URL, which the simulated unmount
  // already revoked).
  useEffect(() => {
    if (!data.voiceBlob) {
      // No resource to create — safe to reset directly.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(data.voiceBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [data.voiceBlob]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (recorderRef.current) {
        recorderRef.current.ondataavailable = null;
        recorderRef.current.onstop = null;
      }
      stopStream();
    };
  }, []);

  const startRecording = async () => {
    setRecState("requesting");
    setErrMsg("");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setRecState("error");
      setErrMsg("Microphone access was denied. Allow microphone access and try again.");
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    durationRef.current = 0;

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      const dur = durationRef.current;
      set({ voiceBlob: blob, voiceDuration: dur });
      setElapsed(dur);
      setRecState("recorded");
      stopStream();
    };

    let secs = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      secs += 1;
      durationRef.current = secs;
      setElapsed(secs);
    }, 1000);

    recorder.start(250);
    setRecState("recording");
  };

  const stopRecording = () => {
    clearTimer();
    recorderRef.current?.stop();
  };

  const reRecord = () => {
    set({ voiceBlob: null, voiceDuration: 0 });
    durationRef.current = 0;
    setElapsed(0);
    setRecState("idle");
  };

  return (
    <div className="fade-up" style={shell}>
      <StepHeader
        eyebrow="Step 3 of 5"
        title="Tell us about them."
        sub="Speak freely — memories, what makes them them, why this moment matters. There's no wrong answer."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Voice recorder */}
        <div>
          <label style={fieldLabel}>Voice note</label>

          {recState === "idle" && (
            <button
              onClick={startRecording}
              style={{ ...primaryBtn, width: "100%", padding: "16px", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
            >
              🎙 Start recording
            </button>
          )}

          {recState === "requesting" && (
            <div style={{ textAlign: "center", padding: "16px", color: "var(--ink-400)", fontSize: 14 }}>
              Waiting for microphone permission…
            </div>
          )}

          {recState === "recording" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="rec-dot" />
                <span style={{ fontSize: 28, fontWeight: 600, color: "var(--ink-50)", fontVariantNumeric: "tabular-nums" }}>
                  {fmtTime(elapsed)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                style={{ ...ghostBtn, borderColor: "rgba(248,113,113,0.5)", color: "#f87171" }}
              >
                ■ Stop recording
              </button>
            </div>
          )}

          {recState === "recorded" && (
            <div style={{ border: "1px solid var(--accent-400)", borderRadius: 14, padding: "14px 18px", background: "rgba(255,200,100,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: audioUrl ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-50)" }}>✓ Recording saved</div>
                  <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 2 }}>{fmtTime(elapsed)}</div>
                </div>
                <button onClick={reRecord} style={{ ...ghostBtn, padding: "8px 14px", fontSize: 13 }}>
                  Re-record
                </button>
              </div>
              {audioUrl && (
                <audio
                  controls
                  src={audioUrl}
                  style={{ width: "100%", borderRadius: 8 }}
                  onLoadedMetadata={(e) => fixInfiniteDuration(e.currentTarget)}
                />
              )}
            </div>
          )}

          {recState === "error" && (
            <>
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.3)", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#f87171" }}>{errMsg}</span>
              </div>
              <button onClick={startRecording} style={{ ...ghostBtn, width: "100%" }}>
                Try again
              </button>
            </>
          )}
        </div>

        {/* Text fallback */}
        <div>
          <label style={fieldLabel}>
            {data.voiceBlob ? "Anything to add? (optional)" : "Prefer to type instead?"}
          </label>
          <textarea
            placeholder="A few sentences about them — what they mean to you, what makes this moment special…"
            value={data.storyText}
            onChange={(e) => set({ storyText: e.target.value })}
            rows={5}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!ok} />
    </div>
  );
}

// ─── Review summary primitives ───────────────────────────────────────────────

function ReviewSection({ title, onEdit, children }: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid var(--glass-border)", borderRadius: 16, padding: "18px 20px", background: "var(--glass)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ ...fieldLabel, marginBottom: 0 }}>{title}</span>
        <button onClick={onEdit} style={{ ...ghostBtn, padding: "6px 16px", fontSize: 13 }}>
          Edit
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "7px 0" }}>
      <span style={{ fontSize: 13, color: "var(--ink-400)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: "var(--ink-50)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "7px 0" }}>
      <div style={{ fontSize: 13, color: "var(--ink-400)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--ink-50)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

// ─── Step 4 — Review ──────────────────────────────────────────────────────────

function Step4({ data, onEdit, onNext, onBack }: {
  data: IntakeData;
  onEdit: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const occasionLabel = data.occasion
    ? `${data.occasion === "wedding" ? "💍" : "🎓"} ${data.occasion.charAt(0).toUpperCase() + data.occasion.slice(1)}`
    : "—";
  const feeling = FEELINGS.find((f) => f.id === data.feeling);
  const style = STYLES.find((s) => s.id === data.style);
  const storyText = data.storyText.trim();

  return (
    <div className="fade-up" style={shell}>
      <StepHeader
        eyebrow="Step 4 of 5"
        title="Let's make sure we've got it right."
        sub="Here's everything you've shared. Edit any section before sending it off."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <ReviewSection title="The basics" onEdit={() => onEdit(0)}>
          <SummaryRow label="Occasion" value={occasionLabel} />
          <SummaryRow label="Event date" value={data.date ? fmtDate(data.date) : "—"} />
          <SummaryRow label="Their name" value={data.name || "—"} />
          <SummaryRow label="Your relationship" value={data.relationship || "—"} />
        </ReviewSection>

        <ReviewSection title="The vibe" onEdit={() => onEdit(1)}>
          <SummaryRow label="Feeling" value={feeling?.label ?? "—"} />
          <SummaryRow label="Musical style" value={style?.label ?? "—"} />
          {data.feelingNote.trim() && <SummaryBlock label="Feeling notes" value={data.feelingNote.trim()} />}
          {data.styleNote.trim() && <SummaryBlock label="Style notes" value={data.styleNote.trim()} />}
        </ReviewSection>

        <ReviewSection title="Their story" onEdit={() => onEdit(2)}>
          <SummaryRow
            label="Voice recording"
            value={data.voiceBlob ? `🎙 ${fmtTime(data.voiceDuration)} recording` : "Not recorded"}
          />
          {storyText && <SummaryBlock label={data.voiceBlob ? "Additional notes" : "Story"} value={storyText} />}
        </ReviewSection>
      </div>

      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ─── Step 5 — Email + Submit ──────────────────────────────────────────────────

function Step5({ data, set, onBack, onSubmitted }: {
  data: IntakeData;
  set: (patch: Partial<IntakeData>) => void;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const emailOk = EMAIL_RE.test(data.email.trim());

  const handleSubmit = async () => {
    if (!emailOk || submitting) return;
    setSubmitting(true);
    await submitOrder(buildBrief(data));
    onSubmitted();
  };

  return (
    <div className="fade-up" style={shell}>
      <StepHeader
        eyebrow="Step 5 of 5"
        title="Almost there."
        sub="Leave your email and we'll take it from here — no payment needed yet."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={fieldLabel}>Your email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => set({ email: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-400)" }}>
          🔒 No charge until you approve — we&apos;ll send a payment link once your song is ready to hear.
        </div>
      </div>

      <NavRow
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel={submitting ? "Submitting…" : "Submit"}
        nextDisabled={!emailOk || submitting}
      />
    </div>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

function Confirmation({ email }: { email: string }) {
  return (
    <div className="fade-up" style={{ ...shell, paddingTop: 80, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 24 }}>✓</div>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 600, color: "var(--ink-50)", lineHeight: 1.15, margin: "0 0 16px" }}>
        Got it. Your story is in good hands.
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-400)", lineHeight: 1.65, maxWidth: 460, margin: "0 auto 12px" }}>
        We&apos;ll listen closely, match you with the right producer, and send a payment link to{" "}
        <strong style={{ color: "var(--ink-200)" }}>{email}</strong> within 1–2 business days. Check your inbox
        (and your spam folder, just in case).
      </p>
      <p style={{ fontSize: 13, color: "var(--ink-500)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 28 }}>
        🔒 No charge until you approve.
      </p>
    </div>
  );
}

// ─── Root form controller ─────────────────────────────────────────────────────

const INITIAL_DATA: IntakeData = {
  occasion: null,
  date: "",
  name: "",
  relationship: "",
  feeling: null,
  feelingNote: "",
  style: null,
  styleNote: "",
  voiceBlob: null,
  voiceDuration: 0,
  storyText: "",
  email: "",
};

const REVIEW_STEP = 3;

export default function IntakeForm() {
  const [step, setStep] = useState<number>(-1); // -1 = intro
  const [data, setData] = useState<IntakeData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);

  const set = (patch: Partial<IntakeData>) => setData((d) => ({ ...d, ...patch }));

  const next = () => {
    if (returnToReview) {
      setReturnToReview(false);
      setStep(REVIEW_STEP);
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    setReturnToReview(false);
    setStep((s) => (s <= 0 ? -1 : s - 1));
  };

  // Jump from the review step to an earlier step to edit it; Continuing from
  // there returns straight to the review rather than re-walking every step.
  const editStep = (target: number) => {
    setReturnToReview(true);
    setStep(target);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-950)" }}>
        <Confirmation email={data.email} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-950)" }}>
      {step >= 0 && <ProgressBar step={step} />}

      {step === -1 && <IntakeIntro onStart={next} />}
      {step === 0 && <Step1 data={data} set={set} onNext={next} onBack={back} />}
      {step === 1 && <Step2 data={data} set={set} onNext={next} onBack={back} />}
      {step === 2 && <Step3 data={data} set={set} onNext={next} onBack={back} />}
      {step === REVIEW_STEP && <Step4 data={data} onEdit={editStep} onNext={next} onBack={back} />}
      {step === 4 && <Step5 data={data} set={set} onBack={back} onSubmitted={() => setSubmitted(true)} />}
    </div>
  );
}
