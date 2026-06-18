import { AnimatePresence, motion } from 'framer-motion'

// Sliding event feed. Shows the most recent rows; each new row slides in.

export default function EventLog({ events = [] }) {
  const recent = events.slice(-15)

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-textMut">Event log</span>
        <span className="mono text-xs text-textMut">{events.length} events</span>
      </div>
      <div className="overflow-hidden h-48 rounded-xl border border-border bg-surface">
        <AnimatePresence initial={false}>
          {recent.length === 0 && (
            <div className="flex items-center justify-center h-full text-xs text-textMut">
              waiting for events…
            </div>
          )}
          {recent.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.04] text-xs"
            >
              <span
                className={`w-20 mono ${
                  e.variant === 'treatment' ? 'text-accentBright' : 'text-textSec'
                }`}
              >
                {e.variant}
              </span>
              <span className={`mono ${e.converted ? 'text-success' : 'text-textMut'}`}>
                {e.converted ? '● converted' : '○ visited'}
              </span>
              <span className="ml-auto text-textMut mono">{e.llr.toFixed(3)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
