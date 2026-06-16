import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Experiment configuration sidebar. Edits are staged locally and applied with
// the "Apply & restart" button (which rebuilds the engines on the backend).

const FIELDS = [
  { key: 'p0', label: 'Baseline CVR', min: 0.01, max: 0.5, step: 0.01 },
  { key: 'p1', label: 'Target CVR', min: 0.01, max: 0.6, step: 0.01 },
  { key: 'alpha', label: 'Alpha (false positive)', min: 0.01, max: 0.2, step: 0.01 },
  { key: 'beta', label: 'Beta (false negative)', min: 0.05, max: 0.5, step: 0.01 },
  { key: 'events_per_second', label: 'Speed (events/sec)', min: 1, max: 50, step: 1 },
]

function ModeToggle({ mode, onChange }) {
  const opts = [
    { key: 'demo', label: 'Demo' },
    { key: 'live', label: 'Live' },
  ]
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-textSec">Data source</label>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-elevated border border-white/[0.07]">
        {opts.map((o) => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`rounded-md py-1.5 text-sm transition-colors ${
              mode === o.key
                ? 'bg-accent text-white'
                : 'text-textSec hover:text-white'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-textMut">
        {mode === 'live'
          ? 'Listening for real events via POST /event.'
          : 'Simulated traffic — nothing is stored.'}
      </span>
    </div>
  )
}

export default function ConfigPanel({ config, mode = 'demo', onApply, onReset, onModeChange }) {
  const [draft, setDraft] = useState({
    p0: 0.1,
    p1: 0.12,
    alpha: 0.05,
    beta: 0.2,
    events_per_second: 3,
  })

  // Seed the draft from the server's current config on first arrival.
  useEffect(() => {
    if (config) setDraft((d) => ({ ...d, ...config }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.p0, config?.p1, config?.alpha, config?.beta, config?.events_per_second])

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="border border-white/[0.07] rounded-xl p-5 bg-surface flex flex-col gap-4">
      <span className="text-xs uppercase tracking-wider text-textSec">Experiment config</span>

      <ModeToggle mode={mode} onChange={onModeChange} />

      <div className="flex flex-col gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm text-textSec">{f.label}</label>
              <span className="mono text-sm text-textPri">
                {f.step < 1 ? Number(draft[f.key]).toFixed(2) : draft[f.key]}
              </span>
            </div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={draft[f.key]}
              onChange={(e) => set(f.key, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onApply(draft)}
          className="w-full rounded-lg py-2.5 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
        >
          Apply &amp; restart
        </motion.button>
        <button
          onClick={onReset}
          className="w-full rounded-lg py-2.5 text-sm text-textSec border border-white/[0.07] hover:border-borderHi hover:text-white transition-colors"
        >
          Reset experiment
        </button>
      </div>
    </div>
  )
}
