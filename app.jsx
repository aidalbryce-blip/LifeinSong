// app.jsx — top-level router + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "amber",
  "accentIntensity": "warm",
  "bg": "plum",
  "displayFont": "Newsreader",
  "showOrbs": true,
  "grainOpacity": 0.06
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  amber:  { hue: 60,  chroma: 0.16, swatch: '#d99655' },
  copper: { hue: 30,  chroma: 0.15, swatch: '#cf7553' },
  honey:  { hue: 90,  chroma: 0.14, swatch: '#c9a64a' },
  rose:   { hue: 18,  chroma: 0.13, swatch: '#cf6b6b' },
  dusk:   { hue: 340, chroma: 0.10, swatch: '#b87890' },
};
const BG_PRESETS = {
  plum:    { hue: 25,  light: 0.16, swatch: '#2a1714' },
  coffee:  { hue: 50,  light: 0.16, swatch: '#241c14' },
  mauve:   { hue: 330, light: 0.16, swatch: '#241620' },
  midnight:{ hue: 270, light: 0.14, swatch: '#1a1422' },
};
const INTENSITY = { soft: 0.85, warm: 1.0, vivid: 1.2 };

function applyTweaks(t) {
  const root = document.documentElement;
  const a = ACCENT_PRESETS[t.accent] || ACCENT_PRESETS.amber;
  const mult = INTENSITY[t.accentIntensity] ?? 1.0;
  const c = a.chroma * mult;
  root.style.setProperty('--accent-300', `oklch(0.86 ${c * 0.6} ${a.hue})`);
  root.style.setProperty('--accent-400', `oklch(0.80 ${c * 0.8} ${a.hue})`);
  root.style.setProperty('--accent-500', `oklch(0.74 ${c} ${a.hue})`);
  root.style.setProperty('--accent-600', `oklch(0.66 ${c * 1.12} ${a.hue - 5})`);
  root.style.setProperty('--accent-700', `oklch(0.55 ${c * 1.12} ${a.hue - 10})`);

  const b = BG_PRESETS[t.bg] || BG_PRESETS.plum;
  root.style.setProperty('--bg-950', `oklch(${b.light} 0.035 ${b.hue})`);
  root.style.setProperty('--bg-900', `oklch(${b.light + 0.05} 0.04 ${b.hue + 3})`);
  root.style.setProperty('--bg-800', `oklch(${b.light + 0.11} 0.045 ${b.hue + 5})`);

  root.style.setProperty('--font-display', `"${t.displayFont}", Georgia, serif`);
  document.querySelectorAll('.orb').forEach(o => o.style.display = t.showOrbs ? '' : 'none');
  const grain = document.querySelector('.grain');
  if (grain) grain.style.opacity = t.grainOpacity;
}

function App() {
  const initialRoute = (() => {
    const m = new URLSearchParams(window.location.search).get('route');
    return ['landing', 'intake', 'dashboard', 'producer'].includes(m) ? m : 'landing';
  })();
  const [route, setRoute] = useState(initialRoute);
  const [intakeData, setIntakeData] = useState({
    occasion: 'wedding',
    date: null,
    name: '',
    relationship: '',
    feeling: null,
    style: null,
    feelingNote: '',
    styleNote: '',
    voice: null,
    story: '',
  });
  const [approved, setApproved] = useState(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => { applyTweaks(t); }, [t]);

  const go = (where) => {
    setRoute(where);
    // smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div data-screen-label={`Life in Song · ${route}`}>
      <Ambient />
      <Nav route={route} go={go} />
      <main>
        {route === 'landing' && <Landing go={go} />}
        {route === 'intake' && <Intake go={go} data={intakeData} setData={setIntakeData} />}
        {route === 'dashboard' && <Dashboard go={go} data={intakeData} approved={approved} setApproved={setApproved} />}
        {route === 'producer' && <Producer data={intakeData} />}
      </main>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakSelect label="Color"
          value={t.accent}
          options={[
            { value: 'amber',  label: 'Amber (default)' },
            { value: 'copper', label: 'Copper' },
            { value: 'honey',  label: 'Honey' },
            { value: 'rose',   label: 'Rose' },
            { value: 'dusk',   label: 'Dusk' },
          ]}
          onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Intensity" value={t.accentIntensity}
          options={['soft', 'warm', 'vivid']}
          onChange={(v) => setTweak('accentIntensity', v)} />

        <TweakSection label="Background" />
        <TweakSelect label="Tone"
          value={t.bg}
          options={[
            { value: 'plum',     label: 'Plum (default)' },
            { value: 'coffee',   label: 'Coffee' },
            { value: 'mauve',    label: 'Mauve' },
            { value: 'midnight', label: 'Midnight' },
          ]}
          onChange={(v) => setTweak('bg', v)} />

        <TweakSection label="Type" />
        <TweakSelect label="Display font" value={t.displayFont}
          options={['Newsreader', 'Cormorant Garamond', 'DM Serif Display', 'Playfair Display', 'EB Garamond']}
          onChange={(v) => setTweak('displayFont', v)} />

        <TweakSection label="Atmosphere" />
        <TweakToggle label="Floating orbs" value={t.showOrbs}
          onChange={(v) => setTweak('showOrbs', v)} />
        <TweakSlider label="Grain" value={t.grainOpacity} min={0} max={0.2} step={0.01}
          onChange={(v) => setTweak('grainOpacity', v)} />

        <TweakSection label="Jump to screen" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button onClick={() => go('landing')} style={btnStyle(route==='landing')}>Landing</button>
          <button onClick={() => go('intake')} style={btnStyle(route==='intake')}>Intake</button>
          <button onClick={() => go('dashboard')} style={btnStyle(route==='dashboard')}>Consumer</button>
          <button onClick={() => go('producer')} style={btnStyle(route==='producer')}>Producer</button>
        </div>
        {route === 'dashboard' && (
          <button onClick={() => setApproved(a => !a)}
                  style={{ ...btnStyle(false), marginTop: 6 }}>
            {approved ? '⟲ Reset to "preview" state' : '⚡ Simulate approved'}
          </button>
        )}
      </TweaksPanel>
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: '8px 10px',
    fontSize: 11.5,
    borderRadius: 8,
    border: '1px solid rgba(41,38,27,0.12)',
    background: active ? 'oklch(0.18 0.04 25)' : 'rgba(255,255,255,0.5)',
    color: active ? '#f6f0e6' : '#29261b',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  };
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
