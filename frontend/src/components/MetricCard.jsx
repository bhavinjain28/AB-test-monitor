import { motion } from 'framer-motion'
import CountUp from 'react-countup'

// Animated number card. Counts up smoothly to its target value on every change.
//
// Props:
//   label      — small caption above the value
//   value      — the number to display
//   decimals   — decimal places for the big number
//   suffix     — e.g. "%"
//   prefix     — e.g. "+"
//   sub        — secondary line below (string)
//   accent     — color the big number (defaults to white)
//   highlight  — adds an indigo glow border (for the winning variant)

export default function MetricCard({
  label,
  value,
  decimals = 2,
  suffix = '',
  prefix = '',
  sub,
  accent = '#F4F4F5',
  highlight = false,
}) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(99,102,241,0.35)', y: -2 }}
      transition={{ duration: 0.2 }}
      className="border rounded-xl p-5 bg-surface flex flex-col gap-1"
      style={{
        borderColor: highlight ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)',
        boxShadow: highlight ? '0 0 24px rgba(99,102,241,0.08)' : 'none',
      }}
    >
      <span className="text-xs uppercase tracking-wider text-textSec">{label}</span>
      <CountUp
        end={value ?? 0}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        duration={0.6}
        useEasing
        preserveValue
        className="mono text-4xl font-semibold"
        style={{ color: accent }}
      />
      {sub && <span className="mono text-xs text-textMut mt-0.5">{sub}</span>}
    </motion.div>
  )
}
