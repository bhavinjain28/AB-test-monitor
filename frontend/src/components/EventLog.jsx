import { AnimatePresence, motion } from 'framer-motion'

// Sliding event feed. Shows the most recent rows; each new row slides in.

export default function EventLog({ events = [] }) {
  const recent = events.slice(-15)

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-textSec">Event log</span>
        <span className="mono text-xs text-textMut">{events.length} events</span>
      </div>
      <div className="overflow-hidden h-48 rounded-xl border border-white/[0.07] bg-surface">
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
                  e.variant === 'treatment' ? 'text-indigo-400' : 'text-zinc-400'
                }`}
              >
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
    </div>
  )
}
