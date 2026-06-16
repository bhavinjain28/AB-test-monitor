# Real-Time A/B Test Monitor — Claude Code Project Brief

> Build a real-time A/B testing dashboard using Sequential Probability Ratio Testing (SPRT).
> Unlike fixed-horizon tests, SPRT lets you peek at results continuously and stop the moment
> you have enough statistical evidence — no false positive inflation.
>
> **UI direction:** Dark, minimalist, scientific-instrument aesthetic.
> Every number animates. The LLR chart is the hero. Motion reinforces the live nature of the data.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Python · FastAPI · WebSocket · asyncio |
| Frontend | React 18 · Vite · Framer Motion · Recharts · Tailwind CSS |
| Stats engine | Pure Python (no external deps) |
| Deploy | Render (backend free tier) · Vercel (frontend free tier) |

> **Why React instead of Streamlit?** Streamlit cannot support custom animations, WebSocket-driven chart streaming, or the level of micro-interaction this UI requires. React + Framer Motion gives full control.

---

## Project structure

```
ab-monitor/
├── backend/
│   ├── main.py            # FastAPI app + WebSocket + REST endpoints
│   ├── sprt.py            # SPRTEngine class
│   ├── store.py           # Experiment + Variant dataclasses
│   └── simulator.py       # Async event stream generator
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── hooks/
│       │   └── useExperiment.js    # WebSocket hook, state management
│       ├── components/
│       │   ├── StatusOrb.jsx       # Pulsing live indicator
│       │   ├── MetricCard.jsx      # Animated number cards
│       │   ├── LLRChart.jsx        # Live streaming chart (Recharts)
│       │   ├── DecisionBanner.jsx  # Winner / no-effect full-width alert
│       │   ├── EventLog.jsx        # Sliding event feed
│       │   └── ConfigPanel.jsx     # Sidebar experiment settings
│       └── lib/
│           └── utils.js
├── requirements.txt
├── render.yaml
└── README.md
```

---

## Design System

### Colour palette

```js
// tailwind.config.js — extend with these exact values
colors: {
  bg:        '#09090B',   // page background — near black with blue undertone
  surface:   '#111117',   // card background
  elevated:  '#18181F',   // hover / active card state
  border:    'rgba(255,255,255,0.07)',   // default border
  borderHi:  'rgba(99,102,241,0.35)',   // active / focused border
  accent:    '#6366F1',   // indigo — the single brand colour
  accentDim: 'rgba(99,102,241,0.15)',   // accent glow fill
  success:   '#10B981',   // winner green
  danger:    '#EF4444',   // no-effect red
  textPri:   '#F4F4F5',   // primary text
  textSec:   '#A1A1AA',   // secondary / labels
  textMut:   '#52525B',   // muted / disabled
}
```

### Typography

Load both fonts from Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Usage |
|---|---|---|---|
| UI labels, body | Inter | 400 / 500 | All non-numeric text |
| All numbers / data | JetBrains Mono | 500 / 600 | CVR, LLR, counts, axis ticks |
| Hero number | JetBrains Mono | 600 | The big CVR values |
| Config inputs | Inter | 400 | Sidebar inputs |

```css
/* Global CSS reset to add in index.css */
body { background: #09090B; color: #F4F4F5; font-family: 'Inter', sans-serif; }
.mono { font-family: 'JetBrains Mono', monospace; }
```

### Spacing scale (Tailwind defaults are fine — use these consistently)

- Card padding: `p-5` (20px)
- Card gap: `gap-4` (16px)
- Section gap: `gap-6` (24px)
- Border radius: `rounded-xl` (12px) for cards, `rounded-full` for pills/orbs

### Borders

All cards: `border border-white/[0.07]` — a single hairline at 7% white opacity.
On hover: transition border to `border-indigo-500/30`.
On active experiment: subtle `shadow-[0_0_24px_rgba(99,102,241,0.08)]` glow.

---

## Animation Specifications

All animations must respect `prefers-reduced-motion`. Wrap everything in:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### 1. Page load — staggered entrance

Use Framer Motion `staggerChildren` on the root container. Each card fades up:

```jsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } }

<motion.div variants={container} initial="hidden" animate="show">
  <motion.div variants={item}><MetricCard /></motion.div>
  <motion.div variants={item}><LLRChart /></motion.div>
</motion.div>
```

### 2. Status orb — pulsing live indicator

The `StatusOrb` component is a circle that communicates experiment state.

States and colours:
- `running` → indigo (`#6366F1`) with a slow pulse animation
- `winner` → green (`#10B981`) with a fast celebratory pulse
- `no_effect` → red (`#EF4444`) — no pulse, just solid

```jsx
// StatusOrb.jsx
// Inner circle: 10px. Outer ring: 20px, animated scale + opacity.
// Use CSS keyframes for the pulse:

@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}

// The orb:
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color, animationDuration: isRunning ? '1.4s' : '0.6s' }} />
  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: color }} />
</span>
```

### 3. Metric cards — animated number counter

When a CVR or visitor count value changes, it should count up smoothly rather than jumping.
Use the `react-countup` library:

```bash
npm install react-countup
```

```jsx
// MetricCard.jsx
import CountUp from 'react-countup'

<CountUp
  end={value}
  decimals={2}
  suffix="%"
  duration={0.6}
  useEasing={true}
  className="mono text-4xl font-semibold text-white"
/>
```

The card itself should have a hover state:
```jsx
<motion.div
  whileHover={{ borderColor: 'rgba(99,102,241,0.35)', y: -2 }}
  transition={{ duration: 0.2 }}
  className="border border-white/[0.07] rounded-xl p-5 bg-surface"
>
```

### 4. LLR chart — streaming line with glow tail

Use Recharts `LineChart` with `isAnimationActive={false}` (we handle animation manually by appending data points, which naturally extends the line smoothly).

Key Recharts config:
```jsx
<LineChart data={history}>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
  <XAxis dataKey="t" hide />
  <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#52525B' }} axisLine={false} tickLine={false} />

  {/* Decision boundary lines */}
  <ReferenceLine y={bounds.B} stroke="#10B981" strokeDasharray="6 4" strokeWidth={1}
    label={{ value: 'Winner threshold', fill: '#10B981', fontSize: 11, fontFamily: 'Inter' }} />
  <ReferenceLine y={bounds.A} stroke="#EF4444" strokeDasharray="6 4" strokeWidth={1}
    label={{ value: 'No-effect threshold', fill: '#EF4444', fontSize: 11, fontFamily: 'Inter' }} />

  {/* Zero line */}
  <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

  {/* LLR line — indigo with gradient area */}
  <defs>
    <linearGradient id="llrGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="llr" stroke="#6366F1" strokeWidth={2}
        fill="url(#llrGrad)" dot={false} isAnimationActive={false} />

  {/* Glowing dot at the current tip */}
  <ReferenceDot x={history.at(-1)?.t} y={history.at(-1)?.llr} r={4}
    fill="#6366F1" stroke="#09090B" strokeWidth={2} />

  <Tooltip
    contentStyle={{ background: '#18181F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }}
    labelStyle={{ color: '#A1A1AA' }}
    itemStyle={{ color: '#6366F1' }}
  />
</LineChart>
```

The chart container should have `height: 280px` and use `ResponsiveContainer width="100%"`.

### 5. Decision banner — winner / no-effect announcement

When `status` changes from `"running"` to `"winner"` or `"no_effect"`, mount a full-width banner above the chart using Framer Motion:

```jsx
// DecisionBanner.jsx
<AnimatePresence>
  {status !== 'running' && (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-xl px-6 py-4 flex items-center gap-4 ${
        status === 'winner'
          ? 'bg-emerald-500/10 border border-emerald-500/30'
          : 'bg-red-500/10 border border-red-500/30'
      }`}
    >
      <span className="text-2xl">{status === 'winner' ? '✓' : '—'}</span>
      <div>
        <p className="font-semibold text-white">
          {status === 'winner' ? 'Treatment wins' : 'No significant effect'}
        </p>
        <p className="text-sm text-zinc-400 mono">
          {status === 'winner'
            ? `Lift: +${lift}% · ${totalVisitors.toLocaleString()} visitors`
            : `Inconclusive after ${totalVisitors.toLocaleString()} visitors`}
        </p>
      </div>
      <button onClick={onReset} className="ml-auto text-sm text-zinc-400 hover:text-white transition-colors">
        Reset experiment →
      </button>
    </motion.div>
  )}
</AnimatePresence>
```

When `status === 'winner'`, also trigger confetti: use the `canvas-confetti` library:
```bash
npm install canvas-confetti
```
```js
import confetti from 'canvas-confetti'
// Fire once when status transitions to 'winner'
confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors: ['#6366F1', '#10B981', '#F4F4F5'] })
```

### 6. Event log — sliding rows

Each new event row slides in from the bottom:

```jsx
// EventLog.jsx — keep the last 30 events max
<div className="overflow-hidden h-48 rounded-xl border border-white/[0.07] bg-surface">
  <AnimatePresence initial={false}>
    {events.slice(-15).map((e) => (
      <motion.div
        key={e.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.04] text-xs"
      >
        <span className={`w-16 mono ${e.variant === 'treatment' ? 'text-indigo-400' : 'text-zinc-400'}`}>
          {e.variant}
        </span>
        <span className={e.converted ? 'text-emerald-400' : 'text-zinc-600'}>
          {e.converted ? '● converted' : '○ visited'}
        </span>
        <span className="ml-auto text-zinc-600 mono">{e.llr.toFixed(3)}</span>
      </motion.div>
    ))}
  </AnimatePresence>
</div>
```

### 7. Config panel — smooth slide-in sidebar

The config panel sits in the right column on desktop, collapsible on mobile.
Use Framer Motion `AnimatePresence` with a slide-from-right for mobile drawer.

Inputs should use a custom dark styled input:
```css
.input-dark {
  background: #18181F;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #F4F4F5;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.input-dark:focus { border-color: rgba(99,102,241,0.5); }
```

Range sliders should be styled to match the dark theme:
```css
input[type=range] { accent-color: #6366F1; }
```

---

## Full layout — App.jsx

```
┌─────────────────────────────────────────────────────┐
│  HEADER (full width, ~56px tall)                    │
│  [● LIVE]  checkout_cta_v2      [12:34 elapsed]     │
├──────────────────────────────┬──────────────────────┤
│  MAIN (left, ~70% width)     │  SIDEBAR (right,30%) │
│                              │                      │
│  [DecisionBanner if active]  │  Experiment config   │
│                              │  ─────────────────   │
│  LLR CHART (full width       │  Baseline CVR  0.10  │
│  of the left column,         │  Target CVR    0.12  │
│  height 280px)               │  Alpha         0.05  │
│                              │  Beta          0.20  │
│  ┌──────┐ ┌──────┐ ┌──────┐ │  Speed         3/s   │
│  │CTRL  │ │ LIFT │ │TREAT │ │                      │
│  │CVR   │ │      │ │CVR   │ │  [Reset experiment]  │
│  │10.2% │ │+1.8% │ │12.0% │ │                      │
│  │1,204 │ │      │ │1,187 │ │  ─────────────────   │
│  │visits│ │      │ │visits│ │  Event log           │
│  └──────┘ └──────┘ └──────┘ │  (scrolling feed)    │
│                              │                      │
│  LLR progress bar            │                      │
│  ████████░░░░░░░░  62% to B  │                      │
└──────────────────────────────┴──────────────────────┘
```

The LLR progress bar is a thin bar (8px height) showing how far the LLR is between 0 and the upper/lower bound:
```jsx
const pct = Math.min(100, Math.abs(llr) / Math.abs(llr >= 0 ? bounds.B : bounds.A) * 100)
<div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
  <motion.div
    className="h-full rounded-full"
    style={{ background: llr >= 0 ? '#6366F1' : '#EF4444' }}
    animate={{ width: `${pct}%` }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  />
</div>
<p className="text-xs text-zinc-500 mono mt-1">{pct.toFixed(0)}% to {llr >= 0 ? 'winner' : 'no-effect'} threshold</p>
```

---

## WebSocket hook — useExperiment.js

```js
// src/hooks/useExperiment.js
import { useState, useEffect, useRef, useCallback } from 'react'

export function useExperiment(url = 'ws://localhost:8000/ws') {
  const [data, setData]       = useState(null)
  const [history, setHistory] = useState([])   // [{t, llr}]
  const [events, setEvents]   = useState([])   // [{id, variant, converted, llr}]
  const [status, setStatus]   = useState('connecting')
  const ws = useRef(null)
  const eventId = useRef(0)

  useEffect(() => {
    ws.current = new WebSocket(url)

    ws.current.onopen  = () => setStatus('connected')
    ws.current.onclose = () => setStatus('disconnected')
    ws.current.onerror = () => setStatus('error')

    ws.current.onmessage = (msg) => {
      const d = JSON.parse(msg.data)
      setData(d)
      setHistory(h => [...h.slice(-300), { t: h.length, llr: d.treatment.llr }])
    }

    return () => ws.current?.close()
  }, [url])

  const reset = useCallback(() => {
    fetch('http://localhost:8000/reset', { method: 'POST' })
    setHistory([])
    setEvents([])
  }, [])

  const configure = useCallback((config) => {
    fetch('http://localhost:8000/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    setHistory([])
    setEvents([])
  }, [])

  return { data, history, events, status, reset, configure }
}
```

---

## Package.json dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.2.0",
    "recharts": "^2.12.7",
    "react-countup": "^6.5.3",
    "canvas-confetti": "^1.9.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.2.0",
    "tailwindcss": "^3.4.4",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```

---

## Backend specifications (unchanged from v1)

### `backend/sprt.py`

`SPRTEngine` class:
- `__init__(self, p0=0.10, p1=0.12, alpha=0.05, beta=0.20)`
- `self.A = math.log(beta / (1 - alpha))` → lower bound (~-2.77)
- `self.B = math.log((1 - beta) / alpha)` → upper bound (~+2.77)
- `self.llr = 0.0`
- `update(self, converted: bool) -> str` — updates LLR, returns decision
- `decision(self) -> str` — returns `"winner"` / `"no_effect"` / `"continue"`
- `reset(self)` — resets `llr` to 0

### `backend/store.py`

`Variant` dataclass: `name`, `visitors`, `conversions`, `engine: SPRTEngine`
- Property `cvr` → `round(conversions / max(1, visitors) * 100, 2)`

`Experiment` dataclass: `name`, `status`, `control: Variant`, `treatment: Variant`
- `record(variant, converted)` → routes, increments, calls engine, updates status
- `reset()` → zeros both variants, resets engines, status = "running"
- `to_dict()` → returns full state dict including `bounds.A` and `bounds.B`

### `backend/simulator.py`

```python
async def stream_events(experiment, events_per_second=3.0):
    while experiment.status == "running":
        variant = random.choice(["control", "treatment"])
        cvr = 0.10 if variant == "control" else 0.12
        converted = random.random() < cvr
        experiment.record(variant, converted)
        yield variant, converted
        await asyncio.sleep(1 / events_per_second)
```

### `backend/main.py`

Endpoints:
- `GET /status` → `experiment.to_dict()`
- `POST /reset` → reset and restart simulator task
- `POST /config` → accepts `{p0, p1, alpha, beta, events_per_second}`, rebuilds engines
- `WebSocket /ws` → sends `experiment.to_dict()` as JSON every 400ms

CORS: allow all origins for local dev.

On startup: launch `stream_events` as a background asyncio task. Store the task reference so `/reset` can `task.cancel()` and restart it.

---

## How to run

```bash
# 1. Install backend deps
pip install -r requirements.txt

# 2. Start backend (Terminal 1)
cd backend
uvicorn main:app --reload --port 8000

# 3. Install frontend deps
cd frontend
npm install

# 4. Start frontend (Terminal 2)
npm run dev
```

Open `http://localhost:5173` — the dashboard connects automatically.

---

## Deploy

**Backend → Render (free)**
```yaml
# render.yaml
services:
  - type: web
    name: ab-monitor-api
    env: python
    rootDir: backend
    buildCommand: pip install -r ../requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    plan: free
```

**Frontend → Vercel (free)**
```bash
cd frontend
npx vercel
```
Update `useExperiment.js` to use the Render URL instead of `localhost:8000`.

---

## Build order for Claude Code

1. `backend/sprt.py` — write and test the engine first in isolation
2. `backend/store.py` — build on the engine
3. `backend/simulator.py` — test with a small `asyncio.run()` script
4. `backend/main.py` — wire into FastAPI, test `/status` with `curl`
5. `frontend/` scaffold — Vite + React + Tailwind setup
6. `src/hooks/useExperiment.js` — WebSocket hook
7. `src/components/LLRChart.jsx` — Recharts chart with boundaries
8. `src/components/MetricCard.jsx` — animated counter cards
9. `src/components/StatusOrb.jsx` + `DecisionBanner.jsx`
10. `src/components/EventLog.jsx` + `ConfigPanel.jsx`
11. `src/App.jsx` — assemble all components into layout
12. `README.md`

---

## What makes the UI distinctive

- **Everything is a number and every number moves** — counters animate on every update, the LLR line grows in real time, the progress bar fills smoothly
- **The chart is the hero** — full-width, prominent, with glowing indigo line and dashed green/red thresholds
- **Dark scientific instrument aesthetic** — feels like a Bloomberg terminal or a flight instrument panel, not a marketing dashboard
- **A single accent colour** — indigo (#6366F1) used only for the active state, the LLR line, and the accent on the winning variant
- **The decision moment is dramatic** — banner slides in, confetti fires, everything snaps from neutral to colour

---

## Resume bullet points

> Built a real-time A/B test monitor using Sequential Probability Ratio Testing (SPRT) — replicating the statistical engine used by Uber, Booking.com, and Statsig — with a React dashboard that streams live experiment state over WebSocket

> Implemented SPRT from scratch in Python: configurable MDE, alpha/beta boundaries, and a continuous likelihood ratio that detects winners up to 80% faster than fixed-horizon tests

> Designed a live dashboard with Framer Motion animations, streaming Recharts LLR chart, and animated CVR counters — deployed on Render + Vercel at zero hosting cost
