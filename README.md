# Real-Time A/B Test Monitor — SPRT

A real-time A/B testing dashboard built on **Sequential Probability Ratio Testing (SPRT)**.
Unlike fixed-horizon tests, SPRT lets you peek at results continuously and stop the moment
there's enough statistical evidence — no false-positive inflation from repeated peeking.

> Dark, minimalist, scientific-instrument aesthetic. Every number animates.
> The log-likelihood ratio (LLR) chart is the hero.

![stack](https://img.shields.io/badge/backend-FastAPI%20%C2%B7%20asyncio-009688) ![stack](https://img.shields.io/badge/frontend-React%20%C2%B7%20Vite%20%C2%B7%20Framer%20Motion-6366F1)

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Python · FastAPI · WebSocket · asyncio |
| Frontend | React 18 · Vite · Framer Motion · Recharts · Tailwind CSS |
| Stats engine | Pure Python (no external deps) |
| Deploy | Render (backend) · Vercel (frontend) |

---

## How it works

Each observation (a simulated visitor who either converts or doesn't) updates a cumulative
**log-likelihood ratio** comparing two hypotheses about the treatment's conversion rate:

- **H0** — treatment has no effect (`p == p0`, the baseline rate)
- **H1** — treatment lifts conversion (`p == p1`, the target rate)

The LLR walks up on conversions and down on non-conversions. Two boundaries derived from
the desired error rates decide the experiment:

- `B = log((1 - β) / α)` — upper bound → **treatment wins**
- `A = log(β / (1 - α))` — lower bound → **no significant effect**

Because the boundaries directly control the α/β error rates, you can watch the result stream
in live and stop as soon as a boundary is crossed.

---

## Project structure

```
ab-monitor/
├── backend/
│   ├── main.py        # FastAPI app + WebSocket + REST endpoints
│   ├── sprt.py        # SPRTEngine (pure Python)
│   ├── store.py       # Experiment + Variant dataclasses
│   └── simulator.py   # Async event-stream generator
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── hooks/useExperiment.js
│       ├── components/   # StatusOrb, MetricCard, LLRChart, DecisionBanner, EventLog, ConfigPanel
│       └── lib/utils.js
├── requirements.txt
├── render.yaml
└── README.md
```

---

## Run locally

You'll need **Python 3.10+** and **Node 18+**.

### 1. Backend (Terminal 1)

```bash
pip install -r requirements.txt
cd backend
uvicorn main:app --reload --port 8000
```

Quick checks:

```bash
curl http://localhost:8000/status          # full experiment snapshot
python backend/sprt.py                      # engine smoke test
python backend/simulator.py                 # stream + engine end-to-end
```

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the dashboard connects to the backend automatically and
starts streaming.

---

## Two modes: Demo vs. Live

The dashboard has a **Data source** toggle (top of the config panel):

- **Demo** *(default)* — a built-in simulator invents traffic so the dashboard is
  always alive. Perfect for a walkthrough or a presentation. Nothing is stored.
- **Live** — the simulator switches off and the monitor watches **your real
  product**. Your app sends one event per user; the backend handles variant
  assignment, dedupes by user, persists to SQLite, and the same chart/decision
  logic runs unchanged.

Flip to **Live** in the UI (or `POST /mode {"mode":"live"}`) and start sending events.

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/status` | Current experiment state (`to_dict`) |
| `POST` | `/reset` | Reset the experiment (also clears stored data in live mode) |
| `POST` | `/config` | Rebuild from `{p0, p1, alpha, beta, events_per_second}` |
| `POST` | `/mode` | Switch data source: `{"mode": "demo" \| "live"}` |
| `GET` | `/assign?user_id=...` | Sticky variant for a user → `{ "variant": "control" \| "treatment" }` |
| `POST` | `/event` | Ingest one real observation (live mode) |
| `WS` | `/ws` | Pushes the full state as JSON every 400 ms |

---

## Monitoring a real product (Live mode)

The only thing that changes for a real experiment is **where events come from**.
Instead of the simulator, your product reports outcomes. The flow is two calls:

1. **Ask which variant to show** a user (sticky — same user always gets the same one):

   ```
   GET /assign?user_id=abc123   ->   { "variant": "treatment" }
   ```

2. **Report the outcome once** when it's known (did this user convert?):

   ```
   POST /event   { "user_id": "abc123", "converted": true }
   ```

The backend derives the variant from `user_id`, **counts each user once**
(duplicate events are ignored), feeds the SPRT engine, and the dashboard updates live.

### Drop-in browser snippet

```html
<script>
const API = 'http://localhost:8000' // or your deployed backend URL

// 1. Decide which variant to render for this user.
async function getVariant(userId) {
  const r = await fetch(`${API}/assign?user_id=${encodeURIComponent(userId)}`)
  return (await r.json()).variant // "control" | "treatment"
}

// 2. Report the outcome exactly once per user (e.g. on purchase, or at session end).
function reportOutcome(userId, converted) {
  fetch(`${API}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, converted }),
  })
}

// Example usage:
const userId = currentUser.id // your own stable user identifier
const variant = await getVariant(userId)
renderCheckoutButton(variant)         // show control vs. treatment
// ...later, when they convert (or you decide they didn't):
reportOutcome(userId, true)
</script>
```

### Backend (Python) equivalent

```python
import requests
API = "http://localhost:8000"

variant = requests.get(f"{API}/assign", params={"user_id": user_id}).json()["variant"]
# ...later:
requests.post(f"{API}/event", json={"user_id": user_id, "converted": True})
```

### Things to get right for trustworthy results

- **One event per user.** SPRT assumes one observation per participant. Send the
  outcome once (the backend dedupes by `user_id` as a safety net).
- **Set `p0` to your real baseline** conversion rate, and `p1` to the smallest lift
  worth detecting (your MDE). These drive how quickly a verdict is reached.
- **"Converted" must be a clear yes/no** by the time you report it (e.g. "purchased
  within the session"). Decide your conversion window before you start.
- Live results persist in `backend/experiment.db` and survive restarts. **Reset** in
  live mode wipes that data — use it deliberately.

---

## Using the dashboard

- **LLR chart** — the live indigo line is the running LLR; dashed green/red lines are the
  decision boundaries; the glowing dot is the current value.
- **Progress bar** — how far the LLR has travelled toward whichever boundary it's heading for.
- **Metric cards** — control / treatment CVR and the relative lift, animated on every update.
- **Config panel** — adjust baseline/target CVR, α, β, and event speed, then **Apply & restart**.
- **Decision banner** — slides in (with confetti for a winner) when a boundary is crossed.

---

## Deploy

### Backend → Render (free)

The included `render.yaml` is ready to go. Push to GitHub and create a new **Blueprint** on
Render pointing at the repo, or create a Web Service manually with:

- Build: `pip install -r ../requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root dir: `backend`

### Frontend → Vercel (free)

```bash
cd frontend
npx vercel
```

Set the API base URL at build time so the frontend points at your Render backend:

```bash
# Vercel project → Settings → Environment Variables
VITE_API_URL = https://ab-monitor-api.onrender.com
```

The WebSocket URL is derived automatically from `VITE_API_URL` (`http→ws`, `https→wss`).
Locally it defaults to `http://localhost:8000`.

---

## Why React instead of Streamlit?

Streamlit can't support custom animations, WebSocket-driven chart streaming, or the level of
micro-interaction this UI requires. React + Framer Motion gives full control over the
scientific-instrument feel: streaming LLR line, animated counters, the dramatic decision moment.
