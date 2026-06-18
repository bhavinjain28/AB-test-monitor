import { useEffect } from 'react'

// Marketing hero landing page (from "AB Monitor Landing.dc.html").
// Re-skinned to the unified purple / Inter Tight design system.
//
// Props:
//   onRunDemo   — jump straight to the dashboard in demo mode
//   onConfigure — go to the experiment briefing / setup screen

const CONCEPTS = [
  {
    n: '01 · SEQUENTIAL',
    color: '#7c6ef2',
    title: 'Stop early without inflating false-positive risk.',
    body: 'Probability-ratio tests bound type-I error across every checkpoint — not just the final one. No correction tax for looking often.',
  },
  {
    n: '02 · ANYTIME-VALID',
    color: '#34d399',
    title: 'Peek whenever. Restart whenever. The math holds.',
    body: "Every reading is a valid decision point. You decide when to ship; the test doesn't dictate a calendar window to you.",
  },
  {
    n: '03 · TRANSPARENT',
    color: '#fbbf24',
    title: 'α, β, baseline, MDE — every assumption is editable.',
    body: "Drag a slider, see the thresholds move. No hidden defaults, no black-box statistics. The instrument tells you what it's measuring.",
  },
]

const TICKER = [
  { c: '#34d399', t: 'checkout_cta_v2 → winner · +0.8% lift · 4,071 visitors' },
  { c: '#f87171', t: 'pricing_table_b → no-effect · −0.1% lift · 12,304 visitors' },
  { c: '#fbbf24', t: 'onboarding_step3_redesign → running · +1.4% (provisional)' },
  { c: '#34d399', t: 'newsletter_modal_v4 → winner · +3.2% lift · 8,950 visitors' },
  { c: '#7c6ef2', t: 'search_autocomplete_ml → running · +0.4% (insufficient)' },
  { c: '#f87171', t: 'mobile_cta_color_orange → no-effect · 0.0% lift · 22,180 visitors' },
]

const Kbd = ({ children }) => (
  <kbd
    className="mono"
    style={{
      padding: '2px 7px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 4,
      color: '#cfcfd6',
    }}
  >
    {children}
  </kbd>
)

export default function Landing({ onRunDemo, onConfigure }) {
  // Keyboard shortcuts: D = demo, N = new test
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'd' || e.key === 'D') onRunDemo()
      if (e.key === 'n' || e.key === 'N') onConfigure()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onRunDemo, onConfigure])

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background:
          'radial-gradient(900px 600px at 110% 90%, rgba(124,110,242,0.14), transparent 60%), radial-gradient(700px 500px at -5% 0%, rgba(124,110,242,0.05), transparent 60%), #0a0a0f',
      }}
    >
      {/* ambient grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 90%)',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 90%)',
        }}
      />
      {/* ambient halo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -180,
          bottom: -220,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(124,110,242,0.18), transparent 60%)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1440,
          margin: '0 auto',
          padding: '28px 56px 56px',
          boxSizing: 'border-box',
        }}
      >
        {/* TOP BAR */}
        <div className="flex items-center justify-between" style={{ padding: '4px 0 36px' }}>
          <div className="flex items-center" style={{ gap: 18 }}>
            <div style={{ position: 'relative', width: 9, height: 9 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#7c6ef2',
                  borderRadius: '50%',
                  boxShadow: '0 0 12px rgba(124,110,242,0.8)',
                }}
              />
              <div
                className="animate-pulse-ring"
                style={{ position: 'absolute', inset: 0, background: '#7c6ef2', borderRadius: '50%' }}
              />
            </div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 500, color: '#e8e8ed' }}>
              ab<span style={{ color: '#4a4a55' }}>/</span>monitor
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                color: '#7a7a87',
                padding: '3px 8px',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 5,
              }}
            >
              v0.4.2
            </div>
          </div>
          <div className="mono flex items-center" style={{ gap: 20, fontSize: 11, color: '#6b6b78' }}>
            <span>sequential probability ratio test</span>
            <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <span className="flex items-center" style={{ gap: 7, color: '#34d399' }}>
              <span
                className="animate-blink"
                style={{
                  width: 6,
                  height: 6,
                  background: '#34d399',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(52,211,153,0.7)',
                }}
              />
              READY
            </span>
          </div>
        </div>

        {/* HERO */}
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)',
            gap: 80,
            padding: '32px 0 56px',
          }}
        >
          {/* LEFT copy */}
          <div>
            <div
              className="mono flex items-center"
              style={{
                gap: 12,
                fontSize: 11.5,
                letterSpacing: '0.16em',
                color: '#7a7a87',
                textTransform: 'uppercase',
                marginBottom: 36,
              }}
            >
              <span style={{ color: '#7c6ef2' }}>001</span>
              <span style={{ width: 24, height: 1, background: 'rgba(124,110,242,0.4)' }} />
              <span>Sequential A/B Testing</span>
            </div>

            <h1
              style={{
                fontWeight: 700,
                fontSize: 'clamp(56px, 6.6vw, 92px)',
                lineHeight: 0.94,
                letterSpacing: '-0.035em',
                margin: '0 0 30px',
                color: '#f4f4f8',
              }}
            >
              Stop the test
              <br />
              the moment
              <br />
              the{' '}
              <em className="serif" style={{ fontStyle: 'italic', color: '#9a8df5' }}>
                math
              </em>{' '}
              does.
            </h1>

            <p
              style={{
                fontSize: 19,
                lineHeight: 1.5,
                color: '#9094a3',
                maxWidth: 520,
                margin: '0 0 44px',
              }}
            >
              Anytime-valid sequential analysis. Peek without penalty — conclude the instant
              evidence crosses your threshold, not when a fixed-horizon calculator says you may.
            </p>

            <div
              className="flex items-center"
              style={{ gap: 12, marginBottom: 36, flexWrap: 'wrap' }}
            >
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 22px 14px 24px' }} onClick={onRunDemo}>
                <span>Run the demo</span>
                <span className="mono" style={{ fontSize: 15, opacity: 0.9 }}>
                  →
                </span>
              </button>
              <button className="btn-ghost" style={{ fontSize: 15, padding: '14px 22px' }} onClick={onConfigure}>
                Configure a live test
              </button>
              <span className="mono" style={{ fontSize: 11, color: '#6b6b78', marginLeft: 6 }}>
                or press <Kbd>D</Kbd>
              </span>
            </div>

            <div
              className="mono flex items-center"
              style={{ gap: 22, fontSize: 11, color: '#6b6b78', flexWrap: 'wrap' }}
            >
              <span className="flex items-center" style={{ gap: 7 }}>
                <Kbd>D</Kbd> demo
              </span>
              <span className="flex items-center" style={{ gap: 7 }}>
                <Kbd>N</Kbd> new test
              </span>
              <span className="flex items-center" style={{ gap: 7 }}>
                <Kbd>?</Kbd> docs
              </span>
            </div>
          </div>

          {/* RIGHT instrument preview */}
          <div className="animate-drift" style={{ position: 'relative' }}>
            <div
              className="mono"
              style={{
                position: 'absolute',
                top: -22,
                right: 0,
                fontSize: 10,
                color: '#6b6b78',
                letterSpacing: '0.12em',
              }}
            >
              PREVIEW · LIVE BIND
            </div>

            <div
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                padding: '20px 20px 18px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* meta row */}
              <div
                className="flex justify-between items-center"
                style={{
                  paddingBottom: 14,
                  marginBottom: 4,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center" style={{ gap: 11 }}>
                  <span
                    className="animate-pulse-dot"
                    style={{
                      width: 8,
                      height: 8,
                      background: '#7c6ef2',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(124,110,242,0.7)',
                    }}
                  />
                  <span
                    className="mono"
                    style={{ fontSize: 10.5, letterSpacing: '0.16em', color: '#a0a0ad' }}
                  >
                    LIVE
                  </span>
                  <span className="mono" style={{ fontSize: 13, color: '#e8e8ed' }}>
                    checkout_cta_v2
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 9.5,
                      padding: '2px 7px',
                      background: 'rgba(251,191,36,0.08)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251,191,36,0.28)',
                      borderRadius: 4,
                      letterSpacing: '0.16em',
                    }}
                  >
                    DEMO
                  </span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: '#6b6b78' }}>
                  02:26 elapsed
                </span>
              </div>

              {/* chart header */}
              <div
                className="flex justify-between items-baseline"
                style={{ padding: '14px 4px 4px' }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 10.5, color: '#6b6b78', letterSpacing: '0.16em' }}
                >
                  LOG-LIKELIHOOD RATIO
                </span>
                <span className="mono" style={{ fontSize: 15, color: '#9a8df5', fontWeight: 500 }}>
                  +2.14
                </span>
              </div>

              {/* chart */}
              <div style={{ position: 'relative', height: 220, padding: '6px 0 0' }}>
                <svg
                  viewBox="0 0 560 220"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="llrFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7c6ef2" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#7c6ef2" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                    <line x1="0" y1="55" x2="560" y2="55" />
                    <line x1="0" y1="110" x2="560" y2="110" />
                    <line x1="0" y1="165" x2="560" y2="165" />
                  </g>
                  <line x1="0" y1="30" x2="560" y2="30" stroke="#34d399" strokeWidth="1" strokeDasharray="6 6" opacity="0.55" />
                  <line x1="0" y1="195" x2="560" y2="195" stroke="#f87171" strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />
                  <path
                    d="M 8 160 C 60 175, 100 150, 140 158 S 220 130, 260 138 S 340 100, 380 104 S 460 60, 500 48 L 540 38 L 540 205 L 8 205 Z"
                    fill="url(#llrFill)"
                    opacity="0.85"
                  />
                  <path
                    d="M 8 160 C 60 175, 100 150, 140 158 S 220 130, 260 138 S 340 100, 380 104 S 460 60, 500 48 L 540 38"
                    fill="none"
                    stroke="#9a8df5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    style={{ animation: 'draw 6.5s ease-out infinite', filter: 'drop-shadow(0 0 6px rgba(124,110,242,0.5))' }}
                  />
                  <g style={{ animation: 'end-dot 6.5s ease-out infinite', transformOrigin: '540px 38px' }}>
                    <circle cx="540" cy="38" r="11" fill="#7c6ef2" opacity="0.18" />
                    <circle cx="540" cy="38" r="5" fill="#7c6ef2" />
                    <circle cx="540" cy="38" r="2" fill="#fff" />
                  </g>
                  <text x="10" y="22" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#34d399" opacity="0.85">
                    winner · +2.94
                  </text>
                  <text x="10" y="213" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#f87171" opacity="0.75">
                    no-effect · −2.94
                  </text>
                </svg>
              </div>

              {/* progress */}
              <div
                className="mono flex justify-between items-center"
                style={{ padding: '18px 4px 6px', fontSize: 10.5, color: '#7a7a87' }}
              >
                <span>78% TO WINNER THRESHOLD</span>
                <span style={{ color: '#5a5a66' }}>22% TO NO-EFFECT</span>
              </div>
              <div
                style={{
                  position: 'relative',
                  height: 3,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  margin: '0 4px 18px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '78%',
                    background: 'linear-gradient(90deg, #5b4ce0, #7c6ef2 60%, #34d399)',
                    borderRadius: 2,
                    boxShadow: '0 0 12px rgba(124,110,242,0.4)',
                  }}
                />
              </div>

              {/* stat tiles */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 1,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 9,
                  overflow: 'hidden',
                }}
              >
                {[
                  { label: 'CONTROL CVR', val: '10.20', unit: '%', sub: '2,043 visitors', color: '#e8e8ed' },
                  { label: 'LIFT', val: '+0.8', unit: '%', sub: 'vs. control', color: '#34d399' },
                  { label: 'TREATMENT', val: '10.28', unit: '%', sub: '2,028 visitors', color: '#9a8df5' },
                ].map((t) => (
                  <div key={t.label} style={{ background: '#101015', padding: '14px 16px' }}>
                    <div
                      className="mono"
                      style={{
                        fontSize: 9.5,
                        letterSpacing: '0.16em',
                        color: '#6b6b78',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      {t.label}
                    </div>
                    <div className="mono" style={{ fontSize: 22, color: t.color, fontWeight: 500 }}>
                      {t.val}
                      <span style={{ color: t.color === '#34d399' ? t.color : '#5a5a66', fontSize: 18 }}>
                        {t.unit}
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: '#6b6b78', marginTop: 3 }}>
                      {t.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="mono flex justify-between items-center"
              style={{ padding: '14px 6px 0', fontSize: 10.5, color: '#6b6b78' }}
            >
              <span>↳ this is what waits behind the door.</span>
              <span style={{ color: '#5a5a66' }}>SAMPLE FRAME · 02:26.000</span>
            </div>
          </div>
        </div>

        {/* CONCEPT STRIP */}
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14, marginTop: 56 }}
        >
          {CONCEPTS.map((c) => (
            <div
              key={c.n}
              style={{
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.008))',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '22px 24px 24px',
                overflow: 'hidden',
              }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: 56 }}>
                <span className="mono" style={{ fontSize: 11, color: c.color, letterSpacing: '0.14em' }}>
                  {c.n}
                </span>
                <span className="mono" style={{ fontSize: 11, color: '#4a4a55' }}>
                  /{c.n.slice(0, 2)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 21,
                  lineHeight: 1.25,
                  fontWeight: 500,
                  color: '#e8e8ed',
                  letterSpacing: '-0.015em',
                  marginBottom: 14,
                }}
              >
                {c.title}
              </div>
              <div className="mono" style={{ fontSize: 11, color: '#7a7a87', lineHeight: 1.55 }}>
                {c.body}
              </div>
            </div>
          ))}
        </div>

        {/* TICKER */}
        <div
          style={{
            marginTop: 56,
            padding: '14px 0',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            className="mono animate-scroll-x flex items-center"
            style={{ gap: 48, whiteSpace: 'nowrap', fontSize: 11.5, color: '#6b6b78', letterSpacing: '0.05em', width: 'max-content' }}
          >
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i}>
                <span style={{ color: item.c }}>●</span>
                &nbsp;&nbsp;{item.t}
              </span>
            ))}
          </div>
          <div
            aria-hidden
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg, #0a0a0f, transparent)', pointerEvents: 'none' }}
          />
          <div
            aria-hidden
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(-90deg, #0a0a0f, transparent)', pointerEvents: 'none' }}
          />
        </div>

        {/* FOOTER */}
        <div
          className="mono flex justify-between items-center"
          style={{ marginTop: 28, fontSize: 11, color: '#6b6b78' }}
        >
          <div className="flex items-center" style={{ gap: 16 }}>
            <span style={{ color: '#a0a0ad' }}>
              ab<span style={{ color: '#4a4a55' }}>/</span>monitor
            </span>
            <span style={{ color: '#4a4a55' }}>·</span>
            <span>v0.4.2 · SPRT</span>
            <span style={{ color: '#4a4a55' }}>·</span>
            <span>MIT</span>
          </div>
          <div className="flex" style={{ gap: 22 }}>
            <a href="https://github.com/bhavinjain28/AB-test-monitor" target="_blank" rel="noreferrer" className="link-mut" style={{ color: '#a0a0ad', textDecoration: 'none' }}>
              GitHub
            </a>
            <span className="link-mut" style={{ color: '#a0a0ad' }} onClick={onConfigure}>
              New test
            </span>
            <span className="link-mut" style={{ color: '#a0a0ad' }} onClick={onRunDemo}>
              Demo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
