import { useState } from 'react'

// Experiment briefing / setup screen (from "Experiment Briefing.dc.html").
// The config card is fully functional — "Begin monitoring" hands the chosen
// settings back up so the app can configure the backend and open the dashboard.
//
// Props:
//   onBegin(config) — config = { name, mode, p0, p1, alpha, beta, events_per_second }
//   onBack          — return to the landing page

const STEPS = [
  { n: '01 · configure', body: 'Set the baseline, target lift, and your false-positive / false-negative tolerances.' },
  { n: '02 · stream', body: 'Pipe events from your source. The likelihood ratio updates per visitor in real time.' },
  { n: '03 · decide', body: 'Stop as soon as the walk crosses a threshold — usually well before fixed-N.' },
]

const RECENTS = [
  { name: 'checkout_cta_v2', status: 'WINNER', color: '#34d399', visitors: '2,148', when: '14m ago' },
  { name: 'price_anchor_b', status: 'NO EFFECT', color: '#f87171', visitors: '6,402', when: '2h ago' },
  { name: 'onboarding_skip_v3', status: 'WINNER', color: '#34d399', visitors: '987', when: '1d ago' },
  { name: 'pricing_page_hero', status: 'RUNNING', color: '#7c6ef2', visitors: '312', when: 'live' },
]

const eyebrow = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.18em',
  color: '#7c6ef2',
  textTransform: 'uppercase',
}

export default function Briefing({ onBegin, onBack }) {
  const [name, setName] = useState('checkout_cta_v2')
  const [mode, setMode] = useState('demo')
  const [params, setParams] = useState({
    p0: 0.1,
    p1: 0.12,
    alpha: 0.05,
    beta: 0.2,
    events_per_second: 3,
  })

  const FIELDS = [
    { key: 'p0', label: 'Baseline CVR', hint: 'control conversion rate', min: 0.01, max: 0.5, step: 0.01, fmt: (v) => v.toFixed(2) },
    { key: 'p1', label: 'Target CVR', hint: 'minimum detectable effect', min: 0.01, max: 0.5, step: 0.01, fmt: (v) => v.toFixed(2) },
    { key: 'alpha', label: 'Alpha', hint: 'false-positive tolerance', min: 0.001, max: 0.2, step: 0.001, fmt: (v) => v.toFixed(3) },
    { key: 'beta', label: 'Beta', hint: 'false-negative tolerance', min: 0.001, max: 0.5, step: 0.001, fmt: (v) => v.toFixed(3) },
    { key: 'events_per_second', label: 'Stream speed', hint: 'events per second', min: 1, max: 50, step: 1, fmt: (v) => `${v} / s` },
  ]

  const set = (k, v) => setParams((p) => ({ ...p, [k]: v }))
  const begin = () => onBegin({ name: name.trim() || 'experiment', mode, ...params })

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'radial-gradient(circle at 18% 12%, rgba(124,110,242,0.10), transparent 45%), radial-gradient(circle at 92% 88%, rgba(124,110,242,0.06), transparent 50%), #0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 48px 28px',
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{ paddingBottom: 28, borderBottom: '1px solid #1f1f27' }}
      >
        <div className="flex items-center" style={{ gap: 14 }}>
          <div style={{ position: 'relative', width: 10, height: 10 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#7c6ef2', boxShadow: '0 0 18px #7c6ef2' }} />
            <div className="animate-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#7c6ef2' }} />
          </div>
          <span className="mono" style={{ fontSize: 13, letterSpacing: '0.04em', color: '#f4f4f8' }}>
            ab<span style={{ color: '#4a4a55' }}>/</span>monitor
          </span>
          <span
            className="mono"
            style={{ fontSize: 11, color: '#6b6b78', padding: '3px 8px', border: '1px solid #2a2a33', borderRadius: 4 }}
          >
            v0.4.2
          </span>
        </div>
        <nav className="mono flex items-center" style={{ gap: 28, fontSize: 12, color: '#7a7a87' }}>
          <span className="link-mut" onClick={onBack}>
            ← home
          </span>
          <a className="link-mut" href="https://github.com/bhavinjain28/AB-test-monitor" target="_blank" rel="noreferrer" style={{ color: '#7a7a87', textDecoration: 'none' }}>
            github ↗
          </a>
        </nav>
      </header>

      {/* Body */}
      <div
        className="grid"
        style={{
          flex: 1,
          gridTemplateColumns: '1fr 480px',
          gap: 80,
          paddingTop: 56,
          maxWidth: 1440,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* LEFT editorial */}
        <section className="flex flex-col" style={{ gap: 48, minWidth: 0 }}>
          <div className="flex flex-col" style={{ gap: 24 }}>
            <div className="flex items-center" style={{ gap: 10, ...eyebrow }}>
              <span style={{ width: 24, height: 1, background: '#7c6ef2' }} />
              <span>experiment console</span>
            </div>
            <h1
              style={{
                margin: 0,
                fontWeight: 500,
                fontSize: 64,
                lineHeight: 1.02,
                letterSpacing: '-0.035em',
                color: '#f4f4f8',
              }}
            >
              Stop your A/B&nbsp;test
              <br />
              <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: '#cfc6ff' }}>
                the moment
              </span>{' '}
              the data&nbsp;decides.
            </h1>
            <p style={{ margin: 0, maxWidth: 560, fontSize: 16, lineHeight: 1.55, color: '#9094a3' }}>
              A sequential testing console for product teams who'd rather not wait for a
              fixed-horizon sample size to tick over. Set thresholds, watch the log-likelihood walk,
              and call the experiment as soon as it crosses.
            </p>
          </div>

          {/* mini visualisation */}
          <div className="flex flex-col" style={{ gap: 18 }}>
            <div className="flex items-baseline justify-between">
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: '#7a7a87', textTransform: 'uppercase' }}>
                method · wald sprt
              </div>
              <div className="mono" style={{ fontSize: 11, color: '#5a5a66' }}>
                illustrative
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                height: 180,
                border: '1px solid #1f1f27',
                borderRadius: 6,
                background: '#101015',
                padding: '18px 20px',
                overflow: 'hidden',
              }}
            >
              <div className="mono" style={{ position: 'absolute', left: 20, top: 14, fontSize: 10, color: '#34d399', letterSpacing: '0.04em' }}>
                winner threshold ─────────────────────────
              </div>
              <div className="mono" style={{ position: 'absolute', left: 20, bottom: 14, fontSize: 10, color: '#f87171', letterSpacing: '0.04em' }}>
                no-effect threshold ─────────────────────
              </div>
              <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="glr-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c6ef2" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7c6ef2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="34" x2="600" y2="34" stroke="#34d399" strokeWidth="1" strokeDasharray="4 6" opacity=".55" />
                <line x1="0" y1="146" x2="600" y2="146" stroke="#f87171" strokeWidth="1" strokeDasharray="4 6" opacity=".55" />
                <path
                  d="M0,90 L20,88 L42,95 L68,84 L92,92 L120,80 L148,86 L176,72 L202,78 L228,64 L256,70 L284,58 L312,66 L340,52 L368,58 L392,46 L420,52 L448,40 L476,46 L500,36 L524,42 L548,34 L572,32 L600,30 L600,180 L0,180 Z"
                  fill="url(#glr-grad)"
                />
                <path
                  d="M0,90 L20,88 L42,95 L68,84 L92,92 L120,80 L148,86 L176,72 L202,78 L228,64 L256,70 L284,58 L312,66 L340,52 L368,58 L392,46 L420,52 L448,40 L476,46 L500,36 L524,42 L548,34 L572,32 L600,30"
                  fill="none"
                  stroke="#7c6ef2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1200"
                  style={{ animation: 'walk 4.5s ease-out forwards' }}
                />
                <circle cx="600" cy="30" r="3.5" fill="#7c6ef2" className="animate-fade-up" />
                <circle cx="600" cy="30" r="8" fill="none" stroke="#7c6ef2" strokeWidth="1" opacity=".4" className="animate-fade-up" />
              </svg>
            </div>
            <div
              className="grid"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#1f1f27', border: '1px solid #1f1f27', borderRadius: 6, overflow: 'hidden' }}
            >
              {STEPS.map((s) => (
                <div key={s.n} style={{ background: '#101015', padding: '16px 18px' }}>
                  <div className="mono" style={{ fontSize: 10, color: '#7a7a87', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                    {s.n}
                  </div>
                  <div style={{ fontSize: 13, color: '#cacaca', lineHeight: 1.45 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* recents */}
          <div className="flex flex-col" style={{ gap: 12, marginTop: 'auto' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: '#5a5a66', textTransform: 'uppercase' }}>
              recent experiments
            </div>
            <div className="flex flex-col" style={{ gap: 1, background: '#1f1f27', border: '1px solid #1f1f27', borderRadius: 6, overflow: 'hidden' }}>
              {RECENTS.map((r) => (
                <div
                  key={r.name}
                  className="mono grid items-center row-hover"
                  style={{ gridTemplateColumns: '1fr 90px 110px 80px', gap: 20, padding: '11px 16px', background: '#101015', fontSize: 12, cursor: 'pointer' }}
                >
                  <span style={{ color: '#dcdcdc' }}>{r.name}</span>
                  <span style={{ color: r.color, fontSize: 11, letterSpacing: '0.06em' }}>{r.status}</span>
                  <span style={{ color: '#7a7a87' }}>{r.visitors} visitors</span>
                  <span style={{ color: '#5a5a66', textAlign: 'right' }}>{r.when}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT config card */}
        <section style={{ position: 'relative' }}>
          <div
            style={{
              position: 'sticky',
              top: 24,
              background: '#14141a',
              border: '1px solid #24242c',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset, 0 30px 80px -20px rgba(0,0,0,0.6)',
            }}
          >
            {/* card header */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '18px 22px', borderBottom: '1px solid #24242c', background: 'linear-gradient(180deg, #1b1b22, #14141a)' }}
            >
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: '#7c6ef2', textTransform: 'uppercase' }}>
                new experiment
              </div>
              <div className="mono" style={{ fontSize: 10, color: '#5a5a66' }}>
                draft · unsaved
              </div>
            </div>

            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* name */}
              <div className="flex flex-col" style={{ gap: 8 }}>
                <label className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#8a8a97', textTransform: 'uppercase' }}>
                  name
                </label>
                <div className="flex items-center" style={{ gap: 8, padding: '11px 14px', border: '1px solid #2a2a33', borderRadius: 6, background: '#0a0a0f' }}>
                  <span className="mono" style={{ color: '#5a5a66', fontSize: 14 }}>
                    $
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && begin()}
                    className="mono"
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#f4f4f8', fontSize: 14, padding: 0, minWidth: 0 }}
                  />
                  <span className="mono" style={{ fontSize: 10, color: '#5a5a66' }}>
                    ↵
                  </span>
                </div>
              </div>

              {/* hypothesis */}
              <div className="flex flex-col" style={{ gap: 8 }}>
                <label className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#8a8a97', textTransform: 'uppercase' }}>
                  hypothesis
                </label>
                <div style={{ padding: '11px 14px', border: '1px solid #2a2a33', borderRadius: 6, background: '#0a0a0f', fontSize: 13, color: '#cacaca', lineHeight: 1.55, minHeight: 62 }}>
                  A single-CTA checkout drawer lifts conversion by at least 2&nbsp;percentage points
                  vs. the current dual-CTA layout.
                </div>
              </div>

              {/* data source */}
              <div className="flex flex-col" style={{ gap: 10 }}>
                <label className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#8a8a97', textTransform: 'uppercase' }}>
                  data source
                </label>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 1, background: '#24242c', border: '1px solid #24242c', borderRadius: 6, overflow: 'hidden' }}>
                  {['demo', 'live'].map((m) => {
                    const active = mode === m
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className="mono flex items-center justify-center"
                        style={{
                          gap: 8,
                          background: active ? '#7c6ef2' : '#0a0a0f',
                          color: active ? '#fff' : '#9094a3',
                          border: 'none',
                          padding: '11px 14px',
                          fontSize: 12,
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: active ? '#fff' : '#3a3a44' }} />
                        {m}
                      </button>
                    )
                  })}
                </div>
                <div className="mono" style={{ fontSize: 11, color: '#6b6b78', lineHeight: 1.45 }}>
                  {mode === 'live' ? 'listening for real events · POST /event' : 'simulated traffic · nothing is stored'}
                </div>
              </div>

              <div style={{ height: 1, background: '#24242c', margin: '2px 0' }} />

              {/* numeric params */}
              <div className="flex flex-col" style={{ gap: 18 }}>
                {FIELDS.map((f) => (
                  <div key={f.key} className="flex flex-col" style={{ gap: 8 }}>
                    <div className="flex items-baseline justify-between">
                      <div className="flex flex-col" style={{ gap: 2 }}>
                        <span style={{ fontSize: 13, color: '#f4f4f8' }}>{f.label}</span>
                        <span className="mono" style={{ fontSize: 10, color: '#8a8a97' }}>
                          {f.hint}
                        </span>
                      </div>
                      <span className="mono tnum" style={{ fontSize: 15, color: '#f4f4f8' }}>
                        {f.fmt(params[f.key])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={params[f.key]}
                      onChange={(e) => set(f.key, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: '#24242c', margin: '2px 0' }} />

              {/* CTA */}
              <button
                onClick={begin}
                className="btn-primary"
                style={{ justifyContent: 'space-between', padding: '14px 18px', fontSize: 14 }}
              >
                <span className="flex items-center" style={{ gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff', boxShadow: '0 0 8px #fff' }} />
                  Begin monitoring
                </span>
                <span className="mono flex items-center" style={{ gap: 6, fontSize: 11, opacity: 0.7 }}>
                  <span style={{ padding: '1px 6px', border: '1px solid rgba(255,255,255,.4)', borderRadius: 3 }}>↵</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer
        className="mono flex items-center justify-between"
        style={{ paddingTop: 32, marginTop: 48, borderTop: '1px solid #1f1f27', fontSize: 11, color: '#5a5a66' }}
      >
        <div className="flex items-center" style={{ gap: 24 }}>
          <span>built for sequential testing</span>
          <span style={{ color: '#2a2a33' }}>·</span>
          <span>open source</span>
          <span style={{ color: '#2a2a33' }}>·</span>
          <a
            className="link-mut"
            href="https://github.com/bhavinjain28"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#5a5a66', textDecoration: 'none' }}
          >
            built by Bhavin Jain
          </a>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span>press</span>
          <span style={{ padding: '2px 6px', border: '1px solid #2a2a33', borderRadius: 3, color: '#9094a3' }}>↵</span>
          <span>to begin</span>
        </div>
      </footer>
    </div>
  )
}
