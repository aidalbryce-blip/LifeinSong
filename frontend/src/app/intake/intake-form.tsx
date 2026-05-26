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
  const [audioUrl, setAudioUrl] = useState<string | null>(() =>
    data.voiceBlob ? URL.createObjectURL(data.voiceBlob) : null
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationRef = useRef(data.voiceDuration);
  const audioUrlRef = useRef(audioUrl);

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

  useEffect(() => {
    return () => {
      clearTimer();
      if (recorderRef.current) {
        recorderRef.current.ondataavailable = null;
        recorderRef.current.onstop = null;
      }
      stopStream();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
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
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      setAudioUrl(url);
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
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioUrl(null);
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
                <audio controls src={audioUrl} style={{ width: "100%", borderRadius: 8 }} />
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
};

export default function IntakeForm() {
  const [step, setStep] = useState<number>(-1); // -1 = intro
  const [data, setData] = useState<IntakeData>(INITIAL_DATA);

  const set = (patch: Partial<IntakeData>) => setData((d) => ({ ...d, ...patch }));
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => (s <= 0 ? -1 : s - 1));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-950)" }}>
      {step >= 0 && <ProgressBar step={step} />}

      {step === -1 && <IntakeIntro onStart={next} />}
      {step === 0 && <Step1 data={data} set={set} onNext={next} onBack={back} />}
      {step === 1 && <Step2 data={data} set={set} onNext={next} onBack={back} />}
      {step === 2 && <Step3 data={data} set={set} onNext={next} onBack={back} />}

      {/* Steps 4–5 coming in B005 */}
      {step > 2 && (
        <div style={{ ...shell, paddingTop: 80, textAlign: "center", color: "var(--ink-400)" }}>
          <p>Steps 4–5 coming soon.</p>
          <button onClick={() => setStep(2)} style={ghostBtn}>← Back</button>
        </div>
      )}
    </div>
  );
}
