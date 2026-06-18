import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { useExperiment } from '../hooks/useExperiment'
import { formatElapsed } from '../lib/utils'
import StatusOrb from '../components/StatusOrb'
import MetricCard from '../components/MetricCard'
import LLRChart from '../components/LLRChart'
import DecisionBanner from '../components/DecisionBanner'
import EventLog from '../components/EventLog'
import ConfigPanel from '../components/ConfigPanel'

// Staggered page-load entrance.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

// Thin LLR progress bar: how far the LLR has travelled toward its boundary.
function ProgressBar({ llr, bounds }) {
  const target = llr >= 0 ? bounds.B : bounds.A
  const pct = Math.min(100, (Math.abs(llr) / Math.abs(target || 1)) * 100)
  return (
    <div className="mt-2">
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: llr >= 0 ? '#7c6ef2' : '#f87171' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-textMut mono mt-1">
        {pct.toFixed(0)}% to {llr >= 0 ? 'winner' : 'no-effect'} threshold
      </p>
    </div>
  )
}

const CONN_LABELS = {
  connecting: 'connecting…',
  connected: 'LIVE',
  disconnected: 'disconnected',
  error: 'connection error',
}

export default function Dashboard({ experimentName, onHome }) {
  const { data, history, events, status, reset, configure, setMode } = useExperiment()

  // Elapsed timer — resets whenever the experiment is (re)started.
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 1000)
    return () => clearInterval(id)
  }, [])

  const restartTimer = () => {
    startRef.current = Date.now()
    setElapsed(0)
  }

  const handleReset = () => {
    reset()
    restartTimer()
  }
  const handleApply = (cfg) => {
    configure(cfg)
    restartTimer()
  }
  const handleModeChange = (mode) => {
    if (mode === data?.mode) return
    setMode(mode)
    restartTimer()
  }

  const expStatus = data?.status ?? 'running'
  const mode = data?.mode ?? 'demo'
  const bounds = data?.bounds ?? { A: -2.77, B: 2.77 }
  const llr = data?.treatment?.llr ?? 0
  const connected = status === 'connected'
  const name = experimentName || data?.name || 'experiment'

  return (
    <div className="min-h-screen bg-bg text-textPri">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-bg/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <span
            className="mono text-xs text-textMut link-mut flex items-center gap-1.5"
            onClick={onHome}
            role="button"
          >
            ab<span className="text-textFaint">/</span>monitor
          </span>
          <span className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <StatusOrb status={connected ? expStatus : 'no_effect'} />
            <span className="mono text-xs uppercase tracking-widest text-textSec">
              {CONN_LABELS[status] || status}
            </span>
          </div>
          <span className="mono text-sm text-textPri">{name}</span>
          <span
            className={`mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${
              mode === 'live'
                ? 'text-accent border-borderHi bg-accentDim'
                : 'text-warn border-warn/30 bg-warn/10'
            }`}
          >
            {mode}
          </span>
          <span className="ml-auto mono text-xs text-textMut">
            {formatElapsed(elapsed)} elapsed
          </span>
        </div>
      </header>

      {/* Body */}
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6"
      >
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <DecisionBanner
            status={expStatus}
            lift={data?.lift ?? 0}
            totalVisitors={data?.total_visitors ?? 0}
            onReset={handleReset}
          />

          <motion.section
            variants={item}
            className="border border-border rounded-xl p-5 bg-surface shadow-glow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-textMut">
                Log-likelihood ratio
              </span>
              <span className="mono text-sm text-accentBright">{llr >= 0 ? '+' : ''}{llr.toFixed(3)}</span>
            </div>
            <LLRChart history={history} bounds={bounds} />
            <ProgressBar llr={llr} bounds={bounds} />
          </motion.section>

          {/* Metric cards */}
          <motion.section variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Control CVR"
              value={data?.control?.cvr ?? 0}
              suffix="%"
              sub={`${(data?.control?.visitors ?? 0).toLocaleString()} visitors`}
            />
            <MetricCard
              label="Lift"
              value={data?.lift ?? 0}
              decimals={1}
              prefix={(data?.lift ?? 0) >= 0 ? '+' : ''}
              suffix="%"
              accent={(data?.lift ?? 0) >= 0 ? '#34d399' : '#f87171'}
              sub="treatment vs. control"
            />
            <MetricCard
              label="Treatment CVR"
              value={data?.treatment?.cvr ?? 0}
              suffix="%"
              sub={`${(data?.treatment?.visitors ?? 0).toLocaleString()} visitors`}
              accent="#9a8df5"
              highlight={expStatus === 'winner'}
            />
          </motion.section>
        </div>

        {/* Right column / sidebar */}
        <motion.aside variants={item} className="flex flex-col gap-6">
          <ConfigPanel
            config={data?.config}
            mode={mode}
            onApply={handleApply}
            onReset={handleReset}
            onModeChange={handleModeChange}
          />
          <EventLog events={events} />
        </motion.aside>
      </motion.main>
    </div>
  )
}
