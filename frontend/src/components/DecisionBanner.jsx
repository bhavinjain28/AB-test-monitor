import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'

// Full-width announcement that slides in when the experiment reaches a decision.
// Fires confetti once on the transition into the "winner" state.

export default function DecisionBanner({ status, lift, totalVisitors = 0, onReset }) {
  const prevStatus = useRef(status)

  useEffect(() => {
    if (status === 'winner' && prevStatus.current !== 'winner') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#7c6ef2', '#34d399', '#f4f4f8'],
      })
    }
    prevStatus.current = status
  }, [status])

  const decided = status === 'winner' || status === 'no_effect'

  return (
    <AnimatePresence>
      {decided && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className={`rounded-xl px-6 py-4 flex items-center gap-4 overflow-hidden ${
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
            <p className="text-sm text-textSec mono">
              {status === 'winner'
                ? `Lift: +${lift}% · ${totalVisitors.toLocaleString()} visitors`
                : `Inconclusive after ${totalVisitors.toLocaleString()} visitors`}
            </p>
          </div>
          <button
            onClick={onReset}
            className="ml-auto text-sm text-textSec hover:text-white transition-colors"
          >
            Reset experiment →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
